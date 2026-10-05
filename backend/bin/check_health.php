<?php
// backend/bin/check_health.php - CLI Stream Health Auditor
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Database.php';
require_once dirname(__DIR__) . '/src/StreamHealth.php';

use App\StreamHealth;

echo "[" . date('Y-m-d H:i:s') . "] Starting RadioWave Kenya Stream Health Audit...\n";

$startTime = microtime(true);
$results = StreamHealth::checkAllStreams();
$duration = round(microtime(true) - $startTime, 2);

$onlineCount = 0;
$offlineCount = 0;

foreach ($results as $res) {
    if ($res['is_online']) {
        $onlineCount++;
        echo "  [✓ ONLINE]  {$res['station_name']} ({$res['codec']} {$res['bitrate']}k) - {$res['latency_ms']}ms\n";
    } else {
        $offlineCount++;
        echo "  [✗ OFFLINE] {$res['station_name']} ({$res['status']})\n";
    }
}

echo "[" . date('Y-m-d H:i:s') . "] Completed in {$duration}s: {$onlineCount} Online, {$offlineCount} Offline.\n";
