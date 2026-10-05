// public/js/app.js
// Main Single Page Application Controller for RadioWave Kenya

const App = {
    state: {
        user: null,
        currentView: 'home',
        viewParam: null,
        activeStationTab: 'schedule',
        activeAdminTab: 'stream',
        activeSuperAdminTab: 'approvals',
        presenterRequestFilter: 'all',
        isMicLive: true,
        stations: [],
        counties: [],
        genres: [],
        filters: {
            county: '',
            genre: '',
            search: ''
        },
        stationDetail: null,
        stationAdminData: null,
        superAdminData: null,
        pollingTimer: null
    },

    async init() {
        Player.init();
        
        // Check authentication state
        const token = API.getToken();
        if (token) {
            try {
                const res = await API.auth.me();
                this.state.user = res.user;
            } catch (e) {
                API.auth.logout();
                this.state.user = null;
            }
        }

        // Fetch meta and initial stations
        await this.loadMetadata();
        await this.loadStations();

        // Start live polling for on-air updates & studio clock
        this.startLivePolling();

        // Initial render
        this.renderNavbar();
        this.renderCurrentView();
    },

    async loadMetadata() {
        try {
            const meta = await API.stations.meta();
            this.state.counties = meta.counties || [];
            this.state.genres = meta.genres || [];
        } catch (e) {
            console.error('Metadata load error:', e);
        }
    },

    async loadStations() {
        try {
            const res = await API.stations.list({
                county: this.state.filters.county,
                genre: this.state.filters.genre,
                search: this.state.filters.search,
                status: 'published'
            });
            this.state.stations = res.stations || [];
        } catch (e) {
            console.error('Failed to load stations:', e);
            this.showToast('Could not load radio stations.', 'error');
        }
    },

    startLivePolling() {
        // High-precision 1-second studio clock ticker
        setInterval(() => {
            const clock = document.getElementById('studio-live-clock');
            if (clock) {
                clock.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
            }
        }, 1000);

        if (this.state.pollingTimer) clearInterval(this.state.pollingTimer);
        this.state.pollingTimer = setInterval(async () => {
            // If viewing presenter cockpit, refresh requests
            if (this.state.currentView === 'presenter-cockpit' && this.state.stationDetail) {
                try {
                    const reqRes = await API.engagement.requests(this.state.stationDetail.id);
                    // Update requests if needed
                } catch (e) {}
            }
        }, 10000);
    },

    // ROUTING & NAVIGATION
    async navigate(view, param = null) {
        this.state.currentView = view;
        this.state.viewParam = param;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        this.renderNavbar();
        await this.renderCurrentView();
    },

    async renderCurrentView() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        switch (this.state.currentView) {
            case 'home':
                appContainer.innerHTML = Components.renderHome(
                    this.state.stations, 
                    this.state.counties, 
                    this.state.genres, 
                    this.state.filters
                );
                break;

            case 'station':
                appContainer.innerHTML = `<div class="text-center py-20 text-slate-500 font-medium">Loading station broadcast...</div>`;
                try {
                    const res = await API.stations.detail(this.state.viewParam);
                    this.state.stationDetail = res.station;
                    appContainer.innerHTML = Components.renderStationDetails(res.station, this.state.activeStationTab);
                } catch (e) {
                    appContainer.innerHTML = `<div class="text-center py-20 text-rose-600 font-semibold">Station not found.</div>`;
                }
                break;

            case 'login':
                appContainer.innerHTML = Components.renderLoginPortal(this.state.viewParam || 'station_admin');
                break;

            case 'station-admin':
                if (!this.state.user || (this.state.user.role !== 'station_admin' && this.state.user.role !== 'super_admin')) {
                    appContainer.innerHTML = Components.renderLoginPortal('station_admin');
                    break;
                }
                appContainer.innerHTML = `<div class="text-center py-20 text-slate-500 font-medium">Loading station control room...</div>`;
                try {
                    const stationId = this.state.user?.station_id || 1;
                    const [stRes, streamRes, subRes, reqRes, anaRes] = await Promise.all([
                        API.stations.detail(stationId),
                        API.streaming.get(stationId),
                        API.billing.subscription(stationId),
                        API.engagement.requests(stationId),
                        API.analytics.getStation(stationId)
                    ]);
                    this.state.stationDetail = stRes.station;
                    appContainer.innerHTML = Components.renderStationAdmin(
                        stRes.station,
                        streamRes,
                        subRes,
                        reqRes.requests || [],
                        anaRes,
                        this.state.activeAdminTab
                    );
                } catch (e) {
                    console.error('Error loading station admin:', e);
                    appContainer.innerHTML = `<div class="text-center py-20 text-rose-600 font-semibold">Could not load station admin dashboard.</div>`;
                }
                break;

            case 'presenter-cockpit':
                if (!this.state.user || (this.state.user.role !== 'presenter' && this.state.user.role !== 'station_admin' && this.state.user.role !== 'super_admin')) {
                    appContainer.innerHTML = Components.renderLoginPortal('presenter');
                    break;
                }
                appContainer.innerHTML = `<div class="text-center py-20 text-slate-500 font-medium">Connecting to live on-air studio...</div>`;
                try {
                    const stationId = (this.state.viewParam && !isNaN(this.state.viewParam)) ? parseInt(this.state.viewParam) : (this.state.user?.station_id || 1);
                    const [stRes, progRes, reqRes] = await Promise.all([
                        API.stations.detail(stationId),
                        API.programmes.list(stationId),
                        API.engagement.requests(stationId)
                    ]);
                    this.state.stationDetail = stRes.station;
                    appContainer.innerHTML = Components.renderPresenterCockpit(
                        stRes.station,
                        progRes.now_playing,
                        reqRes.requests || [],
                        this.state.presenterRequestFilter || 'all'
                    );
                } catch (e) {
                    appContainer.innerHTML = `<div class="text-center py-20 text-rose-600 font-semibold">Failed to connect to on-air studio.</div>`;
                }
                break;

            case 'super-admin':
                if (!this.state.user || this.state.user.role !== 'super_admin') {
                    appContainer.innerHTML = Components.renderLoginPortal('super_admin');
                    break;
                }
                appContainer.innerHTML = `<div class="text-center py-20 text-slate-500 font-medium">Loading operations center...</div>`;
                try {
                    const [overview, pending, streams, audits] = await Promise.all([
                        API.admin.overview(),
                        API.admin.pendingStations(),
                        API.admin.streamHealthGrid(),
                        API.admin.auditLogs()
                    ]);
                    appContainer.innerHTML = Components.renderSuperAdmin(
                        overview,
                        pending.pending_stations || [],
                        streams,
                        audits.audit_logs || [],
                        this.state.activeSuperAdminTab
                    );
                } catch (e) {
                    appContainer.innerHTML = `<div class="text-center py-20 text-rose-600 font-semibold">Could not load super admin portal.</div>`;
                }
                break;

            case 'onboarding':
                appContainer.innerHTML = Components.renderOnboardingWizard();
                break;

            case 'podcasts':
                appContainer.innerHTML = `<div class="text-center py-20 text-slate-500 font-medium">Loading podcast catalog...</div>`;
                try {
                    const res = await API.podcasts.list();
                    appContainer.innerHTML = `
                        <div class="space-y-6 animate-fadeIn">
                            <div>
                                <h1 class="text-3xl font-extrabold text-slate-900">Kenyan Radio Podcasts & Shows</h1>
                                <p class="text-sm text-slate-500">Catch up on missed morning shows, special interviews and exclusive audio series</p>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                ${res.podcasts.map(pod => `
                                    <div class="p-5 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                                        <div class="flex items-start gap-4">
                                            <img src="${pod.cover_url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200'}" class="w-20 h-20 rounded-xl object-cover border border-slate-200">
                                            <div class="flex-1">
                                                <span class="text-[10px] text-blue-700 uppercase font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">${pod.category}</span>
                                                <h3 class="text-base font-bold text-slate-900 mt-1">${pod.title}</h3>
                                                <p class="text-xs text-slate-500 truncate">Station: ${pod.station_name}</p>
                                            </div>
                                        </div>
                                        <p class="text-xs text-slate-600 line-clamp-2">${pod.description}</p>
                                        <button onclick="window.App.openPodcastEpisodes(${pod.id})" class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-blue-600 text-xs font-semibold text-slate-700 hover:text-white transition cursor-pointer">
                                            Listen to Episodes (${pod.episode_count || 0})
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                } catch (e) {}
                break;

            case 'favourites':
                appContainer.innerHTML = `<div class="text-center py-20 text-slate-500 font-medium">Loading your favourite stations...</div>`;
                try {
                    const res = await API.engagement.myFavourites();
                    const favs = res.favourites || [];
                    appContainer.innerHTML = `
                        <div class="space-y-6 animate-fadeIn">
                            <div>
                                <h1 class="text-3xl font-extrabold text-slate-900">My Favourites</h1>
                                <p class="text-sm text-slate-500">Your personalized live radio presets</p>
                            </div>
                            ${favs.length > 0 ? Components.renderHome(favs, [], [], {}) : `
                                <div class="text-center py-16 bg-white rounded-[18px] border border-slate-200 shadow-sm">
                                    <p class="text-slate-500 text-base">You haven't added any favourite stations yet.</p>
                                    <button onclick="window.App.navigate('home')" class="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition cursor-pointer shadow-sm">
                                        Explore All Stations
                                    </button>
                                </div>
                            `}
                        </div>
                    `;
                } catch (e) {
                    appContainer.innerHTML = `<div class="text-center py-16 text-slate-500">Please log in to view your saved favourite stations.</div>`;
                }
                break;
        }
    },

    // NAVBAR
    renderNavbar() {
        const nav = document.getElementById('main-navbar');
        if (!nav) return;

        const user = this.state.user;
        const isStaff = user && (user.role === 'station_admin' || user.role === 'presenter' || user.role === 'super_admin');

        nav.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <!-- Logo -->
                <div onclick="window.App.navigate('home')" class="flex items-center gap-3 cursor-pointer group">
                    <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition transform">
                        <svg class="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                    </div>
                    <div>
                        <div class="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                            RadioWave <span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-bold">KENYA</span>
                        </div>
                        <span class="text-[10px] text-slate-500 block -mt-1 font-medium">Digital Radio & Distribution</span>
                    </div>
                </div>

                <!-- Center Nav Links for Listeners -->
                <div class="hidden md:flex items-center gap-1">
                    <button onclick="window.App.navigate('home')" class="px-3.5 py-2 rounded-xl text-sm font-semibold transition ${this.state.currentView === 'home' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                        Discover
                    </button>
                    <button onclick="window.App.navigate('podcasts')" class="px-3.5 py-2 rounded-xl text-sm font-semibold transition ${this.state.currentView === 'podcasts' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                        Podcasts
                    </button>
                    <button onclick="window.App.navigate('favourites')" class="px-3.5 py-2 rounded-xl text-sm font-semibold transition ${this.state.currentView === 'favourites' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                        Favourites
                    </button>
                    <button onclick="window.App.navigate('onboarding')" class="px-3.5 py-2 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition flex items-center gap-1.5">
                        <span>+</span> Register Station
                    </button>
                </div>

                <!-- Right Side: Broadcaster Portal / Logged-in Staff Workspace -->
                <div class="flex items-center gap-3">
                    ${!isStaff ? `
                        <!-- Public Listener View: Broadcaster Login Button -->
                        <button 
                            onclick="window.App.openLoginModal()" 
                            class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 text-xs font-bold transition flex items-center gap-2 shadow-xs"
                        >
                            <span>🎙️</span>
                            <span>Broadcaster Portal</span>
                        </button>
                    ` : `
                        <!-- Logged-in Broadcaster View: Direct Workspace Shortcut -->
                        ${user.role === 'station_admin' ? `
                            <button onclick="window.App.navigate('station-admin')" class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition">
                                <span>📻</span>
                                <span class="hidden sm:inline">Station Control Room</span>
                            </button>
                        ` : ''}

                        ${user.role === 'presenter' ? `
                            <button onclick="window.App.navigate('presenter-cockpit')" class="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition">
                                <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                <span>Live Studio DJ</span>
                            </button>
                        ` : ''}

                        ${user.role === 'super_admin' ? `
                            <button onclick="window.App.navigate('super-admin')" class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition">
                                <span>⚡</span>
                                <span class="hidden sm:inline">Ops Center</span>
                            </button>
                        ` : ''}

                        <!-- User Profile Chip & Sign Out Button -->
                        <div class="flex items-center gap-2">
                            <div class="flex items-center gap-2 bg-slate-100 border border-slate-200 py-1.5 px-3 rounded-2xl shadow-inner">
                                <img src="${user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="w-6 h-6 rounded-full object-cover border border-slate-200">
                                <div class="text-left leading-none">
                                    <span class="text-xs font-bold text-slate-900 block">${user.name ? user.name.split(' ')[0] : 'DJ'}</span>
                                    <span class="text-[9px] text-blue-600 font-mono uppercase font-bold">${(user.role || '').replace('_', ' ')}</span>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onclick="window.App.handleLogout()" 
                                title="Sign Out of Broadcaster Portal" 
                                class="px-3 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                            >
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    // HANDLERS
    async playStationById(stationId) {
        let station = this.state.stations.find(s => s.id === stationId);
        if (!station && this.state.stationDetail?.id === stationId) {
            station = this.state.stationDetail;
        }
        if (!station) {
            try {
                const res = await API.stations.detail(stationId);
                station = res.station;
            } catch (e) {}
        }
        if (station) {
            Player.playStation(station);
            this.showToast(`Tuned into ${station.name} (${station.frequency || 'Live'})`, 'info');
        }
    },

    handleSearch(val) {
        this.state.filters.search = val;
        this.loadStations().then(() => this.renderCurrentView());
    },

    setFilter(key, val) {
        this.state.filters[key] = val;
        this.loadStations().then(() => this.renderCurrentView());
    },

    resetFilters() {
        this.state.filters = { county: '', genre: '', search: '' };
        this.loadStations().then(() => this.renderCurrentView());
    },

    setStationTab(tabId) {
        this.state.activeStationTab = tabId;
        if (this.state.stationDetail) {
            const container = document.getElementById('app-container');
            if (container) {
                container.innerHTML = Components.renderStationDetails(this.state.stationDetail, tabId);
            }
        }
    },

    setStationAdminTab(tabId) {
        this.state.activeAdminTab = tabId;
        this.navigate('station-admin');
    },

    setSuperAdminTab(tabId) {
        this.state.activeSuperAdminTab = tabId;
        this.navigate('super-admin');
    },

    toggleStreamMode(mode) {
        const group = document.getElementById('external-url-group');
        if (group) {
            if (mode === 'external') {
                group.classList.remove('hidden');
            } else {
                group.classList.add('hidden');
            }
        }
    },

    // AUTHENTICATION & LOGIN MODAL HANDLERS
    openLoginModal(targetRole = 'station_admin') {
        const modal = document.getElementById('login-modal');
        const card = document.getElementById('login-modal-card');
        if (!modal || !card) return;

        this.fillDemoLogin(targetRole);

        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100');
        card.classList.remove('scale-95');
        card.classList.add('scale-100');
    },

    closeLoginModal() {
        const modal = document.getElementById('login-modal');
        const card = document.getElementById('login-modal-card');
        if (!modal || !card) return;

        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-100');
        card.classList.add('scale-95');
    },

    fillDemoLogin(role) {
        const credentials = {
            station_admin: { email: 'owner@enefm.co.ke', pass: 'owner123' },
            presenter: { email: 'marcus@enefm.co.ke', pass: 'dj123' },
            super_admin: { email: 'admin@radiowave.co.ke', pass: 'admin123' },
            listener: { email: 'listener@gmail.com', pass: 'listener123' }
        };

        const cred = credentials[role] || credentials.station_admin;

        // Populate modal inputs if present
        const modalEmail = document.getElementById('login-email');
        const modalPass = document.getElementById('login-password');
        if (modalEmail) modalEmail.value = cred.email;
        if (modalPass) modalPass.value = cred.pass;

        // Populate full-page portal inputs if present
        const portalEmail = document.getElementById('portal-email');
        const portalPass = document.getElementById('portal-password');
        if (portalEmail) portalEmail.value = cred.email;
        if (portalPass) portalPass.value = cred.pass;
    },

    async handleLoginSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const modalEmail = document.getElementById('login-email')?.value;
        const modalPass = document.getElementById('login-password')?.value;
        const portalEmail = document.getElementById('portal-email')?.value;
        const portalPass = document.getElementById('portal-password')?.value;

        const email = (modalEmail || portalEmail || '').trim();
        const password = modalPass || portalPass || '';

        const submitBtn = document.getElementById('login-submit-btn') || form.querySelector('button[type="submit"]');
        const btnText = document.getElementById('login-btn-text') || submitBtn?.querySelector('span');
        const spinner = document.getElementById('login-spinner');
        const originalText = btnText ? btnText.textContent : 'Authenticate & Open Console';

        if (submitBtn) submitBtn.disabled = true;
        if (btnText) btnText.textContent = 'Authenticating...';
        if (spinner) spinner.classList.remove('hidden');

        try {
            const res = await API.auth.login(email, password);
            API.setToken(res.token);
            API.setUser(res.user);
            this.state.user = res.user;

            this.closeLoginModal();
            this.showToast(`Welcome back, ${res.user.name}! Authenticated as ${res.user.role.toUpperCase()}`, 'success');

            this.renderNavbar();

            // Redirect to appropriate workspace
            if (res.user.role === 'station_admin') {
                this.navigate('station-admin');
            } else if (res.user.role === 'presenter') {
                this.navigate('presenter-cockpit');
            } else if (res.user.role === 'super_admin') {
                this.navigate('super-admin');
            } else {
                this.navigate('home');
            }
        } catch (err) {
            this.showToast(err.message || 'Invalid broadcaster credentials. Please check and retry.', 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            if (btnText) btnText.textContent = originalText;
            if (spinner) spinner.classList.add('hidden');
        }
    },

    async handleLogout() {
        try {
            await API.auth.logout();
        } catch (e) {}

        API.removeToken();
        API.removeUser();
        this.state.user = null;

        this.showToast('Signed out of Broadcaster Portal. You are in open listener mode.', 'info');
        this.renderNavbar();
        this.navigate('home');
    },

    async switchDemoRole(role) {
        this.fillDemoLogin(role);
        this.openLoginModal(role);
    },

    async toggleFavourite(stationId) {
        try {
            const res = await API.engagement.toggleFavourite(stationId);
            this.showToast(res.message, res.is_favourite ? 'success' : 'info');
        } catch (e) {
            this.showToast('Please log in to save favourites.', 'warning');
        }
    },

    async votePoll(optionId) {
        try {
            await API.engagement.votePoll(optionId);
            this.showToast('Vote counted! Thank you.', 'success');
            // Refresh detail
            if (this.state.stationDetail) {
                const res = await API.stations.detail(this.state.stationDetail.id);
                this.state.stationDetail = res.station;
                this.setStationTab('requests');
            }
        } catch (e) {
            this.showToast('Could not record vote.', 'error');
        }
    },

    async handleRequestSubmit(e, stationId) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await API.engagement.submitRequest(stationId, data);
            this.showToast(res.message, 'success');
            form.reset();
        } catch (err) {
            this.showToast(err.message || 'Error submitting request', 'error');
        }
    },

    async updateRequestStatus(requestId, status) {
        try {
            const res = await API.engagement.updateRequestStatus(requestId, status);
            this.showToast(res.message, 'success');
            if (this.state.currentView === 'station-admin') {
                this.navigate('station-admin');
            } else if (this.state.currentView === 'presenter-cockpit') {
                this.navigate('presenter-cockpit');
            }
        } catch (e) {
            this.showToast('Failed to update request', 'error');
        }
    },

    async handleUpdateNowPlaying(e, stationId) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await API.programmes.updateNowPlaying(stationId, data);
            this.showToast(res.message, 'success');
            // If currently playing, update local player
            if (Player.currentStation && Player.currentStation.id === stationId) {
                Player.currentStation.now_track = data.track_title;
                Player.currentStation.now_artist = data.artist_name;
                Player.currentStation.now_programme = data.programme_name;
                Player.updateUI();
            }

            // Update Studio Monitor verification strip in DJ cockpit
            const verifiedElem = document.getElementById('studio-verified-track');
            if (verifiedElem) {
                verifiedElem.innerHTML = `🎵 ${data.track_title} <span class="text-orange-400">${data.artist_name ? '— ' + data.artist_name : ''}</span>`;
            }
        } catch (e) {
            this.showToast('Failed to broadcast track', 'error');
        }
    },

    async handleStreamConfigUpdate(e, stationId) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await API.streaming.update(stationId, data);
            this.showToast(res.message, 'success');
            this.navigate('station-admin');
        } catch (e) {
            this.showToast('Failed to update stream configuration', 'error');
        }
    },

    async testStreamHealth(stationId) {
        this.showToast('Checking stream latency and connection handshake...', 'info');
        try {
            const res = await API.streaming.healthCheck(stationId);
            const h = res.health;
            if (h.is_online) {
                this.showToast(`✅ Stream Online! Latency: ${h.latency_ms}ms, Bitrate: ${h.bitrate}kbps (${h.codec.toUpperCase()})`, 'success');
            } else {
                this.showToast(`❌ Stream Endpoint Offline. Response check failed.`, 'error');
            }
        } catch (e) {
            this.showToast('Failed to test stream', 'error');
        }
    },

    async rotateCredentials(stationId) {
        if (!confirm('Are you sure you want to rotate source encoder credentials? Your studio encoder will need to be updated with the new password.')) return;
        try {
            const res = await API.streaming.rotateCredentials(stationId);
            this.showToast(res.message, 'success');
            this.navigate('station-admin');
        } catch (e) {
            this.showToast('Failed to rotate credentials', 'error');
        }
    },

    async handleMpesaPayment(e, stationId) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        this.showToast('Initiating M-Pesa STK Push to ' + data.phone + '...', 'info');
        try {
            const res = await API.billing.subscribeMpesa(stationId, data.plan_id, data.phone);
            this.showToast(`✅ ${res.message} Ref: ${res.receipt}`, 'success');
            setTimeout(() => this.navigate('station-admin'), 1200);
        } catch (e) {
            this.showToast('Payment processing failed', 'error');
        }
    },

    async approveStation(stationId, decision) {
        try {
            const res = await API.admin.approveStation(stationId, decision);
            this.showToast(res.message, 'success');
            await this.loadStations();
            this.navigate('super-admin');
        } catch (e) {
            this.showToast('Failed to process approval', 'error');
        }
    },

    async runAllHealthChecks() {
        this.showToast('Auditing all live radio stream endpoints...', 'info');
        try {
            const res = await API.admin.runAllHealthChecks();
            this.showToast(`Audit completed! Checked ${res.health_results?.length || 10} streams.`, 'success');
            this.navigate('super-admin');
        } catch (e) {
            this.showToast('Audit run failed', 'error');
        }
    },

    async handleOnboardingSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await API.stations.create(data);
            this.showToast(`Station registered! Status: ${res.status.toUpperCase()}`, 'success');
            await this.loadStations();
            setTimeout(() => this.navigate('home'), 1000);
        } catch (e) {
            this.showToast(e.message || 'Onboarding registration failed', 'error');
        }
    },

    openCurrentStationGuide() {
        if (Player.currentStation && Player.currentStation.id) {
            this.navigate('station', Player.currentStation.slug || Player.currentStation.id);
        }
    },

    async toggleStudioMonitor(stationId) {
        let station = this.state.stationDetail;
        if (!station || station.id != stationId) {
            try {
                const res = await API.stations.detail(stationId);
                station = res.station;
                this.state.stationDetail = station;
            } catch (e) {}
        }
        if (!station) return;

        if (Player.isPlaying && Player.currentStation && Player.currentStation.id == station.id) {
            Player.pause();
            this.showToast('🎧 Studio Master Monitor Muted.', 'info');
        } else {
            Player.playStation(station);
            this.showToast(`🎧 Connected to ${station.name} Live Master Stream Return. Monitoring in DJ Headphones.`, 'success');
        }

        // Update Cockpit UI elements
        const badge = document.getElementById('studio-monitor-badge');
        const icon = document.getElementById('studio-monitor-btn-icon');
        const text = document.getElementById('studio-monitor-btn-text');
        const btn = document.getElementById('studio-monitor-toggle-btn');
        if (badge && icon && text && btn) {
            const isNowPlaying = Player.isPlaying && Player.currentStation?.id == station.id;
            badge.className = isNowPlaying 
                ? 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500';
            badge.textContent = isNowPlaying ? '● MONITOR ACTIVE' : '○ MONITOR MUTED';
            icon.textContent = isNowPlaying ? '⏸️' : '▶️';
            text.textContent = isNowPlaying ? 'Mute Studio Monitor' : 'Listen to Live On-Air Feed';
            btn.className = isNowPlaying
                ? 'flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition transform active:scale-95 cursor-pointer'
                : 'flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition transform active:scale-95 cursor-pointer';
        }
    },

    openPresenterCockpit(stationId) {
        if (!this.state.user || (this.state.user.role !== 'presenter' && this.state.user.role !== 'station_admin' && this.state.user.role !== 'super_admin')) {
            this.openLoginModal('presenter');
            return;
        }
        this.navigate('presenter-cockpit', stationId);
    },

    quickFillNowPlaying(title, artist) {
        const trackInput = document.getElementById('input-track-title');
        const artistInput = document.getElementById('input-artist-name');
        if (trackInput) trackInput.value = title;
        if (artistInput) artistInput.value = artist;
        this.showToast(`⚡ Cued "${title}" by ${artist} into broadcast form. Click Broadcast to push live!`, 'info');
    },

    setPresenterRequestFilter(filter) {
        this.state.presenterRequestFilter = filter;
        if (this.state.currentView === 'presenter-cockpit') {
            this.renderCurrentView();
        }
    },

    toggleStudioMic() {
        this.state.isMicLive = !this.state.isMicLive;
        const micBtn = document.getElementById('studio-mic-btn');
        if (micBtn) {
            if (this.state.isMicLive) {
                micBtn.className = 'px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black tracking-wide flex items-center gap-2 shadow-lg shadow-rose-600/30 transition transform active:scale-95 cursor-pointer';
                micBtn.innerHTML = '<span class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span><span id="studio-mic-text">MIC: LIVE ON AIR</span>';
                this.showToast('🎙️ Studio Microphone is LIVE on Air!', 'success');
            } else {
                micBtn.className = 'px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black tracking-wide flex items-center gap-2 border border-slate-700 transition transform active:scale-95 cursor-pointer';
                micBtn.innerHTML = '<span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span id="studio-mic-text">MIC: MUTED / OFF AIR</span>';
                this.showToast('🔇 Studio Microphone Muted (Off Air).', 'warning');
            }
        }
    },

    async refreshPresenterCockpit() {
        this.showToast('Refreshing live studio telemetry & shoutout queue...', 'info');
        await this.renderCurrentView();
        this.showToast('Studio feed updated.', 'success');
    },

    playSoundFx(type) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            if (!this._audioCtx) {
                this._audioCtx = new AudioContext();
            }
            if (this._audioCtx.state === 'suspended') {
                this._audioCtx.resume();
            }
            const ctx = this._audioCtx;
            const now = ctx.currentTime;

            if (type === 'airhorn') {
                const freqs = [311.13, 370.0, 466.16];
                freqs.forEach(f => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(f, now);
                    osc.frequency.exponentialRampToValueAtTime(f * 1.06, now + 0.1);
                    osc.frequency.exponentialRampToValueAtTime(f * 0.97, now + 0.35);
                    gain.gain.setValueAtTime(0.18, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.9);
                });
                this.showToast('📢 Airhorn Blast Triggered', 'info');
            } else if (type === 'applause') {
                const bufferSize = ctx.sampleRate * 2;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(1000, now);
                filter.Q.setValueAtTime(1.5, now);
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.01, now);
                gain.gain.linearRampToValueAtTime(0.25, now + 0.3);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);
                noise.start(now);
                noise.stop(now + 2.1);
                this.showToast('👏 Studio Applause Triggered', 'info');
            } else if (type === 'rewind') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.55);
                this.showToast('⏪ Rewind / Pullup FX Triggered', 'info');
            } else if (type === 'news') {
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const startTime = now + (idx * 0.15);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, startTime);
                    gain.gain.setValueAtTime(0.22, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + 0.65);
                });
                this.showToast('🚨 Breaking News Sting Triggered', 'info');
            } else if (type === 'drumroll') {
                for (let i = 0; i < 12; i++) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const hitTime = now + (i * 0.08);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(180 + (i * 10), hitTime);
                    gain.gain.setValueAtTime(0.05 + (i * 0.02), hitTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.06);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(hitTime);
                    osc.stop(hitTime + 0.07);
                }
                this.showToast('🥁 Drumroll FX Triggered', 'info');
            } else if (type === 'station_id') {
                const chord = [440, 554.37, 659.25, 880];
                chord.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.05);
                    gain.gain.setValueAtTime(0.15, now + idx * 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.05);
                    osc.stop(now + 1.25);
                });
                this.showToast('📻 Station ID Tone Triggered', 'info');
            }
        } catch (e) {
            console.error('Audio FX error:', e);
        }
    },

    openRequestModal(stationId) {
        this.setStationTab('requests');
        setTimeout(() => {
            const form = document.getElementById('station-request-form');
            if (form) {
                form.scrollIntoView({ behavior: 'smooth' });
                const songInput = form.querySelector('input[name="song_title"]');
                if (songInput) songInput.focus();
            }
        }, 100);
    },

    async openPodcastEpisodes(podcastId) {
        try {
            const res = await API.podcasts.episodes(podcastId);
            const eps = res.episodes || [];
            if (eps.length > 0 && eps[0].audio_url) {
                Player.playCustomAudio(eps[0].audio_url, eps[0].title, res.podcast?.title || 'Podcast Episode');
                this.showToast(`Now Playing: "${eps[0].title}"`, 'success');
            } else {
                this.showToast(`Found ${eps.length} recorded episodes for this series.`, 'info');
            }
        } catch (e) {
            this.showToast('Could not load podcast audio.', 'error');
        }
    },

    openAddProgrammeModal(stationId) {
        let modal = document.getElementById('programme-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'programme-modal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="relative w-full max-w-lg rounded-[22px] bg-white border border-slate-200 shadow-2xl p-7 space-y-5">
                <button onclick="document.getElementById('programme-modal').remove()" class="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer">
                    ✕
                </button>
                <div class="space-y-1">
                    <h3 class="text-xl font-bold text-slate-900">Add Radio Programme Slot</h3>
                    <p class="text-xs text-slate-500">Schedule an on-air show for your station lineup</p>
                </div>
                <form onsubmit="window.App.handleAddProgrammeSubmit(event, ${stationId})" class="space-y-4">
                    <div>
                        <label class="text-xs font-bold text-slate-700 block mb-1">Programme Title *</label>
                        <input type="text" name="title" required placeholder="e.g. The Evening Drive Show" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-xs font-bold text-slate-700 block mb-1">Start Time (24h) *</label>
                            <input type="time" name="start_time" value="16:00" required class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-700 block mb-1">End Time (24h) *</label>
                            <input type="time" name="end_time" value="19:00" required class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                        </div>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-slate-700 block mb-1">Broadcast Days</label>
                        <input type="text" name="days_of_week" value="Mon,Tue,Wed,Thu,Fri" placeholder="e.g. Mon,Tue,Wed,Thu,Fri" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-slate-700 block mb-1">Description / Tagline</label>
                        <textarea name="description" rows="2" placeholder="Summary of what the show covers..." class="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"></textarea>
                    </div>
                    <button type="submit" class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md shadow-blue-500/25 cursor-pointer">
                        Save Programme Schedule Slot
                    </button>
                </form>
            </div>
        `;
    },

    async handleAddProgrammeSubmit(e, stationId) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await API.programmes.create(stationId, data);
            this.showToast(res.message, 'success');
            document.getElementById('programme-modal')?.remove();
            this.navigate('station-admin');
        } catch (err) {
            this.showToast(err.message || 'Failed to add programme', 'error');
        }
    },

    async deleteProgramme(programmeId) {
        if (!confirm('Are you sure you want to delete this programme slot?')) return;
        try {
            const res = await API.programmes.delete(programmeId);
            this.showToast(res.message, 'success');
            this.navigate('station-admin');
        } catch (e) {
            this.showToast('Failed to delete programme', 'error');
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        const bgColors = {
            success: 'bg-emerald-600 text-white shadow-emerald-500/20',
            error: 'bg-rose-600 text-white shadow-rose-500/20',
            warning: 'bg-amber-500 text-slate-950 shadow-amber-500/20',
            info: 'bg-slate-900 text-white shadow-slate-900/20 border border-slate-800'
        };

        toast.className = `toast px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 ${bgColors[type] || bgColors.info}`;
        toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> <span>${message}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3500);
    }
};

window.App = App;

// Bootstrap on DOM load
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
