<?php
// backend/config/config.php
declare(strict_types=1);

error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
ini_set('display_errors', '0');

if (!defined('ROOT_DIR')) {
    define('ROOT_DIR', dirname(__DIR__, 2));
}
if (!defined('BACKEND_DIR')) {
    define('BACKEND_DIR', dirname(__DIR__));
}
if (!defined('DATA_DIR')) {
    define('DATA_DIR', BACKEND_DIR . '/data');
}
if (!defined('UPLOADS_DIR')) {
    define('UPLOADS_DIR', ROOT_DIR . '/public/uploads');
}

if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0777, true);
}
if (!is_dir(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0777, true);
}

// Automatically load .env if present (Ideal for HostPinnacle cPanel)
if (file_exists(ROOT_DIR . '/.env')) {
    $lines = file(ROOT_DIR . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            [$k, $v] = explode('=', $line, 2);
            $k = trim($k);
            $v = trim($v, " \t\n\r\0\x0B\"'");
            putenv("$k=$v");
            $_ENV[$k] = $v;
            $_SERVER[$k] = $v;
        }
    }
}

return [
    'app_name' => 'RadioWave Kenya - Streaming & Discovery Platform',
    'app_env' => getenv('APP_ENV') ?: 'development',
    'jwt_secret' => getenv('JWT_SECRET') ?: 'radiowave_super_secure_jwt_secret_key_2026_kenya',
    'database' => [
        'driver' => getenv('DB_DRIVER') ?: 'pgsql',
        'sqlite_path' => DATA_DIR . '/radiowave.sqlite',
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: '5432',
        'dbname' => getenv('DB_NAME') ?: 'radiowav_radio',
        'user' => getenv('DB_USER') ?: 'radiowav_Willy',
        'password' => getenv('DB_PASS') ?: 'William#20',
        'charset' => getenv('DB_CHARSET') ?: 'utf8'
    ],
    'icecast' => [
        'host' => getenv('ICECAST_HOST') ?: '127.0.0.1',
        'port' => (int)(getenv('ICECAST_PORT') ?: 8000),
        'source_user' => 'source',
        'admin_user' => 'admin',
        'admin_password' => getenv('ICECAST_ADMIN_PASSWORD') ?: 'radiowave_admin_pass_2026',
        'default_bitrate' => 128,
        'default_codec' => 'mp3'
    ],
    'billing' => [
        'currency' => 'KES',
        'mpesa_shortcode' => '174379',
        'tax_rate' => 0.16
    ]
];
