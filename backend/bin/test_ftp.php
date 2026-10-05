<?php
$ftp_server = "ftp.radiowave.co.ke";
$ftp_user = "radio@radiowave.co.ke";
$ftp_pass = "William#20";

echo "Connecting to $ftp_server...\n";
$conn_id = @ftp_connect($ftp_server, 21, 15);
if (!$conn_id) {
    // Try resolving host IP or using ssl
    echo "Direct ftp_connect failed. Trying ftp_ssl_connect...\n";
    $conn_id = @ftp_ssl_connect($ftp_server, 21, 15);
}

if (!$conn_id) {
    echo "ERROR: Could not connect to FTP host $ftp_server.\n";
    // Check DNS resolution
    $ip = gethostbyname($ftp_server);
    echo "Resolved IP: $ip\n";
    exit(1);
}

echo "Connected! Logging in with user $ftp_user...\n";
if (@ftp_login($conn_id, $ftp_user, $ftp_pass)) {
    echo "SUCCESS: Logged in successfully!\n";
    ftp_pasv($conn_id, true);
    
    $pwd = ftp_pwd($conn_id);
    echo "Current remote working directory: $pwd\n";
    
    $list = ftp_nlist($conn_id, ".");
    echo "Files in remote directory:\n";
    print_r($list);
} else {
    echo "ERROR: FTP login failed for $ftp_user.\n";
}

ftp_close($conn_id);
