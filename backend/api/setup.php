<?php
// backend/api/setup.php - Temporary initial database migration & seeding helper
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/src/Database.php';
require_once dirname(__DIR__) . '/src/Auth.php';
require_once dirname(__DIR__) . '/src/SeedData.php';

use App\Database;
use App\SeedData;

header('Content-Type: application/json');

try {
    $db = Database::getConnection();
    $driver = Database::getDriver();

    if ($driver === 'pgsql') {
        Database::createPostgresTables();
    } elseif ($driver === 'sqlite') {
        Database::createSqliteTables();
    } else {
        Database::createMySQLTables();
    }

    SeedData::run(true);

    $stationsCount = $db->query("SELECT COUNT(*) FROM stations")->fetchColumn();
    $usersCount = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();

    echo json_encode([
        'status' => 'success',
        'message' => 'PostgreSQL database seeded successfully!',
        'driver' => $driver,
        'stations_count' => (int)$stationsCount,
        'users_count' => (int)$usersCount
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
