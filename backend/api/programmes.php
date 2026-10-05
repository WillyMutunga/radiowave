<?php
// backend/api/programmes.php
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
$action = $_GET['action'] ?? 'list';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$stationId = (int)($_GET['station_id'] ?? $input['station_id'] ?? 0);

switch ($action) {
    case 'list':
        if ($stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid station_id is required.']);
            exit;
        }

        $stmt = $db->prepare("
            SELECT p.*, pr.name as presenter_name, pr.photo_url as presenter_photo, pr.social_handle
            FROM programmes p
            LEFT JOIN presenters pr ON p.presenter_id = pr.id
            WHERE p.station_id = ?
            ORDER BY p.start_time ASC
        ");
        $stmt->execute([$stationId]);
        $programmes = $stmt->fetchAll();

        // Also fetch now playing info
        $npStmt = $db->prepare("SELECT * FROM now_playing WHERE station_id = ?");
        $npStmt->execute([$stationId]);
        $nowPlaying = $npStmt->fetch();

        echo json_encode([
            'programmes' => $programmes,
            'now_playing' => $nowPlaying
        ]);
        break;

    case 'create':
        $user = Auth::requireRole('station_admin', 'presenter', 'super_admin');
        $title = trim($input['title'] ?? '');
        $description = trim($input['description'] ?? '');
        $days = trim($input['days_of_week'] ?? 'Mon,Tue,Wed,Thu,Fri');
        $startTime = trim($input['start_time'] ?? '06:00');
        $endTime = trim($input['end_time'] ?? '10:00');
        $presenterId = isset($input['presenter_id']) && $input['presenter_id'] !== '' ? (int)$input['presenter_id'] : null;
        $coverImage = trim($input['cover_image'] ?? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500');

        if (empty($title) || $stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Title and station_id are required.']);
            exit;
        }

        $ins = $db->prepare("
            INSERT INTO programmes (station_id, presenter_id, title, description, days_of_week, start_time, end_time, cover_image, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
        ");
        $ins->execute([$stationId, $presenterId, $title, $description, $days, $startTime, $endTime, $coverImage]);

        echo json_encode([
            'message' => 'Programme created successfully.',
            'id' => (int)$db->lastInsertId()
        ]);
        break;

    case 'delete':
        $user = Auth::requireRole('station_admin', 'super_admin');
        $id = (int)($_GET['id'] ?? $input['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid programme id required.']);
            exit;
        }

        $del = $db->prepare("DELETE FROM programmes WHERE id = ?");
        $del->execute([$id]);

        echo json_encode(['message' => 'Programme deleted successfully.']);
        break;

    case 'update_now_playing':
        $user = Auth::requireRole('station_admin', 'presenter', 'super_admin');
        if ($stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid station_id is required.']);
            exit;
        }

        $trackTitle = trim($input['track_title'] ?? '');
        $artistName = trim($input['artist_name'] ?? '');
        $programmeName = trim($input['programme_name'] ?? '');

        $check = $db->prepare("SELECT id FROM now_playing WHERE station_id = ?");
        $check->execute([$stationId]);
        if ($check->fetch()) {
            $upd = $db->prepare("
                UPDATE now_playing 
                SET track_title = ?, artist_name = ?, programme_name = ?, started_at = CURRENT_TIMESTAMP, source = 'presenter_live'
                WHERE station_id = ?
            ");
            $upd->execute([$trackTitle, $artistName, $programmeName, $stationId]);
        } else {
            $ins = $db->prepare("
                INSERT INTO now_playing (station_id, programme_name, track_title, artist_name, source)
                VALUES (?, ?, ?, ?, 'presenter_live')
            ");
            $ins->execute([$stationId, $programmeName, $trackTitle, $artistName]);
        }

        echo json_encode([
            'message' => 'Now Playing metadata broadcasted successfully.',
            'now_playing' => [
                'track_title' => $trackTitle,
                'artist_name' => $artistName,
                'programme_name' => $programmeName
            ]
        ]);
        break;

    case 'presenters':
        if ($stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid station_id is required.']);
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = Auth::requireRole('station_admin', 'super_admin');
            $name = trim($input['name'] ?? '');
            $bio = trim($input['bio'] ?? '');
            $photo = trim($input['photo_url'] ?? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200');
            $handle = trim($input['social_handle'] ?? '');

            if (empty($name)) {
                http_response_code(400);
                echo json_encode(['error' => 'Presenter name is required.']);
                exit;
            }

            $ins = $db->prepare("
                INSERT INTO presenters (station_id, name, bio, photo_url, social_handle)
                VALUES (?, ?, ?, ?, ?)
            ");
            $ins->execute([$stationId, $name, $bio, $photo, $handle]);

            echo json_encode([
                'message' => 'Presenter added successfully.',
                'id' => (int)$db->lastInsertId()
            ]);
            exit;
        }

        $stmt = $db->prepare("SELECT * FROM presenters WHERE station_id = ? ORDER BY name ASC");
        $stmt->execute([$stationId]);
        echo json_encode(['presenters' => $stmt->fetchAll()]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action for programmes.']);
        break;
}
