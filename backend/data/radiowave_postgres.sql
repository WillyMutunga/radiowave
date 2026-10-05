-- ========================================================
-- RadioWave Kenya - PostgreSQL Production Database Schema & Seed
-- Target Engine: PostgreSQL 12+ (tested on PostgreSQL 18.x)
-- Database: radio
-- ========================================================

-- Drop tables in reverse dependency order if resetting
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS episodes CASCADE;
DROP TABLE IF EXISTS podcasts CASCADE;
DROP TABLE IF EXISTS poll_options CASCADE;
DROP TABLE IF EXISTS polls CASCADE;
DROP TABLE IF EXISTS favourites CASCADE;
DROP TABLE IF EXISTS listener_requests CASCADE;
DROP TABLE IF EXISTS now_playing CASCADE;
DROP TABLE IF EXISTS programmes CASCADE;
DROP TABLE IF EXISTS presenters CASCADE;
DROP TABLE IF EXISTS stream_health_logs CASCADE;
DROP TABLE IF EXISTS stream_incidents CASCADE;
DROP TABLE IF EXISTS stream_credentials CASCADE;
DROP TABLE IF EXISTS station_streams CASCADE;
DROP TABLE IF EXISTS stations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- --------------------------------------------------------
-- Table structure for users
-- --------------------------------------------------------
CREATE TABLE users (
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

-- --------------------------------------------------------
-- Table structure for stations
-- --------------------------------------------------------
CREATE TABLE stations (
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

-- --------------------------------------------------------
-- Table structure for station_streams
-- --------------------------------------------------------
CREATE TABLE station_streams (
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

-- --------------------------------------------------------
-- Table structure for stream_credentials
-- --------------------------------------------------------
CREATE TABLE stream_credentials (
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

-- --------------------------------------------------------
-- Table structure for stream_incidents
-- --------------------------------------------------------
CREATE TABLE stream_incidents (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    incident_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'resolved',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
);

-- --------------------------------------------------------
-- Table structure for stream_health_logs
-- --------------------------------------------------------
CREATE TABLE stream_health_logs (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    http_code INTEGER NULL,
    latency_ms INTEGER NULL,
    content_type VARCHAR(100) NULL,
    message TEXT NULL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table structure for presenters
-- --------------------------------------------------------
CREATE TABLE presenters (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(120) NOT NULL,
    bio TEXT NULL,
    photo_url VARCHAR(255) NULL,
    social_handle VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table structure for programmes
-- --------------------------------------------------------
CREATE TABLE programmes (
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

-- --------------------------------------------------------
-- Table structure for now_playing
-- --------------------------------------------------------
CREATE TABLE now_playing (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL UNIQUE REFERENCES stations(id) ON DELETE CASCADE,
    programme_name VARCHAR(150) NULL,
    track_title VARCHAR(150) NULL,
    artist_name VARCHAR(150) NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) DEFAULT 'manual'
);

-- --------------------------------------------------------
-- Table structure for listener_requests
-- --------------------------------------------------------
CREATE TABLE listener_requests (
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

-- --------------------------------------------------------
-- Table structure for favourites
-- --------------------------------------------------------
CREATE TABLE favourites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, station_id)
);

-- --------------------------------------------------------
-- Table structure for polls
-- --------------------------------------------------------
CREATE TABLE polls (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    question VARCHAR(255) NOT NULL,
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table structure for poll_options
-- --------------------------------------------------------
CREATE TABLE poll_options (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text VARCHAR(150) NOT NULL,
    votes_count INTEGER DEFAULT 0
);

-- --------------------------------------------------------
-- Table structure for podcasts
-- --------------------------------------------------------
CREATE TABLE podcasts (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    cover_url VARCHAR(255) NULL,
    category VARCHAR(100) DEFAULT 'General',
    status VARCHAR(30) DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table structure for episodes
-- --------------------------------------------------------
CREATE TABLE episodes (
    id SERIAL PRIMARY KEY,
    podcast_id INTEGER NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    audio_url VARCHAR(500) NOT NULL,
    duration VARCHAR(30) DEFAULT '45:00',
    play_count INTEGER DEFAULT 0,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table structure for plans
-- --------------------------------------------------------
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(30) DEFAULT 'monthly',
    stream_model VARCHAR(50) DEFAULT 'hybrid',
    max_bitrate INTEGER DEFAULT 192,
    features_json TEXT NULL
);

-- --------------------------------------------------------
-- Table structure for subscriptions
-- --------------------------------------------------------
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'active',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    renewal_date TIMESTAMP NULL
);

-- --------------------------------------------------------
-- Table structure for payments
-- --------------------------------------------------------
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    provider VARCHAR(50) DEFAULT 'mpesa',
    reference VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'KES',
    status VARCHAR(30) DEFAULT 'completed',
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table structure for audit_logs
-- --------------------------------------------------------
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NULL,
    details TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index optimizations for high-traffic discovery & stream playback
CREATE INDEX IF NOT EXISTS idx_stations_slug ON stations(slug);
CREATE INDEX IF NOT EXISTS idx_stations_county ON stations(county);
CREATE INDEX IF NOT EXISTS idx_stations_genre ON stations(genre);
CREATE INDEX IF NOT EXISTS idx_stations_status ON stations(status);
CREATE INDEX IF NOT EXISTS idx_station_streams_station_id ON station_streams(station_id);
CREATE INDEX IF NOT EXISTS idx_programmes_station_id ON programmes(station_id);
CREATE INDEX IF NOT EXISTS idx_episodes_podcast_id ON episodes(podcast_id);
