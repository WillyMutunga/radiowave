-- ========================================================
-- RadioWave Kenya - HostPinnacle cPanel MySQL Database Dump
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- ========================================================

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+03:00";

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(180) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(30) DEFAULT 'listener',
  `avatar_url` VARCHAR(255) NULL,
  `status` VARCHAR(30) DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping default accounts for `users`
-- Passwords:
-- admin@radiowave.co.ke -> admin123
-- owner@enefm.co.ke -> owner123
-- marcus@enefm.co.ke -> dj123
-- listener@gmail.com -> listener123
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `avatar_url`, `status`) VALUES
(1, 'Network Super Admin', 'admin@radiowave.co.ke', '+254700000001', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', 'active'),
(2, 'Station Manager (ENE FM)', 'owner@enefm.co.ke', '+254722999000', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'station_admin', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'active'),
(3, 'DJ Marcus (Studio Host)', 'marcus@enefm.co.ke', '+254711888999', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'presenter', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', 'active'),
(4, 'Public Listener', 'listener@gmail.com', '+254733444555', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'listener', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', 'active');

-- --------------------------------------------------------
-- Table structure for `stations`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `stations`;
CREATE TABLE `stations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_id` INT UNSIGNED NULL,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `tagline` VARCHAR(255) NULL,
  `frequency` VARCHAR(50) NULL,
  `description` TEXT NULL,
  `county` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `country` VARCHAR(100) DEFAULT 'Kenya',
  `language` VARCHAR(100) DEFAULT 'English/Swahili',
  `genre` VARCHAR(100) DEFAULT 'General',
  `logo_url` VARCHAR(255) NULL,
  `cover_url` VARCHAR(255) NULL,
  `website` VARCHAR(255) NULL,
  `contact_email` VARCHAR(180) NULL,
  `contact_phone` VARCHAR(50) NULL,
  `status` VARCHAR(30) DEFAULT 'published',
  `is_featured` TINYINT(1) DEFAULT 0,
  `listeners_count` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `stations` (`id`, `owner_id`, `name`, `slug`, `tagline`, `frequency`, `description`, `county`, `city`, `country`, `language`, `genre`, `logo_url`, `cover_url`, `website`, `contact_email`, `contact_phone`, `status`, `is_featured`, `listeners_count`) VALUES
(1, 2, 'ENE FM', 'ene-fm', 'Sauti ya Ukweli na Burudani Halisi', '99.9 FM', 'ENE FM is a premier regional commercial radio station broadcasting authentic music, live talk, community news, and cultural entertainment across Nairobi and Eastern Kenya.', 'Machakos', 'Machakos', 'Kenya', 'Swahili/Kamba', 'Afrobeat & Culture', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', 'https://enefm.co.ke', 'studio@enefm.co.ke', '+254722999000', 'published', 1, 1420),
(2, 1, 'Capital FM Kenya', 'capital-fm', 'The Best Mix of Music', '98.4 FM', 'Capital FM is Kenya\'s premier urban contemporary hit radio station featuring pop, afro-fusion, rock, and authoritative global news.', 'Nairobi', 'Nairobi', 'Kenya', 'English', 'Urban Contemporary', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', 'https://www.capitalfm.co.ke', 'info@capitalfm.co.ke', '+254700984984', 'published', 1, 3850),
(3, 1, 'Classic 105', 'classic-105', 'Good Times and Great Hits', '105.2 FM', 'Classic 105 is home to the biggest morning drive conversations and timeless adult contemporary soul, R&B, and pop classics.', 'Nairobi', 'Nairobi', 'Kenya', 'English/Swahili', 'Soul & Classics', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800', 'https://classic105.com', 'info@classic105.com', '+254711046105', 'published', 1, 4120),
(4, 1, 'Radio Citizen', 'radio-citizen', 'Wote Tuseme Citizen', '106.7 FM', 'The most listened-to national vernacular and Swahili network in East Africa, offering grassroots reporting, Taarab, Rhumba, and benga.', 'Nairobi', 'Nairobi', 'Kenya', 'Swahili', 'Rhumba & News', 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300', 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800', 'https://citizen.digital/radio', 'radiocitizen@royalmedia.co.ke', '+254719060000', 'published', 1, 6200),
(5, 1, 'Kiss 100 Kenya', 'kiss-100', 'The Beat of Nairobi', '100.3 FM', 'Kiss 100 delivers youth culture, viral morning banter, trending gengetone, hip hop, and afrobeat bangers.', 'Nairobi', 'Nairobi', 'Kenya', 'English', 'Hip Hop & Gengetone', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=300', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800', 'https://kiss100.co.ke', 'studio@kiss100.co.ke', '+254711046100', 'published', 1, 2980);

-- --------------------------------------------------------
-- Table structure for `station_streams`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `station_streams`;
CREATE TABLE `station_streams` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `station_id` INT UNSIGNED NOT NULL UNIQUE,
  `mode` VARCHAR(30) DEFAULT 'external',
  `stream_url` VARCHAR(500) NULL,
  `backup_url` VARCHAR(500) NULL,
  `mount_name` VARCHAR(100) NULL,
  `codec` VARCHAR(20) DEFAULT 'mp3',
  `bitrate` INT DEFAULT 128,
  `status` VARCHAR(30) DEFAULT 'online',
  `is_live` TINYINT(1) DEFAULT 1,
  `last_checked_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `uptime_percentage` DECIMAL(5,2) DEFAULT 99.80,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `station_streams` (`id`, `station_id`, `mode`, `stream_url`, `backup_url`, `mount_name`, `codec`, `bitrate`, `status`, `is_live`, `uptime_percentage`) VALUES
(1, 1, 'external', 'http://uk3-vn.mixstream.net:8128/listen.mp3/;', '', '/ene-fm', 'mp3', 128, 'online', 1, 99.90),
(2, 2, 'external', 'https://icecast.capitalfm.co.ke/capitalfm', '', '/capital-fm', 'mp3', 128, 'online', 1, 99.95),
(3, 3, 'external', 'https://stream.radioafricagroup.co.ke/classic105', '', '/classic105', 'mp3', 128, 'online', 1, 99.90),
(4, 4, 'external', 'https://stream.royalmedia.co.ke/radiocitizen', '', '/radiocitizen', 'mp3', 128, 'online', 1, 99.85),
(5, 5, 'external', 'https://stream.radioafricagroup.co.ke/kiss100', '', '/kiss100', 'mp3', 128, 'online', 1, 99.90);

-- --------------------------------------------------------
-- Table structure for `stream_credentials`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `stream_credentials`;
CREATE TABLE `stream_credentials` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `station_stream_id` INT UNSIGNED NOT NULL UNIQUE,
  `server_host` VARCHAR(255) DEFAULT 'stream.radiowave.co.ke',
  `server_port` INT DEFAULT 8000,
  `mount_point` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) DEFAULT 'source',
  `password` VARCHAR(255) NOT NULL,
  `codec` VARCHAR(20) DEFAULT 'mp3',
  `bitrate` INT DEFAULT 128,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`station_stream_id`) REFERENCES `station_streams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `stream_credentials` (`id`, `station_stream_id`, `server_host`, `server_port`, `mount_point`, `username`, `password`, `codec`, `bitrate`) VALUES
(1, 1, 'stream.radiowave.co.ke', 8005, '/ene-fm', 'source', 'enefm_live_source_2026', 'mp3', 128),
(2, 2, 'stream.radiowave.co.ke', 8005, '/capital-fm', 'source', 'capital_live_source_2026', 'mp3', 128);

-- --------------------------------------------------------
-- Table structure for `now_playing`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `now_playing`;
CREATE TABLE `now_playing` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `station_id` INT UNSIGNED NOT NULL UNIQUE,
  `programme_name` VARCHAR(150) NULL,
  `track_title` VARCHAR(150) NULL,
  `artist_name` VARCHAR(150) NULL,
  `started_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `source` VARCHAR(50) DEFAULT 'manual',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `now_playing` (`id`, `station_id`, `programme_name`, `track_title`, `artist_name`) VALUES
(1, 1, 'ENE Breakfast Explosion', 'Kwangwaru', 'Harmonize ft. Diamond Platnumz'),
(2, 2, 'Capital In The Morning', 'Starboy', 'The Weeknd ft. Daft Punk'),
(3, 3, 'Maina & Kingangi in the Morning', 'Endless Love', 'Lionel Richie & Diana Ross'),
(4, 4, 'Jambo Citizen', 'Mpenzi', 'Les Wanyika'),
(5, 5, 'The Morning Kiss', 'Sura Yako', 'Sauti Sol');

-- --------------------------------------------------------
-- Table structure for `presenters`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `presenters`;
CREATE TABLE `presenters` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `station_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NULL,
  `name` VARCHAR(120) NOT NULL,
  `bio` TEXT NULL,
  `photo_url` VARCHAR(255) NULL,
  `social_handle` VARCHAR(100) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `presenters` (`id`, `station_id`, `user_id`, `name`, `bio`, `photo_url`, `social_handle`) VALUES
(1, 1, 3, 'DJ Marcus & Annastacia', 'Energizing breakfast hosts delivering humor, trending news, and local jams.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', '@djmarcuske'),
(2, 1, NULL, 'MC Kinyanjui', 'Midday host for community discussions, requests, and Benga classics.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', '@mckinyanjui'),
(3, 1, NULL, 'Sarah Ndanu', 'Evening drive host with acoustic sessions, traffic reports, and love dedications.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', '@sarah_ndanu');

-- --------------------------------------------------------
-- Table structure for `programmes`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `programmes`;
CREATE TABLE `programmes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `station_id` INT UNSIGNED NOT NULL,
  `presenter_id` INT UNSIGNED NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `days_of_week` VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
  `start_time` VARCHAR(10) NOT NULL,
  `end_time` VARCHAR(10) NOT NULL,
  `cover_image` VARCHAR(255) NULL,
  `status` VARCHAR(30) DEFAULT 'active',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`presenter_id`) REFERENCES `presenters`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `programmes` (`id`, `station_id`, `presenter_id`, `title`, `description`, `days_of_week`, `start_time`, `end_time`, `cover_image`) VALUES
(1, 1, 1, 'ENE Breakfast Explosion', 'Kickstart your morning with high-tempo tunes, breaking national news, and interactive banter.', 'Mon,Tue,Wed,Thu,Fri', '06:00', '10:00', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500'),
(2, 1, 2, 'Kazi na Muziki', 'Your midday companion featuring business interviews, listener song requests, and Rhumba tracks.', 'Mon,Tue,Wed,Thu,Fri', '10:00', '14:00', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500'),
(3, 1, 3, 'The Evening Highway Jam', 'Smooth commute companion with live call-ins, relationship debates, and reggae remixes.', 'Mon,Tue,Wed,Thu,Fri', '16:00', '20:00', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500');

-- --------------------------------------------------------
-- Table structure for `listener_requests`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `listener_requests`;
CREATE TABLE `listener_requests` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `station_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NULL,
  `listener_name` VARCHAR(100) NOT NULL,
  `listener_phone` VARCHAR(50) NULL,
  `song_title` VARCHAR(150) NOT NULL,
  `artist` VARCHAR(150) NULL,
  `message` TEXT NULL,
  `status` VARCHAR(30) DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `listener_requests` (`id`, `station_id`, `listener_name`, `listener_phone`, `song_title`, `artist`, `message`, `status`) VALUES
(1, 1, 'Brian Mwangi', '0722111222', 'Sura Yako', 'Sauti Sol', 'Dedicate this to the listeners tuning in from Machakos town!', 'approved'),
(2, 1, 'Mercy Chebet', '0711333444', 'Enjoy', 'Jux ft. Diamond', 'Big shoutout to the morning drive team. We are tuned in from Westlands.', 'pending'),
(3, 1, 'Kevin Otieno', '0733555666', 'Katerina', 'Bruce Melodie', 'Please play this for the team working hard today.', 'played');

-- --------------------------------------------------------
-- Table structure for `podcasts`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `podcasts`;
CREATE TABLE `podcasts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `station_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `cover_url` VARCHAR(255) NULL,
  `category` VARCHAR(100) DEFAULT 'General',
  `status` VARCHAR(30) DEFAULT 'published',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `podcasts` (`id`, `station_id`, `title`, `description`, `cover_url`, `category`) VALUES
(1, 1, 'ENE Morning Show Catch-Up', 'Missed the morning banter? Catch the daily best moments and uncensored interviews.', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400', 'Talk & Comedy'),
(2, 1, 'Business & Farming Horizons', 'Expert weekly guide to agriculture, trade, and investments in Eastern Kenya.', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400', 'Business');

-- --------------------------------------------------------
-- Table structure for `episodes`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `episodes`;
CREATE TABLE `episodes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `podcast_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `audio_url` VARCHAR(500) NOT NULL,
  `duration` VARCHAR(30) DEFAULT '45:00',
  `play_count` INT DEFAULT 0,
  `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`podcast_id`) REFERENCES `podcasts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `episodes` (`id`, `podcast_id`, `title`, `description`, `audio_url`, `duration`, `play_count`) VALUES
(1, 1, 'Episode 42: Morning Banter & Nairobi Traffic Special', 'Full recap of today\'s morning show discussion on fuel prices and live call-ins.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '42:15', 380),
(2, 2, 'Agri-Tech & Avocado Export Boom', 'Comprehensive guide to commercial Hass avocado growing and export logistics in Kenya.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', '35:20', 215);

-- --------------------------------------------------------
-- Table structure for `plans`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `plans`;
CREATE TABLE `plans` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `price_monthly` DECIMAL(10,2) NOT NULL,
  `max_listeners` INT DEFAULT 500,
  `bitrate_limit` INT DEFAULT 128,
  `features` TEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `plans` (`id`, `name`, `slug`, `price_monthly`, `max_listeners`, `bitrate_limit`, `features`) VALUES
(1, 'Community FM Starter', 'starter', 4999.00, 500, 128, '500 Concurrent Listeners, 128k MP3, Standard Analytics, Song Request System'),
(2, 'Regional Commercial Pro', 'pro', 12999.00, 3000, 192, '3,000 Concurrent Listeners, 192k HD Audio, WhatsApp Ingest Hook, Real-Time Telemetry'),
(3, 'National Broadcaster Enterprise', 'enterprise', 29999.00, 20000, 320, 'Unlimited Listeners, 320k Studio HD, Multi-Mount Fallback, 99.99% Uptime SLA');

-- --------------------------------------------------------
-- Table structure for `station_subscriptions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `station_subscriptions`;
CREATE TABLE `station_subscriptions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `station_id` INT UNSIGNED NOT NULL,
  `plan_id` INT UNSIGNED NOT NULL,
  `status` VARCHAR(30) DEFAULT 'active',
  `start_date` DATE DEFAULT (CURRENT_DATE),
  `next_billing_date` DATE DEFAULT (CURRENT_DATE + INTERVAL 30 DAY),
  `mpesa_reference` VARCHAR(100) NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `station_subscriptions` (`id`, `station_id`, `plan_id`, `status`, `mpesa_reference`) VALUES
(1, 1, 2, 'active', 'QBH789XY21');

-- --------------------------------------------------------
-- Table structure for `audit_logs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `actor_id` INT UNSIGNED NULL,
  `actor_role` VARCHAR(50) NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NULL,
  `ip_address` VARCHAR(50) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `audit_logs` (`id`, `actor_id`, `actor_role`, `action`, `details`) VALUES
(1, 1, 'super_admin', 'SYSTEM_INIT', 'RadioWave Kenya digital broadcast platform initialized successfully.'),
(2, 2, 'station_admin', 'STREAM_CONFIG_UPDATE', 'ENE FM encoder stream configuration verified and operational.');

SET FOREIGN_KEY_CHECKS=1;
