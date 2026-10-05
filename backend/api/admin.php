<?php
// backend/api/admin.php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Database.php';
require_once dirname(__DIR__) . '/src/Auth.php';
require_once dirname(__DIR__) . '/src/StreamHealth.php';

use App\Database;
use App\Auth;
use App\StreamHealth;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$user = Auth::requireRole('super_admin');
$db = Database::getConnection();
$action = $_GET['action'] ?? 'overview';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

switch ($action) {
    case 'overview':
        $totalStations = (int)$db->query("SELECT COUNT(*) FROM stations")->fetchColumn();
        $publishedStations = (int)$db->query("SELECT COUNT(*) FROM stations WHERE status = 'published'")->fetchColumn();
        $pendingStations = (int)$db->query("SELECT COUNT(*) FROM stations WHERE status = 'pending_approval'")->fetchColumn();
        $totalUsers = (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $totalIncidents = (int)$db->query("SELECT COUNT(*) FROM stream_incidents WHERE status = 'open'")->fetchColumn();

        echo json_encode([
            'total_stations' => $totalStations,
            'published_stations' => $publishedStations,
            'pending_stations' => $pendingStations,
            'total_users' => $totalUsers,
            'open_incidents' => $totalIncidents
        ]);
        break;

    case 'pending_stations':
        $stmt = $db->query("
            SELECT s.*, ss.mode as stream_mode, ss.stream_url, ss.mount_name, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
            FROM stations s
            LEFT JOIN station_streams ss ON s.id = ss.station_id
            LEFT JOIN users u ON s.owner_id = u.id
            WHERE s.status = 'pending_approval'
            ORDER BY s.created_at DESC
        ");
        echo json_encode(['pending_stations' => $stmt->fetchAll()]);
        break;

    case 'approve_station':
        $stationId = (int)($input['station_id'] ?? 0);
        $decision = $input['decision'] ?? 'published'; // 'published' or 'rejected'
        $feedback = trim($input['feedback'] ?? '');

        if ($stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid station_id is required.']);
            exit;
        }

        $stmt = $db->prepare("UPDATE stations SET status = ? WHERE id = ?");
        $stmt->execute([$decision, $stationId]);

        // Audit Log
        $audit = $db->prepare("INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details) VALUES (?, 'STATION_STATUS_CHANGE', 'Station', ?, ?)");
        $audit->execute([$user['id'], $stationId, "Station approval decision: $decision. Note: $feedback"]);

        echo json_encode(['message' => "Station has been $decision."]);
        break;

    case 'stream_health_grid':
        $stmt = $db->query("
            SELECT s.id as station_id, s.name as station_name, s.slug, s.county, s.frequency,
                   ss.mode, ss.stream_url, ss.mount_name, ss.status as stream_status, ss.is_live,
                   ss.codec, ss.bitrate, ss.uptime_percentage, ss.last_checked_at
            FROM stations s
            JOIN station_streams ss ON s.id = ss.station_id
            ORDER BY ss.status ASC, s.name ASC
        ");
        $streams = $stmt->fetchAll();

        // Fetch recent incidents
        $incStmt = $db->query("
            SELECT inc.*, s.name as station_name
            FROM stream_incidents inc
            JOIN stations s ON inc.station_id = s.id
            ORDER BY inc.started_at DESC
            LIMIT 20
        ");
        $incidents = $incStmt->fetchAll();

        echo json_encode([
            'streams' => $streams,
            'incidents' => $incidents
        ]);
        break;

    case 'run_all_health_checks':
        $results = StreamHealth::checkAllStreams();
        echo json_encode(['health_results' => $results]);
        break;

    case 'audit_logs':
        $stmt = $db->query("
            SELECT a.*, u.name as actor_name, u.email as actor_email, u.role as actor_role
            FROM audit_logs a
            LEFT JOIN users u ON a.actor_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 50
        ");
        echo json_encode(['audit_logs' => $stmt->fetchAll()]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid admin action.']);
        break;
}
