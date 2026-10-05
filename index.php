<?php
// index.php - Main Application Router & Entry Point
declare(strict_types=1);

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

// API Routing
if (strpos($uri, '/api/auth') === 0) {
    require __DIR__ . '/backend/api/auth.php';
    exit;
}
if (strpos($uri, '/api/stations') === 0) {
    require __DIR__ . '/backend/api/stations.php';
    exit;
}
if (strpos($uri, '/api/stream-proxy') === 0) {
    require __DIR__ . '/backend/api/stream-proxy.php';
    exit;
}
if (strpos($uri, '/api/streaming') === 0) {
    require __DIR__ . '/backend/api/streaming.php';
    exit;
}
if (strpos($uri, '/api/stream') === 0) {
    require __DIR__ . '/backend/api/stream.php';
    exit;
}
if (strpos($uri, '/api/programmes') === 0) {
    require __DIR__ . '/backend/api/programmes.php';
    exit;
}
if (strpos($uri, '/api/engagement') === 0) {
    require __DIR__ . '/backend/api/engagement.php';
    exit;
}
if (strpos($uri, '/api/podcasts') === 0) {
    require __DIR__ . '/backend/api/podcasts.php';
    exit;
}
if (strpos($uri, '/api/analytics') === 0) {
    require __DIR__ . '/backend/api/analytics.php';
    exit;
}
if (strpos($uri, '/api/billing') === 0) {
    require __DIR__ . '/backend/api/billing.php';
    exit;
}
if (strpos($uri, '/api/admin') === 0) {
    require __DIR__ . '/backend/api/admin.php';
    exit;
}

// Serve public static assets
$publicFile = __DIR__ . '/public' . $uri;
if ($uri !== '/' && file_exists($publicFile) && !is_dir($publicFile)) {
    $ext = pathinfo($publicFile, PATHINFO_EXTENSION);
    $mimeMap = [
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'mp3' => 'audio/mpeg'
    ];
    if (isset($mimeMap[$ext])) {
        header("Content-Type: {$mimeMap[$ext]}");
    }
    readfile($publicFile);
    exit;
}

// Default to SPA Single Page Application
header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/public/index.html');
exit;
