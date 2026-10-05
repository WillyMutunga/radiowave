<?php
$ftp_server = "ftp.radiowave.co.ke";
$ftp_user = "radio@radiowave.co.ke";
$ftp_pass = "William#20";

echo "Connecting to $ftp_server...\n";
$conn_id = @ftp_ssl_connect($ftp_server, 21, 15) ?: @ftp_connect($ftp_server, 21, 15);

if (!$conn_id) {
    echo "ERROR: Could not connect to FTP host $ftp_server.\n";
    exit(1);
}

if (!@ftp_login($conn_id, $ftp_user, $ftp_pass)) {
    echo "ERROR: FTP login failed for $ftp_user.\n";
    exit(1);
}

ftp_pasv($conn_id, true);
echo "SUCCESS: Logged in to FTP.\n";

$files_to_sync = [
    'public/css/styles.css' => 'public/css/styles.css',
    'public/index.html' => 'public/index.html',
    'public/js/components.js' => 'public/js/components.js',
    'public/js/app.js' => 'public/js/app.js',
    'public/js/player.js' => 'public/js/player.js',
];

$base_dir = dirname(__DIR__, 2);

foreach ($files_to_sync as $local_rel => $remote_rel) {
    $local_path = $base_dir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $local_rel);
    if (!file_exists($local_path)) {
        echo "Local file not found: $local_path\n";
        continue;
    }
    
    // Ensure remote directory exists
    $remote_dir = dirname($remote_rel);
    if ($remote_dir !== '.' && $remote_dir !== '') {
        @ftp_mkdir($conn_id, $remote_dir);
    }
    
    echo "Uploading $local_rel -> $remote_rel... ";
    if (ftp_put($conn_id, $remote_rel, $local_path, FTP_BINARY)) {
        echo "OK (" . filesize($local_path) . " bytes)\n";
    } else {
        echo "FAILED\n";
    }
}

ftp_close($conn_id);
echo "Sync complete!\n";
