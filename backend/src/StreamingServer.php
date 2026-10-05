<?php
// backend/src/StreamingServer.php
// Pure PHP Icecast-compatible Audio Streaming & Ingest Server
declare(strict_types=1);

class RadioWaveStreamingEngine {
    private string $host = '0.0.0.0';
    private int $port = 8005;
    private $serverSocket = null;
    private array $clients = [];
    private array $mounts = [];

    public function __construct(string $host = '0.0.0.0', int $port = 8005) {
        $this->host = $host;
        $this->port = $port;
    }

    public function start(): void {
        $context = stream_context_create(['socket' => ['so_reuseport' => 1, 'so_reuseaddr' => 1]]);
        $this->serverSocket = @stream_socket_server("tcp://{$this->host}:{$this->port}", $errno, $errstr, STREAM_SERVER_BIND | STREAM_SERVER_LISTEN, $context);

        if (!$this->serverSocket) {
            echo "❌ Failed to bind to {$this->host}:{$this->port}: {$errstr} ({$errno})\n";
            exit(1);
        }

        stream_set_blocking($this->serverSocket, false);
        echo "=====================================================\n";
        echo "🎙️ RadioWave Live Icecast Streaming Engine Started\n";
        echo "📡 Listening for BUTT / Studio Encoders on: {$this->host}:{$this->port}\n";
        echo "🔊 Mount Point: /ene-fm\n";
        echo "=====================================================\n";

        while (true) {
            $read = [];
            if (is_resource($this->serverSocket)) {
                $read[] = $this->serverSocket;
            } else {
                break;
            }

            foreach ($this->clients as $id => $client) {
                if (isset($client['socket']) && is_resource($client['socket'])) {
                    $read[] = $client['socket'];
                } else {
                    unset($this->clients[$id]);
                }
            }

            $write = [];
            $except = null;

            if (empty($read) || @stream_select($read, $write, $except, 0, 20000) === false) {
                usleep(10000);
                continue;
            }

            if (in_array($this->serverSocket, $read, true)) {
                $newSocket = @stream_socket_accept($this->serverSocket, 0);
                if ($newSocket && is_resource($newSocket)) {
                    stream_set_blocking($newSocket, false);
                    $id = (int)$newSocket;
                    $this->clients[$id] = [
                        'socket' => $newSocket,
                        'type' => 'pending',
                        'mount' => null,
                        'buffer' => '',
                        'created_at' => time()
                    ];
                }
                $key = array_search($this->serverSocket, $read, true);
                if ($key !== false) {
                    unset($read[$key]);
                }
            }

            foreach ($read as $socket) {
                $id = (int)$socket;
                if (!isset($this->clients[$id]) || !is_resource($socket)) {
                    continue;
                }

                $data = @fread($socket, 8192);
                if ($data === false || $data === '') {
                    $this->disconnectClient($id);
                    continue;
                }

                $client = &$this->clients[$id];

                if ($client['type'] === 'pending') {
                    $client['buffer'] .= $data;
                    if (strpos($client['buffer'], "\r\n\r\n") !== false || strpos($client['buffer'], "\n\n") !== false) {
                        $this->handleHandshake($id);
                    }
                } elseif ($client['type'] === 'source') {
                    $mount = $client['mount'];
                    if (isset($this->mounts[$mount])) {
                        $this->mounts[$mount]['burst_buffer'] = substr($this->mounts[$mount]['burst_buffer'] . $data, -65536);

                        foreach ($this->mounts[$mount]['listeners'] as $listenerId) {
                            if (isset($this->clients[$listenerId]['socket']) && is_resource($this->clients[$listenerId]['socket'])) {
                                @fwrite($this->clients[$listenerId]['socket'], $data);
                            }
                        }
                    }
                }
            }
        }
    }

