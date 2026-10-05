<?php
// backend/api/auth.php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Database.php';
require_once dirname(__DIR__) . '/src/Auth.php';
require_once dirname(__DIR__) . '/src/SeedData.php';

use App\Database;
use App\Auth;
use App\SeedData;

// Initialize Database
Database::init(require dirname(__DIR__) . '/config/config.php');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$db = Database::getConnection();

switch ($action) {
    case 'login':
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required.']);
            exit;
        }

        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND status = 'active'");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !Auth::verifyPassword($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password credentials.']);
            exit;
        }

        // Get station ID if station_admin or presenter
        $stationId = null;
        if ($user['role'] === 'station_admin') {
            $stStmt = $db->prepare("SELECT id FROM stations WHERE owner_id = ? LIMIT 1");
            $stStmt->execute([$user['id']]);
            $stationId = $stStmt->fetchColumn() ?: 1;
        } elseif ($user['role'] === 'presenter') {
            $prStmt = $db->prepare("SELECT station_id FROM presenters WHERE user_id = ? LIMIT 1");
            $prStmt->execute([$user['id']]);
            $stationId = $prStmt->fetchColumn() ?: 1;
        }

        $token = Auth::generateToken([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'station_id' => $stationId
        ]);

        unset($user['password_hash']);
        $user['station_id'] = $stationId;

        echo json_encode([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user
        ]);
        break;

    case 'register':
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'listener';

        if (empty($name) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Name, email and password are required.']);
            exit;
        }

        // Check if email exists
        $check = $db->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$email]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'An account with this email already exists.']);
            exit;
        }

        $allowedRoles = ['listener', 'station_admin', 'presenter'];
        if (!in_array($role, $allowedRoles, true)) {
            $role = 'listener';
        }

        $pwdHash = Auth::hashPassword($password);
        $insert = $db->prepare("
            INSERT INTO users (name, email, phone, password_hash, role, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        ");
        $insert->execute([$name, $email, $phone, $pwdHash, $role]);
        $userId = (int)$db->lastInsertId();

        $token = Auth::generateToken([
            'user_id' => $userId,
            'email' => $email,
            'role' => $role
        ]);

        echo json_encode([
            'message' => 'Account registered successfully',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'role' => $role,
                'status' => 'active'
            ]
        ]);
        break;

    case 'me':
        $user = Auth::requireAuth();
        // Get station ID if station owner
        if ($user['role'] === 'station_admin') {
            $stStmt = $db->prepare("SELECT id, name, slug FROM stations WHERE owner_id = ? LIMIT 1");
            $stStmt->execute([$user['id']]);
            $station = $stStmt->fetch();
            $user['station'] = $station ?: null;
            $user['station_id'] = $station ? $station['id'] : 1;
        } elseif ($user['role'] === 'presenter') {
            $prStmt = $db->prepare("SELECT p.station_id, s.name, s.slug FROM presenters p JOIN stations s ON p.station_id = s.id WHERE p.user_id = ? LIMIT 1");
            $prStmt->execute([$user['id']]);
            $presenterInfo = $prStmt->fetch();
            $user['station_id'] = $presenterInfo ? $presenterInfo['station_id'] : 1;
        }

        echo json_encode(['user' => $user]);
        break;

    case 'switch_demo_role':
        // Demo helper to quickly switch identity during evaluation
        $targetRole = $input['role'] ?? 'listener';
        $userMap = [
            'super_admin' => 'admin@radiowave.co.ke',
            'station_admin' => 'owner@enefm.co.ke',
            'presenter' => 'marcus@enefm.co.ke',
            'listener' => 'listener@gmail.com'
        ];

        $targetEmail = $userMap[$targetRole] ?? 'listener@gmail.com';
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$targetEmail]);
        $user = $stmt->fetch();

        if ($user) {
            unset($user['password_hash']);
            $stationId = in_array($targetRole, ['station_admin', 'presenter']) ? 1 : null;
            $token = Auth::generateToken([
                'user_id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'],
                'station_id' => $stationId
            ]);
            $user['station_id'] = $stationId;
            echo json_encode([
                'message' => 'Switched to ' . $user['role'],
                'token' => $token,
                'user' => $user
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Demo user not found.']);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid auth action specified.']);
        break;
}
