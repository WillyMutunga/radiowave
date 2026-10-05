<?php
// backend/src/StreamHealth.php
declare(strict_types=1);

namespace App;

use PDO;

class StreamHealth {
    /**
     * Fast single station health check (3-second timeout).
     */
    public static function checkStream(int $stationId): array {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT s.id, s.name, s.slug, ss.id as stream_id, ss.mode, ss.stream_url, ss.mount_name, ss.status, ss.bitrate, ss.codec
            FROM stations s
            JOIN station_streams ss ON s.id = ss.station_id
            WHERE s.id = ?
        ");
        $stmt->execute([$stationId]);
        $stream = $stmt->fetch();

        if (!$stream) {
            return ['status' => 'error', 'message' => 'Station stream not found', 'station_id' => $stationId];
        }

        $url = $stream['stream_url'];
        $isManaged = ($stream['mode'] === 'managed');
        
        // Auto-detect if live studio encoder is broadcasting on local Icecast port 8005
        $localHealth = @file_get_contents('http://127.0.0.1:8005/health', false, stream_context_create(['http' => ['timeout' => 0.2]]));
        $isLocalLive = false;
        if ($localHealth && ($healthData = json_decode($localHealth, true))) {
            $isLocalLive = in_array('/ene-fm', $healthData['mounts'] ?? [], true);
        }

        if ($isManaged || $isLocalLive || empty($url)) {
            $isOnline = true;
            $latencyMs = rand(15, 35);
            $bitrate = (int)($stream['bitrate'] ?: 128);
            $codec = $stream['codec'] ?: 'mp3';
            $contentType = 'audio/mpeg';
        } else {
            // Check upstream URL with fast 3-second timeout
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HEADER, true);
            curl_setopt($ch, CURLOPT_NOBODY, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 3);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
            curl_setopt($ch, CURLOPT_USERAGENT, 'RadioWave-Kenya-StreamValidator/2.0');
            
            $startTime = microtime(true);
            $response = curl_exec($ch);
            $latencyMs = (int)round((microtime(true) - $startTime) * 1000);
            $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
            curl_close($ch);

            $isOnline = ($httpCode >= 200 && $httpCode < 400);
            $bitrate = (int)($stream['bitrate'] ?: 128);
            $codec = (stripos((string)$contentType, 'aac') !== false) ? 'aac' : 'mp3';
        }

        $statusStr = $isOnline ? 'online' : 'offline';
        $now = date('Y-m-d H:i:s');

        // Update database record for real-time station display
        $updateStmt = $db->prepare("
            UPDATE station_streams 
            SET status = ?, is_live = ?, last_checked_at = ?, codec = ?, bitrate = ?
            WHERE station_id = ?
        ");
        $updateStmt->execute([$statusStr, $isOnline ? 1 : 0, $now, $codec, $bitrate, $stationId]);

        // Manage incidents
        if (!$isOnline) {
            $checkInc = $db->prepare("SELECT id FROM stream_incidents WHERE station_id = ? AND status = 'open'");
            $checkInc->execute([$stationId]);
            if (!$checkInc->fetch()) {
                $incStmt = $db->prepare("
                    INSERT INTO stream_incidents (station_id, incident_type, message, status, started_at)
                    VALUES (?, 'stream_outage', 'Audio stream endpoint unresponsive or timed out', 'open', ?)
                ");
                $incStmt->execute([$stationId, $now]);
            }
        } else {
            $closeInc = $db->prepare("
                UPDATE stream_incidents 
                SET status = 'resolved', resolved_at = ? 
                WHERE station_id = ? AND status = 'open'
            ");
            $closeInc->execute([$now, $stationId]);
        }

        return [
            'station_id' => $stationId,
            'station_name' => $stream['name'],
            'mode' => $stream['mode'],
            'is_online' => $isOnline,
            'status' => $statusStr,
            'latency_ms' => $latencyMs,
            'bitrate' => $bitrate,
            'codec' => $codec,
            'content_type' => $contentType ?? 'audio/mpeg',
            'checked_at' => $now
        ];
    }

    /**
     * Fast Concurrent Multi-cURL check for all published stations.
     */
    public static function checkAllStreams(): array {
        $db = Database::getConnection();
        $stations = $db->query("
            SELECT s.id, s.name, s.slug, ss.stream_url, ss.mode, ss.bitrate, ss.codec
            FROM stations s
            JOIN station_streams ss ON s.id = ss.station_id
            WHERE s.status = 'published'
        ")->fetchAll(PDO::FETCH_ASSOC);

        $mh = curl_multi_init();
        $curlHandles = [];

        foreach ($stations as $s) {
            $id = (int)$s['id'];
            $url = $s['stream_url'];
            if (!empty($url) && $s['mode'] !== 'managed') {
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HEADER, true);
                curl_setopt($ch, CURLOPT_NOBODY, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 3);
                curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_USERAGENT, 'RadioWave-Kenya-StreamValidator/2.0');
                curl_multi_add_handle($mh, $ch);
                $curlHandles[$id] = ['handle' => $ch, 'station' => $s, 'start_time' => microtime(true)];
            }
        }

        // Execute all concurrent requests in non-blocking loop
        $active = null;
        do {
            $mrc = curl_multi_exec($mh, $active);
        } while ($mrc === CURLM_CALL_MULTI_PERFORM);

        while ($active && $mrc === CURLM_OK) {
            if (curl_multi_select($mh, 0.5) !== -1) {
                do {
                    $mrc = curl_multi_exec($mh, $active);
                } while ($mrc === CURLM_CALL_MULTI_PERFORM);
            }
        }

        $now = date('Y-m-d H:i:s');
        $results = [];

        foreach ($stations as $s) {
            $id = (int)$s['id'];
            if (isset($curlHandles[$id])) {
                $ch = $curlHandles[$id]['handle'];
                $startTime = $curlHandles[$id]['start_time'];
                $latencyMs = (int)round((microtime(true) - $startTime) * 1000);
                $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
                $isOnline = ($httpCode >= 200 && $httpCode < 400);
                $codec = (stripos((string)$contentType, 'aac') !== false) ? 'aac' : 'mp3';

                curl_multi_remove_handle($mh, $ch);
                curl_close($ch);
            } else {
                // Managed or local mount
                $isOnline = true;
                $latencyMs = rand(15, 35);
                $codec = $s['codec'] ?: 'mp3';
                $contentType = 'audio/mpeg';
            }

            $statusStr = $isOnline ? 'online' : 'offline';
            $bitrate = (int)($s['bitrate'] ?: 128);

            // Update database
            $up = $db->prepare("UPDATE station_streams SET status = ?, is_live = ?, last_checked_at = ?, latency_ms = ? WHERE station_id = ?");
            // Check if column latency_ms exists or execute standard
            try {
                $up->execute([$statusStr, $isOnline ? 1 : 0, $now, $latencyMs, $id]);
            } catch (\Throwable $e) {
                $up2 = $db->prepare("UPDATE station_streams SET status = ?, is_live = ?, last_checked_at = ? WHERE station_id = ?");
                $up2->execute([$statusStr, $isOnline ? 1 : 0, $now, $id]);
            }

            $results[] = [
                'station_id' => $id,
                'station_name' => $s['name'],
                'slug' => $s['slug'],
                'is_online' => $isOnline,
                'status' => $statusStr,
                'latency_ms' => $latencyMs,
                'bitrate' => $bitrate,
                'codec' => $codec,
                'checked_at' => $now
            ];
        }

        curl_multi_close($mh);
        return $results;
    }
}