    private function handleHandshake(int $id): void {
        if (!isset($this->clients[$id])) {
            return;
        }

        $client = &$this->clients[$id];
        $headers = $client['buffer'];
        $firstLine = strtok($headers, "\r\n");
        $parts = explode(' ', (string)$firstLine);
        $method = strtoupper($parts[0] ?? '');
        $path = $parts[1] ?? '/';
        $mount = parse_url($path, PHP_URL_PATH) ?? '/ene-fm';

        echo "[Handshake] Method: {$method}, Mount: {$mount}, Client ID: #{$id}\n";

        if ($method === 'SOURCE' || $method === 'PUT') {
            $client['type'] = 'source';
            $client['mount'] = $mount;

            if (!isset($this->mounts[$mount])) {
                $this->mounts[$mount] = [
                    'source_id' => $id,
                    'burst_buffer' => '',
                    'listeners' => []
                ];
            } else {
                $oldSource = $this->mounts[$mount]['source_id'] ?? null;
                if ($oldSource && $oldSource !== $id && isset($this->clients[$oldSource])) {
                    $this->disconnectClient($oldSource);
                }
                $this->mounts[$mount]['source_id'] = $id;
            }

            $response = "HTTP/1.0 200 OK\r\nServer: RadioWave-Icecast/2.4.4\r\nConnection: Close\r\n\r\n";
            if (isset($client['socket']) && is_resource($client['socket'])) {
                @fwrite($client['socket'], $response);
            }

            echo "✅ STUDIO BROADCAST CONNECTED on mount: {$mount} (from BUTT/OBS)!\n";
        } elseif ($method === 'GET' || $method === 'HEAD') {
            $client['type'] = 'listener';
            $client['mount'] = $mount;

            // Icecast / BUTT Metadata & Status endpoints
            if (in_array($mount, ['/health', '/status', '/status-json.xsl', '/7.html', '/7.xsl', '/admin/stats.xml'], true)) {
                $statusData = [
                    'icestats' => [
                        'admin' => 'admin@radiowave.co.ke',
                        'location' => 'Kenya',
                        'server_id' => 'RadioWave-Icecast/2.4.4',
                        'source' => [
                            'mount' => '/ene-fm',
                            'listeners' => count($this->mounts['/ene-fm']['listeners'] ?? []),
                            'bitrate' => 128,
                            'genre' => 'Kenyan Radio',
                            'server_name' => 'ENE FM Live Studio',
                            'audio_info' => 'channels=2;samplerate=44100;bitrate=128'
                        ]
                    ]
                ];
                $rsp = json_encode($statusData);
                $resp = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: " . strlen($rsp) . "\r\nConnection: close\r\n\r\n" . $rsp;
                if (isset($client['socket']) && is_resource($client['socket'])) {
                    @fwrite($client['socket'], $resp);
                }
                $this->disconnectClient($id);
                return;
            }

            $response = "HTTP/1.1 200 OK\r\n";
            $response .= "Content-Type: audio/mpeg\r\n";
            $response .= "Server: RadioWave-Icecast/2.4.4\r\n";
            $response .= "Cache-Control: no-cache, no-store\r\n";
            $response .= "Access-Control-Allow-Origin: *\r\n";
            $response .= "Access-Control-Allow-Headers: Origin, Accept, X-Requested-With, Content-Type, Icy-MetaData\r\n";
            $response .= "Connection: close\r\n\r\n";
            
            if (isset($client['socket']) && is_resource($client['socket'])) {
                @fwrite($client['socket'], $response);
            }

            if (isset($this->mounts[$mount])) {
                $this->mounts[$mount]['listeners'][] = $id;
                if (!empty($this->mounts[$mount]['burst_buffer']) && isset($client['socket']) && is_resource($client['socket'])) {
                    @fwrite($client['socket'], $this->mounts[$mount]['burst_buffer']);
                }
                echo "[LISTENER] Connected to {$mount}\n";
            } else {
                $this->mounts[$mount] = ['source_id' => null, 'burst_buffer' => '', 'listeners' => [$id]];
            }
        } elseif ($method === 'OPTIONS') {
            if (isset($client['socket']) && is_resource($client['socket'])) {
                @fwrite($client['socket'], "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\n\r\n");
            }
            $this->disconnectClient($id);
        } else {
            if (isset($client['socket']) && is_resource($client['socket'])) {
                @fwrite($client['socket'], "HTTP/1.0 400 Bad Request\r\n\r\n");
            }
            $this->disconnectClient($id);
        }
    }

    private function disconnectClient(int $id): void {
        if (!isset($this->clients[$id])) {
            return;
        }

        $client = $this->clients[$id];
        $mount = $client['mount'];
        if ($client['type'] === 'source' && $mount && isset($this->mounts[$mount])) {
            if (($this->mounts[$mount]['source_id'] ?? null) === $id) {
                $this->mounts[$mount]['source_id'] = null;
                echo "[STUDIO DISCONNECTED] Mount: {$mount}\n";
            }
        } elseif ($client['type'] === 'listener' && $mount && isset($this->mounts[$mount])) {
            $key = array_search($id, $this->mounts[$mount]['listeners'], true);
            if ($key !== false) {
                unset($this->mounts[$mount]['listeners'][$key]);
            }
        }

        if (isset($client['socket']) && is_resource($client['socket'])) {
            @fclose($client['socket']);
        }
        unset($this->clients[$id]);
    }
}

$server = new RadioWaveStreamingEngine('0.0.0.0', 8005);
$server->start();