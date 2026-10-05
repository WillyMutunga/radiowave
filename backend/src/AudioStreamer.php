<?php
// backend/src/AudioStreamer.php
declare(strict_types=1);

namespace App;

use PDO;

class AudioStreamer {
    // Verified 24/7 Live Stream Sources for Kenyan Stations
    private static array $defaultStreams = [
        1 => 'http://uk3-vn.mixstream.net:8128/listen.mp3/;',               // ENE FM Official Live Broadcast Feed (Machakos/Makueni)
        2 => 'https://atunwadigital.streamguys1.com/classic105',            // Classic 105
        3 => 'https://atunwadigital.streamguys1.com/radiojambo',            // Radio Jambo
        4 => 'https://atunwadigital.streamguys1.com/eastfm',                // East FM
        5 => 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',       // BBC Africa
        6 => 'https://radiocitizen-atunwadigital.streamguys1.com/radiocitizen', // Radio Citizen (Royal Media Services Live Feed)
        7 => 'https://radiomaisha-atunwadigital.streamguys1.com/radiomaisha',  // Radio Maisha
        8 => 'https://ramogifm-atunwadigital.streamguys1.com/ramogifm',        // Ramogi FM
        9 => 'https://inoorofm-atunwadigital.streamguys1.com/inoorofm',        // Inooro FM
        10 => 'https://hot96-atunwadigital.streamguys1.com/hot96',             // Hot 96
        11 => 'https://capitalfm-atunwadigital.streamguys1.com/capitalfm',     // Capital FM
        12 => 'https://baharifm-atunwadigital.streamguys1.com/baharifm',       // Bahari FM
        13 => 'https://uksouth.streaming.broadcast.radio/nrg',                 // NRG Radio
    ];

    /**
     * Proxies any direct stream URL (HTTP / HTTPS / custom ports) with SSL & CORS termination.
     * Prevents memory leaks by aborting upstream cURL connection when client disconnects.
     */
    public static function streamDirectUrl(string $targetUrl, string $stationName = 'RadioWave Kenya'): void {
        $targetUrl = trim($targetUrl);

        if (empty($targetUrl) || !filter_var($targetUrl, FILTER_VALIDATE_URL)) {
            http_response_code(400);
            header('Content-Type: application/json');
            header('Access-Control-Allow-Origin: *');
            echo json_encode(['error' => 'Invalid or missing stream URL provided.', 'status' => 400]);
            exit;
        }

        $scheme = strtolower((string)parse_url($targetUrl, PHP_URL_SCHEME));
        if (!in_array($scheme, ['http', 'https'], true)) {
            http_response_code(400);
            header('Content-Type: application/json');
            header('Access-Control-Allow-Origin: *');
            echo json_encode(['error' => 'Unsupported stream protocol. Only HTTP and HTTPS are permitted.', 'status' => 400]);
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, HEAD, OPTIONS');
            header('Access-Control-Allow-Headers: *');
            http_response_code(200);
            exit;
        }

        // Disable script timeouts for continuous live audio streaming
        set_time_limit(0);
        ignore_user_abort(true);

        // Clean any pre-existing output buffers
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        $headersSent = false;
        $isHls = str_contains($targetUrl, '.m3u8');
        $fallbackContentType = $isHls ? 'application/vnd.apple.mpegurl' : 'audio/mpeg';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $targetUrl);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 0);          // Continuous live stream
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 6);   // 6s connection timeout
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RadioWave-Proxy/2.0');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: */*',
            'Icy-MetaData: 1'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);

        curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($ch, $headerLine) use (&$headersSent, $fallbackContentType, $stationName) {
            $len = strlen($headerLine);
            $clean = trim($headerLine);
            if (empty($clean)) {
                if (!$headersSent) {
                    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: $fallbackContentType;
                    header('Content-Type: ' . $contentType);
                    header('Access-Control-Allow-Origin: *');
                    header('Access-Control-Allow-Methods: GET, HEAD, OPTIONS');
                    header('Access-Control-Allow-Headers: *');
                    header('Cache-Control: no-cache, no-store, must-revalidate');
                    header('Pragma: no-cache');
                    header('Expires: 0');
                    header('icy-name: ' . rawurlencode($stationName));
                    header('X-Proxy-Engine: RadioWave-SSL-Edge');
                    $headersSent = true;
                }
            } elseif (stripos($clean, 'Content-Type:') === 0) {
                header($clean);
                $headersSent = true;
            } elseif (stripos($clean, 'icy-') === 0) {
                header($clean);
            }
            return $len;
        });

        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) use (&$headersSent, $fallbackContentType, $stationName) {
            // Client disconnection / abort detection -> clean up socket immediately
            if (connection_aborted()) {
                return 0;
            }
            if (!$headersSent) {
                $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: $fallbackContentType;
                header('Content-Type: ' . $contentType);
                header('Access-Control-Allow-Origin: *');
                header('Access-Control-Allow-Methods: GET, HEAD, OPTIONS');
                header('Access-Control-Allow-Headers: *');
                header('Cache-Control: no-cache, no-store, must-revalidate');
                header('Pragma: no-cache');
                header('Expires: 0');
                header('icy-name: ' . rawurlencode($stationName));
                header('X-Proxy-Engine: RadioWave-SSL-Edge');
                $headersSent = true;
            }
            echo $chunk;
            flush();
            return strlen($chunk);
        });

        $res = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        // If headers weren't sent and connection failed, return structured 502
        if (!$headersSent && ($res === false || $httpCode >= 400 || $httpCode === 0)) {
            http_response_code(502);
            header('Content-Type: application/json');
            header('Access-Control-Allow-Origin: *');
            echo json_encode([
                'error' => 'Upstream audio stream unreachable or timed out.',
                'target_url' => $targetUrl,
                'upstream_http_code' => $httpCode,
                'details' => $curlError ?: 'Connection failed',
                'status' => 502
            ]);
            exit;
        }
        exit;
    }

    /**
     * Streams station audio by station ID, resolving external, managed mount, or fallback source.
     */
    public static function streamStationAudio(int $stationId): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT s.id, s.name, s.slug, ss.mode, ss.stream_url, ss.bitrate, ss.codec
            FROM stations s
            LEFT JOIN station_streams ss ON s.id = ss.station_id
            WHERE s.id = ?
        ");
        $stmt->execute([$stationId]);
        $station = $stmt->fetch();

        if (!$station) {
            http_response_code(404);
            header('Content-Type: application/json');
            header('Access-Control-Allow-Origin: *');
            echo json_encode(['error' => 'Station not found', 'status' => 404]);
            exit;
        }

        // Determine audio source URL
        $sourceUrl = $station['stream_url'] ?? '';
        
        // Auto-detect if live studio encoder is broadcasting on local Icecast port 8005
        $localHealth = @file_get_contents('http://127.0.0.1:8005/health', false, stream_context_create(['http' => ['timeout' => 0.2]]));
        if ($localHealth && ($healthData = json_decode($localHealth, true)) && in_array('/ene-fm', $healthData['mounts'] ?? [], true)) {
            $sourceUrl = 'http://127.0.0.1:8005/ene-fm';
        } elseif (empty($sourceUrl) || !filter_var($sourceUrl, FILTER_VALIDATE_URL) || str_contains($sourceUrl, 'localhost')) {
            $sourceUrl = self::$defaultStreams[$stationId] ?? 'https://atunwadigital.streamguys1.com/classic105';
        }

        self::streamDirectUrl($sourceUrl, $station['name']);
    }
}
