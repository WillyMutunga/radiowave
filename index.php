<?php
// index.php - Main Application Router & Entry Point
declare(strict_types=1);

$rawUri = $_SERVER['REDIRECT_URL'] ?? $_SERVER['PATH_INFO'] ?? $_SERVER['REQUEST_URI'] ?? '/';
$uri = parse_url($rawUri, PHP_URL_PATH) ?? '/';

// Normalize URI
$cleanUri = preg_replace('#^/public#', '', $uri);

// API Routing
if (strpos($cleanUri, '/api/auth') === 0 || strpos($uri, '/api/auth') === 0) {
    require __DIR__ . '/backend/api/auth.php';
    exit;
}
if (strpos($cleanUri, '/api/stations') === 0 || strpos($uri, '/api/stations') === 0) {
    require __DIR__ . '/backend/api/stations.php';
    exit;
}
if (strpos($cleanUri, '/api/stream-proxy') === 0 || strpos($uri, '/api/stream-proxy') === 0) {
    require __DIR__ . '/backend/api/stream-proxy.php';
    exit;
}
if (strpos($cleanUri, '/api/streaming') === 0 || strpos($uri, '/api/streaming') === 0) {
    require __DIR__ . '/backend/api/streaming.php';
    exit;
}
if (strpos($cleanUri, '/api/stream') === 0 || strpos($uri, '/api/stream') === 0) {
    require __DIR__ . '/backend/api/stream.php';
    exit;
}
if (strpos($cleanUri, '/api/programmes') === 0 || strpos($uri, '/api/programmes') === 0) {
    require __DIR__ . '/backend/api/programmes.php';
    exit;
}
if (strpos($cleanUri, '/api/engagement') === 0 || strpos($uri, '/api/engagement') === 0) {
    require __DIR__ . '/backend/api/engagement.php';
    exit;
}
if (strpos($cleanUri, '/api/podcasts') === 0 || strpos($uri, '/api/podcasts') === 0) {
    require __DIR__ . '/backend/api/podcasts.php';
    exit;
}
if (strpos($cleanUri, '/api/analytics') === 0 || strpos($uri, '/api/analytics') === 0) {
    require __DIR__ . '/backend/api/analytics.php';
    exit;
}
if (strpos($cleanUri, '/api/billing') === 0 || strpos($uri, '/api/billing') === 0) {
    require __DIR__ . '/backend/api/billing.php';
    exit;
}
if (strpos($cleanUri, '/api/admin') === 0 || strpos($uri, '/api/admin') === 0) {
    require __DIR__ . '/backend/api/admin.php';
    exit;
}

// Serve public static assets
$candidateFiles = [
    __DIR__ . '/public' . $cleanUri,
    __DIR__ . '/public' . $uri,
    __DIR__ . $uri
];

foreach ($candidateFiles as $file) {
    if ($cleanUri !== '/' && $uri !== '/' && file_exists($file) && !is_dir($file)) {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $mimeMap = [
            'css' => 'text/css; charset=utf-8',
            'js' => 'application/javascript; charset=utf-8',
            'json' => 'application/json; charset=utf-8',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'mp3' => 'audio/mpeg',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf'
        ];
        if (isset($mimeMap[$ext])) {
            header("Content-Type: {$mimeMap[$ext]}");
        }
        readfile($file);
        exit;
    }
}

// Default to SPA HTML
header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/public/index.html');
exit;
