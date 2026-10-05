<?php
// backend/api/streaming.php
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
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'get';
$stationId = (int)($_GET['station_id'] ?? $_POST['station_id'] ?? 0);
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
if ($stationId <= 0 && isset($input['station_id'])) {
    $stationId = (int)$input['station_id'];
}

switch ($action) {
    case 'get':
        if ($stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid station_id is required.']);
            exit;
        }

        $stmt = $db->prepare("
            SELECT ss.*, s.name as station_name, s.slug as station_slug
            FROM station_streams ss
            JOIN stations s ON ss.station_id = s.id
            WHERE ss.station_id = ?
        ");
        $stmt->execute([$stationId]);
        $stream = $stmt->fetch();

        if (!$stream) {
            http_response_code(404);
            echo json_encode(['error' => 'Stream configuration not found.']);
            exit;
        }

        // Fetch credentials if managed
        $credentials = null;
        if ($stream['mode'] === 'managed') {
            $credStmt = $db->prepare("SELECT * FROM stream_credentials WHERE station_stream_id = ?");
            $credStmt->execute([$stream['id']]);
            $credentials = $credStmt->fetch();
        }

        // Encoder setup presets for station
        $encoderConfigs = [
            'butt' => [
                'server' => 'stream.radiowave.co.ke',
                'port' => 8000,
                'mount' => $stream['mount_name'] ?: '/' . $stream['station_slug'],
                'user' => 'source',
                'password' => $credentials ? $credentials['password'] : '••••••••••••'
            ],
            'obs_studio' => [
                'service' => 'Custom...',
                'server' => 'icecast://stream.radiowave.co.ke:8000' . ($stream['mount_name'] ?: '/' . $stream['station_slug']),
                'stream_key' => 'source:' . ($credentials ? $credentials['password'] : '••••••••••••')
            ],
            'mixxx' => [
                'type' => 'Icecast 2',
                'host' => 'stream.radiowave.co.ke',
                'mount' => $stream['mount_name'] ?: '/' . $stream['station_slug'],
                'port' => 8000,
                'login' => 'source'
            ]
        ];

        echo json_encode([
            'stream' => $stream,
            'credentials' => $credentials,
            'encoder_presets' => $encoderConfigs
        ]);
        break;

    case 'update':
        $user = Auth::requireRole('station_admin', 'super_admin');
        if ($stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid station_id is required.']);
            exit;
        }

        $mode = $input['mode'] ?? 'external'; // 'external' or 'managed'
        $streamUrl = trim($input['stream_url'] ?? '');
        $bitrate = (int)($input['bitrate'] ?? 128);
        $codec = $input['codec'] ?? 'mp3';

        // Fetch station
        $stStmt = $db->prepare("SELECT slug, name FROM stations WHERE id = ?");
        $stStmt->execute([$stationId]);
        $station = $stStmt->fetch();
        if (!$station) {
            http_response_code(404);
            echo json_encode(['error' => 'Station not found.']);
            exit;
        }

        $mountName = ($mode === 'managed') ? '/' . $station['slug'] : '';

        // Check if stream record exists
        $streamCheck = $db->prepare("SELECT id FROM station_streams WHERE station_id = ?");
        $streamCheck->execute([$stationId]);
        $existingStreamId = $streamCheck->fetchColumn();

        if ($existingStreamId) {
            $upd = $db->prepare("
                UPDATE station_streams 
                SET mode = ?, stream_url = ?, mount_name = ?, bitrate = ?, codec = ?, status = 'online', is_live = 1
                WHERE id = ?
            ");
            $upd->execute([$mode, $streamUrl, $mountName, $bitrate, $codec, $existingStreamId]);
            $streamId = (int)$existingStreamId;
        } else {
            $ins = $db->prepare("
                INSERT INTO station_streams (station_id, mode, stream_url, mount_name, bitrate, codec, status, is_live)
                VALUES (?, ?, ?, ?, ?, ?, 'online', 1)
            ");
            $ins->execute([$stationId, $mode, $streamUrl, $mountName, $bitrate, $codec]);
            $streamId = (int)$db->lastInsertId();
        }

        // If managed, create or update credentials
        if ($mode === 'managed') {
            $checkCred = $db->prepare("SELECT id FROM stream_credentials WHERE station_stream_id = ?");
            $checkCred->execute([$streamId]);
            if (!$checkCred->fetch()) {
                $insCred = $db->prepare("
                    INSERT INTO stream_credentials (station_stream_id, server_host, server_port, mount_point, username, password, codec, bitrate)
                    VALUES (?, 'stream.radiowave.co.ke', 8000, ?, 'source', ?, ?, ?)
                ");
                $insCred->execute([$streamId, $mountName, 'key_' . bin2hex(random_bytes(6)), $codec, $bitrate]);
            }
        }

        // Audit Log
        $audit = $db->prepare("INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details) VALUES (?, 'STREAM_UPDATE', 'StationStream', ?, ?)");
        $audit->execute([$user['id'], $streamId, "Stream configuration updated. Mode: $mode, Bitrate: $bitrate kbps, Codec: $codec"]);

        echo json_encode(['message' => 'Stream configuration updated successfully.']);
        break;

    case 'health_check':
        if ($stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid station_id is required.']);
            exit;
        }

        $result = StreamHealth::checkStream($stationId);
        echo json_encode(['health' => $result]);
        break;

    case 'rotate_credentials':
        $user = Auth::requireRole('station_admin', 'super_admin');
        if ($stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid station_id is required.']);
            exit;
        }

        $stStmt = $db->prepare("SELECT ss.id FROM station_streams ss WHERE ss.station_id = ?");
        $stStmt->execute([$stationId]);
        $streamId = $stStmt->fetchColumn();

        if (!$streamId) {
            http_response_code(404);
            echo json_encode(['error' => 'Stream not found.']);
            exit;
        }

        $newPassword = 'key_' . bin2hex(random_bytes(6));
        $rot = $db->prepare("UPDATE stream_credentials SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE station_stream_id = ?");
        $rot->execute([$newPassword, $streamId]);

        $audit = $db->prepare("INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details) VALUES (?, 'CREDENTIALS_ROTATE', 'StreamCredentials', ?, 'Rotated Icecast mount source credentials')");
        $audit->execute([$user['id'], (int)$streamId]);

        echo json_encode([
            'message' => 'Source encoder password rotated successfully.',
            'new_password' => $newPassword
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid streaming action.']);
        break;
}
