<?php
// backend/api/engagement.php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Database.php';
require_once dirname(__DIR__) . '/src/Auth.php';

use App\Database;
use App\Auth;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db = Database::getConnection();
$action = $_GET['action'] ?? 'requests';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$stationId = (int)($_GET['station_id'] ?? $input['station_id'] ?? 0);

switch ($action) {
    case 'requests':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Listener submits song request / dedication
            $name = trim($input['listener_name'] ?? 'Anonymous Listener');
            $phone = trim($input['listener_phone'] ?? '');
            $songTitle = trim($input['song_title'] ?? '');
            $artist = trim($input['artist'] ?? '');
            $message = trim($input['message'] ?? '');

            if ($stationId <= 0 || empty($songTitle)) {
                http_response_code(400);
                echo json_encode(['error' => 'Station ID and Song Title are required.']);
                exit;
            }

            $user = Auth::getCurrentUser();
            $userId = $user ? $user['id'] : null;

            $ins = $db->prepare("
                INSERT INTO listener_requests (station_id, user_id, listener_name, listener_phone, song_title, artist, message, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
            ");
            $ins->execute([$stationId, $userId, $name, $phone, $songTitle, $artist, $message]);

            echo json_encode([
                'message' => 'Your request and dedication have been sent to the on-air presenter!',
                'id' => (int)$db->lastInsertId()
            ]);
            exit;
        }

        // GET requests for station / presenter queue
        if ($stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid station_id is required.']);
            exit;
        }

        $status = $_GET['status'] ?? 'all';
        $query = "SELECT * FROM listener_requests WHERE station_id = ?";
        $params = [$stationId];

        if ($status !== 'all') {
            $query .= " AND status = ?";
            $params[] = $status;
        }

        $query .= " ORDER BY id DESC LIMIT 50";
        $stmt = $db->prepare($query);
        $stmt->execute($params);

        echo json_encode(['requests' => $stmt->fetchAll()]);
        break;

    case 'update_request_status':
        $user = Auth::requireRole('station_admin', 'presenter', 'super_admin');
        $requestId = (int)($input['request_id'] ?? 0);
        $newStatus = $input['status'] ?? 'approved'; // 'pending', 'approved', 'played', 'rejected'

        if ($requestId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid request_id is required.']);
            exit;
        }

        $stmt = $db->prepare("UPDATE listener_requests SET status = ? WHERE id = ?");
        $stmt->execute([$newStatus, $requestId]);

        echo json_encode(['message' => "Request marked as $newStatus."]);
        break;

    case 'toggle_favourite':
        $user = Auth::requireAuth();
        if ($stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid station_id is required.']);
            exit;
        }

        $check = $db->prepare("SELECT id FROM favourites WHERE user_id = ? AND station_id = ?");
        $check->execute([$user['id'], $stationId]);
        $existing = $check->fetch();

        if ($existing) {
            $del = $db->prepare("DELETE FROM favourites WHERE id = ?");
            $del->execute([$existing['id']]);
            echo json_encode(['is_favourite' => false, 'message' => 'Removed from favourites.']);
        } else {
            $ins = $db->prepare("INSERT INTO favourites (user_id, station_id) VALUES (?, ?)");
            $ins->execute([$user['id'], $stationId]);
            echo json_encode(['is_favourite' => true, 'message' => 'Added to favourites.']);
        }
        break;

    case 'my_favourites':
        $user = Auth::requireAuth();
        $stmt = $db->prepare("
            SELECT s.*, ss.stream_url, ss.mount_name, ss.status as stream_status, ss.is_live,
                   np.programme_name as now_programme, np.track_title as now_track, np.artist_name as now_artist
            FROM favourites f
            JOIN stations s ON f.station_id = s.id
            LEFT JOIN station_streams ss ON s.id = ss.station_id
            LEFT JOIN now_playing np ON s.id = np.station_id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        ");
        $stmt->execute([$user['id']]);
        echo json_encode(['favourites' => $stmt->fetchAll()]);
        break;

    case 'vote_poll':
        $optionId = (int)($input['option_id'] ?? 0);
        if ($optionId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Option ID is required.']);
            exit;
        }

        $stmt = $db->prepare("UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = ?");
        $stmt->execute([$optionId]);

        echo json_encode(['message' => 'Vote recorded successfully!']);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid engagement action.']);
        break;
}
