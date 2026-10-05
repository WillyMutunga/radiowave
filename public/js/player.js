// public/js/player.js
// Enterprise-Grade Audio Streaming Engine, Dual-Path Stream Resolver, HLS Player & Media Session Controller

const Player = {
    audio: new Audio(),
    hls: null,
    currentStation: null,
    isPlaying: false,
    isBuffering: false,
    state: 'idle', // 'idle' | 'loading' | 'playing' | 'paused' | 'error'
    volume: 0.9,
    isMuted: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    streamRoute: 'direct_cdn', // 'direct_cdn' or 'secure_proxy'

    init() {
        this.audio.preload = 'none';
        this.audio.volume = this.volume;

        // Audio event listeners
        this.audio.addEventListener('loadstart', () => {
            this.setState('loading');
        });

        this.audio.addEventListener('waiting', () => {
            this.isBuffering = true;
            this.setState('loading');
        });

        this.audio.addEventListener('canplay', () => {
            this.isBuffering = false;
            this.updateUI();
        });

        this.audio.addEventListener('playing', () => {
            this.isPlaying = true;
            this.isBuffering = false;
            this.reconnectAttempts = 0;
            this.setState('playing');
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.isBuffering = false;
            if (this.state !== 'error') {
                this.setState('paused');
            }
        });

        this.audio.addEventListener('error', (e) => {
            console.warn('[Player] Stream connection or mixed-content failure:', e);
            this.fallbackToProxy();
        });

        // Set up MediaSession API for mobile background & lock screen playback
        this.setupMediaSessionHandlers();

        // Bind UI controls
        this.bindEvents();
    },

    setState(newState) {
        this.state = newState;
        this.updateUI();
    },

    /**
     * Resolves stream URL according to Mixed-Content and CORS rules:
     * - If page is HTTPS and stream is HTTP or custom port (e.g. :8000, :8128), routes via reverse proxy.
     * - If clean HTTPS on port 443 with CORS, routes direct CDN to save server bandwidth.
     */
    resolveStreamUrl(station, forceProxy = false) {
        const rawUrl = station.stream_url || '';
        const isHls = rawUrl.includes('.m3u8');
        
        if (forceProxy || !rawUrl) {
            return {
                url: `/api/stream-proxy?station_id=${station.id || ''}&name=${encodeURIComponent(station.name || 'Station')}&t=${Date.now()}`,
                route: 'secure_proxy',
                isHls
            };
        }

        try {
            const parsed = new URL(rawUrl);
            const isHttps = parsed.protocol === 'https:';
            const isStandardPort = !parsed.port || parsed.port === '443' || parsed.port === '80';
            const isPageHttps = window.location.protocol === 'https:';

            // If page is HTTPS and target stream is HTTP or on a custom port, route via proxy to prevent browser mixed-content blocks
            if ((isPageHttps && !isHttps) || !isStandardPort || station.stream_mode === 'managed') {
                return {
                    url: `/api/stream-proxy?url=${encodeURIComponent(rawUrl)}&name=${encodeURIComponent(station.name || 'Station')}&t=${Date.now()}`,
                    route: 'secure_proxy',
                    isHls
                };
            }

            // Direct CDN route
            return {
                url: rawUrl,
                route: 'direct_cdn',
                isHls
            };
        } catch (e) {
            return {
                url: `/api/stream-proxy?station_id=${station.id || ''}&t=${Date.now()}`,
                route: 'secure_proxy',
                isHls
            };
        }
    },

    playStation(station, forceProxy = false) {
        if (!station) return;
        this.currentStation = station;
        this.reconnectAttempts = 0;
        this.setState('loading');

        // Clean up previous HLS instance if any
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }

        this.audio.pause();
        this.audio.removeAttribute('src');

        const resolved = this.resolveStreamUrl(station, forceProxy);
        this.streamRoute = resolved.route;

        // 1. HLS (.m3u8) Playback Handling
        if (resolved.isHls) {
            if (window.Hls && Hls.isSupported() && !forceProxy) {
                this.hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 30
                });
                this.hls.loadSource(resolved.url);
                this.hls.attachMedia(this.audio);
                this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    this.startPlayPromise();
                });
                this.hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.warn('[Player] HLS network error, attempting recovery...');
                                this.hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.warn('[Player] HLS media error, recovering...');
                                this.hls.recoverMediaError();
                                break;
                            default:
                                console.warn('[Player] Unrecoverable HLS error, falling back to proxy...');
                                this.fallbackToProxy();
                                break;
                        }
                    }
                });
            } else if (this.audio.canPlayType('application/vnd.apple.mpegurl')) {
                // Native Safari HLS support
                this.audio.src = resolved.url;
                this.audio.load();
                this.startPlayPromise();
            } else {
                // Fallback to proxy
                this.streamRoute = 'secure_proxy';
                this.audio.src = `/api/stream-proxy?url=${encodeURIComponent(resolved.url)}`;
                this.audio.load();
                this.startPlayPromise();
            }
        } else {
            // 2. Standard MP3 / AAC Stream Playback
            this.audio.src = resolved.url;
            this.audio.load();
            this.startPlayPromise();
        }

        this.updateMediaSession(station);
    },

    playCustomAudio(audioUrl, title, subtitle) {
        if (!audioUrl) return;
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
        this.audio.pause();
        this.currentStation = {
            id: 0,
            name: title || 'Audio Track',
            frequency: subtitle || 'Podcast Episode',
            logo_url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200',
            now_track: title,
            now_artist: subtitle,
            bitrate: 128
        };
        this.streamRoute = 'direct_cdn';
        this.audio.src = audioUrl;
        this.audio.load();
        this.startPlayPromise();
        this.setState('loading');
        this.updateMediaSession(this.currentStation);
    },

    startPlayPromise() {
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.isBuffering = false;
                this.setState('playing');
            }).catch((err) => {
                console.warn('[Player] Playback promise error:', err);
                if (this.streamRoute === 'direct_cdn') {
                    this.fallbackToProxy();
                } else {
                    this.isBuffering = false;
                    this.setState('paused');
                }
            });
        }
    },

    fallbackToProxy() {
        if (!this.currentStation) return;
        if (this.streamRoute !== 'secure_proxy') {
            console.log(`[Player] Fallback: Routing ${this.currentStation.name} through Secure Edge Proxy...`);
            this.playStation(this.currentStation, true);
        } else {
            this.handleStreamError();
        }
    },

    togglePlay() {
        if (!this.currentStation) {
            if (window.App && window.App.state && window.App.state.stations.length > 0) {
                this.playStation(window.App.state.stations[0]);
            }
            return;
        }

        if (this.isPlaying) {
            this.pause();
        } else {
            this.resume();
        }
    },

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.setState('paused');
    },

    resume() {
        if (!this.currentStation) return;
        this.setState('loading');

        if (this.streamRoute === 'secure_proxy') {
            const resolved = this.resolveStreamUrl(this.currentStation, true);
            this.audio.src = resolved.url;
            this.audio.load();
        }

        this.audio.play().then(() => {
            this.isPlaying = true;
            this.isBuffering = false;
            this.setState('playing');
        }).catch(e => {
            console.error('[Player] Audio resume error:', e);
            this.isBuffering = false;
            this.setState('paused');
        });
    },

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        this.audio.volume = this.volume;
        this.isMuted = this.volume === 0;
        this.updateVolumeUI();
    },

    toggleMute() {
        if (this.isMuted) {
            this.audio.volume = this.volume || 0.85;
            this.isMuted = false;
        } else {
            this.audio.volume = 0;
            this.isMuted = true;
        }
        this.updateVolumeUI();
    },

    handleStreamError() {
        if (!this.currentStation) return;

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[Player] Reconnecting ${this.currentStation.name} (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                const proxyUrl = `/api/stream-proxy?station_id=${this.currentStation.id}&retry=${this.reconnectAttempts}&t=${Date.now()}`;
                this.audio.src = proxyUrl;
                this.audio.load();
                this.audio.play().catch(() => {});
            }, 1200 * this.reconnectAttempts);
        } else {
            this.isBuffering = false;
            this.isPlaying = false;
            this.setState('error');
            if (window.App && window.App.showToast) {
                window.App.showToast(`Stream for ${this.currentStation.name} is currently offline or unreachable.`, 'warning');
            }
        }
    },

    playNextStation() {
        if (window.App && window.App.state && window.App.state.stations && window.App.state.stations.length > 0) {
            const list = window.App.state.stations;
            const curId = this.currentStation?.id;
            const idx = list.findIndex(s => s.id === curId);
            const nextIdx = (idx + 1) % list.length;
            this.playStation(list[nextIdx]);
            if (window.App.showToast) {
                window.App.showToast(`Tuned to next station: ${list[nextIdx].name}`, 'info');
            }
        }
    },

    playPreviousStation() {
        if (window.App && window.App.state && window.App.state.stations && window.App.state.stations.length > 0) {
            const list = window.App.state.stations;
            const curId = this.currentStation?.id;
            const idx = list.findIndex(s => s.id === curId);
            const prevIdx = (idx - 1 + list.length) % list.length;
            this.playStation(list[prevIdx]);
            if (window.App.showToast) {
                window.App.showToast(`Tuned to previous station: ${list[prevIdx].name}`, 'info');
            }
        }
    },

    setupMediaSessionHandlers() {
        if ('mediaSession' in navigator) {
            try {
                navigator.mediaSession.setActionHandler('play', () => this.resume());
                navigator.mediaSession.setActionHandler('pause', () => this.pause());
                navigator.mediaSession.setActionHandler('stop', () => this.pause());
                navigator.mediaSession.setActionHandler('nexttrack', () => this.playNextStation());
                navigator.mediaSession.setActionHandler('previoustrack', () => this.playPreviousStation());
            } catch (e) {
                console.warn('[Player] MediaSession handler registration warning:', e);
            }
        }
    },

    updateMediaSession(station) {
        if ('mediaSession' in navigator && station) {
            const logo = station.logo_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300';
            const trackText = station.now_track ? `${station.now_track} (${station.now_artist || station.name})` : (station.name || 'Live Radio');
            const artistText = station.now_artist ? `${station.name} • ${station.frequency || 'Live'}` : (station.tagline || `${station.frequency || 'Kenya'} • ${station.county || 'Radio'}`);

            try {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: trackText,
                    artist: artistText,
                    album: 'radiowave.co.ke',
                    artwork: [
                        { src: logo, sizes: '96x96', type: 'image/png' },
                        { src: logo, sizes: '128x128', type: 'image/png' },
                        { src: logo, sizes: '192x192', type: 'image/png' },
                        { src: logo, sizes: '256x256', type: 'image/png' },
                        { src: logo, sizes: '384x384', type: 'image/png' },
                        { src: logo, sizes: '512x512', type: 'image/png' }
                    ]
                });
                navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
            } catch (e) {
                console.warn('[Player] MediaSession metadata update error:', e);
            }
        }
    },

    updateUI() {
        const playerBar = document.getElementById('persistent-player-bar');
        if (!playerBar) return;

        if (!this.currentStation) {
            playerBar.classList.add('translate-y-36', 'opacity-0', 'pointer-events-none');
            playerBar.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
            return;
        }

        playerBar.classList.remove('translate-y-36', 'opacity-0', 'pointer-events-none');
        playerBar.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');

        // Update station branding info
        const logo = document.getElementById('player-station-logo');
        const name = document.getElementById('player-station-name');
        const show = document.getElementById('player-station-show');
        const track = document.getElementById('player-station-track');
        const playIcon = document.getElementById('player-play-icon');
        const bufferSpinner = document.getElementById('player-buffer-spinner');
        const equalizer = document.getElementById('player-equalizer');
        const bitrateBadge = document.getElementById('player-bitrate-badge');
        const routeBadge = document.getElementById('player-route-badge');

        if (logo) logo.src = this.currentStation.logo_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100';
        if (name) name.innerText = this.currentStation.name;
        if (show) show.innerText = `${this.currentStation.frequency || 'Online'} • ${this.currentStation.county || 'Kenya'}`;
        if (track) track.innerText = this.currentStation.now_track ? `${this.currentStation.now_track} - ${this.currentStation.now_artist}` : (this.currentStation.tagline || 'Live Audio Stream');
        if (bitrateBadge) bitrateBadge.innerText = `${this.currentStation.bitrate || 128} kbps`;
        
        if (routeBadge) {
            if (this.streamRoute === 'direct_cdn') {
                routeBadge.innerText = 'DIRECT CDN';
                routeBadge.className = 'px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold border border-emerald-200 hidden sm:inline-block';
            } else {
                routeBadge.innerText = 'SECURE PROXY';
                routeBadge.className = 'px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 font-mono text-[9px] font-bold border border-blue-200 hidden sm:inline-block';
            }
        }

        if (bufferSpinner) {
            if (this.state === 'loading' || this.isBuffering) {
                bufferSpinner.classList.remove('hidden');
                if (playIcon) playIcon.classList.add('opacity-0');
            } else {
                bufferSpinner.classList.add('hidden');
                if (playIcon) playIcon.classList.remove('opacity-0');
            }
        }

        if (playIcon) {
            if (this.isPlaying) {
                playIcon.innerHTML = `<svg class="w-6 h-6 fill-current text-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
            } else {
                playIcon.innerHTML = `<svg class="w-6 h-6 fill-current text-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
            }
        }

        if (equalizer) {
            if (this.isPlaying && !this.isBuffering) {
                equalizer.classList.add('playing');
            } else {
                equalizer.classList.remove('playing');
            }
        }

        // Keep MediaSession playbackState in sync
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
        }
    },

    updateVolumeUI() {
        const slider = document.getElementById('player-volume-slider');
        const icon = document.getElementById('player-volume-icon');
        if (slider) slider.value = this.isMuted ? 0 : this.volume * 100;
        if (icon) {
            if (this.isMuted || this.volume === 0) {
                icon.innerHTML = `<svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>`;
            } else {
                icon.innerHTML = `<svg class="w-5 h-5 text-slate-500 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>`;
            }
        }
    },

    bindEvents() {
        const playBtn = document.getElementById('player-play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlay());
        }

        const volSlider = document.getElementById('player-volume-slider');
        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                this.setVolume(parseFloat(e.target.value) / 100);
            });
        }

        const volBtn = document.getElementById('player-volume-btn');
        if (volBtn) {
            volBtn.addEventListener('click', () => this.toggleMute());
        }
    }
};

window.Player = Player;
