<?php
// backend/api/stations.php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Database.php';
require_once dirname(__DIR__) . '/src/Auth.php';

use App\Database;
use App\Auth;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

switch ($method) {
    case 'GET':
        if ($action === 'meta') {
            // Return unique counties, genres, and languages for filtering
            $counties = $db->query("SELECT DISTINCT county FROM stations WHERE status = 'published' ORDER BY county ASC")->fetchAll(PDO::FETCH_COLUMN);
            $genres = $db->query("SELECT DISTINCT genre FROM stations WHERE status = 'published' ORDER BY genre ASC")->fetchAll(PDO::FETCH_COLUMN);
            $languages = $db->query("SELECT DISTINCT language FROM stations WHERE status = 'published' ORDER BY language ASC")->fetchAll(PDO::FETCH_COLUMN);
            
            echo json_encode([
                'counties' => $counties,
                'genres' => $genres,
                'languages' => $languages
            ]);
            exit;
        }

        if ($action === 'health') {
            require_once dirname(__DIR__) . '/src/StreamHealth.php';
            $stationId = (int)($_GET['station_id'] ?? $_GET['id'] ?? 0);
            if ($stationId > 0) {
                $health = \App\StreamHealth::checkStream($stationId);
                echo json_encode(['health' => $health, 'status' => 'success']);
            } else {
                $results = \App\StreamHealth::checkAllStreams();
                $onlineCount = count(array_filter($results, fn($r) => $r['is_online']));
                echo json_encode([
                    'total_checked' => count($results),
                    'online_count' => $onlineCount,
                    'offline_count' => count($results) - $onlineCount,
                    'stations' => $results,
                    'status' => 'success'
                ]);
            }
            exit;
        }

        if ($action === 'detail') {
            $slug = $_GET['slug'] ?? '';
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

            if (empty($slug) && $id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Station slug or ID required.']);
                exit;
            }

            if ($id > 0) {
                $where = "s.id = ?";
                $val = $id;
            } elseif (is_numeric($slug)) {
                $where = "s.id = ?";
                $val = (int)$slug;
            } else {
                $where = "s.slug = ?";
                $val = $slug;
            }
            
            $query = "
                SELECT s.*, 
                       ss.id as stream_id, ss.mode as stream_mode, ss.stream_url, ss.mount_name, 
                       ss.codec, ss.bitrate, ss.status as stream_status, ss.is_live, ss.uptime_percentage,
                       np.programme_name as now_programme, np.track_title as now_track, np.artist_name as now_artist,
                       u.name as owner_name, u.email as owner_email
                FROM stations s
                LEFT JOIN station_streams ss ON s.id = ss.station_id
                LEFT JOIN now_playing np ON s.id = np.station_id
                LEFT JOIN users u ON s.owner_id = u.id
                WHERE {$where}";
            
            $stmt = $db->prepare($query);
            $stmt->execute([$val]);
            $station = $stmt->fetch();

            if (!$station) {
                http_response_code(404);
                echo json_encode(['error' => 'Station not found.']);
                exit;
            }

            // Fetch programmes
            $progStmt = $db->prepare("
                SELECT p.*, pr.name as presenter_name, pr.photo_url as presenter_photo
                FROM programmes p
                LEFT JOIN presenters pr ON p.presenter_id = pr.id
                WHERE p.station_id = ?
                ORDER BY p.start_time ASC
            ");
            $progStmt->execute([$station['id']]);
            $station['programmes'] = $progStmt->fetchAll();

            // Fetch presenters
            $presStmt = $db->prepare("SELECT * FROM presenters WHERE station_id = ?");
            $presStmt->execute([$station['id']]);
            $station['presenters'] = $presStmt->fetchAll();

            // Fetch podcasts
            $podStmt = $db->prepare("
                SELECT p.*, (SELECT COUNT(*) FROM episodes e WHERE e.podcast_id = p.id) as episode_count
                FROM podcasts p
                WHERE p.station_id = ? AND p.status = 'published'
            ");
            $podStmt->execute([$station['id']]);
            $station['podcasts'] = $podStmt->fetchAll();

            // Fetch active poll
            $pollStmt = $db->prepare("SELECT * FROM polls WHERE station_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1");
            $pollStmt->execute([$station['id']]);
            $poll = $pollStmt->fetch();
            if ($poll) {
                $optStmt = $db->prepare("SELECT * FROM poll_options WHERE poll_id = ?");
                $optStmt->execute([$poll['id']]);
                $poll['options'] = $optStmt->fetchAll();
                $station['active_poll'] = $poll;
            } else {
                $station['active_poll'] = null;
            }

            echo json_encode(['station' => $station]);
            exit;
        }

        // List Stations
        $county = $_GET['county'] ?? '';
        $genre = $_GET['genre'] ?? '';
        $language = $_GET['language'] ?? '';
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? 'published';
        $isFeatured = isset($_GET['featured']) ? (int)$_GET['featured'] : null;

        $conditions = [];
        $params = [];

        if ($status !== 'all') {
            $conditions[] = "s.status = ?";
            $params[] = $status;
        }

        if (!empty($county)) {
            $conditions[] = "s.county = ?";
            $params[] = $county;
        }

        if (!empty($genre)) {
            $conditions[] = "s.genre LIKE ?";
            $params[] = "%$genre%";
        }

        if (!empty($language)) {
            $conditions[] = "s.language LIKE ?";
            $params[] = "%$language%";
        }

        if (!empty($search)) {
            $conditions[] = "(s.name LIKE ? OR s.tagline LIKE ? OR s.frequency LIKE ? OR s.city LIKE ? OR s.county LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        if ($isFeatured !== null) {
            $conditions[] = "s.is_featured = ?";
            $params[] = $isFeatured;
        }

        $whereClause = !empty($conditions) ? "WHERE " . implode(" AND ", $conditions) : "";

        $sql = "
            SELECT s.*, 
                   ss.id as stream_id, ss.mode as stream_mode, ss.stream_url, ss.mount_name, 
                   ss.codec, ss.bitrate, ss.status as stream_status, ss.is_live, ss.uptime_percentage,
                   np.programme_name as now_programme, np.track_title as now_track, np.artist_name as now_artist
            FROM stations s
            LEFT JOIN station_streams ss ON s.id = ss.station_id
            LEFT JOIN now_playing np ON s.id = np.station_id
            $whereClause
            ORDER BY s.is_featured DESC, s.listeners_count DESC, s.name ASC
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $stations = $stmt->fetchAll();

        echo json_encode([
            'count' => count($stations),
            'stations' => $stations
        ]);
        break;

    case 'POST':
        // Station Creation / Onboarding
        $user = Auth::requireAuth();
        
        $name = trim($input['name'] ?? '');
        $tagline = trim($input['tagline'] ?? '');
        $frequency = trim($input['frequency'] ?? '');
        $description = trim($input['description'] ?? '');
        $county = trim($input['county'] ?? 'Nairobi');
        $city = trim($input['city'] ?? 'Nairobi');
        $language = trim($input['language'] ?? 'English/Swahili');
        $genre = trim($input['genre'] ?? 'General');
        $website = trim($input['website'] ?? '');
        $contactEmail = trim($input['contact_email'] ?? $user['email']);
        $contactPhone = trim($input['contact_phone'] ?? '');
        $logoUrl = trim($input['logo_url'] ?? 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300');
        $streamMode = $input['stream_mode'] ?? 'external'; // 'external' or 'managed'
        $streamUrl = trim($input['stream_url'] ?? '');

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Station name is required.']);
            exit;
        }

        // Generate slug
        $slug = strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', $name));
        $checkSlug = $db->prepare("SELECT id FROM stations WHERE slug = ?");
        $checkSlug->execute([$slug]);
        if ($checkSlug->fetch()) {
            $slug .= '-' . rand(100, 999);
        }

        // Check if admin or self-onboarding
        $initialStatus = ($user['role'] === 'super_admin') ? 'published' : 'pending_approval';

        $insertStation = $db->prepare("
            INSERT INTO stations (
                owner_id, name, slug, tagline, frequency, description,
                county, city, country, language, genre, logo_url, website,
                contact_email, contact_phone, status, is_featured, listeners_count
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, 'Kenya', ?, ?, ?, ?,
                ?, ?, ?, 0, 10
            )
        ");
        $insertStation->execute([
            $user['id'], $name, $slug, $tagline, $frequency, $description,
            $county, $city, $language, $genre, $logoUrl, $website,
            $contactEmail, $contactPhone, $initialStatus
        ]);
        $stationId = (int)$db->lastInsertId();

        // Create Stream Record
        $mountName = ($streamMode === 'managed') ? '/' . $slug : '';
        $insertStream = $db->prepare("
            INSERT INTO station_streams (
                station_id, mode, stream_url, mount_name, codec, bitrate, status, is_live, uptime_percentage
            ) VALUES (
                ?, ?, ?, ?, 'mp3', 128, 'online', 1, 99.9
            )
        ");
        $insertStream->execute([$stationId, $streamMode, $streamUrl, $mountName]);
        $streamId = (int)$db->lastInsertId();

        // If managed, generate mount credentials
        if ($streamMode === 'managed') {
            $credInsert = $db->prepare("
                INSERT INTO stream_credentials (
                    station_stream_id, server_host, server_port, mount_point, username, password, codec, bitrate
                ) VALUES (
                    ?, 'stream.radiowave.co.ke', 8000, ?, 'source', ?, 'mp3', 128
                )
            ");
            $credInsert->execute([$streamId, $mountName, 'key_' . bin2hex(random_bytes(6))]);
        }

        // Initialize Now Playing
        $npInsert = $db->prepare("
            INSERT INTO now_playing (station_id, programme_name, track_title, artist_name, source)
            VALUES (?, 'Live Broadcast', 'Welcome to ' || ?, 'Radio Host')
        ");
        $npInsert->execute([$stationId, $name]);

        // Log Audit
        $audit = $db->prepare("INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details) VALUES (?, 'STATION_CREATE', 'Station', ?, ?)");
        $audit->execute([$user['id'], $stationId, "Station registered in $streamMode mode. Status: $initialStatus"]);

        echo json_encode([
            'message' => 'Station registered successfully.',
            'station_id' => $stationId,
            'slug' => $slug,
            'status' => $initialStatus
        ]);
        break;

    case 'PUT':
    case 'PATCH':
        $user = Auth::requireRole('station_admin', 'super_admin');
        $stationId = (int)($input['station_id'] ?? $_GET['id'] ?? 0);

        if ($stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid station_id is required.']);
            exit;
        }

        // Check ownership if not super_admin
        if ($user['role'] !== 'super_admin') {
            $checkOwner = $db->prepare("SELECT id FROM stations WHERE id = ? AND owner_id = ?");
            $checkOwner->execute([$stationId, $user['id']]);
            if (!$checkOwner->fetch()) {
                http_response_code(403);
                echo json_encode(['error' => 'You do not have permission to manage this station.']);
                exit;
            }
        }

        $fields = ['name', 'tagline', 'frequency', 'description', 'county', 'city', 'language', 'genre', 'logo_url', 'website', 'contact_email', 'contact_phone'];
        $updates = [];
        $params = [];

        foreach ($fields as $f) {
            if (isset($input[$f])) {
                $updates[] = "$f = ?";
                $params[] = trim((string)$input[$f]);
            }
        }

        if (!empty($updates)) {
            $params[] = $stationId;
            $stmt = $db->prepare("UPDATE stations SET " . implode(', ', $updates) . " WHERE id = ?");
            $stmt->execute($params);
        }

        echo json_encode(['message' => 'Station updated successfully.']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed.']);
        break;
}
