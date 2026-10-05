# RadioWave Kenya - Radio Streaming & Discovery Platform

> **Hybrid Aggregator + Managed Streaming Infrastructure**  
> Complete implementation based on the System Requirements & Technical Specification Blueprint.

---

## 📻 Overview

**RadioWave Kenya** is a multi-tenant digital radio ecosystem that solves fragmented online radio distribution in Kenya and East Africa. It provides:

1. **Aggregator Model**: Seamlessly aggregates existing external Icecast/SHOUTcast/HLS streams from established commercial radio stations.
2. **Managed Streaming Model**: Provisions dedicated Icecast mounts, encoder credentials (`source` username, secret passwords, port, codec) for community and independent stations without existing streaming infrastructure.
3. **Hybrid & Live Migration**: Stations can migrate between external and managed streams dynamically without losing their public slug, listeners, favourites, or historical telemetry.

---

## 🚀 Key Features

### 🎧 1. Listener Discovery & Web Player
- **Interactive Live Player**: Persistent bottom player with Web Audio API waveform visualizer, volume controls, buffering spinner, MediaSession lockscreen controls, and automatic reconnection.
- **Kenyan County Filters**: Browse stations across Nairobi, Mombasa, Kisumu, Nakuru, Machakos, Kiambu, Uasin Gishu, Nyeri, Meru, etc.
- **Genre & Language Filters**: English, Swahili, Kikuyu, Luo, Kalenjin, Kamba, Sheng, Afrobeat, Mugithi, Benga, Rhumba, Reggae, Gospel.
- **Interactive Engagement**: Send real-time song requests and dedications straight to the on-air DJ, vote on live polls, and favourite stations.
- **Podcasts & Catch-Up**: On-demand audio library for missed morning shows and talk segments.

### 📻 2. Station Management Console
- **Stream Configuration**: 1-click switch between External URL and Managed Icecast Mount.
- **Encoder Setup Presets**: Pre-configured settings for **OBS Studio**, **BUTT (Broadcast Using This Tool)**, **Mixxx**, **SAM Broadcaster**.
- **Stream Health Auditor**: Instant handshake latency testing (ping, bitrate, codec, HTTP headers).
- **Programme Scheduler**: Weekly slot builder with day-of-week recurrence and presenter assignments.
- **Requests Queue**: Real-time moderation inbox (Approve, Mark as Played, Reject).
- **Station Analytics**: Hourly concurrency graph, county distribution, and device breakdown.
- **Lipa na M-Pesa Subscription**: Plan renewal and upgrade simulation via M-Pesa STK push.

### 🎙️ 3. Presenter / DJ Live Cockpit
- High-contrast live studio interface for on-air radio hosts.
- Real-time incoming listener dedications and song requests.
- 1-click **Update Now-Playing Track & Artist** broadcasted immediately to all active listener players.

### ⚡ 4. Super Administrator & Operations Portal
- **Station Onboarding & Verification Queue**: Approve pending station applications or reject with feedback.
- **Global Stream Health Monitor**: Live SLA status grid of all stations with automated incident tracking and response time metrics.
- **Security & Audit Logs**: Full transactional activity log for operational traceability.

---

## 🛠️ Technology Stack

- **Backend**: PHP 8.x (REST API, PDO SQLite & MySQL support, JWT token engine, audio stream proxy/synthesizer, stream health monitor daemon).
- **Frontend**: Single Page Application (HTML5, Tailwind CSS, Lucide Icons, Web Audio API, Responsive Mobile-first UX).
- **Streaming Infrastructure**: Icecast 2 & Audio Relay Handler.
- **Containerization**: Docker Compose, Apache, Redis.

---

## 💻 Quick Start & Running Locally

### Option 1: Built-in PHP Server (Instant Zero-Config Run)

Run the following command in the project root:

```bash
# Using XAMPP PHP
C:\xampp\php\php.exe -S 127.0.0.1:8000 -t .
```

