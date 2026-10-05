<?php
// backend/api/billing.php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Database.php';
require_once dirname(__DIR__) . '/src/Auth.php';

use App\Database;
use App\Auth;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db = Database::getConnection();
$action = $_GET['action'] ?? 'plans';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$stationId = (int)($_GET['station_id'] ?? $input['station_id'] ?? 0);

switch ($action) {
    case 'plans':
        $plans = $db->query("SELECT * FROM plans ORDER BY price ASC")->fetchAll();
        foreach ($plans as &$p) {
            $p['features'] = json_decode($p['features_json'] ?? '[]', true);
        }
        echo json_encode(['plans' => $plans]);
        break;

    case 'subscription':
    case 'station_subscription':
        if ($stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid station_id is required.']);
            exit;
        }

        $stmt = $db->prepare("
            SELECT sub.*, p.name as plan_name, p.price, p.billing_cycle, p.stream_model, p.features_json
            FROM subscriptions sub
            JOIN plans p ON sub.plan_id = p.id
            WHERE sub.station_id = ?
            ORDER BY sub.id DESC
            LIMIT 1
        ");
        $stmt->execute([$stationId]);
        $subscription = $stmt->fetch();

        if ($subscription) {
            $subscription['features'] = json_decode($subscription['features_json'] ?? '[]', true);
        }

        // Fetch payment history
        $payStmt = $db->prepare("
            SELECT pm.*
            FROM payments pm
            JOIN subscriptions s ON pm.subscription_id = s.id
            WHERE s.station_id = ?
            ORDER BY pm.paid_at DESC
        ");
        $payStmt->execute([$stationId]);
        $payments = $payStmt->fetchAll();

        echo json_encode([
            'subscription' => $subscription,
            'payments' => $payments
        ]);
        break;

    case 'subscribe_mpesa':
        $user = Auth::requireRole('station_admin', 'super_admin');
        $planId = (int)($input['plan_id'] ?? 0);
        $phone = trim($input['phone'] ?? '+254700000000');

        if ($stationId <= 0 || $planId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Station ID and Plan ID are required.']);
            exit;
        }

        $plan = $db->prepare("SELECT * FROM plans WHERE id = ?");
        $plan->execute([$planId]);
        $p = $plan->fetch();

        if (!$p) {
            http_response_code(404);
            echo json_encode(['error' => 'Plan not found.']);
            exit;
        }

        // Create subscription
        $subIns = $db->prepare("
            INSERT INTO subscriptions (station_id, plan_id, status, start_date, renewal_date)
            VALUES (?, ?, 'active', CURRENT_TIMESTAMP, datetime('now', '+30 days'))
        ");
        $subIns->execute([$stationId, $planId]);
        $subId = (int)$db->lastInsertId();

        // Create simulated completed payment
        $ref = 'MP' . strtoupper(bin2hex(random_bytes(4))) . rand(10, 99);
        $payIns = $db->prepare("
            INSERT INTO payments (subscription_id, provider, reference, amount, currency, status, paid_at)
            VALUES (?, 'mpesa', ?, ?, 'KES', 'completed', CURRENT_TIMESTAMP)
        ");
        $payIns->execute([$subId, $ref, $p['price']]);

        // Audit Log
        $audit = $db->prepare("INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details) VALUES (?, 'SUBSCRIPTION_PURCHASE', 'Subscription', ?, ?)");
        $audit->execute([$user['id'], $subId, "Subscribed station $stationId to plan {$p['name']} via M-Pesa. Ref: $ref"]);

        echo json_encode([
            'message' => "M-Pesa STK Push prompt processed! Subscription active for {$p['name']}.",
            'receipt' => $ref,
            'amount' => $p['price'],
            'currency' => 'KES',
            'status' => 'completed'
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid billing action.']);
        break;
}
