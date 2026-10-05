// public/js/api.js
// Client API Service for RadioWave Kenya Platform

const API = {
    baseUrl: '/api',
    tokenKey: 'radiowave_jwt_token',
    userKey: 'radiowave_user_info',

    getToken() {
        return localStorage.getItem(this.tokenKey);
    },

    setToken(token) {
        if (token) {
            localStorage.setItem(this.tokenKey, token);
        } else {
            localStorage.removeItem(this.tokenKey);
        }
    },

    getUser() {
        const u = localStorage.getItem(this.userKey);
        return u ? JSON.parse(u) : null;
    },

    setUser(user) {
        if (user) {
            localStorage.setItem(this.userKey, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.userKey);
        }
    },

    removeToken() {
        localStorage.removeItem(this.tokenKey);
    },

    removeUser() {
        localStorage.removeItem(this.userKey);
    },

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const res = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || `HTTP Error ${res.status}`);
            }
            return data;
        } catch (err) {
            console.error(`API Error on ${endpoint}:`, err);
            throw err;
        }
    },

    // 1. Auth Endpoints
    auth: {
        login: (email, password) => API.request('/auth.php?action=login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),
        register: (userData) => API.request('/auth.php?action=register', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),
        me: () => API.request('/auth.php?action=me'),
        switchDemoRole: (role) => API.request('/auth.php?action=switch_demo_role', {
            method: 'POST',
            body: JSON.stringify({ role })
        }),
        logout() {
            API.setToken(null);
            API.setUser(null);
        }
    },

    // 2. Stations Endpoints
    stations: {
        list: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.request(`/stations.php?${query}`);
        },
        detail: (slugOrId) => {
            const isNum = !isNaN(slugOrId) && !isNaN(parseFloat(slugOrId));
            const param = isNum ? `id=${slugOrId}` : `slug=${slugOrId}`;
            return API.request(`/stations.php?action=detail&${param}`);
        },
        meta: () => API.request('/stations.php?action=meta'),
        create: (data) => API.request('/stations.php', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => API.request(`/stations.php?id=${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        })
    },

    // 3. Streaming Endpoints
    streaming: {
        get: (stationId) => API.request(`/streaming.php?action=get&station_id=${stationId}`),
        update: (stationId, data) => API.request('/streaming.php?action=update', {
            method: 'POST',
            body: JSON.stringify({ station_id: stationId, ...data })
        }),
        healthCheck: (stationId) => API.request(`/streaming.php?action=health_check&station_id=${stationId}`),
        rotateCredentials: (stationId) => API.request('/streaming.php?action=rotate_credentials', {
            method: 'POST',
            body: JSON.stringify({ station_id: stationId })
        })
    },

    // 4. Programmes & Presenters
    programmes: {
        list: (stationId) => API.request(`/programmes.php?action=list&station_id=${stationId}`),
        create: (stationId, data) => API.request('/programmes.php?action=create', {
            method: 'POST',
            body: JSON.stringify({ station_id: stationId, ...data })
        }),
        delete: (id) => API.request(`/programmes.php?action=delete&id=${id}`, { method: 'POST' }),
        updateNowPlaying: (stationId, data) => API.request('/programmes.php?action=update_now_playing', {
            method: 'POST',
            body: JSON.stringify({ station_id: stationId, ...data })
        }),
        presenters: (stationId) => API.request(`/programmes.php?action=presenters&station_id=${stationId}`),
        addPresenter: (stationId, data) => API.request(`/programmes.php?action=presenters&station_id=${stationId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
    },

    // 5. Engagement
    engagement: {
        requests: (stationId, status = 'all') => API.request(`/engagement.php?action=requests&station_id=${stationId}&status=${status}`),
        submitRequest: (stationId, data) => API.request(`/engagement.php?action=requests&station_id=${stationId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        updateRequestStatus: (requestId, status) => API.request('/engagement.php?action=update_request_status', {
            method: 'POST',
            body: JSON.stringify({ request_id: requestId, status })
        }),
        toggleFavourite: (stationId) => API.request('/engagement.php?action=toggle_favourite', {
            method: 'POST',
            body: JSON.stringify({ station_id: stationId })
        }),
        myFavourites: () => API.request('/engagement.php?action=my_favourites'),
        votePoll: (optionId) => API.request('/engagement.php?action=vote_poll', {
            method: 'POST',
            body: JSON.stringify({ option_id: optionId })
        })
    },

    // 6. Podcasts
    podcasts: {
        list: (stationId = null) => API.request(`/podcasts.php?action=list${stationId ? `&station_id=${stationId}` : ''}`),
        episodes: (podcastId) => API.request(`/podcasts.php?action=episodes&podcast_id=${podcastId}`),
        trackPlay: (episodeId) => API.request(`/podcasts.php?action=track_play&episode_id=${episodeId}`, { method: 'POST' }),
        createPodcast: (stationId, data) => API.request('/podcasts.php?action=create_podcast', {
            method: 'POST',
            body: JSON.stringify({ station_id: stationId, ...data })
        }),
        createEpisode: (podcastId, data) => API.request('/podcasts.php?action=create_episode', {
            method: 'POST',
            body: JSON.stringify({ podcast_id: podcastId, ...data })
        })
    },

    // 7. Analytics
    analytics: {
        getStation: (stationId) => API.request(`/analytics.php?station_id=${stationId}`),
        getPlatform: () => API.request('/analytics.php')
    },

    // 8. Billing
    billing: {
        plans: () => API.request('/billing.php?action=plans'),
        subscription: (stationId) => API.request(`/billing.php?action=station_subscription&station_id=${stationId}`),
        subscribeMpesa: (stationId, planId, phone) => API.request('/billing.php?action=subscribe_mpesa', {
            method: 'POST',
            body: JSON.stringify({ station_id: stationId, plan_id: planId, phone })
        })
    },

    // 9. Admin & Super Admin
    admin: {
        overview: () => API.request('/admin.php?action=overview'),
        pendingStations: () => API.request('/admin.php?action=pending_stations'),
        approveStation: (stationId, decision, feedback = '') => API.request('/admin.php?action=approve_station', {
            method: 'POST',
            body: JSON.stringify({ station_id: stationId, decision, feedback })
        }),
        streamHealthGrid: () => API.request('/admin.php?action=stream_health_grid'),
        runAllHealthChecks: () => API.request('/admin.php?action=run_all_health_checks'),
        auditLogs: () => API.request('/admin.php?action=audit_logs')
    }
};

window.API = API;