Then open your browser and navigate to:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

### Option 2: Docker Compose

```bash
cd infrastructure
docker-compose up -d
```

Access the app at:
- **Web App & API**: `http://localhost:8000`
- **Icecast Streaming Server**: `http://localhost:8001`

---

## 🎭 Pre-seeded Test Accounts & Roles

The system is pre-populated with realistic Kenyan radio stations and 4 test accounts accessible via the top-right **Role Switcher**:

| Role | Name | Email | Password | Pre-assigned Station |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Super Administrator | `admin@radiowave.co.ke` | `admin123` | Global Platform |
| **Station Admin** | Station Manager | `owner@enefm.co.ke` | `owner123` | **ENE FM (99.9 FM)** |
| **Presenter / DJ** | DJ Marcus | `marcus@enefm.co.ke` | `dj123` | **ENE FM Live Studio** |
| **Listener** | Faith Mwangi | `listener@gmail.com` | `listener123` | Public Portal |

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth.php?action=login` | User authentication & JWT generation |
| `POST` | `/api/auth.php?action=register` | Listener/station registration |
| `GET` | `/api/stations.php` | List & filter stations (by county, genre, language) |
| `GET` | `/api/stations.php?action=detail&slug={slug}` | Full station profile, schedule, presenters & poll |
| `POST` | `/api/stations.php` | Register new station (onboarding) |
| `GET` | `/api/streaming.php?action=get&station_id={id}` | Stream configuration & encoder credentials |
| `POST` | `/api/streaming.php?action=update` | Update stream mode (Managed vs External) |
| `GET` | `/api/stream.php?station_id={id}` | Live audio stream playback endpoint |
| `POST` | `/api/engagement.php?action=requests` | Submit song request / dedication |
| `POST` | `/api/programmes.php?action=update_now_playing` | Broadcast on-air Now-Playing track |
| `POST` | `/api/billing.php?action=subscribe_mpesa` | Lipa na M-Pesa subscription checkout |
| `GET` | `/api/admin.php?action=stream_health_grid` | Super Admin live stream SLA monitor |

---

## 📁 Repository Structure

```
Radio/
├── backend/
│   ├── config/
│   │   └── config.php          # Database, Icecast, JWT settings
│   ├── src/
│   │   ├── Database.php        # SQLite/MySQL connection & schema runner
│   │   ├── Auth.php            # JWT & RBAC permission handler
│   │   ├── StreamHealth.php    # Audio stream health checker & incident logger
│   │   ├── AudioStreamer.php   # Live audio streaming relay & synthesizer
│   │   └── SeedData.php        # Kenyan radio stations seed dataset
│   └── api/
│       ├── auth.php            # Authentication endpoints
│       ├── stations.php        # Station catalog & filtering
│       ├── streaming.php       # Stream provisioning & encoder credentials
│       ├── stream.php          # Audio stream delivery
│       ├── programmes.php      # Schedules & Now-Playing updates
│       ├── engagement.php      # Song requests & Polls
│       ├── podcasts.php        # Podcast shows & episodes
│       ├── analytics.php       # Station & platform telemetry
│       ├── billing.php         # Plans & M-Pesa checkout
│       └── admin.php           # Super Admin operations
├── public/
│   ├── index.html              # Modern responsive Single Page Application
│   ├── css/
│   │   └── styles.css          # Dark-theme styling & equalizer animation
│   └── js/
│       ├── api.js              # Client API SDK
│       ├── player.js           # HTML5 Audio Player & Visualizer
│       ├── components.js       # Modular UI view templates
│       └── app.js              # App state, routing & event bindings
├── infrastructure/
│   ├── docker-compose.yml      # Multi-container deployment
│   ├── Dockerfile              # PHP Apache Dockerfile
│   ├── nginx/default.conf      # Virtual host routing
│   └── icecast/icecast.xml     # Icecast configuration
├── index.php                   # Root application router
└── README.md                   # Documentation
```
