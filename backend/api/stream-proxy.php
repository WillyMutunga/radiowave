<?php
// backend/api/stream-proxy.php - Reverse Stream Proxy Endpoint (SSL & Mixed-Content Bypass)
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Database.php';
require_once dirname(__DIR__) . '/src/AudioStreamer.php';

use App\Database;
use App\AudioStreamer;

$targetUrl = $_GET['url'] ?? $_GET['target'] ?? '';
$stationId = (int)($_GET['station_id'] ?? 0);
$slug = $_GET['slug'] ?? '';

if (!empty($targetUrl)) {
    AudioStreamer::streamDirectUrl($targetUrl, $_GET['name'] ?? 'RadioWave Kenya');
} elseif ($stationId > 0) {
    AudioStreamer::streamStationAudio($stationId);
} elseif (!empty($slug)) {
    $db = Database::getConnection();
    $stmt = $db->prepare("SELECT id FROM stations WHERE slug = ?");
    $stmt->execute([$slug]);
    $id = (int)$stmt->fetchColumn();
    if ($id > 0) {
        AudioStreamer::streamStationAudio($id);
    } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Station slug not found.', 'status' => 404]);
        exit;
    }
} else {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Missing required parameter: url or station_id.', 'status' => 400]);
    exit;
}
