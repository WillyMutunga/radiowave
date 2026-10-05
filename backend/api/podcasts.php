<?php
// backend/api/podcasts.php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Database.php';
require_once dirname(__DIR__) . '/src/Auth.php';

use App\Database;
use App\Auth;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
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
        $query = "
            SELECT p.*, s.name as station_name, s.slug as station_slug, s.logo_url as station_logo,
                   (SELECT COUNT(*) FROM episodes e WHERE e.podcast_id = p.id) as episode_count
            FROM podcasts p
            JOIN stations s ON p.station_id = s.id
            WHERE p.status = 'published'
        ";
        $params = [];

        if ($stationId > 0) {
            $query .= " AND p.station_id = ?";
            $params[] = $stationId;
        }

        $query .= " ORDER BY p.id DESC";
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $podcasts = $stmt->fetchAll();

        echo json_encode(['podcasts' => $podcasts]);
        break;

    case 'episodes':
        $podcastId = (int)($_GET['podcast_id'] ?? 0);
        if ($podcastId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid podcast_id is required.']);
            exit;
        }

        $stmt = $db->prepare("SELECT * FROM episodes WHERE podcast_id = ? ORDER BY published_at DESC");
        $stmt->execute([$podcastId]);
        echo json_encode(['episodes' => $stmt->fetchAll()]);
        break;

    case 'track_play':
        $episodeId = (int)($input['episode_id'] ?? $_GET['episode_id'] ?? 0);
        if ($episodeId > 0) {
            $db->prepare("UPDATE episodes SET play_count = play_count + 1 WHERE id = ?")->execute([$episodeId]);
        }
        echo json_encode(['success' => true]);
        break;

    case 'create_podcast':
        $user = Auth::requireRole('station_admin', 'super_admin');
        $title = trim($input['title'] ?? '');
        $description = trim($input['description'] ?? '');
        $category = trim($input['category'] ?? 'General');
        $coverUrl = trim($input['cover_url'] ?? 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400');

        if (empty($title) || $stationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Title and station_id are required.']);
            exit;
        }

        $ins = $db->prepare("
            INSERT INTO podcasts (station_id, title, description, cover_url, category, status)
            VALUES (?, ?, ?, ?, ?, 'published')
        ");
        $ins->execute([$stationId, $title, $description, $coverUrl, $category]);

        echo json_encode([
            'message' => 'Podcast created successfully.',
            'id' => (int)$db->lastInsertId()
        ]);
        break;

    case 'create_episode':
        $user = Auth::requireRole('station_admin', 'super_admin');
        $podcastId = (int)($input['podcast_id'] ?? 0);
        $title = trim($input['title'] ?? '');
        $description = trim($input['description'] ?? '');
        $audioUrl = trim($input['audio_url'] ?? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        $duration = trim($input['duration'] ?? '35:00');

        if (empty($title) || $podcastId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Title and podcast_id are required.']);
            exit;
        }

        $ins = $db->prepare("
            INSERT INTO episodes (podcast_id, title, description, audio_url, duration, play_count)
            VALUES (?, ?, ?, ?, ?, 0)
        ");
        $ins->execute([$podcastId, $title, $description, $audioUrl, $duration]);

        echo json_encode([
            'message' => 'Episode uploaded successfully.',
            'id' => (int)$db->lastInsertId()
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid podcast action.']);
        break;
}
