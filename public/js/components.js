// public/js/components.js
// UI Views and Component Renderers for RadioWave Kenya
// Modern Bright & Vibrant Royal Blue Theme

const Components = {
    // 1. LISTENER HOME & DISCOVER VIEW
    renderHome(stations, counties = [], genres = [], activeFilters = {}) {
        const featured = stations.find(s => s.is_featured) || stations[0];
        
        return `
            <div class="space-y-8 animate-fadeIn">
                <!-- Hero Featured Station Banner -->
                ${featured ? `
                    <div class="relative rounded-[22px] overflow-hidden bg-white border border-slate-200/80 p-6 md:p-10 shadow-sm hover:shadow-md transition-shadow">
                        <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent z-10"></div>
                        <img src="${featured.cover_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200'}" class="absolute inset-0 w-full h-full object-cover opacity-35">
                        
                        <div class="relative z-20 max-w-2xl space-y-4">
                            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                <span class="w-2 h-2 rounded-full bg-emerald-400 live-pulse"></span>
                                Featured Live Broadcast
                            </div>
                            
                            <h1 class="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                                ${featured.name} <span class="text-blue-400 text-2xl md:text-3xl font-medium">(${featured.frequency || 'Live'})</span>
                            </h1>
                            
                            <p class="text-slate-200 text-sm md:text-base line-clamp-2 leading-relaxed">
                                ${featured.tagline || featured.description || 'Broadcasting authentic music, live news, and entertainment across Kenya.'}
                            </p>
                            
                            <div class="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-slate-300">
                                <span class="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 backdrop-blur-xs">📍 ${featured.county}, Kenya</span>
                                <span class="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 backdrop-blur-xs">🎵 ${featured.genre}</span>
                                <span class="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 backdrop-blur-xs">🗣️ ${featured.language}</span>
                                <span class="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold backdrop-blur-xs">🏢 ${featured.media_group || 'Kenyan Broadcast Network'}</span>
                            </div>

                            <div class="flex items-center gap-3 pt-3">
                                <button onclick="window.App.playStationById(${featured.id})" class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition transform hover:scale-105 active:scale-95 cursor-pointer">
                                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    Listen Live Now
                                </button>
                                <button onclick="window.App.navigate('station', '${featured.slug}')" class="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition border border-white/20 backdrop-blur-sm cursor-pointer">
                                    View Guide & Pipeline
                                </button>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Search and County / Genre Filter Section -->
                <div class="space-y-4">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Direct IP Radio Streaming & Discovery</h2>
                            <p class="text-sm text-slate-500">High-fidelity IP broadcast directory with direct CDN offload & HTTPS proxy wrap</p>
                        </div>
                        
                        <!-- Search Bar -->
                        <div class="relative w-full md:w-80">
                            <input 
                                type="text" 
                                id="station-search-input" 
                                placeholder="Search station, frequency, county..." 
                                value="${activeFilters.search || ''}"
                                oninput="window.App.handleSearch(this.value)"
                                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-xs"
                            />
                            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                    </div>

                    <!-- Filter Chips: Kenyan Counties -->
                    <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <span class="text-xs text-slate-400 uppercase font-bold pr-2 flex-shrink-0">Counties:</span>
                        <button onclick="window.App.filterNearMe()" id="near-me-btn" class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 shadow-xs" title="Find stations in your current location">
                            <span>📍</span> Near Me
                        </button>
                        <button onclick="window.App.setFilter('county', '')" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${!activeFilters.county ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}">
                            All Kenya (${stations.length})
                        </button>
                        ${['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Machakos', 'Kiambu', 'Uasin Gishu', 'Nyeri', 'Meru'].map(c => `
                            <button onclick="window.App.setFilter('county', '${c}')" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${activeFilters.county === c ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}">
                                ${c}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Filter Chips: Genres -->
                    <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <span class="text-xs text-slate-400 uppercase font-bold pr-2 flex-shrink-0">Genres:</span>
                        <button onclick="window.App.setFilter('genre', '')" class="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${!activeFilters.genre ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-800'}">
                            All Genres
                        </button>
                        ${['Afrobeat', 'Classic Hits', 'News, Talk', 'Reggae', 'Rhumba', 'Vernacular', 'Asian & Bollywood'].map(g => `
                            <button onclick="window.App.setFilter('genre', '${g}')" class="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${activeFilters.genre === g ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-800'}">
                                ${g}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Stations Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${stations.map(station => `
                        <div class="station-card rounded-[18px] bg-white border border-slate-200/90 p-5 flex flex-col justify-between group shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 hover:shadow-[0_12px_28px_rgba(37,99,235,0.12)]">
                            <div class="space-y-4">
                                <div class="flex items-start justify-between gap-3">
                                    <div class="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 shadow-inner">
                                        <img src="${station.logo_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=150'}" class="w-full h-full object-cover">
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-1.5 mb-0.5">
                                            <span class="live-badge ${station.stream_status === 'online' ? '' : 'offline'}">
                                                <span class="w-1.5 h-1.5 rounded-full ${station.stream_status === 'online' ? 'bg-emerald-500 live-pulse' : 'bg-slate-400'}"></span>
                                                ${station.stream_status === 'online' ? 'LIVE' : 'OFFLINE'}
                                            </span>
                                            <span class="text-xs text-slate-500 font-medium">• ${station.frequency || 'Online'}</span>
                                        </div>
                                        <h3 class="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                                            ${station.name}
                                        </h3>
                                        <p class="text-xs text-slate-500 truncate">📍 ${station.county}, ${station.city}</p>
                                    </div>
                                </div>

                                <p class="text-xs text-slate-600 line-clamp-2 h-8 leading-relaxed">
                                    ${station.tagline || station.description || 'Kenyan radio broadcast.'}
                                </p>

                                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
                                    <div class="truncate mr-2">
                                        <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">NOW PLAYING</span>
                                        <span class="text-slate-800 font-semibold truncate block">${station.now_track ? `${station.now_track} - ${station.now_artist}` : 'Live On-Air Studio Feed'}</span>
                                    </div>
                                    <span class="px-2 py-0.5 rounded bg-blue-50 text-[10px] text-blue-700 border border-blue-100 font-mono font-bold flex-shrink-0">${station.bitrate || 128}k ${station.codec || 'MP3'}</span>
                                </div>
                            </div>

                            <div class="pt-4 flex items-center gap-1.5">
                                <button onclick="window.App.playStationById(${station.id})" class="flex-1 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition duration-150 shadow-xs active:scale-95 cursor-pointer group/btn">
                                    <svg class="w-4 h-4 fill-current transition" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    <span>Play</span>
                                </button>
                                <button onclick="window.App.openWhatsApp('${station.contact_phone || '+254700000000'}', '${station.name.replace(/'/g, "\\'")}')" class="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white transition cursor-pointer" title="Chat with Studio on WhatsApp">
                                    💬
                                </button>
                                <button onclick="window.App.shareStation(${station.id})" class="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition cursor-pointer" title="Share Station Link">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                                </button>
                                <button onclick="window.App.navigate('station', '${station.slug}')" class="px-2.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer" title="Station Guide & Architecture">
                                    Guide
                                </button>
                                <button onclick="window.App.toggleFavourite(${station.id})" class="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer" title="Add to Favourites">
                                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${stations.length === 0 ? `
                    <div class="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <p class="text-slate-500 text-lg">No radio stations found matching your filter.</p>
                        <button onclick="window.App.resetFilters()" class="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition cursor-pointer shadow-sm">
                            Reset All Filters
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // 2. STATION DETAILS VIEW
    renderStationDetails(station, activeTab = 'schedule') {
        const programmes = station.programmes || [];
        const presenters = station.presenters || [];
        const podcasts = station.podcasts || [];
        const activePoll = station.active_poll;

        return `
            <div class="space-y-8 animate-fadeIn">
                <!-- Station Header Card -->
                <div class="relative rounded-[22px] overflow-hidden bg-white border border-slate-200/90 p-6 md:p-8 shadow-sm">
                    <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent z-10"></div>
                    <img src="${station.cover_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200'}" class="absolute inset-0 w-full h-full object-cover opacity-35">
                    
                    <div class="relative z-20 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div class="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-white border-2 border-blue-500 shadow-xl flex-shrink-0">
                            <img src="${station.logo_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300'}" class="w-full h-full object-cover">
                        </div>

                        <div class="flex-1 space-y-2">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="live-badge ${station.stream_status === 'online' ? '' : 'offline'}">
                                    <span class="w-2 h-2 rounded-full ${station.stream_status === 'online' ? 'bg-emerald-500 live-pulse' : 'bg-slate-400'}"></span>
                                    ${station.stream_status === 'online' ? 'ON AIR' : 'OFFLINE'}
                                </span>
                                <span class="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-mono font-bold">${station.frequency || 'Live Stream'}</span>
                                <span class="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">📍 ${station.county}, Kenya</span>
                                <span class="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold">🗣️ ${station.language}</span>
                                <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">🏢 ${station.media_group || 'National Broadcast'}</span>
                            </div>

                            <h1 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">${station.name}</h1>
                            <p class="text-slate-200 text-sm md:text-base max-w-3xl leading-relaxed">${station.description || station.tagline || ''}</p>

                            <div class="flex flex-wrap items-center gap-3 pt-4">
                                <button onclick="window.App.playStationById(${station.id})" class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition transform hover:scale-105 active:scale-95 cursor-pointer">
                                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    Listen Live
                                </button>
                                <button onclick="window.App.openWhatsApp('${station.contact_phone || '+254700000000'}', '${station.name.replace(/'/g, "\\'")}')" class="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer">
                                    <span>💬</span> WhatsApp Studio
                                </button>
                                <button onclick="window.App.openRequestModal(${station.id})" class="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-blue-300 font-semibold transition border border-blue-400/30 backdrop-blur-sm flex items-center gap-2 cursor-pointer">
                                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                                    Song Request
                                </button>
                                <button onclick="window.App.shareStation(${station.id})" class="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/20 backdrop-blur-sm cursor-pointer" title="Share Station">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                                </button>
                                <button onclick="window.App.toggleFavourite(${station.id})" class="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-rose-400 transition border border-white/20 backdrop-blur-sm cursor-pointer" title="Add to Favourites">
                                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <div class="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
                    ${[
                        { id: 'schedule', label: 'Programme Guide', icon: '📅' },
                        { id: 'requests', label: 'Requests & Polls', icon: '🎙️' },
                        { id: 'presenters', label: 'Presenters & Hosts', icon: '🎧' },
                        { id: 'podcasts', label: 'Catch-up & Podcasts', icon: '📻' },
                        { id: 'pipeline', label: 'Audio Pipeline & Architecture', icon: '⚡' }
                    ].map(tab => `
                        <button onclick="window.App.setStationTab('${tab.id}')" class="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}">
                            <span>${tab.icon}</span>
                            ${tab.label}
                        </button>
                    `).join('')}
                </div>

                <!-- Tab 1: Programme Guide -->
                ${activeTab === 'schedule' ? `
                    <div class="space-y-4">
                        <h3 class="text-xl font-bold text-slate-900">Broadcast Schedule</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${programmes.length > 0 ? programmes.map(prog => `
                                <div class="p-5 rounded-[18px] bg-white border border-slate-200/90 shadow-sm flex items-start gap-4">
                                    <div class="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                                        <img src="${prog.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}" class="w-full h-full object-cover">
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-bold text-blue-600 font-mono">${prog.start_time} - ${prog.end_time}</span>
                                            <span class="text-[10px] text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-100 font-semibold">${prog.days_of_week}</span>
                                        </div>
                                        <h4 class="text-base font-bold text-slate-900 mt-1">${prog.title}</h4>
                                        <p class="text-xs text-slate-500 mt-1 line-clamp-2">${prog.description || 'Weekly regular show.'}</p>
                                        ${prog.presenter_name ? `
                                            <div class="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                                                <span>🎙️ Host:</span>
                                                <span class="text-slate-800 font-medium">${prog.presenter_name}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="col-span-2 p-8 text-center bg-white rounded-[18px] text-slate-500 border border-slate-200 shadow-sm">
                                    No scheduled programmes uploaded for this station yet.
                                </div>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 2: Requests & Polls -->
                ${activeTab === 'requests' ? `
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Song Request Box -->
                        <div class="p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-bold text-slate-900">Send On-Air Request / Dedication</h3>
                                <span class="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-bold">Direct to Presenter</span>
                            </div>
                            <form id="station-request-form" onsubmit="window.App.handleRequestSubmit(event, ${station.id})" class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-700 block mb-1">Your Name / Handle</label>
                                    <input type="text" name="listener_name" required placeholder="e.g. Brian from Machakos" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-xs font-bold text-slate-700 block mb-1">Song Title *</label>
                                        <input type="text" name="song_title" required placeholder="e.g. Sura Yako" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                                    </div>
                                    <div>
                                        <label class="text-xs font-bold text-slate-700 block mb-1">Artist Name</label>
                                        <input type="text" name="artist" placeholder="e.g. Sauti Sol" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                                    </div>
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-700 block mb-1">Dedication Message / Shoutout</label>
                                    <textarea name="message" rows="3" placeholder="Write a message to be read live on-air..." class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"></textarea>
                                </div>
                                <button type="submit" class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-500/20 cursor-pointer">
                                    Submit Request to Studio
                                </button>
                            </form>
                        </div>

                        <!-- Live Poll -->
                        <div class="p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                            <h3 class="text-lg font-bold text-slate-900">Live Listener Poll</h3>
                            ${activePoll ? `
                                <div class="space-y-3">
                                    <p class="text-sm font-semibold text-slate-800">❓ ${activePoll.question}</p>
                                    <div class="space-y-2 pt-2">
                                        ${activePoll.options.map(opt => `
                                            <div onclick="window.App.votePoll(${opt.id})" class="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 cursor-pointer transition flex items-center justify-between group">
                                                <span class="text-sm text-slate-700 group-hover:text-blue-900 font-medium">${opt.option_text}</span>
                                                <span class="text-xs text-blue-700 font-mono font-bold bg-blue-100 px-2 py-0.5 rounded">${opt.votes_count} votes</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : `
                                <p class="text-sm text-slate-500">No active poll right now. Check back during live shows!</p>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 3: Presenters Lineup -->
                ${activeTab === 'presenters' ? `
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${presenters.length > 0 ? presenters.map(pres => `
                            <div class="p-5 rounded-[18px] bg-white border border-slate-200/90 shadow-sm text-center space-y-3">
                                <div class="w-24 h-24 rounded-full overflow-hidden mx-auto bg-slate-100 border-2 border-blue-500 shadow-md">
                                    <img src="${pres.photo_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200'}" class="w-full h-full object-cover">
                                </div>
                                <div>
                                    <h4 class="text-base font-bold text-slate-900">${pres.name}</h4>
                                    <span class="text-xs text-blue-600 font-semibold">${pres.social_handle || 'On-Air Host'}</span>
                                </div>
                                <p class="text-xs text-slate-500 line-clamp-3 leading-relaxed">${pres.bio || 'Radio host and presenter.'}</p>
                            </div>
                        `).join('') : `
                            <div class="col-span-3 p-8 text-center bg-white rounded-[18px] text-slate-500 border border-slate-200 shadow-sm">
                                Presenter profiles will be added soon.
                            </div>
                        `}
                    </div>
                ` : ''}

                <!-- Tab 4: Catch-up & Podcasts -->
                ${activeTab === 'podcasts' ? `
                    <div class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${podcasts.length > 0 ? podcasts.map(pod => `
                                <div class="p-5 rounded-[18px] bg-white border border-slate-200/90 shadow-sm flex items-start gap-4">
                                    <div class="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                                        <img src="${pod.cover_url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200'}" class="w-full h-full object-cover">
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <span class="text-[10px] text-blue-700 uppercase font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">${pod.category}</span>
                                        <h4 class="text-base font-bold text-slate-900 mt-1">${pod.title}</h4>
                                        <p class="text-xs text-slate-500 mt-1 line-clamp-2">${pod.description}</p>
                                        <button onclick="window.App.openPodcastEpisodes(${pod.id})" class="mt-3 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 text-xs font-semibold text-slate-700 hover:text-white transition cursor-pointer">
                                            Listen to Episodes (${pod.episode_count || 0})
                                        </button>
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="col-span-2 p-8 text-center bg-white rounded-[18px] text-slate-500 border border-slate-200 shadow-sm">
                                    No podcasts or catch-up episodes published yet.
                                </div>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 5: Audio Pipeline & Architecture -->
                ${activeTab === 'pipeline' ? `
                    <div class="p-6 md:p-8 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-8">
                        <div>
                            <span class="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold uppercase border border-blue-200">End-to-End Broadcast Pipeline</span>
                            <h3 class="text-xl md:text-2xl font-extrabold text-slate-900 mt-2">How Audio Flows from Studio to Your Browser</h3>
                            <p class="text-xs text-slate-500 mt-1">Direct IP routing with zero-bandwidth CDN offloading & HTTPS proxy encapsulation</p>
                        </div>

                        <!-- Interactive Pipeline Flow Diagram -->
                        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative">
                                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">1</div>
                                <h4 class="text-sm font-bold text-slate-900">Studio MCR</h4>
                                <p class="text-[11px] text-slate-500">Master mixing console outputs clean audio feed.</p>
                            </div>
                            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">2</div>
                                <h4 class="text-sm font-bold text-slate-900">Audio Encoder</h4>
                                <p class="text-[11px] text-slate-500">OBS, BUTT, Barix encodes to AAC (32-64k) or MP3 (128k).</p>
                            </div>
                            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">3</div>
                                <h4 class="text-sm font-bold text-slate-900">Origin / CDN</h4>
                                <p class="text-[11px] text-slate-500">Icecast / Shoutcast / AWS CloudFront handles listeners.</p>
                            </div>
                            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">4</div>
                                <h4 class="text-sm font-bold text-slate-900">Platform Index</h4>
                                <p class="text-[11px] text-slate-500">RadioWave aggregates stream URLs, metadata & health checks.</p>
                            </div>
                            <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">5</div>
                                <h4 class="text-sm font-bold text-slate-900">Listener Client</h4>
                                <p class="text-[11px] text-slate-600">Direct TCP/HTTPS connection with HTML5 & HLS.js engine.</p>
                            </div>
                        </div>

                        <!-- Technical Specs Matrix -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <span class="text-[10px] text-slate-400 uppercase font-bold block">STREAMING ARCHITECTURE</span>
                                <span class="text-sm font-bold text-slate-900 uppercase">${station.stream_mode === 'managed' ? 'Platform Managed Icecast' : 'Direct CDN Aggregation'}</span>
                            </div>
                            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <span class="text-[10px] text-slate-400 uppercase font-bold block">AUDIO CODEC & BITRATE</span>
                                <span class="text-sm font-bold text-blue-600">${station.codec ? station.codec.toUpperCase() : 'MP3'} • ${station.bitrate || 128} kbps</span>
                            </div>
                            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <span class="text-[10px] text-slate-400 uppercase font-bold block">UPTIME SLA (HEALTH CHECK)</span>
                                <span class="text-sm font-bold text-emerald-600">${station.uptime_percentage || 99.9}%</span>
                            </div>
                        </div>

                        <!-- Challenges & Resolutions -->
                        <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-700">
                            <h4 class="font-bold text-slate-900 text-sm">Security & Web Delivery Standards:</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                                <div class="space-y-1">
                                    <span class="font-bold text-blue-700 block">🔒 Mixed Content Wrap</span>
                                    <p class="text-slate-500 text-[11px]">Legacy HTTP station streams are encapsulated via HTTPS reverse proxy to prevent browser security blocks.</p>
                                </div>
                                <div class="space-y-1">
                                    <span class="font-bold text-indigo-700 block">🌐 CORS Compliance</span>
                                    <p class="text-slate-500 text-[11px]">Streams include automatic Access-Control headers to allow seamless cross-origin browser audio streaming.</p>
                                </div>
                                <div class="space-y-1">
                                    <span class="font-bold text-emerald-700 block">📱 MediaSession Background</span>
                                    <p class="text-slate-500 text-[11px]">Hardware lock-screen playback controls with station artwork and ICY Now-Playing metadata tags.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // 3. STATION ADMIN PORTAL
    renderStationAdmin(station, streamData, subscription, requests, analytics, activeTab = 'stream') {
        const stream = streamData.stream || {};
        const creds = streamData.credentials || {};

        return `
            <div class="space-y-8 animate-fadeIn">
                <!-- Station Admin Banner -->
                <div class="p-6 md:p-8 rounded-[22px] bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div class="flex items-center gap-4">
                        <img src="${station.logo_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=150'}" class="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold uppercase border border-blue-200">Station Console</span>
                                <span class="text-xs text-slate-500">• ${station.frequency || '99.9 FM'}</span>
                                <span class="text-xs text-indigo-600 font-semibold">• ${station.media_group || 'Broadcaster'}</span>
                            </div>
                            <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 mt-0.5">${station.name}</h1>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                        <button onclick="window.App.toggleStudioMonitor(${station.id})" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition transform active:scale-95 cursor-pointer">
                            <span>🎧</span>
                            <span>Listen to Live Stream</span>
                        </button>
                        <button onclick="window.App.openPresenterCockpit(${station.id})" class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/20 transition transform active:scale-95 cursor-pointer">
                            <span class="w-2 h-2 rounded-full bg-white live-pulse"></span>
                            <span>Open Live DJ Studio Cockpit</span>
                        </button>
                    </div>
                </div>

                <!-- KPI Metric Cards -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="p-5 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-1">
                        <span class="text-xs text-slate-500 font-semibold uppercase">LIVE LISTENERS</span>
                        <div class="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                            ${analytics.current_concurrent_listeners || station.listeners_count || 120}
                            <span class="text-xs text-emerald-600 font-normal">🟢 Live</span>
                        </div>
                    </div>
                    <div class="p-5 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-1">
                        <span class="text-xs text-slate-500 font-semibold uppercase">STREAM UPTIME SLA</span>
                        <div class="text-2xl font-extrabold text-emerald-600">${station.uptime_percentage || 99.8}%</div>
                    </div>
                    <div class="p-5 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-1">
                        <span class="text-xs text-slate-500 font-semibold uppercase">TOTAL REQUESTS</span>
                        <div class="text-2xl font-extrabold text-blue-600">${requests.length || 0}</div>
                    </div>
                    <div class="p-5 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-1">
                        <span class="text-xs text-slate-500 font-semibold uppercase">CURRENT PLAN</span>
                        <div class="text-lg font-bold text-indigo-600 truncate">${subscription?.subscription?.plan_name || 'Managed Pro'}</div>
                    </div>
                </div>

                <!-- Admin Tabs -->
                <div class="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
                    ${[
                        { id: 'stream', label: 'Streaming Config & Mount', icon: '📡' },
                        { id: 'requests', label: 'Song Requests Inbox', icon: '📥' },
                        { id: 'schedule', label: 'Programmes & Lineup', icon: '📅' },
                        { id: 'analytics', label: 'Telemetry & Analytics', icon: '📊' },
                        { id: 'billing', label: 'Subscription & M-Pesa', icon: '💳' }
                    ].map(tab => `
                        <button onclick="window.App.setStationAdminTab('${tab.id}')" class="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}">
                            <span>${tab.icon}</span>
                            ${tab.label}
                        </button>
                    `).join('')}
                </div>

                <!-- Tab 1: Streaming Config -->
                ${activeTab === 'stream' ? `
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2 p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-6">
                            <h3 class="text-lg font-bold text-slate-900">Stream Distribution Mode</h3>

                            <form id="stream-config-form" onsubmit="window.App.handleStreamConfigUpdate(event, ${station.id})" class="space-y-5">
                                <div class="grid grid-cols-2 gap-4">
                                    <label class="p-4 rounded-xl border cursor-pointer transition ${stream.mode === 'managed' ? 'bg-blue-50 border-blue-500 text-slate-900 ring-2 ring-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}">
                                        <input type="radio" name="mode" value="managed" ${stream.mode === 'managed' ? 'checked' : ''} onchange="window.App.toggleStreamMode('managed')" class="hidden">
                                        <div class="font-bold text-sm text-slate-900">Managed Icecast Streaming</div>
                                        <div class="text-xs text-slate-500 mt-1">Platform provisions mount & source credentials for studio encoder.</div>
                                    </label>
                                    <label class="p-4 rounded-xl border cursor-pointer transition ${stream.mode === 'external' ? 'bg-blue-50 border-blue-500 text-slate-900 ring-2 ring-blue-200' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}">
                                        <input type="radio" name="mode" value="external" ${stream.mode === 'external' ? 'checked' : ''} onchange="window.App.toggleStreamMode('external')" class="hidden">
                                        <div class="font-bold text-sm text-slate-900">Existing External Stream</div>
                                        <div class="text-xs text-slate-500 mt-1">Provide direct CDN / Icecast endpoint.</div>
                                    </label>
                                </div>

                                <div id="external-url-group" class="${stream.mode === 'external' ? '' : 'hidden'}">
                                    <label class="text-xs font-bold text-slate-700 block mb-1">Direct Audio Stream / HLS Manifest URL</label>
                                    <input type="url" name="stream_url" value="${stream.stream_url || ''}" placeholder="https://stream.yourstation.com/live.mp3 or .m3u8" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-xs font-bold text-slate-700 block mb-1">Audio Codec</label>
                                        <select name="codec" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                                            <option value="mp3" ${stream.codec === 'mp3' ? 'selected' : ''}>MP3 (Universal Playback)</option>
                                            <option value="aac" ${stream.codec === 'aac' ? 'selected' : ''}>AAC / AAC+ (High Efficiency / Low Data)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="text-xs font-bold text-slate-700 block mb-1">Target Bitrate</label>
                                        <select name="bitrate" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                                            <option value="32" ${stream.bitrate == 32 ? 'selected' : ''}>32 kbps (AAC+ Ultra Low Bandwidth)</option>
                                            <option value="64" ${stream.bitrate == 64 ? 'selected' : ''}>64 kbps (Standard Mobile)</option>
                                            <option value="128" ${stream.bitrate == 128 ? 'selected' : ''}>128 kbps (High Quality MP3)</option>
                                            <option value="192" ${stream.bitrate == 192 ? 'selected' : ''}>192 kbps (Studio Master)</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3 pt-2">
                                    <button type="submit" class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-sm cursor-pointer">
                                        Save Stream Configuration
                                    </button>
                                    <button type="button" onclick="window.App.testStreamHealth(${station.id})" class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition border border-slate-200 flex items-center gap-2 cursor-pointer">
                                        ⚡ Test Stream Handshake
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Studio Encoder Provisioning Credentials Card -->
                        <div class="p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-base font-bold text-slate-900">Studio Encoder Settings</h3>
                                <button onclick="window.App.rotateCredentials(${station.id})" class="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer">Rotate Secret</button>
                            </div>

                            <div class="space-y-3 text-xs">
                                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                    <span class="text-slate-400 font-semibold block">ICECAST SERVER HOST</span>
                                    <span class="text-slate-900 font-mono font-bold">${creds.server_host || 'stream.radiowave.co.ke'}</span>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                        <span class="text-slate-400 font-semibold block">PORT</span>
                                        <span class="text-slate-900 font-mono font-bold">${creds.server_port || 8000}</span>
                                    </div>
                                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                        <span class="text-slate-400 font-semibold block">MOUNT</span>
                                        <span class="text-blue-600 font-mono font-bold">${creds.mount_point || '/' + station.slug}</span>
                                    </div>
                                </div>
                                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                    <span class="text-slate-400 font-semibold block">SOURCE USERNAME</span>
                                    <span class="text-slate-900 font-mono font-bold">${creds.username || 'source'}</span>
                                </div>
                                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                    <span class="text-slate-400 font-semibold block">SOURCE PASSWORD</span>
                                    <span class="text-emerald-700 font-mono font-bold select-all bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${creds.password || 'key_' + station.slug}</span>
                                </div>
                            </div>

                            <div class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800">
                                💡 Compatible with <strong>BUTT</strong>, <strong>OBS Studio</strong>, <strong>Telos Z/IP</strong>, <strong>Barix Instreamer</strong>, and <strong>Mixxx</strong>.
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 2: Requests Inbox -->
                ${activeTab === 'requests' ? `
                    <div class="p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-bold text-slate-900">Listener Song Requests & Dedications Queue</h3>
                            <span class="text-xs text-slate-500 font-semibold">${requests.length} total submissions</span>
                        </div>

                        <div class="space-y-3">
                            ${requests.length > 0 ? requests.map(req => `
                                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div class="space-y-1">
                                        <div class="flex items-center gap-2">
                                            <span class="font-bold text-slate-900 text-sm">${req.song_title}</span>
                                            ${req.artist ? `<span class="text-xs text-slate-500">• ${req.artist}</span>` : ''}
                                            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : req.status === 'played' ? 'bg-blue-100 text-blue-800' : req.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">
                                                ${req.status}
                                            </span>
                                        </div>
                                        <p class="text-xs text-slate-700 italic">"${req.message || 'No message'}"</p>
                                        <div class="text-[11px] text-slate-500">From: <strong class="text-slate-800">${req.listener_name}</strong> ${req.listener_phone ? `(${req.listener_phone})` : ''} • ${req.created_at}</div>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <button onclick="window.App.updateRequestStatus(${req.id}, 'approved')" class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-semibold transition border border-emerald-200 cursor-pointer">
                                            Approve
                                        </button>
                                        <button onclick="window.App.updateRequestStatus(${req.id}, 'played')" class="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-semibold transition border border-blue-200 cursor-pointer">
                                            Mark Played
                                        </button>
                                        <button onclick="window.App.updateRequestStatus(${req.id}, 'rejected')" class="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-semibold transition border border-rose-200 cursor-pointer">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="text-center py-10 text-slate-500 text-sm">No listener requests currently in queue.</div>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 3: Programmes & Lineup -->
                ${activeTab === 'schedule' ? `
                    <div class="p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-6">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-bold text-slate-900">Programme Slots</h3>
                            <button onclick="window.App.openAddProgrammeModal(${station.id})" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer">
                                + Add Programme Slot
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${(station.programmes || []).map(prog => `
                                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                                    <div>
                                        <span class="text-xs font-mono font-bold text-blue-600">${prog.start_time} - ${prog.end_time} (${prog.days_of_week})</span>
                                        <h4 class="text-base font-bold text-slate-900 mt-0.5">${prog.title}</h4>
                                        <p class="text-xs text-slate-500 mt-1">${prog.description}</p>
                                    </div>
                                    <button onclick="window.App.deleteProgramme(${prog.id})" class="text-xs text-rose-600 hover:text-rose-700 font-semibold p-1 cursor-pointer">Delete</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 4: Analytics -->
                ${activeTab === 'analytics' ? `
                    <div class="space-y-6">
                        <div class="p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                            <h3 class="text-lg font-bold text-slate-900">Hourly Listener Concurrency (Last 24 Hours)</h3>
                            <div class="flex items-end gap-2 h-48 pt-6">
                                ${(analytics.hourly_trend || []).map(item => `
                                    <div class="flex-1 flex flex-col items-center gap-1 group relative">
                                        <div class="w-full bg-blue-600 hover:bg-blue-500 rounded-t transition" style="height: ${Math.max(8, (item.listeners / (analytics.peak_listeners || 100)) * 100)}%"></div>
                                        <span class="text-[9px] text-slate-400 truncate font-mono">${item.time}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-3">
                                <h3 class="text-base font-bold text-slate-900">Audience by Kenyan County</h3>
                                <div class="space-y-2 pt-2">
                                    ${(analytics.county_distribution || []).map(c => `
                                        <div>
                                            <div class="flex justify-between text-xs mb-1">
                                                <span class="text-slate-700 font-medium">${c.county}</span>
                                                <span class="text-blue-600 font-bold">${c.percentage}% (${c.listeners} listeners)</span>
                                            </div>
                                            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div class="bg-blue-600 h-full rounded-full" style="width: ${c.percentage}%"></div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-3">
                                <h3 class="text-base font-bold text-slate-900">Listening Platforms</h3>
                                <div class="space-y-2 pt-2">
                                    ${(analytics.device_breakdown || []).map(d => `
                                        <div>
                                            <div class="flex justify-between text-xs mb-1">
                                                <span class="text-slate-700 font-medium">${d.platform}</span>
                                                <span class="text-indigo-600 font-bold">${d.percentage}%</span>
                                            </div>
                                            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div class="bg-indigo-600 h-full rounded-full" style="width: ${d.percentage}%"></div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 5: Subscription & M-Pesa -->
                ${activeTab === 'billing' ? `
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                            <h3 class="text-base font-bold text-slate-900">Current Subscription</h3>
                            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div class="text-xl font-extrabold text-slate-900">${subscription?.subscription?.plan_name || 'Managed Broadcast Pro'}</div>
                                <div class="text-sm font-bold text-blue-600">KES ${subscription?.subscription?.price || '7,500'} / month</div>
                                <div class="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Status: Active & Auto-renewing
                                </div>
                            </div>
                        </div>

                        <div class="lg:col-span-2 p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                            <h3 class="text-base font-bold text-slate-900">Upgrade or Renew via Lipa na M-Pesa</h3>
                            <form onsubmit="window.App.handleMpesaPayment(event, ${station.id})" class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-xs font-bold text-slate-700 block mb-1">Choose Plan</label>
                                        <select name="plan_id" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                                            <option value="2">Pro Aggregator (KES 2,500/mo)</option>
                                            <option value="3" selected>Managed Broadcast Pro (KES 7,500/mo)</option>
                                            <option value="4">Enterprise Broadcast Network (KES 18,000/mo)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="text-xs font-bold text-slate-700 block mb-1">M-Pesa Mobile Number</label>
                                        <input type="tel" name="phone" value="+254712345678" required class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                                    </div>
                                </div>
                                <button type="submit" class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20 cursor-pointer">
                                    📲 Send M-Pesa STK Push Prompt
                                </button>
                            </form>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // 4. PRESENTER / DJ LIVE STUDIO COCKPIT
    renderPresenterCockpit(station, nowPlaying, requests, activeFilter = 'all') {
        const filteredRequests = activeFilter === 'all' 
            ? requests 
            : requests.filter(r => r.status === activeFilter);

        const pendingCount = requests.filter(r => r.status === 'pending').length;
        const playedCount = requests.filter(r => r.status === 'played').length;
        const approvedCount = requests.filter(r => r.status === 'approved').length;

        const presets = [
            { title: 'Sura Yako', artist: 'Sauti Sol' },
            { title: 'Kwangwaru', artist: 'Harmonize ft. Diamond' },
            { title: 'Enjoy', artist: 'Jux ft. Diamond Platnumz' },
            { title: 'Katerina', artist: 'Bruce Melodie' },
            { title: 'Suzanna', artist: 'Sauti Sol' },
            { title: 'Inama', artist: 'Diamond Platnumz ft. Fally Ipupa' }
        ];

        return `
            <div class="space-y-8 animate-fadeIn max-w-7xl mx-auto">
                <!-- Cockpit Broadcast Header -->
                <div class="p-6 md:p-8 rounded-[22px] bg-slate-950 text-white border-2 border-rose-500/40 shadow-xl space-y-6">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <div class="relative">
                                <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-blue-600 flex items-center justify-center text-2xl text-white shadow-xl shadow-rose-500/30">
                                    🎙️
                                </div>
                                <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-slate-950 animate-ping"></span>
                                <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-slate-950"></span>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                        ● LIVE ON-AIR
                                    </span>
                                    <span class="text-xs text-slate-400 font-mono">Studio Stream Engine</span>
                                </div>
                                <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight mt-0.5">
                                    ${station.name} <span class="text-blue-400 font-normal">(${station.frequency || 'Live'})</span>
                                </h1>
                            </div>
                        </div>

                        <!-- Studio Live Digital Clock & Controls -->
                        <div class="flex flex-wrap items-center gap-3">
                            <div class="px-4 py-2 rounded-2xl bg-black/80 border border-slate-800 text-center">
                                <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">STUDIO CLOCK (EAT)</div>
                                <div id="studio-live-clock" class="text-xl font-mono font-black text-amber-400 tracking-wider">
                                    ${new Date().toLocaleTimeString('en-US', { hour12: false })}
                                </div>
                            </div>

                            <button 
                                id="studio-mic-btn"
                                onclick="window.App.toggleStudioMic()" 
                                class="px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black tracking-wide flex items-center gap-2 shadow-lg shadow-rose-600/30 transition transform active:scale-95 cursor-pointer"
                            >
                                <span class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                                <span id="studio-mic-text">MIC: LIVE ON AIR</span>
                            </button>

                            <button 
                                onclick="window.App.refreshPresenterCockpit()"
                                class="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 cursor-pointer"
                                title="Refresh Studio Feeds"
                            >
                                🔄
                            </button>
                        </div>
                    </div>

                    <!-- Telemetry Badges -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
                        <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span class="text-slate-400 text-[10px] block font-bold uppercase">LIVE AUDIENCE</span>
                            <span class="text-white font-bold text-base">👥 ${station.listeners_count || 1420} <span class="text-emerald-400 text-xs font-normal">Listening</span></span>
                        </div>
                        <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span class="text-slate-400 text-[10px] block font-bold uppercase">STUDIO ENCODER INGEST</span>
                            <span class="text-emerald-400 font-mono font-bold text-sm">Port 8005 • BUTT / OBS</span>
                        </div>
                        <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span class="text-slate-400 text-[10px] block font-bold uppercase">MOUNT POINT</span>
                            <span class="text-blue-400 font-mono font-bold text-sm">/ene-fm (Icecast)</span>
                        </div>
                        <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span class="text-slate-400 text-[10px] block font-bold uppercase">PENDING SHOUTOUTS</span>
                            <span class="text-amber-400 font-bold text-base">📥 ${pendingCount} in Queue</span>
                        </div>
                    </div>
                </div>

                <!-- Live Master Stream Return & DJ Headphone Monitor Console -->
                <div class="p-5 md:p-6 rounded-[22px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div class="flex items-center gap-3.5">
                            <div class="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl text-blue-600 flex-shrink-0">
                                🎧
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold text-slate-900 uppercase tracking-wider">Studio Master Headphone Monitor (PFL)</span>
                                    <span id="studio-monitor-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${window.Player && window.Player.isPlaying && window.Player.currentStation && window.Player.currentStation.id == station.id ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}">
                                        ${window.Player && window.Player.isPlaying && window.Player.currentStation && window.Player.currentStation.id == station.id ? '● MONITOR ACTIVE' : '○ MONITOR MUTED'}
                                    </span>
                                </div>
                                <p class="text-xs text-slate-500 mt-0.5">Listen directly to the actual on-air return audio to verify music, levels & ICY metadata</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 w-full sm:w-auto">
                            <button 
                                id="studio-monitor-toggle-btn"
                                type="button"
                                onclick="window.App.toggleStudioMonitor(${station.id})" 
                                class="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl ${window.Player && window.Player.isPlaying && window.Player.currentStation && window.Player.currentStation.id == station.id ? 'bg-blue-700 hover:bg-blue-800 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition transform active:scale-95 cursor-pointer"
                            >
                                <span id="studio-monitor-btn-icon">${window.Player && window.Player.isPlaying && window.Player.currentStation && window.Player.currentStation.id == station.id ? '⏸️' : '▶️'}</span>
                                <span id="studio-monitor-btn-text">${window.Player && window.Player.isPlaying && window.Player.currentStation && window.Player.currentStation.id == station.id ? 'Mute Studio Monitor' : 'Listen to Live On-Air Feed'}</span>
                            </button>
                        </div>
                    </div>

                    <!-- Real-Time Track Verification Strip -->
                    <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="equalizer flex items-end gap-1 h-4">
                                <span class="bar"></span>
                                <span class="bar"></span>
                                <span class="bar"></span>
                                <span class="bar"></span>
                            </div>
                            <div class="truncate">
                                <span class="text-[10px] text-slate-400 font-bold uppercase block">Current Live Stream Track (Listeners Hear):</span>
                                <span id="studio-verified-track" class="font-bold text-slate-900 truncate">
                                    🎵 ${nowPlaying?.track_title || 'Live Stream Audio'} <span class="text-blue-600">${nowPlaying?.artist_name ? '— ' + nowPlaying.artist_name : ''}</span>
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 text-[11px] text-slate-500">
                            <span class="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-emerald-600 font-bold">128 kbps MP3</span>
                            <span class="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-blue-600 font-bold">Low-Latency Studio Return</span>
                        </div>
                    </div>
                </div>

                <!-- Main Grid: Broadcaster & Request Queue -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    <!-- Left Column: Broadcast Now-Playing & Sound FX (7 cols) -->
                    <div class="lg:col-span-7 space-y-6">
                        
                        <!-- 1. Now Playing Broadcast Card -->
                        <div class="p-6 md:p-7 rounded-[22px] bg-white border border-slate-200/90 shadow-sm space-y-5">
                            <div class="flex items-center justify-between border-b border-slate-200 pb-3">
                                <div>
                                    <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <span>🎵</span> Broadcast "Now Playing" ICY Metadata
                                    </h2>
                                    <p class="text-xs text-slate-500">Pushes live song info & artist tags to all listeners' phones in real-time</p>
                                </div>
                                <span class="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-mono font-bold border border-blue-200">
                                    128k MP3
                                </span>
                            </div>

                            <form id="now-playing-form" onsubmit="window.App.handleUpdateNowPlaying(event, ${station.id})" class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-700 block mb-1">On-Air Show / Programme Name *</label>
                                    <input 
                                        type="text" 
                                        name="programme_name" 
                                        id="input-programme-name"
                                        value="${nowPlaying?.programme_name || 'ENE Breakfast Explosion'}" 
                                        required 
                                        placeholder="e.g. The Morning Drive Show"
                                        class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium"
                                    />
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-xs font-bold text-slate-700 block mb-1">Track Title *</label>
                                        <input 
                                            type="text" 
                                            name="track_title" 
                                            id="input-track-title"
                                            value="${nowPlaying?.track_title || ''}" 
                                            placeholder="e.g. Sura Yako" 
                                            required 
                                            class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label class="text-xs font-bold text-slate-700 block mb-1">Artist / Group Name *</label>
                                        <input 
                                            type="text" 
                                            name="artist_name" 
                                            id="input-artist-name"
                                            value="${nowPlaying?.artist_name || ''}" 
                                            placeholder="e.g. Sauti Sol" 
                                            required 
                                            class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium"
                                        />
                                    </div>
                                </div>

                                <!-- Quick Presets -->
                                <div>
                                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">⚡ One-Click Popular Track Presets:</span>
                                    <div class="flex flex-wrap gap-2">
                                        ${presets.map(p => `
                                            <button 
                                                type="button" 
                                                onclick="window.App.quickFillNowPlaying('${p.title}', '${p.artist}')"
                                                class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium transition cursor-pointer"
                                            >
                                                🎵 ${p.title} <span class="text-slate-400 text-[10px]">(${p.artist})</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    class="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>🚀 Broadcast Track to All Connected Listeners</span>
                                </button>
                            </form>
                        </div>

                        <!-- 2. Studio Soundboard & Jingles FX -->
                        <div class="p-6 rounded-[22px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                            <div class="flex items-center justify-between border-b border-slate-200 pb-3">
                                <div>
                                    <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <span>🎛️</span> Studio Soundboard & Sweepers
                                    </h3>
                                    <p class="text-xs text-slate-500">Trigger on-air sound effects & audio sweepers</p>
                                </div>
                                <span class="text-[11px] text-slate-400">Web Audio Synth FX</span>
                            </div>

                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <button onclick="window.App.playSoundFx('airhorn')" class="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition transform active:scale-95 group cursor-pointer">
                                    <span class="text-xl block mb-1">📢</span>
                                    <span class="text-xs font-bold text-slate-900 block group-hover:text-blue-600">Airhorn Blast</span>
                                    <span class="text-[10px] text-slate-500">Hype & Drop</span>
                                </button>
                                <button onclick="window.App.playSoundFx('applause')" class="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition transform active:scale-95 group cursor-pointer">
                                    <span class="text-xl block mb-1">👏</span>
                                    <span class="text-xs font-bold text-slate-900 block group-hover:text-emerald-600">Studio Applause</span>
                                    <span class="text-[10px] text-slate-500">Crowd Cheer</span>
                                </button>
                                <button onclick="window.App.playSoundFx('rewind')" class="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition transform active:scale-95 group cursor-pointer">
                                    <span class="text-xl block mb-1">⏪</span>
                                    <span class="text-xs font-bold text-slate-900 block group-hover:text-indigo-600">DJ Scratch / Pullup</span>
                                    <span class="text-[10px] text-slate-500">Track Spinback</span>
                                </button>
                                <button onclick="window.App.playSoundFx('news')" class="p-3.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-left transition transform active:scale-95 group cursor-pointer">
                                    <span class="text-xl block mb-1">🚨</span>
                                    <span class="text-xs font-bold text-slate-900 block group-hover:text-rose-600">Breaking News Sting</span>
                                    <span class="text-[10px] text-slate-500">Alert Chime</span>
                                </button>
                                <button onclick="window.App.playSoundFx('drumroll')" class="p-3.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition transform active:scale-95 group cursor-pointer">
                                    <span class="text-xl block mb-1">🥁</span>
                                    <span class="text-xs font-bold text-slate-900 block group-hover:text-purple-600">Drum Roll</span>
                                    <span class="text-[10px] text-slate-500">Big Reveal</span>
                                </button>
                                <button onclick="window.App.playSoundFx('station_id')" class="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition transform active:scale-95 group cursor-pointer">
                                    <span class="text-xl block mb-1">📻</span>
                                    <span class="text-xs font-bold text-slate-900 block group-hover:text-amber-600">Station ID Tone</span>
                                    <span class="text-[10px] text-slate-500">Legal Stinger</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Live Listener Shoutouts & Song Queue (5 cols) -->
                    <div class="lg:col-span-5 space-y-6">
                        
                        <div class="p-6 rounded-[22px] bg-white border border-slate-200/90 shadow-sm space-y-5">
                            <div class="flex items-center justify-between border-b border-slate-200 pb-3">
                                <div>
                                    <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <span>📥</span> Listener Requests & Shoutouts
                                    </h3>
                                    <p class="text-xs text-slate-500">Incoming listener dedications</p>
                                </div>
                                <span class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono border border-blue-200">
                                    ${requests.length} Total
                                </span>
                            </div>

                            <!-- Filter Tabs -->
                            <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                                <button onclick="window.App.setPresenterRequestFilter('all')" class="flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer ${activeFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                                    All (${requests.length})
                                </button>
                                <button onclick="window.App.setPresenterRequestFilter('pending')" class="flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer ${activeFilter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                                    Pending (${pendingCount})
                                </button>
                                <button onclick="window.App.setPresenterRequestFilter('approved')" class="flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer ${activeFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                                    Approved (${approvedCount})
                                </button>
                                <button onclick="window.App.setPresenterRequestFilter('played')" class="flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer ${activeFilter === 'played' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                                    Played (${playedCount})
                                </button>
                            </div>

                            <!-- Requests List -->
                            <div class="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                                ${filteredRequests.length > 0 ? filteredRequests.map(req => `
                                    <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition space-y-3">
                                        <div class="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                                    <span>🎵</span> ${req.song_title}
                                                </h4>
                                                ${req.artist ? `<span class="text-xs text-blue-600 font-semibold block ml-5">${req.artist}</span>` : ''}
                                            </div>
                                            <span class="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${req.status === 'played' ? 'bg-blue-100 text-blue-800' : req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : req.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">
                                                ${req.status}
                                            </span>
                                        </div>

                                        <div class="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 italic">
                                            "${req.message || 'No dedication message provided.'}"
                                        </div>

                                        <div class="flex items-center justify-between text-[11px] text-slate-500">
                                            <span>From: <strong class="text-slate-800">${req.listener_name}</strong> ${req.listener_phone ? `<span class="text-slate-600 font-mono">(${req.listener_phone})</span>` : ''}</span>
                                            <span class="font-mono text-[10px]">${req.created_at ? req.created_at.split(' ')[1] || req.created_at : ''}</span>
                                        </div>

                                        <!-- Action Buttons -->
                                        <div class="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200">
                                            <button 
                                                onclick="window.App.quickFillNowPlaying('${req.song_title.replace(/'/g, "\\'")}', '${(req.artist || '').replace(/'/g, "\\'")}')"
                                                class="py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200 text-center cursor-pointer"
                                                title="Load into Broadcast form"
                                            >
                                                ⚡ Cue Track
                                            </button>
                                            
                                            ${req.status !== 'played' ? `
                                                <button 
                                                    onclick="window.App.updateRequestStatus(${req.id}, 'played')"
                                                    class="py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                                >
                                                    ✓ Played
                                                </button>
                                            ` : `
                                                <button 
                                                    onclick="window.App.updateRequestStatus(${req.id}, 'approved')"
                                                    class="py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition cursor-pointer"
                                                >
                                                    Re-open
                                                </button>
                                            `}

                                            ${req.status !== 'rejected' ? `
                                                <button 
                                                    onclick="window.App.updateRequestStatus(${req.id}, 'rejected')"
                                                    class="py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-semibold transition border border-rose-200 cursor-pointer"
                                                >
                                                    Dismiss
                                                </button>
                                            ` : `
                                                <button 
                                                    onclick="window.App.updateRequestStatus(${req.id}, 'pending')"
                                                    class="py-1.5 rounded-lg bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white text-xs font-semibold transition border border-amber-200 cursor-pointer"
                                                >
                                                    Restore
                                                </button>
                                            `}
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div class="text-center py-16 text-slate-400 text-sm space-y-2">
                                        <span class="text-3xl block">📭</span>
                                        <p>No ${activeFilter !== 'all' ? activeFilter : ''} listener shoutouts in queue.</p>
                                    </div>
                                `}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;
    },

    // 5. SUPER ADMIN PORTAL
    renderSuperAdmin(overview, pendingStations, streamsGrid, auditLogs, activeTab = 'approvals') {
        return `
            <div class="space-y-8 animate-fadeIn">
                <!-- Super Admin Overview -->
                <div class="p-6 md:p-8 rounded-[22px] bg-white border border-slate-200/90 shadow-sm space-y-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold uppercase border border-indigo-200">Super Administrator Portal</span>
                            <h1 class="text-3xl font-extrabold text-slate-900 mt-1">Platform Operations & Telemetry</h1>
                        </div>
                        <button onclick="window.App.runAllHealthChecks()" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm cursor-pointer">
                            ⚡ Run Global Stream Health Audit
                        </button>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <span class="text-xs text-slate-500 font-semibold uppercase">PUBLISHED STATIONS</span>
                            <div class="text-2xl font-extrabold text-slate-900">${overview.published_stations || 10}</div>
                        </div>
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <span class="text-xs text-slate-500 font-semibold uppercase">PENDING APPROVALS</span>
                            <div class="text-2xl font-extrabold text-amber-600">${overview.pending_stations || 0}</div>
                        </div>
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <span class="text-xs text-slate-500 font-semibold uppercase">TOTAL USERS</span>
                            <div class="text-2xl font-extrabold text-blue-600">${overview.total_users || 4}</div>
                        </div>
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <span class="text-xs text-slate-500 font-semibold uppercase">OPEN INCIDENTS</span>
                            <div class="text-2xl font-extrabold text-emerald-600">${overview.open_incidents || 0}</div>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
                    ${[
                        { id: 'approvals', label: 'Pending Onboarding Approvals', icon: '📝' },
                        { id: 'streams', label: 'Stream Health Monitor Grid', icon: '📡' },
                        { id: 'audits', label: 'System Audit Logs', icon: '📜' }
                    ].map(tab => `
                        <button onclick="window.App.setSuperAdminTab('${tab.id}')" class="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}">
                            <span>${tab.icon}</span>
                            ${tab.label}
                        </button>
                    `).join('')}
                </div>

                <!-- Tab 1: Pending Station Approvals -->
                ${activeTab === 'approvals' ? `
                    <div class="p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                        <h3 class="text-lg font-bold text-slate-900">Station Registration Queue</h3>
                        <div class="space-y-4">
                            ${pendingStations.length > 0 ? pendingStations.map(station => `
                                <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div class="space-y-1">
                                        <div class="flex items-center gap-2">
                                            <h4 class="text-base font-bold text-slate-900">${station.name}</h4>
                                            <span class="text-xs text-blue-600 font-mono">(${station.frequency || 'Live'})</span>
                                            <span class="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase font-bold">${station.stream_mode}</span>
                                        </div>
                                        <p class="text-xs text-slate-500">📍 ${station.county}, ${station.city} • Genre: ${station.genre}</p>
                                        <div class="text-[11px] text-slate-500">Applicant: <strong class="text-slate-800">${station.owner_name || 'Station Owner'}</strong> (${station.owner_email})</div>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <button onclick="window.App.approveStation(${station.id}, 'published')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer">
                                            ✓ Approve & Publish
                                        </button>
                                        <button onclick="window.App.approveStation(${station.id}, 'rejected')" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer">
                                            ✕ Reject
                                        </button>
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="text-center py-10 text-slate-500 text-sm">No stations currently awaiting approval. All onboarding queue clear!</div>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 2: Stream Health Monitor Grid -->
                ${activeTab === 'streams' ? `
                    <div class="p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-bold text-slate-900">Live Stream Endpoints Status</h3>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs text-slate-700">
                                <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                                    <tr>
                                        <th class="p-3">Station</th>
                                        <th class="p-3">Model</th>
                                        <th class="p-3">Codec / Bitrate</th>
                                        <th class="p-3">Status</th>
                                        <th class="p-3">Uptime SLA</th>
                                        <th class="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-200">
                                    ${(streamsGrid.streams || []).map(s => `
                                        <tr class="hover:bg-slate-50">
                                            <td class="p-3 font-bold text-slate-900">${s.station_name}</td>
                                            <td class="p-3 uppercase text-blue-600 font-mono font-bold">${s.mode}</td>
                                            <td class="p-3 font-mono">${s.codec} / ${s.bitrate}k</td>
                                            <td class="p-3">
                                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${s.stream_status === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                                                    ${s.stream_status ? s.stream_status.toUpperCase() : 'ONLINE'}
                                                </span>
                                            </td>
                                            <td class="p-3 font-bold text-emerald-600">${s.uptime_percentage}%</td>
                                            <td class="p-3">
                                                <button onclick="window.App.testStreamHealth(${s.station_id})" class="text-blue-600 hover:underline font-semibold cursor-pointer">Ping Check</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 3: System Audit Logs -->
                ${activeTab === 'audits' ? `
                    <div class="p-6 rounded-[18px] bg-white border border-slate-200/90 shadow-sm space-y-4">
                        <h3 class="text-lg font-bold text-slate-900">System Audit & Operational Log</h3>
                        <div class="space-y-2">
                            ${auditLogs.map(log => `
                                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-4">
                                    <div>
                                        <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">${log.action}</span>
                                        <p class="text-slate-700 mt-1">${log.details}</p>
                                        <span class="text-[10px] text-slate-400">By: ${log.actor_name || 'System'} (${log.actor_role || 'Daemon'})</span>
                                    </div>
                                    <span class="text-[10px] text-slate-400 whitespace-nowrap font-mono">${log.created_at}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // 6. STATION ONBOARDING WIZARD
    renderOnboardingWizard() {
        return `
            <div class="max-w-2xl mx-auto p-6 md:p-10 rounded-[22px] bg-white border border-slate-200/90 shadow-sm space-y-8 animate-fadeIn">
                <div>
                    <span class="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold uppercase border border-blue-200">Station Onboarding</span>
                    <h1 class="text-3xl font-extrabold text-slate-900 mt-1">Register Your Radio Station</h1>
                    <p class="text-sm text-slate-500">Join Kenya's centralized radio distribution ecosystem.</p>
                </div>

                <!-- Wizard Form -->
                <form onsubmit="window.App.handleOnboardingSubmit(event)" class="space-y-6">
                    <div class="space-y-4">
                        <h3 class="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">1. Station Information</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-bold text-slate-700 block mb-1">Station Name *</label>
                                <input type="text" name="name" required placeholder="e.g. Safari FM" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-700 block mb-1">Frequency (e.g. 94.7 FM)</label>
                                <input type="text" name="frequency" placeholder="e.g. 94.7 FM" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                            </div>
                        </div>

                        <div>
                            <label class="text-xs font-bold text-slate-700 block mb-1">Parent Media Group (Optional)</label>
                            <input type="text" name="media_group" placeholder="e.g. Royal Media Services, Radio Africa Group, Independent" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                        </div>

                        <div>
                            <label class="text-xs font-bold text-slate-700 block mb-1">Tagline / Motto</label>
                            <input type="text" name="tagline" placeholder="e.g. Sauti ya Amani na Muziki" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-bold text-slate-700 block mb-1">County *</label>
                                <select name="county" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                                    <option value="Nairobi">Nairobi</option>
                                    <option value="Mombasa">Mombasa</option>
                                    <option value="Kisumu">Kisumu</option>
                                    <option value="Nakuru">Nakuru</option>
                                    <option value="Machakos">Machakos</option>
                                    <option value="Kiambu">Kiambu</option>
                                    <option value="Uasin Gishu">Uasin Gishu (Eldoret)</option>
                                    <option value="Nyeri">Nyeri</option>
                                    <option value="Meru">Meru</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-700 block mb-1">City / Town *</label>
                                <input type="text" name="city" required placeholder="e.g. Nairobi" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-bold text-slate-700 block mb-1">Primary Language</label>
                                <input type="text" name="language" value="English/Swahili" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-700 block mb-1">Primary Music/Content Genre</label>
                                <input type="text" name="genre" value="Afrobeat & Talk" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h3 class="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">2. Streaming Infrastructure Model</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label class="p-4 rounded-xl border border-blue-500 bg-blue-50 cursor-pointer">
                                <input type="radio" name="stream_mode" value="managed" checked class="mr-2">
                                <span class="font-bold text-slate-900 text-sm">Managed Icecast Provisioning</span>
                                <p class="text-xs text-slate-500 mt-1">Platform automatically provisions mount and credentials for your studio encoder.</p>
                            </label>
                            <label class="p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                                <input type="radio" name="stream_mode" value="external" class="mr-2">
                                <span class="font-bold text-slate-900 text-sm">Aggregator (Direct Stream / HLS)</span>
                                <p class="text-xs text-slate-500 mt-1">Provide your active audio stream URL or .m3u8 manifest.</p>
                            </label>
                        </div>

                        <div>
                            <label class="text-xs font-bold text-slate-700 block mb-1">Stream URL (Optional if Managed)</label>
                            <input type="url" name="stream_url" placeholder="https://stream.yourstation.com/live.mp3 or .m3u8" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                        </div>
                    </div>

                    <button type="submit" class="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition shadow-lg shadow-blue-500/25 cursor-pointer">
                        Submit Station for Verification & Publication
                    </button>
                </form>
            </div>
        `;
    },

    // 8. BROADCASTER & STAFF LOGIN PORTAL VIEW (For Full Page Access)
    renderLoginPortal(targetRole = 'station_admin') {
        const roleLabels = {
            station_admin: { title: 'Station Management Portal', subtitle: 'Manage your live stream, studio credentials, analytics and billing.', icon: '📻', defaultEmail: 'owner@enefm.co.ke', defaultPass: 'owner123' },
            presenter: { title: 'Presenter Live Studio Cockpit', subtitle: 'Access your live on-air queue, song requests, and listener shoutouts.', icon: '🎙️', defaultEmail: 'marcus@enefm.co.ke', defaultPass: 'dj123' },
            super_admin: { title: 'Network Operations Center', subtitle: 'Full administrative access to all Kenyan broadcast stations, SLAs, and platform logs.', icon: '⚡', defaultEmail: 'admin@radiowave.co.ke', defaultPass: 'admin123' },
            listener: { title: 'Listener Account Access', subtitle: 'Sign in to sync your favourite presets across devices.', icon: '👤', defaultEmail: 'listener@gmail.com', defaultPass: 'listener123' }
        };

        const active = roleLabels[targetRole] || roleLabels.station_admin;

        return `
            <div class="max-w-xl mx-auto py-8 px-4 animate-fadeIn">
                <div class="rounded-[22px] bg-white border border-slate-200 shadow-xl p-8 md:p-10 space-y-7">
                    
                    <!-- Portal Icon & Title -->
                    <div class="text-center space-y-2">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 mb-2 text-3xl">
                            ${active.icon}
                        </div>
                        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">${active.title}</h1>
                        <p class="text-xs md:text-sm text-slate-500 max-w-sm mx-auto">${active.subtitle}</p>
                    </div>

                    <!-- Role Switcher Pills -->
                    <div class="space-y-2">
                        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">Select Your Broadcaster Workspace:</span>
                        <div class="grid grid-cols-3 gap-2">
                            <button onclick="window.App.fillDemoLogin('station_admin')" class="p-3 rounded-2xl border ${targetRole === 'station_admin' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'} text-center transition cursor-pointer">
                                <span class="text-xl block mb-1">📻</span>
                                <span class="text-xs font-bold text-slate-900 block">Station Owner</span>
                                <span class="text-[10px] text-slate-500 block">ENE FM</span>
                            </button>
                            <button onclick="window.App.fillDemoLogin('presenter')" class="p-3 rounded-2xl border ${targetRole === 'presenter' ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'} text-center transition cursor-pointer">
                                <span class="text-xl block mb-1">🎙️</span>
                                <span class="text-xs font-bold text-slate-900 block">Studio Presenter</span>
                                <span class="text-[10px] text-slate-500 block">DJ Marcus</span>
                            </button>
                            <button onclick="window.App.fillDemoLogin('super_admin')" class="p-3 rounded-2xl border ${targetRole === 'super_admin' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'} text-center transition cursor-pointer">
                                <span class="text-xl block mb-1">⚡</span>
                                <span class="text-xs font-bold text-slate-900 block">Super Admin</span>
                                <span class="text-[10px] text-slate-500 block">Network Ops</span>
                            </button>
                        </div>
                    </div>

                    <!-- Login Form -->
                    <form onsubmit="window.App.handleLoginSubmit(event)" class="space-y-4 pt-2">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">Broadcast Email</label>
                            <input 
                                type="email" 
                                id="portal-email" 
                                required 
                                value="${active.defaultEmail}"
                                placeholder="name@yourstation.co.ke" 
                                class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </div>

                        <div>
                            <div class="flex items-center justify-between mb-1.5">
                                <label class="block text-xs font-bold text-slate-700">Access Key / Password</label>
                                <span class="text-[11px] text-blue-600 font-semibold">Demo: ${active.defaultPass}</span>
                            </div>
                            <input 
                                type="password" 
                                id="portal-password" 
                                required 
                                value="${active.defaultPass}"
                                placeholder="••••••••" 
                                class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </div>

                        <button 
                            type="submit" 
                            class="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span>Authenticate & Open Workspace</span>
                        </button>
                    </form>

                    <div class="text-center pt-2 border-t border-slate-200">
                        <button onclick="window.App.navigate('home')" class="text-xs text-slate-500 hover:text-blue-600 transition font-medium flex items-center justify-center gap-1.5 mx-auto cursor-pointer">
                            <span>←</span> Back to Public Radio Directory (Listen Freely)
                        </button>
                    </div>

                </div>
            </div>
        `;
    }
};

window.Components = Components;
