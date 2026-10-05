<?php
// backend/bin/migrate.php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Database.php';
require_once dirname(__DIR__) . '/src/Auth.php';
require_once dirname(__DIR__) . '/src/SeedData.php';

use App\Database;
use App\SeedData;

echo "========================================================\n";
echo " RadioWave Kenya - Database Migration & Seed Utility\n";
echo "========================================================\n\n";

try {
    echo "Connecting to database...\n";
    $db = Database::getConnection();
    $driver = Database::getDriver();
    echo "Connected successfully! [Driver: {$driver}]\n\n";

    $force = in_array('--force', $argv, true) || in_array('-f', $argv, true);
    
    echo "Running schema creation / table validation...\n";
    if ($driver === 'pgsql') {
        Database::createPostgresTables();
    } elseif ($driver === 'sqlite') {
        Database::createSqliteTables();
    } else {
        Database::createMySQLTables();
    }
    echo "Database schema tables verified/created.\n\n";

    echo "Running seeds (Force: " . ($force ? "YES" : "NO") . ")...\n";
    SeedData::run($force);
    echo "Seed data completed successfully.\n\n";

    // Summary counts
    $userCount = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $stationCount = $db->query("SELECT COUNT(*) FROM stations")->fetchColumn();
    $streamCount = $db->query("SELECT COUNT(*) FROM station_streams")->fetchColumn();
    $programmeCount = $db->query("SELECT COUNT(*) FROM programmes")->fetchColumn();
    $podcastCount = $db->query("SELECT COUNT(*) FROM podcasts")->fetchColumn();

    echo "--- Database Summary ---\n";
    echo " Users:          {$userCount}\n";
    echo " Stations:       {$stationCount}\n";
    echo " Active Streams: {$streamCount}\n";
    echo " Programmes:     {$programmeCount}\n";
    echo " Podcasts:       {$podcastCount}\n";
    echo "------------------------\n";
    echo "\nPostgreSQL Migration & Seeding Successful!\n";

} catch (Exception $e) {
    echo "\n[ERROR] Migration failed: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}
