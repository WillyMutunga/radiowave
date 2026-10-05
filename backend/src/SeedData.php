<?php
// backend/src/SeedData.php
declare(strict_types=1);

namespace App;

use PDO;

class SeedData {
    public static function run(bool $force = false): void {
        $db = Database::getConnection();

        // Check if already seeded
        $userCount = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
        if ($userCount > 0 && !$force) {
            return;
        }

        $driver = Database::getDriver();
        if ($force) {
            if ($driver === 'pgsql') {
                $db->exec("TRUNCATE TABLE audit_logs, payments, subscriptions, plans, episodes, podcasts, poll_options, polls, favourites, listener_requests, now_playing, programmes, presenters, stream_health_logs, stream_incidents, stream_credentials, station_streams, stations, users RESTART IDENTITY CASCADE;");
            } elseif ($driver === 'sqlite') {
                $db->exec("PRAGMA foreign_keys = OFF;");
                $db->exec("
                    DELETE FROM audit_logs;
                    DELETE FROM payments;
                    DELETE FROM subscriptions;
                    DELETE FROM plans;
                    DELETE FROM episodes;
                    DELETE FROM podcasts;
                    DELETE FROM poll_options;
                    DELETE FROM polls;
                    DELETE FROM favourites;
                    DELETE FROM listener_requests;
                    DELETE FROM now_playing;
                    DELETE FROM programmes;
                    DELETE FROM presenters;
                    DELETE FROM stream_health_logs;
                    DELETE FROM stream_incidents;
                    DELETE FROM stream_credentials;
                    DELETE FROM station_streams;
                    DELETE FROM stations;
                    DELETE FROM users;
                    DELETE FROM sqlite_sequence;
                ");
                $db->exec("PRAGMA foreign_keys = ON;");
            } else {
                $db->exec("SET FOREIGN_KEY_CHECKS = 0;");
                $db->exec("
                    TRUNCATE TABLE audit_logs;
                    TRUNCATE TABLE payments;
                    TRUNCATE TABLE subscriptions;
                    TRUNCATE TABLE plans;
                    TRUNCATE TABLE episodes;
                    TRUNCATE TABLE podcasts;
                    TRUNCATE TABLE poll_options;
                    TRUNCATE TABLE polls;
                    TRUNCATE TABLE favourites;
                    TRUNCATE TABLE listener_requests;
                    TRUNCATE TABLE now_playing;
                    TRUNCATE TABLE programmes;
                    TRUNCATE TABLE presenters;
                    TRUNCATE TABLE stream_health_logs;
                    TRUNCATE TABLE stream_incidents;
                    TRUNCATE TABLE stream_credentials;
                    TRUNCATE TABLE station_streams;
                    TRUNCATE TABLE stations;
                    TRUNCATE TABLE users;
                ");
                $db->exec("SET FOREIGN_KEY_CHECKS = 1;");
            }
        }

        // 1. Insert Users
        $users = [
            [
                'name' => 'Super Administrator',
                'email' => 'admin@radiowave.co.ke',
                'phone' => '+254711000001',
                'password_hash' => Auth::hashPassword('admin123'),
                'role' => 'super_admin',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                'status' => 'active'
            ],
            [
                'name' => 'Station Manager (ENE FM)',
                'email' => 'owner@enefm.co.ke',
                'phone' => '+254722000002',
                'password_hash' => Auth::hashPassword('owner123'),
                'role' => 'station_admin',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                'status' => 'active'
            ],
            [
                'name' => 'DJ Marcus (Presenter)',
                'email' => 'marcus@enefm.co.ke',
                'phone' => '+254733000003',
                'password_hash' => Auth::hashPassword('dj123'),
                'role' => 'presenter',
                'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                'status' => 'active'
            ],
            [
                'name' => 'Faith Mwangi (Listener)',
                'email' => 'listener@gmail.com',
                'phone' => '+254744000004',
                'password_hash' => Auth::hashPassword('listener123'),
                'role' => 'listener',
                'avatar_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                'status' => 'active'
            ]
        ];

        $userInsert = $db->prepare("
            INSERT INTO users (name, email, phone, password_hash, role, avatar_url, status)
            VALUES (:name, :email, :phone, :password_hash, :role, :avatar_url, :status)
        ");
        foreach ($users as $u) {
            $userInsert->execute($u);
        }

        // 2. Insert Plans
        $plans = [
            [
                'name' => 'Starter Aggregator',
                'price' => 0.00,
                'billing_cycle' => 'monthly',
                'stream_model' => 'external',
                'max_bitrate' => 128,
                'features_json' => json_encode(['Directory Listing', 'Public Player', 'Basic Analytics', 'External Stream Relay'])
            ],
            [
                'name' => 'Pro Aggregator',
                'price' => 2500.00,
                'billing_cycle' => 'monthly',
                'stream_model' => 'external',
                'max_bitrate' => 192,
                'features_json' => json_encode(['Priority Discovery', 'Programme Schedules', 'Listener Requests Box', 'Advanced Analytics', 'SMS/WhatsApp Hook'])
            ],
            [
                'name' => 'Managed Broadcast Pro',
                'price' => 7500.00,
                'billing_cycle' => 'monthly',
                'stream_model' => 'managed',
                'max_bitrate' => 192,
                'features_json' => json_encode(['Dedicated Icecast Mount', 'Full Encoder Provisioning', '99.9% SLA & Monitoring', 'Unlimited Listeners Relay', 'Podcasts Hosting'])
            ],
            [
                'name' => 'Enterprise Broadcast Network',
                'price' => 18000.00,
                'billing_cycle' => 'monthly',
                'stream_model' => 'hybrid',
                'max_bitrate' => 320,
                'features_json' => json_encode(['Multi-station Mounts', 'Global CDN Distribution', 'Custom Mobile SDK', 'Ad Insertion Engine', 'Dedicated Support'])
            ]
        ];
        $planInsert = $db->prepare("
            INSERT INTO plans (name, price, billing_cycle, stream_model, max_bitrate, features_json)
            VALUES (:name, :price, :billing_cycle, :stream_model, :max_bitrate, :features_json)
        ");
        foreach ($plans as $p) {
            $planInsert->execute($p);
        }

        // 3. Insert Verified Kenyan Stations with Real 24/7 Streams
        $stationsData = [
            [
                'name' => 'ENE FM',
                'slug' => 'ene-fm',
                'tagline' => 'Sauti ya Ukweli na Burudani Halisi',
                'frequency' => '99.9 FM',
                'description' => 'ENE FM is a premier regional commercial radio station broadcasting authentic music, live talk, community news, and cultural entertainment across Nairobi and Eastern Kenya.',
                'county' => 'Machakos',
                'city' => 'Machakos',
                'country' => 'Kenya',
                'language' => 'Swahili/Kamba',
                'genre' => 'Afrobeat & Culture',
                'logo_url' => 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300',
                'cover_url' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
                'website' => 'https://enefm.co.ke',
                'contact_email' => 'studio@enefm.co.ke',
                'contact_phone' => '+254722999000',
                'status' => 'published',
                'is_featured' => 1,
                'listeners_count' => 1420,
                'owner_id' => 2,
                'stream' => [
                    'mode' => 'external',
                    'stream_url' => 'http://uk3-vn.mixstream.net:8128/listen.mp3/;',
                    'mount_name' => '',
                    'codec' => 'mp3',
                    'bitrate' => 128,
                    'status' => 'online',
                    'is_live' => 1,
                    'uptime_percentage' => 99.9
                ]
            ],
            [
                'name' => 'Classic 105',
                'slug' => 'classic-105',
                'tagline' => 'Good Times and Great Hits',
                'frequency' => '105.0 FM',
                'description' => 'The home of soul, soul-stirring morning conversations with Maina & King\'ang\'i, and timeless classic hits in Kenya.',
                'county' => 'Nairobi',
                'city' => 'Nairobi',
                'country' => 'Kenya',
                'language' => 'English',
                'genre' => 'Classic Hits & Soul',
                'logo_url' => 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300',
                'cover_url' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
                'website' => 'https://classic105.com',
                'contact_email' => 'info@classic105.com',
                'contact_phone' => '+254711105105',
                'status' => 'published',
                'is_featured' => 1,
                'listeners_count' => 4820,
                'owner_id' => 1,
                'stream' => [
                    'mode' => 'external',
                    'stream_url' => 'https://atunwadigital.streamguys1.com/classic105',
                    'mount_name' => '',
                    'codec' => 'mp3',
                    'bitrate' => 128,
                    'status' => 'online',
                    'is_live' => 1,
                    'uptime_percentage' => 99.8
                ]
            ],
            [
                'name' => 'Radio Jambo',
                'slug' => 'radio-jambo',
                'tagline' => 'Mazungumzo ya Kweli na Michezo',
                'frequency' => '97.5 FM',
                'description' => 'Kenya’s leading Swahili talk, relationships and football commentary station with Gidi na Ghost Asubuhi.',
                'county' => 'Nairobi',
                'city' => 'Nairobi',
                'country' => 'Kenya',
                'language' => 'Swahili',
                'genre' => 'News, Talk & Sports',
                'logo_url' => 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300',
                'cover_url' => 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800',
                'website' => 'https://radiojambo.co.ke',
                'contact_email' => 'info@radiojambo.co.ke',
                'contact_phone' => '+254719000097',
                'status' => 'published',
                'is_featured' => 1,
                'listeners_count' => 5200,
                'owner_id' => 1,
                'stream' => [
                    'mode' => 'external',
                    'stream_url' => 'https://atunwadigital.streamguys1.com/radiojambo',
                    'mount_name' => '',
                    'codec' => 'mp3',
                    'bitrate' => 128,
                    'status' => 'online',
                    'is_live' => 1,
                    'uptime_percentage' => 99.9
                ]
            ],
            [
                'name' => 'East FM Kenya',
                'slug' => 'east-fm',
                'tagline' => 'The Premier Asian Mix',
                'frequency' => '106.3 FM',
                'description' => 'The pulse of Bollywood hits, Asian contemporary melodies, and community news in Kenya.',
                'county' => 'Nairobi',
                'city' => 'Nairobi',
                'country' => 'Kenya',
                'language' => 'English/Hindi',
                'genre' => 'Asian & Bollywood',
                'logo_url' => 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300',
                'cover_url' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
                'website' => 'https://eastfm.com',
                'contact_email' => 'info@eastfm.com',
                'contact_phone' => '+254722106300',
                'status' => 'published',
                'is_featured' => 1,
                'listeners_count' => 2890,
                'owner_id' => 1,
                'stream' => [
                    'mode' => 'external',
                    'stream_url' => 'https://atunwadigital.streamguys1.com/eastfm',
                    'mount_name' => '',
                    'codec' => 'mp3',
                    'bitrate' => 128,
                    'status' => 'online',
                    'is_live' => 1,
                    'uptime_percentage' => 99.9
                ]
            ],
            [
                'name' => 'BBC World Service Africa',
                'slug' => 'bbc-africa',
                'tagline' => 'Global News & In-depth African Analysis',
                'frequency' => '93.9 FM',
                'description' => 'Unbiased international news, Focus on Africa documentaries, sports updates and live reports.',
                'county' => 'Nairobi',
                'city' => 'Nairobi',
                'country' => 'Kenya',
                'language' => 'English/Swahili',
                'genre' => 'International News',
                'logo_url' => 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300',
                'cover_url' => 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
                'website' => 'https://bbc.com/africa',
                'contact_email' => 'africa@bbc.co.uk',
                'contact_phone' => '+254700093900',
                'status' => 'published',
                'is_featured' => 1,
                'listeners_count' => 3400,
                'owner_id' => 1,
                'stream' => [
                    'mode' => 'external',
                    'stream_url' => 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
                    'mount_name' => '',
                    'codec' => 'mp3',
                    'bitrate' => 128,
                    'status' => 'online',
                    'is_live' => 1,
                    'uptime_percentage' => 99.95
                ]
            ],
            [
                'name' => 'Radio Citizen',
                'slug' => 'radio-citizen',
                'tagline' => 'Makao ya Taifa',
                'frequency' => '106.7 FM',
                'description' => 'Kenya’s biggest national radio station offering comprehensive breaking news, cultural talk, and unmissable Rhumba.',
                'county' => 'Nairobi',
                'city' => 'Nairobi',
                'country' => 'Kenya',
                'language' => 'Swahili',
                'genre' => 'News, Talk & Rhumba',
                'logo_url' => 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=300',
                'cover_url' => 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800',
                'website' => 'https://radiocitizen.co.ke',
                'contact_email' => 'citizen@royalmedia.co.ke',
                'contact_phone' => '+254719000106',
                'status' => 'published',
                'is_featured' => 1,
                'listeners_count' => 6100,
                'owner_id' => 1,
                'stream' => [
                    'mode' => 'external',
                    'stream_url' => 'https://radiocitizen-atunwadigital.streamguys1.com/radiocitizen',
                    'mount_name' => '',
                    'codec' => 'mp3',
                    'bitrate' => 128,
                    'status' => 'online',
                    'is_live' => 1,
                    'uptime_percentage' => 99.8
                ]
            ],
            [
                'name' => 'Radio Maisha',
                'slug' => 'radio-maisha',
                'tagline' => 'Tuko Mbele Pamoja',
                'frequency' => '102.7 FM',
                'description' => 'Radio Maisha is a leading Swahili contemporary radio station offering electrifying breakfast shows, sports commentary, Rhumba, and Kenyan youth entertainment.',
                'county' => 'Nairobi',
                'city' => 'Nairobi',
                'country' => 'Kenya',
                'language' => 'Swahili',
                'genre' => 'News, Talk & Rhumba',
                'logo_url' => 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300',
                'cover_url' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
                'website' => 'https://radiomaisha.co.ke',
                'contact_email' => 'info@radiomaisha.co.ke',
                'contact_phone' => '+254700102700',
                'status' => 'published',
                'is_featured' => 1,
                'listeners_count' => 4600,
                'owner_id' => 1,
                'stream' => [
                    'mode' => 'external',
                    'stream_url' => 'https://radiomaisha-atunwadigital.streamguys1.com/radiomaisha',
                    'mount_name' => '',
                    'codec' => 'mp3',
                    'bitrate' => 128,
                    'status' => 'online',
                    'is_live' => 1,
                    'uptime_percentage' => 99.8
                ]
            ],
            [
                'name' => 'Inooro FM',
                'slug' => 'inooro-fm',
                'tagline' => 'Nyumba ya Mũgĩkũyũ',
                'frequency' => '98.9 FM',
                'description' => 'The leading Kikuyu language broadcast station delivering cultural heritage, Mugithi music, agricultural insights, and national news.',
                'county' => 'Nairobi',
                'city' => 'Nairobi',
                'country' => 'Kenya',
                'language' => 'Kikuyu',
                'genre' => 'Mugithi & Vernacular',
                'logo_url' => 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300',
                'cover_url' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
                'website' => 'https://inoorofm.co.ke',
                'contact_email' => 'inooro@royalmedia.co.ke',
                'contact_phone' => '+254719000098',
                'status' => 'published',
                'is_featured' => 1,
                'listeners_count' => 3890,
                'owner_id' => 1,
                'stream' => [
                    'mode' => 'external',
                    'stream_url' => 'https://inoorofm-atunwadigital.streamguys1.com/inoorofm',
                    'mount_name' => '',
                    'codec' => 'mp3',
                    'bitrate' => 128,
                    'status' => 'online',
                    'is_live' => 1,
                    'uptime_percentage' => 99.9
                ]
            ],
            [
                'name' => 'Hot 96 FM',
                'slug' => 'hot-96',
                'tagline' => 'All The Hits',
                'frequency' => '96.0 FM',
                'description' => 'Kenya\'s ultimate urban English contemporary hit station playing the biggest global hip-hop, R&B, and pop tracks.',
                'county' => 'Nairobi',
                'city' => 'Nairobi',
                'country' => 'Kenya',
                'language' => 'English',
                'genre' => 'Urban & Contemporary Hit',
                'logo_url' => 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300',
                'cover_url' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
                'website' => 'https://hot96.co.ke',
                'contact_email' => 'hot96@royalmedia.co.ke',
                'contact_phone' => '+254719000096',
                'status' => 'published',
                'is_featured' => 1,
                'listeners_count' => 2950,
                'owner_id' => 1,
                'stream' => [
                    'mode' => 'external',
                    'stream_url' => 'https://hot96-atunwadigital.streamguys1.com/hot96',
                    'mount_name' => '',
                    'codec' => 'mp3',
                    'bitrate' => 128,
                    'status' => 'online',
                    'is_live' => 1,
                    'uptime_percentage' => 99.8
                ]
            ],
            [
                'name' => 'Ramogi FM',
                'slug' => 'ramogi-fm',
                'tagline' => 'Dholuo Odhiero',
                'frequency' => '107.1 FM',
                'description' => 'The leading Luo language radio station broadcasting rich Benga melodies, community dialogue, and agricultural updates in Western Kenya.',
                'county' => 'Kisumu',
                'city' => 'Kisumu',
                'country' => 'Kenya',
                'language' => 'Luo',
                'genre' => 'Benga & Vernacular',
                'logo_url' => 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300',
                'cover_url' => 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
                'website' => 'https://ramogifm.co.ke',
                'contact_email' => 'info@ramogifm.co.ke',
                'contact_phone' => '+254722107107',
                'status' => 'published',
                'is_featured' => 0,
                'listeners_count' => 1950,
                'owner_id' => 1,
                'stream' => [
                    'mode' => 'external',
                    'stream_url' => 'https://ramogifm-atunwadigital.streamguys1.com/ramogifm',
                    'mount_name' => '',
                    'codec' => 'mp3',
                    'bitrate' => 128,
                    'status' => 'online',
                    'is_live' => 1,
                    'uptime_percentage' => 99.9
                ]
            ],
            [
                'name' => 'Capital FM Kenya',
                'slug' => 'capital-fm',
                'tagline' => '7 Hours of Commercial Free Music Every Day',
                'frequency' => '98.4 FM',
                'description' => 'Kenya\'s premier lifestyle, rock, pop, and business news radio station.',
                'county' => 'Nairobi',
                'city' => 'Nairobi',
                'country' => 'Kenya',
                'language' => 'English',
                'genre' => 'Urban & Contemporary Hit',
                'logo_url' => 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300',
                'cover_url' => 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800',
                'website' => 'https://capitalfm.co.ke',
                'contact_email' => 'info@capitalfm.co.ke',
                'contact_phone' => '+254700098400',
                'status' => 'published',
                'is_featured' => 0,
                'listeners_count' => 2400,
                'owner_id' => 1,
                'stream' => [
                    'mode' => 'external',
                    'stream_url' => 'https://capitalfm-atunwadigital.streamguys1.com/capitalfm',
                    'mount_name' => '',
                    'codec' => 'mp3',
                    'bitrate' => 128,
                    'status' => 'online',
                    'is_live' => 1,
                    'uptime_percentage' => 99.8
                ]
            ],
            [
                'name' => 'Bahari FM',
                'slug' => 'bahari-fm',
                'tagline' => 'Sauti ya Pwani',
                'frequency' => '94.2 FM',
                'description' => 'The authentic coastal Swahili voice broadcasting Taarab, Mwanzele, coastal news, and maritime community reports.',
                'county' => 'Mombasa',
                'city' => 'Mombasa',
                'country' => 'Kenya',
                'language' => 'Swahili',
                'genre' => 'Afrobeat & Culture',
                'logo_url' => 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300',
                'cover_url' => 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800',
                'website' => 'https://baharifm.co.ke',
                'contact_email' => 'info@baharifm.co.ke',
                'contact_phone' => '+254722094200',
                'status' => 'published',
                'is_featured' => 0,
                'listeners_count' => 1650,
                'owner_id' => 1,
                'stream' => [
                    'mode' => 'external',
                    'stream_url' => 'https://baharifm-atunwadigital.streamguys1.com/baharifm',
                    'mount_name' => '',
                    'codec' => 'mp3',
                    'bitrate' => 128,
                    'status' => 'online',
                    'is_live' => 1,
                    'uptime_percentage' => 99.8
                ]
            ]
        ];

        $stationInsert = $db->prepare("
            INSERT INTO stations (
                name, slug, tagline, frequency, description, county, city, country,
                language, genre, logo_url, cover_url, website, contact_email,
                contact_phone, status, is_featured, listeners_count, owner_id
            ) VALUES (
                :name, :slug, :tagline, :frequency, :description, :county, :city, :country,
                :language, :genre, :logo_url, :cover_url, :website, :contact_email,
                :contact_phone, :status, :is_featured, :listeners_count, :owner_id
            )
        ");

        $streamInsert = $db->prepare("
            INSERT INTO station_streams (
                station_id, mode, stream_url, mount_name, codec, bitrate, status, is_live, uptime_percentage
            ) VALUES (
                :station_id, :mode, :stream_url, :mount_name, :codec, :bitrate, :status, :is_live, :uptime_percentage
            )
        ");

        $credInsert = $db->prepare("
            INSERT INTO stream_credentials (
                station_stream_id, server_host, server_port, mount_point, username, password, codec, bitrate
            ) VALUES (
                :station_stream_id, :server_host, :server_port, :mount_point, :username, :password, :codec, :bitrate
            )
        ");

        $npInsert = $db->prepare("
            INSERT INTO now_playing (station_id, programme_name, track_title, artist_name, source)
            VALUES (?, ?, ?, ?, 'system')
        ");

        foreach ($stationsData as $s) {
            $streamData = $s['stream'];
            unset($s['stream']);
            
            $stationInsert->execute($s);
            $stationId = (int)$db->lastInsertId();

            $streamInsert->execute([
                'station_id' => $stationId,
                'mode' => $streamData['mode'],
                'stream_url' => $streamData['stream_url'],
                'mount_name' => $streamData['mount_name'],
                'codec' => $streamData['codec'],
                'bitrate' => $streamData['bitrate'],
                'status' => $streamData['status'],
                'is_live' => $streamData['is_live'],
                'uptime_percentage' => $streamData['uptime_percentage']
            ]);
            $streamId = (int)$db->lastInsertId();

            // If managed stream, add Icecast credentials
            if ($streamData['mode'] === 'managed') {
                $credInsert->execute([
                    'station_stream_id' => $streamId,
                    'server_host' => 'stream.radiowave.co.ke',
                    'server_port' => 8000,
                    'mount_point' => $streamData['mount_name'] ?: '/' . $s['slug'],
                    'username' => 'source',
                    'password' => 'secret_stream_key_' . $s['slug'],
                    'codec' => $streamData['codec'],
                    'bitrate' => $streamData['bitrate']
                ]);
            }

            // Default Now Playing
            $npInsert->execute([
                $stationId,
                'The Morning Drive Show',
                'Sura Yako',
                'Sauti Sol'
            ]);
        }

        // 4. Presenters & Programmes for ENE FM (Station ID = 1)
        $db->exec("
            INSERT INTO presenters (station_id, user_id, name, bio, photo_url, social_handle)
            VALUES 
            (1, 3, 'DJ Marcus & Annastacia', 'Energizing breakfast hosts delivering humor, trending news, and local jams.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', '@djmarcuske'),
            (1, NULL, 'MC Kinyanjui', 'Midday host for community discussions, requests, and Benga classics.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', '@mckinyanjui'),
            (1, NULL, 'Sarah Ndanu', 'Evening drive host with acoustic sessions, traffic reports, and love dedications.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', '@sarah_ndanu');

            INSERT INTO programmes (station_id, presenter_id, title, description, days_of_week, start_time, end_time, cover_image, status)
            VALUES
            (1, 1, 'ENE Breakfast Explosion', 'Kickstart your morning with high-tempo tunes, breaking national news, and interactive banter.', 'Mon,Tue,Wed,Thu,Fri', '06:00', '10:00', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500', 'active'),
            (1, 2, 'Kazi na Muziki', 'Your midday companion featuring business interviews, listener song requests, and Rhumba tracks.', 'Mon,Tue,Wed,Thu,Fri', '10:00', '14:00', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500', 'active'),
            (1, 3, 'The Evening Highway Jam', 'Smooth commute companion with live call-ins, relationship debates, and reggae remixes.', 'Mon,Tue,Wed,Thu,Fri', '16:00', '20:00', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500', 'active'),
            (1, 1, 'Saturday Super Club Mix', 'Non-stop Afrobeats, Amapiano, Gengetone, and club bangers with live listener shoutouts.', 'Sat', '20:00', '02:00', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500', 'active');
        ");

        // 5. Listener Requests for ENE FM
        $db->exec("
            INSERT INTO listener_requests (station_id, listener_name, listener_phone, song_title, artist, message, status)
            VALUES
            (1, 'Kevin Mutua', '+254712345678', 'Suzanna', 'Sauti Sol', 'Big shoutout to my colleagues at Machakos town!', 'approved'),
            (1, 'Mercy Wambua', '+254723456789', 'Katerina', 'Bruce Melodie', 'Dedicated to Brian on his birthday! Tune in!', 'pending'),
            (1, 'John Otieno', '+254734567890', 'Inama', 'Diamond Platnumz ft Fally Ipupa', 'Loving the morning mix! Play this next.', 'played'),
            (1, 'Grace Ndinda', '+254745678901', 'Enjoy', 'Jux ft Diamond', 'Greeting all ENE FM fans listening in Kitui!', 'pending');
        ");

        // 6. Polls for ENE FM
        $db->exec("
            INSERT INTO polls (station_id, question, status)
            VALUES (1, 'What is your favorite genre for morning commute?', 'active');
        ");
        $pollId = (int)$db->lastInsertId();
        $db->exec("
            INSERT INTO poll_options (poll_id, option_text, votes_count)
            VALUES 
            ($pollId, 'Afrobeats & Pop', 142),
            ($pollId, 'Classic Rhumba', 98),
            ($pollId, 'Uplifting Gospel', 115),
            ($pollId, 'Reggae & Dancehall', 64);
        ");

        // 7. Podcasts
        $db->exec("
            INSERT INTO podcasts (station_id, title, description, cover_url, category, status)
            VALUES
            (1, 'ENE Morning Show Catch-Up', 'Missed the morning banter? Catch the daily best moments and uncensored interviews.', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400', 'Talk & Comedy', 'published'),
            (1, 'Business & Farming Horizons', 'Expert weekly guide to agriculture, trade, and investments in Eastern Kenya.', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400', 'Business', 'published');
        ");

        $db->exec("
            INSERT INTO episodes (podcast_id, title, description, audio_url, duration, play_count)
            VALUES
            (1, 'Episode 42: How Youth Entrepreneurs are Innovating in Agritech', 'DJ Marcus speaks with local innovators in Machakos county.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '38:15', 342),
            (1, 'Episode 43: The Friday Banter & Weekend Match Previews', 'Highlights from Friday breakfast show with special celebrity guests.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', '45:20', 512),
            (2, 'Episode 12: Modern Greenhouse Farming in Kenya', 'A comprehensive step-by-step masterclass on tomato farming.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', '52:10', 289);
        ");

        // 8. Subscriptions & Payments for ENE FM
        $pastDate = date('Y-m-d H:i:s', strtotime('-15 days'));
        $futureDate = date('Y-m-d H:i:s', strtotime('+15 days'));

        $subStmt = $db->prepare("
            INSERT INTO subscriptions (station_id, plan_id, status, start_date, renewal_date)
            VALUES (1, 3, 'active', ?, ?)
        ");
        $subStmt->execute([$pastDate, $futureDate]);

        $payStmt = $db->prepare("
            INSERT INTO payments (subscription_id, provider, reference, amount, currency, status, paid_at)
            VALUES (1, 'mpesa', 'QK789XYZ12', 7500.00, 'KES', 'completed', ?)
        ");
        $payStmt->execute([$pastDate]);

        // 9. Initial Audit Log
        $db->exec("
            INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details)
            VALUES (1, 'SYSTEM_INIT', 'System', 1, 'Initial database schema and Kenyan radio directory seeded successfully.');
        ");
    }
}
