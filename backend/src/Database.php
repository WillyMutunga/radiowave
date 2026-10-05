<?php
// backend/src/Database.php
declare(strict_types=1);

namespace App;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;
    private static array $config = [];
    private static string $currentDriver = 'pgsql';

    public static function init(array $config): void {
        self::$config = $config;
        self::$instance = null;
    }

    public static function getDriver(): string {
        return self::$currentDriver;
    }

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            if (empty(self::$config)) {
                self::$config = require dirname(__DIR__) . '/config/config.php';
            }

            $dbConfig = self::$config['database'];
            $driver = strtolower($dbConfig['driver'] ?? 'pgsql');
            if ($driver === 'postgres' || $driver === 'postgresql') {
                $driver = 'pgsql';
            }
            self::$currentDriver = $driver;

            try {
                if ($driver === 'pgsql') {
                    $host = $dbConfig['host'] ?? '127.0.0.1';
                    $port = $dbConfig['port'] ?? '5432';
                    $dbname = $dbConfig['dbname'] ?? 'radio';
                    $user = $dbConfig['user'] ?? 'postgres';
                    $password = $dbConfig['password'] ?? '';
                    $dsn = "pgsql:host={$host};port={$port};dbname={$dbname}";

                    self::$instance = new PDO($dsn, $user, $password, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false
                    ]);

                    self::createPostgresTables();
                } elseif ($driver === 'sqlite') {
                    $dbPath = $dbConfig['sqlite_path'];
                    $isNew = !file_exists($dbPath);
                    self::$instance = new PDO("sqlite:" . $dbPath, null, null, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                    ]);
                    self::$instance->exec("PRAGMA journal_mode = WAL;");
                    self::$instance->exec("PRAGMA busy_timeout = 5000;");
                    self::$instance->exec("PRAGMA foreign_keys = ON;");
                    
                    if ($isNew) {
                        self::createSqliteTables();
                    }
                } else {
                    // MySQL / MariaDB
                    $dsn = sprintf(
                        "mysql:host=%s;port=%s;dbname=%s;charset=%s",
                        $dbConfig['host'] ?? '127.0.0.1',
                        $dbConfig['port'] ?: '3306',
                        $dbConfig['dbname'] ?? 'radiowave_db',
                        $dbConfig['charset'] ?? 'utf8mb4'
                    );
                    self::$instance = new PDO($dsn, $dbConfig['user'] ?? 'root', $dbConfig['password'] ?? '', [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false
                    ]);
                    self::createMySQLTables();
                }
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => 'Database connection failed: ' . $e->getMessage(),
                    'driver' => $driver
                ]);
                exit;
            }
        }

        return self::$instance;
    }

    public static function createPostgresTables(): void {
        $db = self::$instance;
        if (!$db) return;

        $schema = "
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(180) UNIQUE NOT NULL,
            phone VARCHAR(30) NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(30) DEFAULT 'listener',
            avatar_url VARCHAR(255) NULL,
            status VARCHAR(30) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS stations (
            id SERIAL PRIMARY KEY,
            owner_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
            name VARCHAR(150) NOT NULL,
            slug VARCHAR(150) UNIQUE NOT NULL,
            tagline VARCHAR(255) NULL,
            frequency VARCHAR(50) NULL,
            description TEXT NULL,
            county VARCHAR(100) NOT NULL,
            city VARCHAR(100) NOT NULL,
            country VARCHAR(100) DEFAULT 'Kenya',
            language VARCHAR(100) DEFAULT 'English/Swahili',
            genre VARCHAR(100) DEFAULT 'General',
            logo_url VARCHAR(255) NULL,
            cover_url VARCHAR(255) NULL,
            website VARCHAR(255) NULL,
            contact_email VARCHAR(180) NULL,
            contact_phone VARCHAR(50) NULL,
            status VARCHAR(30) DEFAULT 'published',
            is_featured BOOLEAN DEFAULT FALSE,
            listeners_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS station_streams (
            id SERIAL PRIMARY KEY,
            station_id INTEGER NOT NULL UNIQUE REFERENCES stations(id) ON DELETE CASCADE,
            mode VARCHAR(30) DEFAULT 'external',
            stream_url VARCHAR(500) NULL,
            backup_url VARCHAR(500) NULL,
            mount_name VARCHAR(100) NULL,
            codec VARCHAR(20) DEFAULT 'mp3',
            bitrate INTEGER DEFAULT 128,
            status VARCHAR(30) DEFAULT 'online',
            is_live BOOLEAN DEFAULT TRUE,
            last_checked_at TIMESTAMP NULL,
            uptime_percentage NUMERIC(5,2) DEFAULT 99.80
        );

        CREATE TABLE IF NOT EXISTS stream_credentials (
            id SERIAL PRIMARY KEY,
            station_stream_id INTEGER NOT NULL UNIQUE REFERENCES station_streams(id) ON DELETE CASCADE,
            server_host VARCHAR(255) DEFAULT 'stream.radiowave.co.ke',
            server_port INTEGER DEFAULT 8000,
            mount_point VARCHAR(100) NOT NULL,
            username VARCHAR(50) DEFAULT 'source',
            password VARCHAR(255) NOT NULL,
            codec VARCHAR(20) DEFAULT 'mp3',
            bitrate INTEGER DEFAULT 128,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS stream_incidents (
            id SERIAL PRIMARY KEY,
            station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
            incident_type VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(30) DEFAULT 'resolved',
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP NULL
        );

        CREATE TABLE IF NOT EXISTS stream_health_logs (
            id SERIAL PRIMARY KEY,
            station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL,
            http_code INTEGER NULL,
            latency_ms INTEGER NULL,
            content_type VARCHAR(100) NULL,
            message TEXT NULL,
            checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS presenters (
            id SERIAL PRIMARY KEY,
            station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
            user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
            name VARCHAR(120) NOT NULL,
            bio TEXT NULL,
            photo_url VARCHAR(255) NULL,
            social_handle VARCHAR(100) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS programmes (
            id SERIAL PRIMARY KEY,
            station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
            presenter_id INTEGER NULL REFERENCES presenters(id) ON DELETE SET NULL,
            title VARCHAR(150) NOT NULL,
            description TEXT NULL,
            days_of_week VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
            start_time VARCHAR(10) NOT NULL,
            end_time VARCHAR(10) NOT NULL,
            cover_image VARCHAR(255) NULL,
            status VARCHAR(30) DEFAULT 'active'
        );

        CREATE TABLE IF NOT EXISTS now_playing (
            id SERIAL PRIMARY KEY,
            station_id INTEGER NOT NULL UNIQUE REFERENCES stations(id) ON DELETE CASCADE,
            programme_name VARCHAR(150) NULL,
            track_title VARCHAR(150) NULL,
            artist_name VARCHAR(150) NULL,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            source VARCHAR(50) DEFAULT 'manual'
        );

        CREATE TABLE IF NOT EXISTS listener_requests (
            id SERIAL PRIMARY KEY,
            station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
            user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
            listener_name VARCHAR(100) NOT NULL,
            listener_phone VARCHAR(50) NULL,
            song_title VARCHAR(150) NOT NULL,
            artist VARCHAR(150) NULL,
            message TEXT NULL,
            status VARCHAR(30) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS favourites (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, station_id)
        );

        CREATE TABLE IF NOT EXISTS polls (
            id SERIAL PRIMARY KEY,
            station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
            question VARCHAR(255) NOT NULL,
            status VARCHAR(30) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS poll_options (
            id SERIAL PRIMARY KEY,
            poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
            option_text VARCHAR(150) NOT NULL,
            votes_count INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS podcasts (
            id SERIAL PRIMARY KEY,
            station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
            title VARCHAR(150) NOT NULL,
            description TEXT NULL,
            cover_url VARCHAR(255) NULL,
            category VARCHAR(100) DEFAULT 'General',
            status VARCHAR(30) DEFAULT 'published',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS episodes (
            id SERIAL PRIMARY KEY,
            podcast_id INTEGER NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
            title VARCHAR(150) NOT NULL,
            description TEXT NULL,
            audio_url VARCHAR(500) NOT NULL,
            duration VARCHAR(30) DEFAULT '45:00',
            play_count INTEGER DEFAULT 0,
            published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS plans (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            billing_cycle VARCHAR(30) DEFAULT 'monthly',
            stream_model VARCHAR(50) DEFAULT 'hybrid',
            max_bitrate INTEGER DEFAULT 192,
            features_json TEXT NULL
        );

        CREATE TABLE IF NOT EXISTS subscriptions (
            id SERIAL PRIMARY KEY,
            station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
            plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
            status VARCHAR(30) DEFAULT 'active',
            start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            renewal_date TIMESTAMP NULL
        );

        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
            provider VARCHAR(50) DEFAULT 'mpesa',
            reference VARCHAR(100) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(10) DEFAULT 'KES',
            status VARCHAR(30) DEFAULT 'completed',
            paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            actor_id INTEGER NULL,
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INTEGER NULL,
            details TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ";

        $db->exec($schema);
    }

    public static function createSqliteTables(): void {
        $db = self::$instance;
        if (!$db) return;

        $schema = "
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(180) UNIQUE NOT NULL,
            phone VARCHAR(30) NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(30) DEFAULT 'listener',
            avatar_url VARCHAR(255) NULL,
            status VARCHAR(30) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS stations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id INTEGER NULL,
            name VARCHAR(150) NOT NULL,
            slug VARCHAR(150) UNIQUE NOT NULL,
            tagline VARCHAR(255) NULL,
            frequency VARCHAR(50) NULL,
            description TEXT NULL,
            county VARCHAR(100) NOT NULL,
            city VARCHAR(100) NOT NULL,
            country VARCHAR(100) DEFAULT 'Kenya',
            language VARCHAR(100) DEFAULT 'English/Swahili',
            genre VARCHAR(100) DEFAULT 'General',
            logo_url VARCHAR(255) NULL,
            cover_url VARCHAR(255) NULL,
            website VARCHAR(255) NULL,
            contact_email VARCHAR(180) NULL,
            contact_phone VARCHAR(50) NULL,
            status VARCHAR(30) DEFAULT 'published',
            is_featured BOOLEAN DEFAULT 0,
            listeners_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS station_streams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id INTEGER NOT NULL UNIQUE,
            mode VARCHAR(30) DEFAULT 'external',
            stream_url VARCHAR(500) NULL,
            backup_url VARCHAR(500) NULL,
            mount_name VARCHAR(100) NULL,
            codec VARCHAR(20) DEFAULT 'mp3',
            bitrate INTEGER DEFAULT 128,
            status VARCHAR(30) DEFAULT 'online',
            is_live BOOLEAN DEFAULT 1,
            last_checked_at DATETIME NULL,
            uptime_percentage FLOAT DEFAULT 99.8,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS stream_credentials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_stream_id INTEGER NOT NULL UNIQUE,
            server_host VARCHAR(255) DEFAULT 'stream.radiowave.co.ke',
            server_port INTEGER DEFAULT 8000,
            mount_point VARCHAR(100) NOT NULL,
            username VARCHAR(50) DEFAULT 'source',
            password VARCHAR(255) NOT NULL,
            codec VARCHAR(20) DEFAULT 'mp3',
            bitrate INTEGER DEFAULT 128,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_stream_id) REFERENCES station_streams(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS stream_incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id INTEGER NOT NULL,
            incident_type VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(30) DEFAULT 'resolved',
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved_at DATETIME NULL,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS stream_health_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id INTEGER NOT NULL,
            status VARCHAR(20) NOT NULL,
            http_code INTEGER NULL,
            latency_ms INTEGER NULL,
            content_type VARCHAR(100) NULL,
            message TEXT NULL,
            checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS presenters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id INTEGER NOT NULL,
            user_id INTEGER NULL,
            name VARCHAR(120) NOT NULL,
            bio TEXT NULL,
            photo_url VARCHAR(255) NULL,
            social_handle VARCHAR(100) NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS programmes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id INTEGER NOT NULL,
            presenter_id INTEGER NULL,
            title VARCHAR(150) NOT NULL,
            description TEXT NULL,
            days_of_week VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
            start_time VARCHAR(10) NOT NULL,
            end_time VARCHAR(10) NOT NULL,
            cover_image VARCHAR(255) NULL,
            status VARCHAR(30) DEFAULT 'active',
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
            FOREIGN KEY (presenter_id) REFERENCES presenters(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS now_playing (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id INTEGER NOT NULL UNIQUE,
            programme_name VARCHAR(150) NULL,
            track_title VARCHAR(150) NULL,
            artist_name VARCHAR(150) NULL,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            source VARCHAR(50) DEFAULT 'manual',
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS listener_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id INTEGER NOT NULL,
            user_id INTEGER NULL,
            listener_name VARCHAR(100) NOT NULL,
            listener_phone VARCHAR(50) NULL,
            song_title VARCHAR(150) NOT NULL,
            artist VARCHAR(150) NULL,
            message TEXT NULL,
            status VARCHAR(30) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS favourites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            station_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, station_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS polls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id INTEGER NOT NULL,
            question VARCHAR(255) NOT NULL,
            status VARCHAR(30) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS poll_options (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            poll_id INTEGER NOT NULL,
            option_text VARCHAR(150) NOT NULL,
            votes_count INTEGER DEFAULT 0,
            FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS podcasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id INTEGER NOT NULL,
            title VARCHAR(150) NOT NULL,
            description TEXT NULL,
            cover_url VARCHAR(255) NULL,
            category VARCHAR(100) DEFAULT 'General',
            status VARCHAR(30) DEFAULT 'published',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS episodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            podcast_id INTEGER NOT NULL,
            title VARCHAR(150) NOT NULL,
            description TEXT NULL,
            audio_url VARCHAR(500) NOT NULL,
            duration VARCHAR(30) DEFAULT '45:00',
            play_count INTEGER DEFAULT 0,
            published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            billing_cycle VARCHAR(30) DEFAULT 'monthly',
            stream_model VARCHAR(50) DEFAULT 'hybrid',
            max_bitrate INTEGER DEFAULT 192,
            features_json TEXT NULL
        );

        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id INTEGER NOT NULL,
            plan_id INTEGER NOT NULL,
            status VARCHAR(30) DEFAULT 'active',
            start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            renewal_date DATETIME NULL,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subscription_id INTEGER NOT NULL,
            provider VARCHAR(50) DEFAULT 'mpesa',
            reference VARCHAR(100) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(10) DEFAULT 'KES',
            status VARCHAR(30) DEFAULT 'completed',
            paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            actor_id INTEGER NULL,
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INTEGER NULL,
            details TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        ";

        $db->exec($schema);
    }

    public static function createMySQLTables(): void {
        $db = self::$instance;
        if (!$db) return;

        $schema = "
        CREATE TABLE IF NOT EXISTS users (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(180) NOT NULL UNIQUE,
            phone VARCHAR(30) NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(30) DEFAULT 'listener',
            avatar_url VARCHAR(255) NULL,
            status VARCHAR(30) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS stations (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            owner_id INT UNSIGNED NULL,
            name VARCHAR(150) NOT NULL,
            slug VARCHAR(150) NOT NULL UNIQUE,
            tagline VARCHAR(255) NULL,
            frequency VARCHAR(50) NULL,
            description TEXT NULL,
            county VARCHAR(100) NOT NULL,
            city VARCHAR(100) NOT NULL,
            country VARCHAR(100) DEFAULT 'Kenya',
            language VARCHAR(100) DEFAULT 'English/Swahili',
            genre VARCHAR(100) DEFAULT 'General',
            logo_url VARCHAR(255) NULL,
            cover_url VARCHAR(255) NULL,
            website VARCHAR(255) NULL,
            contact_email VARCHAR(180) NULL,
            contact_phone VARCHAR(50) NULL,
            status VARCHAR(30) DEFAULT 'published',
            is_featured TINYINT(1) DEFAULT 0,
            listeners_count INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS station_streams (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            station_id INT UNSIGNED NOT NULL UNIQUE,
            mode VARCHAR(30) DEFAULT 'external',
            stream_url VARCHAR(500) NULL,
            backup_url VARCHAR(500) NULL,
            mount_name VARCHAR(100) NULL,
            codec VARCHAR(20) DEFAULT 'mp3',
            bitrate INT DEFAULT 128,
            status VARCHAR(30) DEFAULT 'online',
            is_live TINYINT(1) DEFAULT 1,
            last_checked_at DATETIME NULL,
            uptime_percentage DECIMAL(5,2) DEFAULT 99.80,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS stream_credentials (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            station_stream_id INT UNSIGNED NOT NULL UNIQUE,
            server_host VARCHAR(255) DEFAULT 'stream.radiowave.co.ke',
            server_port INT DEFAULT 8000,
            mount_point VARCHAR(100) NOT NULL,
            username VARCHAR(50) DEFAULT 'source',
            password VARCHAR(255) NOT NULL,
            codec VARCHAR(20) DEFAULT 'mp3',
            bitrate INT DEFAULT 128,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_stream_id) REFERENCES station_streams(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS stream_incidents (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            station_id INT UNSIGNED NOT NULL,
            incident_type VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(30) DEFAULT 'resolved',
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved_at DATETIME NULL,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS stream_health_logs (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            station_id INT UNSIGNED NOT NULL,
            status VARCHAR(20) NOT NULL,
            http_code INT NULL,
            latency_ms INT NULL,
            content_type VARCHAR(100) NULL,
            message TEXT NULL,
            checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS presenters (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            station_id INT UNSIGNED NOT NULL,
            user_id INT UNSIGNED NULL,
            name VARCHAR(120) NOT NULL,
            bio TEXT NULL,
            photo_url VARCHAR(255) NULL,
            social_handle VARCHAR(100) NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS programmes (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            station_id INT UNSIGNED NOT NULL,
            presenter_id INT UNSIGNED NULL,
            title VARCHAR(150) NOT NULL,
            description TEXT NULL,
            days_of_week VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
            start_time VARCHAR(10) NOT NULL,
            end_time VARCHAR(10) NOT NULL,
            cover_image VARCHAR(255) NULL,
            status VARCHAR(30) DEFAULT 'active',
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
            FOREIGN KEY (presenter_id) REFERENCES presenters(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS now_playing (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            station_id INT UNSIGNED NOT NULL UNIQUE,
            programme_name VARCHAR(150) NULL,
            track_title VARCHAR(150) NULL,
            artist_name VARCHAR(150) NULL,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            source VARCHAR(50) DEFAULT 'manual',
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS listener_requests (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            station_id INT UNSIGNED NOT NULL,
            user_id INT UNSIGNED NULL,
            listener_name VARCHAR(100) NOT NULL,
            listener_phone VARCHAR(50) NULL,
            song_title VARCHAR(150) NOT NULL,
            artist VARCHAR(150) NULL,
            message TEXT NULL,
            status VARCHAR(30) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS favourites (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            station_id INT UNSIGNED NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY user_station_unique (user_id, station_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS polls (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            station_id INT UNSIGNED NOT NULL,
            question VARCHAR(255) NOT NULL,
            status VARCHAR(30) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS poll_options (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            poll_id INT UNSIGNED NOT NULL,
            option_text VARCHAR(150) NOT NULL,
            votes_count INT DEFAULT 0,
            FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS podcasts (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            station_id INT UNSIGNED NOT NULL,
            title VARCHAR(150) NOT NULL,
            description TEXT NULL,
            cover_url VARCHAR(255) NULL,
            category VARCHAR(100) DEFAULT 'General',
            status VARCHAR(30) DEFAULT 'published',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS episodes (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            podcast_id INT UNSIGNED NOT NULL,
            title VARCHAR(150) NOT NULL,
            description TEXT NULL,
            audio_url VARCHAR(500) NOT NULL,
            duration VARCHAR(30) DEFAULT '45:00',
            play_count INT DEFAULT 0,
            published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS plans (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            billing_cycle VARCHAR(30) DEFAULT 'monthly',
            stream_model VARCHAR(50) DEFAULT 'hybrid',
            max_bitrate INT DEFAULT 192,
            features_json TEXT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS subscriptions (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            station_id INT UNSIGNED NOT NULL,
            plan_id INT UNSIGNED NOT NULL,
            status VARCHAR(30) DEFAULT 'active',
            start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            renewal_date DATETIME NULL,
            FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS payments (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            subscription_id INT UNSIGNED NOT NULL,
            provider VARCHAR(50) DEFAULT 'mpesa',
            reference VARCHAR(100) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(10) DEFAULT 'KES',
            status VARCHAR(30) DEFAULT 'completed',
            paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS audit_logs (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            actor_id INT UNSIGNED NULL,
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INT UNSIGNED NULL,
            details TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ";

        $db->exec($schema);
    }
}
