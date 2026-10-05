// public/js/components.js
// UI Views and Component Renderers for RadioWave Kenya

const Components = {
    // 1. LISTENER HOME & DISCOVER VIEW
    renderHome(stations, counties = [], genres = [], activeFilters = {}) {
        const featured = stations.find(s => s.is_featured) || stations[0];
        
        return `
            <div class="space-y-8 animate-fadeIn">
                <!-- Hero Featured Station Banner -->
                ${featured ? `
                    <div class="relative rounded-3xl overflow-hidden glass border border-orange-500/20 p-6 md:p-10 shadow-2xl">
                        <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent z-10"></div>
                        <img src="${featured.cover_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200'}" class="absolute inset-0 w-full h-full object-cover opacity-40">
                        
                        <div class="relative z-20 max-w-2xl space-y-4">
                            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
                                <span class="w-2 h-2 rounded-full bg-red-500 live-pulse"></span>
                                Featured Live Broadcast
                            </div>
                            
                            <h1 class="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                                ${featured.name} <span class="text-orange-500 text-2xl md:text-3xl font-medium">(${featured.frequency || 'Live'})</span>
                            </h1>
                            
                            <p class="text-gray-300 text-sm md:text-base line-clamp-2">
                                ${featured.tagline || featured.description || 'Broadcasting authentic music, live news, and entertainment across Kenya.'}
                            </p>
                            
                            <div class="flex flex-wrap items-center gap-3 pt-2 text-xs text-gray-400">
                                <span class="px-2.5 py-1 rounded-lg bg-gray-800/80 border border-gray-700">📍 ${featured.county}, Kenya</span>
                                <span class="px-2.5 py-1 rounded-lg bg-gray-800/80 border border-gray-700">🎵 ${featured.genre}</span>
                                <span class="px-2.5 py-1 rounded-lg bg-gray-800/80 border border-gray-700">🗣️ ${featured.language}</span>
                                <span class="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">🏢 ${featured.media_group || 'Kenyan Broadcast Network'}</span>
                            </div>

                            <div class="flex items-center gap-4 pt-4">
                                <button onclick="window.App.playStationById(${featured.id})" class="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30 transition transform hover:scale-105">
                                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    Listen Live Now
                                </button>
                                <button onclick="window.App.navigate('station', '${featured.slug}')" class="px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold transition border border-gray-700">
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
                            <h2 class="text-2xl font-bold text-white tracking-tight">Direct IP Radio Streaming & Discovery</h2>
                            <p class="text-sm text-gray-400">High-fidelity IP broadcast directory with direct CDN offload & HTTPS proxy wrap</p>
                        </div>
                        
                        <!-- Search Bar -->
                        <div class="relative w-full md:w-80">
                            <input 
                                type="text" 
                                id="station-search-input" 
                                placeholder="Search station, frequency, county..." 
                                value="${activeFilters.search || ''}"
                                oninput="window.App.handleSearch(this.value)"
                                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                            />
                            <svg class="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                    </div>

                    <!-- Filter Chips: Kenyan Counties -->
                    <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <span class="text-xs text-gray-500 uppercase font-bold pr-2 flex-shrink-0">Counties:</span>
                        <button onclick="window.App.setFilter('county', '')" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${!activeFilters.county ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}">
                            All Kenya (${stations.length})
                        </button>
                        ${['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Machakos', 'Kiambu', 'Uasin Gishu', 'Nyeri', 'Meru'].map(c => `
                            <button onclick="window.App.setFilter('county', '${c}')" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${activeFilters.county === c ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}">
                                ${c}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Filter Chips: Genres -->
                    <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <span class="text-xs text-gray-500 uppercase font-bold pr-2 flex-shrink-0">Genres:</span>
                        <button onclick="window.App.setFilter('genre', '')" class="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${!activeFilters.genre ? 'bg-gray-700 text-orange-400' : 'bg-gray-900/60 text-gray-400 hover:text-white'}">
                            All Genres
                        </button>
                        ${['Afrobeat', 'Classic Hits', 'News, Talk', 'Reggae', 'Rhumba', 'Vernacular', 'Asian & Bollywood'].map(g => `
                            <button onclick="window.App.setFilter('genre', '${g}')" class="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${activeFilters.genre === g ? 'bg-gray-700 text-orange-400' : 'bg-gray-900/60 text-gray-400 hover:text-white'}">
                                ${g}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Stations Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${stations.map(station => `
                        <div class="station-card rounded-2xl bg-gray-900/80 border border-gray-800/80 overflow-hidden flex flex-col justify-between group">
                            <div class="p-5 space-y-4">
                                <div class="flex items-start justify-between gap-3">
                                    <div class="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
                                        <img src="${station.logo_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=150'}" class="w-full h-full object-cover">
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-1.5">
                                            <span class="w-2 h-2 rounded-full ${station.stream_status === 'online' ? 'bg-green-500' : 'bg-red-500'}"></span>
                                            <span class="text-xs font-bold ${station.stream_status === 'online' ? 'text-green-400' : 'text-red-400'} uppercase">
                                                ${station.stream_status === 'online' ? 'LIVE' : 'OFFLINE'}
                                            </span>
                                            <span class="text-xs text-gray-500">• ${station.frequency || 'Online'}</span>
                                        </div>
                                        <h3 class="text-lg font-bold text-white truncate group-hover:text-orange-400 transition">
                                            ${station.name}
                                        </h3>
                                        <p class="text-xs text-gray-400 truncate">📍 ${station.county}, ${station.city}</p>
                                    </div>
                                </div>

                                <p class="text-xs text-gray-400 line-clamp-2 h-8">
                                    ${station.tagline || station.description || 'Kenyan radio broadcast.'}
                                </p>

                                <div class="p-2.5 rounded-xl bg-gray-950/60 border border-gray-800 text-xs flex items-center justify-between">
                                    <div class="truncate mr-2">
                                        <span class="text-gray-500 text-[10px] block">NOW PLAYING (ICY TAG)</span>
                                        <span class="text-gray-200 font-medium truncate block">${station.now_track ? `${station.now_track} - ${station.now_artist}` : 'Live On-Air Studio Feed'}</span>
                                    </div>
                                    <span class="px-2 py-0.5 rounded bg-gray-800 text-[10px] text-orange-400 font-mono flex-shrink-0">${station.bitrate || 128}k ${station.codec || 'MP3'}</span>
                                </div>
                            </div>

                            <div class="p-4 pt-0 flex items-center gap-2">
                                <button onclick="window.App.playStationById(${station.id})" class="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md shadow-orange-500/20">
                                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    Play Live
                                </button>
                                <button onclick="window.App.navigate('station', '${station.slug}')" class="px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition border border-gray-700" title="Station Guide & Architecture">
                                    Guide
                                </button>
                                <button onclick="window.App.toggleFavourite(${station.id})" class="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-500 transition border border-gray-700" title="Add to Favourites">
                                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${stations.length === 0 ? `
                    <div class="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-800">
                        <p class="text-gray-400 text-lg">No radio stations found matching your filter.</p>
                        <button onclick="window.App.resetFilters()" class="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold">
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
                <div class="relative rounded-3xl overflow-hidden glass border border-gray-800 p-6 md:p-8 shadow-2xl">
                    <div class="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/85 to-transparent z-10"></div>
                    <img src="${station.cover_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200'}" class="absolute inset-0 w-full h-full object-cover opacity-30">
                    
                    <div class="relative z-20 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div class="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gray-800 border-2 border-orange-500/50 shadow-xl flex-shrink-0">
                            <img src="${station.logo_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300'}" class="w-full h-full object-cover">
                        </div>

                        <div class="flex-1 space-y-2">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full bg-red-500 live-pulse"></span>
                                    ${station.stream_status === 'online' ? 'ON AIR' : 'OFFLINE'}
                                </span>
                                <span class="px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 text-xs font-mono font-bold">${station.frequency || 'Live Stream'}</span>
                                <span class="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold">📍 ${station.county}, Kenya</span>
                                <span class="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">🗣️ ${station.language}</span>
                                <span class="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">🏢 ${station.media_group || 'National Broadcast'}</span>
                            </div>

                            <h1 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">${station.name}</h1>
                            <p class="text-gray-300 text-sm md:text-base max-w-3xl">${station.description || station.tagline || ''}</p>

                            <div class="flex items-center gap-3 pt-4">
                                <button onclick="window.App.playStationById(${station.id})" class="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30 transition transform hover:scale-105">
                                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    Listen Live
                                </button>
                                <button onclick="window.App.openRequestModal(${station.id})" class="px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-orange-400 font-semibold transition border border-orange-500/30 flex items-center gap-2">
                                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                                    Song Request / Dedication
                                </button>
                                <button onclick="window.App.toggleFavourite(${station.id})" class="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-500 transition border border-gray-700">
                                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <div class="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto">
                    ${[
                        { id: 'schedule', label: 'Programme Guide', icon: '📅' },
                        { id: 'requests', label: 'Requests & Polls', icon: '🎙️' },
                        { id: 'presenters', label: 'Presenters & Hosts', icon: '🎧' },
                        { id: 'podcasts', label: 'Catch-up & Podcasts', icon: '📻' },
                        { id: 'pipeline', label: 'Audio Pipeline & Architecture', icon: '⚡' }
                    ].map(tab => `
                        <button onclick="window.App.setStationTab('${tab.id}')" class="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-gray-900 text-gray-400 hover:text-white'}">
                            <span>${tab.icon}</span>
                            ${tab.label}
                        </button>
                    `).join('')}
                </div>

                <!-- Tab 1: Programme Guide -->
                ${activeTab === 'schedule' ? `
                    <div class="space-y-4">
                        <h3 class="text-xl font-bold text-white">Broadcast Schedule</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${programmes.length > 0 ? programmes.map(prog => `
                                <div class="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex items-start gap-4">
                                    <div class="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
                                        <img src="${prog.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}" class="w-full h-full object-cover">
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-bold text-orange-400 font-mono">${prog.start_time} - ${prog.end_time}</span>
                                            <span class="text-[10px] text-gray-500 uppercase px-2 py-0.5 rounded bg-gray-800">${prog.days_of_week}</span>
                                        </div>
                                        <h4 class="text-base font-bold text-white mt-1">${prog.title}</h4>
                                        <p class="text-xs text-gray-400 mt-1 line-clamp-2">${prog.description || 'Weekly regular show.'}</p>
                                        ${prog.presenter_name ? `
                                            <div class="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                                                <span>🎙️ Host:</span>
                                                <span class="text-gray-300 font-medium">${prog.presenter_name}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="col-span-2 p-8 text-center bg-gray-900/50 rounded-2xl text-gray-400 border border-gray-800">
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
                        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-bold text-white">Send On-Air Request / Dedication</h3>
                                <span class="text-xs text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">Direct to Presenter</span>
                            </div>
                            <form id="station-request-form" onsubmit="window.App.handleRequestSubmit(event, ${station.id})" class="space-y-4">
                                <div>
                                    <label class="text-xs font-semibold text-gray-400 block mb-1">Your Name / Handle</label>
                                    <input type="text" name="listener_name" required placeholder="e.g. Brian from Machakos" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-xs font-semibold text-gray-400 block mb-1">Song Title *</label>
                                        <input type="text" name="song_title" required placeholder="e.g. Sura Yako" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                                    </div>
                                    <div>
                                        <label class="text-xs font-semibold text-gray-400 block mb-1">Artist Name</label>
                                        <input type="text" name="artist" placeholder="e.g. Sauti Sol" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                                    </div>
                                </div>
                                <div>
                                    <label class="text-xs font-semibold text-gray-400 block mb-1">Dedication Message / Shoutout</label>
                                    <textarea name="message" rows="3" placeholder="Write a message to be read live on-air..." class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500"></textarea>
                                </div>
                                <button type="submit" class="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition shadow-lg shadow-orange-500/20">
                                    Submit Request to Studio
                                </button>
                            </form>
                        </div>

                        <!-- Live Poll -->
                        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
                            <h3 class="text-lg font-bold text-white">Live Listener Poll</h3>
                            ${activePoll ? `
                                <div class="space-y-3">
                                    <p class="text-sm font-semibold text-gray-200">❓ ${activePoll.question}</p>
                                    <div class="space-y-2 pt-2">
                                        ${activePoll.options.map(opt => `
                                            <div onclick="window.App.votePoll(${opt.id})" class="p-3.5 rounded-xl bg-gray-950 hover:bg-gray-800 border border-gray-800 cursor-pointer transition flex items-center justify-between group">
                                                <span class="text-sm text-gray-300 group-hover:text-white">${opt.option_text}</span>
                                                <span class="text-xs text-orange-400 font-mono font-bold bg-orange-500/10 px-2 py-0.5 rounded">${opt.votes_count} votes</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : `
                                <p class="text-sm text-gray-400">No active poll right now. Check back during live shows!</p>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 3: Presenters Lineup -->
                ${activeTab === 'presenters' ? `
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${presenters.length > 0 ? presenters.map(pres => `
                            <div class="p-5 rounded-2xl bg-gray-900 border border-gray-800 text-center space-y-3">
                                <div class="w-24 h-24 rounded-full overflow-hidden mx-auto bg-gray-800 border-2 border-orange-500/40">
                                    <img src="${pres.photo_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200'}" class="w-full h-full object-cover">
                                </div>
                                <div>
                                    <h4 class="text-base font-bold text-white">${pres.name}</h4>
                                    <span class="text-xs text-orange-400">${pres.social_handle || 'On-Air Host'}</span>
                                </div>
                                <p class="text-xs text-gray-400 line-clamp-3">${pres.bio || 'Radio host and presenter.'}</p>
                            </div>
                        `).join('') : `
                            <div class="col-span-3 p-8 text-center bg-gray-900/50 rounded-2xl text-gray-400 border border-gray-800">
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
                                <div class="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex items-start gap-4">
                                    <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
                                        <img src="${pod.cover_url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200'}" class="w-full h-full object-cover">
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <span class="text-[10px] text-orange-400 uppercase font-bold bg-orange-500/10 px-2 py-0.5 rounded">${pod.category}</span>
                                        <h4 class="text-base font-bold text-white mt-1">${pod.title}</h4>
                                        <p class="text-xs text-gray-400 mt-1 line-clamp-2">${pod.description}</p>
                                        <button onclick="window.App.openPodcastEpisodes(${pod.id})" class="mt-3 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition">
                                            Listen to Episodes (${pod.episode_count || 0})
                                        </button>
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="col-span-2 p-8 text-center bg-gray-900/50 rounded-2xl text-gray-400 border border-gray-800">
                                    No podcasts or catch-up episodes published yet.
                                </div>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 5: Audio Pipeline & Architecture -->
                ${activeTab === 'pipeline' ? `
                    <div class="p-6 md:p-8 rounded-2xl bg-gray-900 border border-gray-800 space-y-8">
                        <div>
                            <span class="text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold uppercase border border-orange-500/30">End-to-End Broadcast Pipeline</span>
                            <h3 class="text-xl md:text-2xl font-extrabold text-white mt-2">How Audio Flows from Studio to Your Browser</h3>
                            <p class="text-xs text-gray-400 mt-1">Direct IP routing with zero-bandwidth CDN offloading & HTTPS proxy encapsulation</p>
                        </div>

                        <!-- Interactive Pipeline Flow Diagram -->
                        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div class="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2 relative">
                                <div class="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">1</div>
                                <h4 class="text-sm font-bold text-white">Studio MCR</h4>
                                <p class="text-[11px] text-gray-400">Master mixing console outputs clean audio feed.</p>
                            </div>
                            <div class="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                                <div class="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">2</div>
                                <h4 class="text-sm font-bold text-white">Audio Encoder</h4>
                                <p class="text-[11px] text-gray-400">OBS, BUTT, Barix encodes to AAC (32-64k) or MP3 (128k).</p>
                            </div>
                            <div class="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                                <div class="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">3</div>
                                <h4 class="text-sm font-bold text-white">Origin / CDN</h4>
                                <p class="text-[11px] text-gray-400">Icecast / Shoutcast / AWS CloudFront handles thousands of listeners.</p>
                            </div>
                            <div class="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                                <div class="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">4</div>
                                <h4 class="text-sm font-bold text-white">Platform Index</h4>
                                <p class="text-[11px] text-gray-400">RadioWave aggregates stream URLs, metadata & health checks.</p>
                            </div>
                            <div class="p-4 rounded-xl bg-gray-950 border border-green-500/30 bg-green-500/5 space-y-2">
                                <div class="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-sm">5</div>
                                <h4 class="text-sm font-bold text-white">Listener Client</h4>
                                <p class="text-[11px] text-gray-400">Direct TCP/HTTPS connection with HTML5 & HLS.js engine.</p>
                            </div>
                        </div>

                        <!-- Technical Specs Matrix -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            <div class="p-4 rounded-xl bg-gray-950 border border-gray-800">
                                <span class="text-[10px] text-gray-500 uppercase font-bold block">STREAMING ARCHITECTURE</span>
                                <span class="text-sm font-bold text-white uppercase">${station.stream_mode === 'managed' ? 'Platform Managed Icecast' : 'Direct CDN Aggregation'}</span>
                            </div>
                            <div class="p-4 rounded-xl bg-gray-950 border border-gray-800">
                                <span class="text-[10px] text-gray-500 uppercase font-bold block">AUDIO CODEC & BITRATE</span>
                                <span class="text-sm font-bold text-orange-400">${station.codec ? station.codec.toUpperCase() : 'MP3'} • ${station.bitrate || 128} kbps</span>
                            </div>
                            <div class="p-4 rounded-xl bg-gray-950 border border-gray-800">
                                <span class="text-[10px] text-gray-500 uppercase font-bold block">UPTIME SLA (HEALTH CHECK)</span>
                                <span class="text-sm font-bold text-green-400">${station.uptime_percentage || 99.9}%</span>
                            </div>
                        </div>

                        <!-- Challenges & Resolutions -->
                        <div class="p-5 rounded-xl bg-gray-950 border border-gray-800 space-y-3 text-xs text-gray-300">
                            <h4 class="font-bold text-white text-sm">Security & Web Delivery Standards:</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                                <div class="space-y-1">
                                    <span class="font-bold text-orange-400 block">🔒 Mixed Content Wrap</span>
                                    <p class="text-gray-400 text-[11px]">Legacy HTTP station streams are encapsulated via HTTPS reverse proxy to prevent browser security blocks.</p>
                                </div>
                                <div class="space-y-1">
                                    <span class="font-bold text-cyan-400 block">🌐 CORS Compliance</span>
                                    <p class="text-gray-400 text-[11px]">Streams include automatic Access-Control headers to allow seamless cross-origin browser audio streaming.</p>
                                </div>
                                <div class="space-y-1">
                                    <span class="font-bold text-green-400 block">📱 MediaSession Background</span>
                                    <p class="text-gray-400 text-[11px]">Hardware lock-screen playback controls with station artwork and ICY Now-Playing metadata tags.</p>
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
                <div class="p-6 md:p-8 rounded-3xl glass border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div class="flex items-center gap-4">
                        <img src="${station.logo_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=150'}" class="w-16 h-16 rounded-2xl object-cover border border-gray-700">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold uppercase">Station Console</span>
                                <span class="text-xs text-gray-400">• ${station.frequency || '99.9 FM'}</span>
                                <span class="text-xs text-purple-400">• ${station.media_group || 'Broadcaster'}</span>
                            </div>
                            <h1 class="text-2xl md:text-3xl font-extrabold text-white">${station.name}</h1>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                        <button onclick="window.App.toggleStudioMonitor(${station.id})" class="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition transform active:scale-95">
                            <span>🎧</span>
                            <span>Listen to Live Stream</span>
                        </button>
                        <button onclick="window.App.openPresenterCockpit(${station.id})" class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 transition transform active:scale-95">
                            <span class="w-2 h-2 rounded-full bg-white live-pulse"></span>
                            <span>Open Live DJ Studio Cockpit</span>
                        </button>
                    </div>
                </div>

                <!-- KPI Metric Cards -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
                        <span class="text-xs text-gray-500 font-semibold">LIVE LISTENERS</span>
                        <div class="text-2xl font-extrabold text-white flex items-center gap-2">
                            ${analytics.current_concurrent_listeners || station.listeners_count || 120}
                            <span class="text-xs text-green-400 font-normal">🟢 Live</span>
                        </div>
                    </div>
                    <div class="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
                        <span class="text-xs text-gray-500 font-semibold">STREAM UPTIME SLA</span>
                        <div class="text-2xl font-extrabold text-green-400">${station.uptime_percentage || 99.8}%</div>
                    </div>
                    <div class="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
                        <span class="text-xs text-gray-500 font-semibold">TOTAL REQUESTS</span>
                        <div class="text-2xl font-extrabold text-orange-400">${requests.length || 0}</div>
                    </div>
                    <div class="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
                        <span class="text-xs text-gray-500 font-semibold">CURRENT PLAN</span>
                        <div class="text-lg font-bold text-blue-400 truncate">${subscription?.subscription?.plan_name || 'Managed Pro'}</div>
                    </div>
                </div>

                <!-- Admin Tabs -->
                <div class="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto">
                    ${[
                        { id: 'stream', label: 'Streaming Config & Mount', icon: '📡' },
                        { id: 'requests', label: 'Song Requests Inbox', icon: '📥' },
                        { id: 'schedule', label: 'Programmes & Lineup', icon: '📅' },
                        { id: 'analytics', label: 'Telemetry & Analytics', icon: '📊' },
                        { id: 'billing', label: 'Subscription & M-Pesa', icon: '💳' }
                    ].map(tab => `
                        <button onclick="window.App.setStationAdminTab('${tab.id}')" class="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}">
                            <span>${tab.icon}</span>
                            ${tab.label}
                        </button>
                    `).join('')}
                </div>

                <!-- Tab 1: Streaming Config -->
                ${activeTab === 'stream' ? `
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2 p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-6">
                            <h3 class="text-lg font-bold text-white">Stream Distribution Mode</h3>

                            <form id="stream-config-form" onsubmit="window.App.handleStreamConfigUpdate(event, ${station.id})" class="space-y-5">
                                <div class="grid grid-cols-2 gap-4">
                                    <label class="p-4 rounded-xl border cursor-pointer transition ${stream.mode === 'managed' ? 'bg-orange-500/10 border-orange-500 text-white' : 'bg-gray-950 border-gray-800 text-gray-400'}">
                                        <input type="radio" name="mode" value="managed" ${stream.mode === 'managed' ? 'checked' : ''} onchange="window.App.toggleStreamMode('managed')" class="hidden">
                                        <div class="font-bold text-sm">Managed Icecast Streaming</div>
                                        <div class="text-xs text-gray-400 mt-1">Platform provisions mount & source credentials for studio encoder.</div>
                                    </label>
                                    <label class="p-4 rounded-xl border cursor-pointer transition ${stream.mode === 'external' ? 'bg-orange-500/10 border-orange-500 text-white' : 'bg-gray-950 border-gray-800 text-gray-400'}">
                                        <input type="radio" name="mode" value="external" ${stream.mode === 'external' ? 'checked' : ''} onchange="window.App.toggleStreamMode('external')" class="hidden">
                                        <div class="font-bold text-sm">Existing External Stream</div>
                                        <div class="text-xs text-gray-400 mt-1">Provide direct CDN / Icecast endpoint.</div>
                                    </label>
                                </div>

                                <div id="external-url-group" class="${stream.mode === 'external' ? '' : 'hidden'}">
                                    <label class="text-xs font-semibold text-gray-400 block mb-1">Direct Audio Stream / HLS Manifest URL</label>
                                    <input type="url" name="stream_url" value="${stream.stream_url || ''}" placeholder="https://stream.yourstation.com/live.mp3 or .m3u8" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-xs font-semibold text-gray-400 block mb-1">Audio Codec</label>
                                        <select name="codec" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                                            <option value="mp3" ${stream.codec === 'mp3' ? 'selected' : ''}>MP3 (Universal Playback)</option>
                                            <option value="aac" ${stream.codec === 'aac' ? 'selected' : ''}>AAC / AAC+ (High Efficiency / Low Data)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="text-xs font-semibold text-gray-400 block mb-1">Target Bitrate</label>
                                        <select name="bitrate" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                                            <option value="32" ${stream.bitrate == 32 ? 'selected' : ''}>32 kbps (AAC+ Ultra Low Bandwidth)</option>
                                            <option value="64" ${stream.bitrate == 64 ? 'selected' : ''}>64 kbps (Standard Mobile)</option>
                                            <option value="128" ${stream.bitrate == 128 ? 'selected' : ''}>128 kbps (High Quality MP3)</option>
                                            <option value="192" ${stream.bitrate == 192 ? 'selected' : ''}>192 kbps (Studio Master)</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3 pt-2">
                                    <button type="submit" class="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition">
                                        Save Stream Configuration
                                    </button>
                                    <button type="button" onclick="window.App.testStreamHealth(${station.id})" class="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition border border-gray-700 flex items-center gap-2">
                                        ⚡ Test Stream Handshake
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Studio Encoder Provisioning Credentials Card -->
                        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-base font-bold text-white">Studio Encoder Settings</h3>
                                <button onclick="window.App.rotateCredentials(${station.id})" class="text-[10px] text-orange-400 hover:underline">Rotate Secret</button>
                            </div>

                            <div class="space-y-3 text-xs">
                                <div class="p-3 rounded-xl bg-gray-950 border border-gray-800">
                                    <span class="text-gray-500 block">ICECAST SERVER HOST</span>
                                    <span class="text-white font-mono font-bold">${creds.server_host || 'stream.radiowave.co.ke'}</span>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="p-3 rounded-xl bg-gray-950 border border-gray-800">
                                        <span class="text-gray-500 block">PORT</span>
                                        <span class="text-white font-mono font-bold">${creds.server_port || 8000}</span>
                                    </div>
                                    <div class="p-3 rounded-xl bg-gray-950 border border-gray-800">
                                        <span class="text-orange-400 font-mono font-bold">${creds.mount_point || '/' + station.slug}</span>
                                    </div>
                                </div>
                                <div class="p-3 rounded-xl bg-gray-950 border border-gray-800">
                                    <span class="text-gray-500 block">SOURCE USERNAME</span>
                                    <span class="text-white font-mono font-bold">${creds.username || 'source'}</span>
                                </div>
                                <div class="p-3 rounded-xl bg-gray-950 border border-gray-800">
                                    <span class="text-gray-500 block">SOURCE PASSWORD</span>
                                    <span class="text-green-400 font-mono font-bold select-all">${creds.password || 'key_' + station.slug}</span>
                                </div>
                            </div>

                            <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
                                💡 Compatible with <strong>BUTT</strong>, <strong>OBS Studio</strong>, <strong>Telos Z/IP</strong>, <strong>Barix Instreamer</strong>, and <strong>Mixxx</strong>.
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 2: Requests Inbox -->
                ${activeTab === 'requests' ? `
                    <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-bold text-white">Listener Song Requests & Dedications Queue</h3>
                            <span class="text-xs text-gray-400">${requests.length} total submissions</span>
                        </div>

                        <div class="space-y-3">
                            ${requests.length > 0 ? requests.map(req => `
                                <div class="p-4 rounded-xl bg-gray-950 border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div class="space-y-1">
                                        <div class="flex items-center gap-2">
                                            <span class="font-bold text-white text-sm">${req.song_title}</span>
                                            ${req.artist ? `<span class="text-xs text-gray-400">• ${req.artist}</span>` : ''}
                                            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${req.status === 'approved' ? 'bg-green-500/20 text-green-400' : req.status === 'played' ? 'bg-blue-500/20 text-blue-400' : req.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}">
                                                ${req.status}
                                            </span>
                                        </div>
                                        <p class="text-xs text-gray-300 italic">"${req.message || 'No message'}"</p>
                                        <div class="text-[11px] text-gray-500">From: <strong class="text-gray-300">${req.listener_name}</strong> ${req.listener_phone ? `(${req.listener_phone})` : ''} • ${req.created_at}</div>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <button onclick="window.App.updateRequestStatus(${req.id}, 'approved')" class="px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white text-xs font-semibold transition border border-green-500/30">
                                            Approve
                                        </button>
                                        <button onclick="window.App.updateRequestStatus(${req.id}, 'played')" class="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-semibold transition border border-blue-500/30">
                                            Mark Played
                                        </button>
                                        <button onclick="window.App.updateRequestStatus(${req.id}, 'rejected')" class="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold transition border border-red-500/30">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="text-center py-10 text-gray-500 text-sm">No listener requests currently in queue.</div>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 3: Programmes & Lineup -->
                ${activeTab === 'schedule' ? `
                    <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-6">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-bold text-white">Programme Slots</h3>
                            <button onclick="window.App.openAddProgrammeModal(${station.id})" class="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition">
                                + Add Programme Slot
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${(station.programmes || []).map(prog => `
                                <div class="p-4 rounded-xl bg-gray-950 border border-gray-800 flex items-start justify-between gap-3">
                                    <div>
                                        <span class="text-xs font-mono font-bold text-orange-400">${prog.start_time} - ${prog.end_time} (${prog.days_of_week})</span>
                                        <h4 class="text-base font-bold text-white mt-0.5">${prog.title}</h4>
                                        <p class="text-xs text-gray-400 mt-1">${prog.description}</p>
                                    </div>
                                    <button onclick="window.App.deleteProgramme(${prog.id})" class="text-xs text-red-400 hover:text-red-300 p-1">Delete</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 4: Analytics -->
                ${activeTab === 'analytics' ? `
                    <div class="space-y-6">
                        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
                            <h3 class="text-lg font-bold text-white">Hourly Listener Concurrency (Last 24 Hours)</h3>
                            <div class="flex items-end gap-2 h-48 pt-6">
                                ${(analytics.hourly_trend || []).map(item => `
                                    <div class="flex-1 flex flex-col items-center gap-1 group relative">
                                        <div class="w-full bg-orange-500/80 hover:bg-orange-400 rounded-t transition" style="height: ${Math.max(8, (item.listeners / (analytics.peak_listeners || 100)) * 100)}%"></div>
                                        <span class="text-[9px] text-gray-500 truncate font-mono">${item.time}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
                                <h3 class="text-base font-bold text-white">Audience by Kenyan County</h3>
                                <div class="space-y-2 pt-2">
                                    ${(analytics.county_distribution || []).map(c => `
                                        <div>
                                            <div class="flex justify-between text-xs mb-1">
                                                <span class="text-gray-300">${c.county}</span>
                                                <span class="text-orange-400 font-bold">${c.percentage}% (${c.listeners} listeners)</span>
                                            </div>
                                            <div class="w-full bg-gray-950 h-2 rounded-full overflow-hidden">
                                                <div class="bg-orange-500 h-full rounded-full" style="width: ${c.percentage}%"></div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
                                <h3 class="text-base font-bold text-white">Listening Platforms</h3>
                                <div class="space-y-2 pt-2">
                                    ${(analytics.device_breakdown || []).map(d => `
                                        <div>
                                            <div class="flex justify-between text-xs mb-1">
                                                <span class="text-gray-300">${d.platform}</span>
                                                <span class="text-cyan-400 font-bold">${d.percentage}%</span>
                                            </div>
                                            <div class="w-full bg-gray-950 h-2 rounded-full overflow-hidden">
                                                <div class="bg-cyan-500 h-full rounded-full" style="width: ${d.percentage}%"></div>
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
                        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
                            <h3 class="text-base font-bold text-white">Current Subscription</h3>
                            <div class="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                                <div class="text-xl font-extrabold text-white">${subscription?.subscription?.plan_name || 'Managed Broadcast Pro'}</div>
                                <div class="text-sm font-bold text-orange-400">KES ${subscription?.subscription?.price || '7,500'} / month</div>
                                <div class="text-xs text-green-400 font-semibold">Status: Active & Auto-renewing</div>
                            </div>
                        </div>

                        <div class="lg:col-span-2 p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
                            <h3 class="text-base font-bold text-white">Upgrade or Renew via Lipa na M-Pesa</h3>
                            <form onsubmit="window.App.handleMpesaPayment(event, ${station.id})" class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-xs font-semibold text-gray-400 block mb-1">Choose Plan</label>
                                        <select name="plan_id" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                                            <option value="2">Pro Aggregator (KES 2,500/mo)</option>
                                            <option value="3" selected>Managed Broadcast Pro (KES 7,500/mo)</option>
                                            <option value="4">Enterprise Broadcast Network (KES 18,000/mo)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="text-xs font-semibold text-gray-400 block mb-1">M-Pesa Mobile Number</label>
                                        <input type="tel" name="phone" value="+254712345678" required class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                                    </div>
                                </div>
                                <button type="submit" class="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition shadow-lg shadow-green-600/20">
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
                <div class="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-2 border-red-500/40 shadow-2xl space-y-6">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <div class="relative">
                                <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-2xl text-white shadow-xl shadow-red-500/30">
                                    🎙️
                                </div>
                                <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-gray-950 animate-ping"></span>
                                <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-gray-950"></span>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                        ● LIVE ON-AIR
                                    </span>
                                    <span class="text-xs text-gray-400 font-mono">Studio Stream Engine</span>
                                </div>
                                <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight mt-0.5">
                                    ${station.name} <span class="text-orange-500 font-normal">(${station.frequency || 'Live'})</span>
                                </h1>
                            </div>
                        </div>

                        <!-- Studio Live Digital Clock & Controls -->
                        <div class="flex flex-wrap items-center gap-3">
                            <div class="px-4 py-2 rounded-2xl bg-black/80 border border-gray-800 text-center">
                                <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">STUDIO CLOCK (EAT)</div>
                                <div id="studio-live-clock" class="text-xl font-mono font-black text-amber-400 tracking-wider">
                                    ${new Date().toLocaleTimeString('en-US', { hour12: false })}
                                </div>
                            </div>

                            <button 
                                id="studio-mic-btn"
                                onclick="window.App.toggleStudioMic()" 
                                class="px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black tracking-wide flex items-center gap-2 shadow-lg shadow-red-600/30 transition transform active:scale-95"
                            >
                                <span class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                                <span id="studio-mic-text">MIC: LIVE ON AIR</span>
                            </button>

                            <button 
                                onclick="window.App.refreshPresenterCockpit()"
                                class="p-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition border border-gray-700"
                                title="Refresh Studio Feeds"
                            >
                                🔄
                            </button>
                        </div>
                    </div>

                    <!-- Telemetry Badges -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-800/80 text-xs">
                        <div class="p-3 rounded-xl bg-gray-950/70 border border-gray-800">
                            <span class="text-gray-500 text-[10px] block font-bold uppercase">LIVE AUDIENCE</span>
                            <span class="text-white font-bold text-base">👥 ${station.listeners_count || 1420} <span class="text-green-400 text-xs font-normal">Listening</span></span>
                        </div>
                        <div class="p-3 rounded-xl bg-gray-950/70 border border-gray-800">
                            <span class="text-gray-500 text-[10px] block font-bold uppercase">STUDIO ENCODER INGEST</span>
                            <span class="text-green-400 font-mono font-bold text-sm">Port 8005 • BUTT / OBS</span>
                        </div>
                        <div class="p-3 rounded-xl bg-gray-950/70 border border-gray-800">
                            <span class="text-gray-500 text-[10px] block font-bold uppercase">MOUNT POINT</span>
                            <span class="text-orange-400 font-mono font-bold text-sm">/ene-fm (Icecast)</span>
                        </div>
                        <div class="p-3 rounded-xl bg-gray-950/70 border border-gray-800">
                            <span class="text-gray-500 text-[10px] block font-bold uppercase">PENDING SHOUTOUTS</span>
                            <span class="text-amber-400 font-bold text-base">📥 ${pendingCount} in Queue</span>
                        </div>
                    </div>
                </div>

                <!-- Live Master Stream Return & DJ Headphone Monitor Console -->
                <div class="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 border border-orange-500/30 shadow-xl space-y-4">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div class="flex items-center gap-3.5">
                            <div class="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-2xl text-orange-400 flex-shrink-0">
                                🎧
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold text-white uppercase tracking-wider">Studio Master Headphone Monitor (PFL)</span>
                                    <span id="studio-monitor-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${window.Player && window.Player.isPlaying && window.Player.currentStation && window.Player.currentStation.id == station.id ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-400'}">
                                        ${window.Player && window.Player.isPlaying && window.Player.currentStation && window.Player.currentStation.id == station.id ? '● MONITOR ACTIVE' : '○ MONITOR MUTED'}
                                    </span>
                                </div>
                                <p class="text-xs text-gray-400 mt-0.5">Listen directly to the actual on-air return audio to verify music, levels & ICY metadata</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 w-full sm:w-auto">
                            <button 
                                id="studio-monitor-toggle-btn"
                                type="button"
                                onclick="window.App.toggleStudioMonitor(${station.id})" 
                                class="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl ${window.Player && window.Player.isPlaying && window.Player.currentStation && window.Player.currentStation.id == station.id ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'} font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition transform active:scale-95 cursor-pointer"
                            >
                                <span id="studio-monitor-btn-icon">${window.Player && window.Player.isPlaying && window.Player.currentStation && window.Player.currentStation.id == station.id ? '⏸️' : '▶️'}</span>
                                <span id="studio-monitor-btn-text">${window.Player && window.Player.isPlaying && window.Player.currentStation && window.Player.currentStation.id == station.id ? 'Mute Studio Monitor' : 'Listen to Live On-Air Feed'}</span>
                            </button>
                        </div>
                    </div>

                    <!-- Real-Time Track Verification Strip -->
                    <div class="p-3.5 rounded-2xl bg-black/60 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="flex items-center gap-1">
                                <span class="w-1 h-3.5 bg-orange-400 rounded-full animate-bounce"></span>
                                <span class="w-1 h-5 bg-orange-500 rounded-full animate-pulse"></span>
                                <span class="w-1 h-2.5 bg-amber-400 rounded-full animate-bounce"></span>
                                <span class="w-1 h-4 bg-orange-400 rounded-full animate-pulse"></span>
                            </div>
                            <div class="truncate">
                                <span class="text-[10px] text-gray-500 font-bold uppercase block">Current Live Stream Track (Listeners Hear):</span>
                                <span id="studio-verified-track" class="font-bold text-white truncate">
                                    🎵 ${nowPlaying?.track_title || 'Live Stream Audio'} <span class="text-orange-400">${nowPlaying?.artist_name ? '— ' + nowPlaying.artist_name : ''}</span>
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 text-[11px] text-gray-400">
                            <span class="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 font-mono text-green-400 font-bold">128 kbps MP3</span>
                            <span class="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 font-mono text-orange-400 font-bold">Low-Latency Studio Return</span>
                        </div>
                    </div>
                </div>

                <!-- Main Grid: Broadcaster & Request Queue -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    <!-- Left Column: Broadcast Now-Playing & Sound FX (7 cols) -->
                    <div class="lg:col-span-7 space-y-6">
                        
                        <!-- 1. Now Playing Broadcast Card -->
                        <div class="p-6 md:p-7 rounded-3xl bg-gray-900 border border-gray-800 space-y-5 shadow-xl">
                            <div class="flex items-center justify-between border-b border-gray-800 pb-3">
                                <div>
                                    <h2 class="text-lg font-bold text-white flex items-center gap-2">
                                        <span>🎵</span> Broadcast "Now Playing" ICY Metadata
                                    </h2>
                                    <p class="text-xs text-gray-400">Pushes live song info & artist tags to all listeners' phones in real-time</p>
                                </div>
                                <span class="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-mono font-bold">
                                    128k MP3
                                </span>
                            </div>

                            <form id="now-playing-form" onsubmit="window.App.handleUpdateNowPlaying(event, ${station.id})" class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-gray-300 block mb-1">On-Air Show / Programme Name *</label>
                                    <input 
                                        type="text" 
                                        name="programme_name" 
                                        id="input-programme-name"
                                        value="${nowPlaying?.programme_name || 'ENE Breakfast Explosion'}" 
                                        required 
                                        placeholder="e.g. The Morning Drive Show"
                                        class="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500 font-medium"
                                    />
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-xs font-bold text-gray-300 block mb-1">Track Title *</label>
                                        <input 
                                            type="text" 
                                            name="track_title" 
                                            id="input-track-title"
                                            value="${nowPlaying?.track_title || ''}" 
                                            placeholder="e.g. Sura Yako" 
                                            required 
                                            class="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500 font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label class="text-xs font-bold text-gray-300 block mb-1">Artist / Group Name *</label>
                                        <input 
                                            type="text" 
                                            name="artist_name" 
                                            id="input-artist-name"
                                            value="${nowPlaying?.artist_name || ''}" 
                                            placeholder="e.g. Sauti Sol" 
                                            required 
                                            class="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500 font-medium"
                                        />
                                    </div>
                                </div>

                                <!-- Quick Presets -->
                                <div>
                                    <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">⚡ One-Click Popular Track Presets:</span>
                                    <div class="flex flex-wrap gap-2">
                                        ${presets.map(p => `
                                            <button 
                                                type="button" 
                                                onclick="window.App.quickFillNowPlaying('${p.title}', '${p.artist}')"
                                                class="px-3 py-1.5 rounded-lg bg-gray-950 hover:bg-orange-500/20 hover:border-orange-500 text-gray-300 hover:text-white border border-gray-800 text-xs font-medium transition"
                                            >
                                                🎵 ${p.title} <span class="text-gray-500 text-[10px]">(${p.artist})</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    class="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 transition transform active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <span>🚀 Broadcast Track to All Connected Listeners</span>
                                </button>
                            </form>
                        </div>

                        <!-- 2. Studio Soundboard & Jingles FX -->
                        <div class="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4 shadow-xl">
                            <div class="flex items-center justify-between border-b border-gray-800 pb-3">
                                <div>
                                    <h3 class="text-base font-bold text-white flex items-center gap-2">
                                        <span>🎛️</span> Studio Soundboard & Sweepers
                                    </h3>
                                    <p class="text-xs text-gray-400">Trigger on-air sound effects & audio sweepers</p>
                                </div>
                                <span class="text-[11px] text-gray-500">Web Audio Synth FX</span>
                            </div>

                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <button onclick="window.App.playSoundFx('airhorn')" class="p-3.5 rounded-xl bg-gray-950 hover:bg-orange-500/20 border border-gray-800 hover:border-orange-500/50 text-left transition transform active:scale-95 group">
                                    <span class="text-xl block mb-1">📢</span>
                                    <span class="text-xs font-bold text-white block group-hover:text-orange-400">Airhorn Blast</span>
                                    <span class="text-[10px] text-gray-500">Hype & Drop</span>
                                </button>
                                <button onclick="window.App.playSoundFx('applause')" class="p-3.5 rounded-xl bg-gray-950 hover:bg-green-500/20 border border-gray-800 hover:border-green-500/50 text-left transition transform active:scale-95 group">
                                    <span class="text-xl block mb-1">👏</span>
                                    <span class="text-xs font-bold text-white block group-hover:text-green-400">Studio Applause</span>
                                    <span class="text-[10px] text-gray-500">Crowd Cheer</span>
                                </button>
                                <button onclick="window.App.playSoundFx('rewind')" class="p-3.5 rounded-xl bg-gray-950 hover:bg-blue-500/20 border border-gray-800 hover:border-blue-500/50 text-left transition transform active:scale-95 group">
                                    <span class="text-xl block mb-1">⏪</span>
                                    <span class="text-xs font-bold text-white block group-hover:text-blue-400">DJ Scratch / Pullup</span>
                                    <span class="text-[10px] text-gray-500">Track Spinback</span>
                                </button>
                                <button onclick="window.App.playSoundFx('news')" class="p-3.5 rounded-xl bg-gray-950 hover:bg-red-500/20 border border-gray-800 hover:border-red-500/50 text-left transition transform active:scale-95 group">
                                    <span class="text-xl block mb-1">🚨</span>
                                    <span class="text-xs font-bold text-white block group-hover:text-red-400">Breaking News Sting</span>
                                    <span class="text-[10px] text-gray-500">Alert Chime</span>
                                </button>
                                <button onclick="window.App.playSoundFx('drumroll')" class="p-3.5 rounded-xl bg-gray-950 hover:bg-purple-500/20 border border-gray-800 hover:border-purple-500/50 text-left transition transform active:scale-95 group">
                                    <span class="text-xl block mb-1">🥁</span>
                                    <span class="text-xs font-bold text-white block group-hover:text-purple-400">Drum Roll</span>
                                    <span class="text-[10px] text-gray-500">Big Reveal</span>
                                </button>
                                <button onclick="window.App.playSoundFx('station_id')" class="p-3.5 rounded-xl bg-gray-950 hover:bg-amber-500/20 border border-gray-800 hover:border-amber-500/50 text-left transition transform active:scale-95 group">
                                    <span class="text-xl block mb-1">📻</span>
                                    <span class="text-xs font-bold text-white block group-hover:text-amber-400">Station ID Tone</span>
                                    <span class="text-[10px] text-gray-500">Legal Stinger</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Live Listener Shoutouts & Song Queue (5 cols) -->
                    <div class="lg:col-span-5 space-y-6">
                        
                        <div class="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-5 shadow-xl">
                            <div class="flex items-center justify-between border-b border-gray-800 pb-3">
                                <div>
                                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                                        <span>📥</span> Listener Requests & Shoutouts
                                    </h3>
                                    <p class="text-xs text-gray-400">Incoming listener dedications</p>
                                </div>
                                <span class="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold font-mono">
                                    ${requests.length} Total
                                </span>
                            </div>

                            <!-- Filter Tabs -->
                            <div class="flex items-center gap-1.5 p-1 rounded-xl bg-gray-950 border border-gray-800 text-xs">
                                <button onclick="window.App.setPresenterRequestFilter('all')" class="flex-1 py-1.5 rounded-lg font-bold transition ${activeFilter === 'all' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}">
                                    All (${requests.length})
                                </button>
                                <button onclick="window.App.setPresenterRequestFilter('pending')" class="flex-1 py-1.5 rounded-lg font-bold transition ${activeFilter === 'pending' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}">
                                    Pending (${pendingCount})
                                </button>
                                <button onclick="window.App.setPresenterRequestFilter('approved')" class="flex-1 py-1.5 rounded-lg font-bold transition ${activeFilter === 'approved' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}">
                                    Approved (${approvedCount})
                                </button>
                                <button onclick="window.App.setPresenterRequestFilter('played')" class="flex-1 py-1.5 rounded-lg font-bold transition ${activeFilter === 'played' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}">
                                    Played (${playedCount})
                                </button>
                            </div>

                            <!-- Requests List -->
                            <div class="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                                ${filteredRequests.length > 0 ? filteredRequests.map(req => `
                                    <div class="p-4 rounded-2xl bg-gray-950 border border-gray-800 hover:border-gray-700 transition space-y-3">
                                        <div class="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
                                                    <span>🎵</span> ${req.song_title}
                                                </h4>
                                                ${req.artist ? `<span class="text-xs text-orange-400 font-medium block ml-5">${req.artist}</span>` : ''}
                                            </div>
                                            <span class="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${req.status === 'played' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : req.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : req.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}">
                                                ${req.status}
                                            </span>
                                        </div>

                                        <div class="p-3 rounded-xl bg-gray-900/80 border border-gray-800/80 text-xs text-gray-300 italic">
                                            "${req.message || 'No dedication message provided.'}"
                                        </div>

                                        <div class="flex items-center justify-between text-[11px] text-gray-500">
                                            <span>From: <strong class="text-gray-300">${req.listener_name}</strong> ${req.listener_phone ? `<span class="text-gray-400 font-mono">(${req.listener_phone})</span>` : ''}</span>
                                            <span class="font-mono text-[10px]">${req.created_at ? req.created_at.split(' ')[1] || req.created_at : ''}</span>
                                        </div>

                                        <!-- Action Buttons -->
                                        <div class="grid grid-cols-3 gap-2 pt-1 border-t border-gray-800/80">
                                            <button 
                                                onclick="window.App.quickFillNowPlaying('${req.song_title.replace(/'/g, "\\'")}', '${(req.artist || '').replace(/'/g, "\\'")}')"
                                                class="py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold transition border border-orange-500/20 text-center"
                                                title="Load into Broadcast form"
                                            >
                                                ⚡ Cue Track
                                            </button>
                                            
                                            ${req.status !== 'played' ? `
                                                <button 
                                                    onclick="window.App.updateRequestStatus(${req.id}, 'played')"
                                                    class="py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
                                                >
                                                    ✓ Played
                                                </button>
                                            ` : `
                                                <button 
                                                    onclick="window.App.updateRequestStatus(${req.id}, 'approved')"
                                                    class="py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition"
                                                >
                                                    Re-open
                                                </button>
                                            `}

                                            ${req.status !== 'rejected' ? `
                                                <button 
                                                    onclick="window.App.updateRequestStatus(${req.id}, 'rejected')"
                                                    class="py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold transition border border-red-500/20"
                                                >
                                                    Dismiss
                                                </button>
                                            ` : `
                                                <button 
                                                    onclick="window.App.updateRequestStatus(${req.id}, 'pending')"
                                                    class="py-1.5 rounded-lg bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white text-xs font-semibold transition"
                                                >
                                                    Restore
                                                </button>
                                            `}
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div class="text-center py-16 text-gray-500 text-sm space-y-2">
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
                <div class="p-6 md:p-8 rounded-3xl glass border border-gray-800 space-y-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 font-bold uppercase border border-purple-500/30">Super Administrator Portal</span>
                            <h1 class="text-3xl font-extrabold text-white mt-1">Platform Operations & Telemetry</h1>
                        </div>
                        <button onclick="window.App.runAllHealthChecks()" class="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition">
                            ⚡ Run Global Stream Health Audit
                        </button>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="p-4 rounded-xl bg-gray-900 border border-gray-800">
                            <span class="text-xs text-gray-500">PUBLISHED STATIONS</span>
                            <div class="text-2xl font-extrabold text-white">${overview.published_stations || 10}</div>
                        </div>
                        <div class="p-4 rounded-xl bg-gray-900 border border-gray-800">
                            <span class="text-xs text-gray-500">PENDING APPROVALS</span>
                            <div class="text-2xl font-extrabold text-yellow-400">${overview.pending_stations || 0}</div>
                        </div>
                        <div class="p-4 rounded-xl bg-gray-900 border border-gray-800">
                            <span class="text-xs text-gray-500">TOTAL USERS</span>
                            <div class="text-2xl font-extrabold text-cyan-400">${overview.total_users || 4}</div>
                        </div>
                        <div class="p-4 rounded-xl bg-gray-900 border border-gray-800">
                            <span class="text-xs text-gray-500">OPEN INCIDENTS</span>
                            <div class="text-2xl font-extrabold text-green-400">${overview.open_incidents || 0}</div>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto">
                    ${[
                        { id: 'approvals', label: 'Pending Onboarding Approvals', icon: '📝' },
                        { id: 'streams', label: 'Stream Health Monitor Grid', icon: '📡' },
                        { id: 'audits', label: 'System Audit Logs', icon: '📜' }
                    ].map(tab => `
                        <button onclick="window.App.setSuperAdminTab('${tab.id}')" class="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}">
                            <span>${tab.icon}</span>
                            ${tab.label}
                        </button>
                    `).join('')}
                </div>

                <!-- Tab 1: Pending Station Approvals -->
                ${activeTab === 'approvals' ? `
                    <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
                        <h3 class="text-lg font-bold text-white">Station Registration Queue</h3>
                        <div class="space-y-4">
                            ${pendingStations.length > 0 ? pendingStations.map(station => `
                                <div class="p-5 rounded-xl bg-gray-950 border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div class="space-y-1">
                                        <div class="flex items-center gap-2">
                                            <h4 class="text-base font-bold text-white">${station.name}</h4>
                                            <span class="text-xs text-orange-400 font-mono">(${station.frequency || 'Live'})</span>
                                            <span class="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 uppercase">${station.stream_mode}</span>
                                        </div>
                                        <p class="text-xs text-gray-400">📍 ${station.county}, ${station.city} • Genre: ${station.genre}</p>
                                        <div class="text-[11px] text-gray-500">Applicant: <strong>${station.owner_name || 'Station Owner'}</strong> (${station.owner_email})</div>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <button onclick="window.App.approveStation(${station.id}, 'published')" class="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition">
                                            ✓ Approve & Publish
                                        </button>
                                        <button onclick="window.App.approveStation(${station.id}, 'rejected')" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition">
                                            ✕ Reject
                                        </button>
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="text-center py-10 text-gray-500 text-sm">No stations currently awaiting approval. All onboarding queue clear!</div>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 2: Stream Health Monitor Grid -->
                ${activeTab === 'streams' ? `
                    <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-bold text-white">Live Stream Endpoints Status</h3>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs text-gray-300">
                                <thead class="bg-gray-950 text-gray-400 uppercase text-[10px]">
                                    <tr>
                                        <th class="p-3">Station</th>
                                        <th class="p-3">Model</th>
                                        <th class="p-3">Codec / Bitrate</th>
                                        <th class="p-3">Status</th>
                                        <th class="p-3">Uptime SLA</th>
                                        <th class="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-800">
                                    ${(streamsGrid.streams || []).map(s => `
                                        <tr class="hover:bg-gray-950/60">
                                            <td class="p-3 font-bold text-white">${s.station_name}</td>
                                            <td class="p-3 uppercase text-orange-400 font-mono">${s.mode}</td>
                                            <td class="p-3 font-mono">${s.codec} / ${s.bitrate}k</td>
                                            <td class="p-3">
                                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${s.stream_status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}">
                                                    ${s.stream_status ? s.stream_status.toUpperCase() : 'ONLINE'}
                                                </span>
                                            </td>
                                            <td class="p-3 font-bold text-green-400">${s.uptime_percentage}%</td>
                                            <td class="p-3">
                                                <button onclick="window.App.testStreamHealth(${s.station_id})" class="text-orange-400 hover:underline">Ping Check</button>
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
                    <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
                        <h3 class="text-lg font-bold text-white">System Audit & Operational Log</h3>
                        <div class="space-y-2">
                            ${auditLogs.map(log => `
                                <div class="p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs flex items-start justify-between gap-4">
                                    <div>
                                        <span class="px-2 py-0.5 rounded bg-gray-800 text-orange-400 font-mono text-[10px] font-bold">${log.action}</span>
                                        <p class="text-gray-300 mt-1">${log.details}</p>
                                        <span class="text-[10px] text-gray-500">By: ${log.actor_name || 'System'} (${log.actor_role || 'Daemon'})</span>
                                    </div>
                                    <span class="text-[10px] text-gray-500 whitespace-nowrap font-mono">${log.created_at}</span>
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
            <div class="max-w-2xl mx-auto p-6 md:p-10 rounded-3xl glass border border-gray-800 space-y-8 animate-fadeIn">
                <div>
                    <span class="text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold uppercase border border-orange-500/30">Station Onboarding</span>
                    <h1 class="text-3xl font-extrabold text-white mt-1">Register Your Radio Station</h1>
                    <p class="text-sm text-gray-400">Join Kenya's centralized radio distribution ecosystem.</p>
                </div>

                <!-- Wizard Form -->
                <form onsubmit="window.App.handleOnboardingSubmit(event)" class="space-y-6">
                    <div class="space-y-4">
                        <h3 class="text-base font-bold text-white border-b border-gray-800 pb-2">1. Station Information</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-semibold text-gray-400 block mb-1">Station Name *</label>
                                <input type="text" name="name" required placeholder="e.g. Safari FM" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                            </div>
                            <div>
                                <label class="text-xs font-semibold text-gray-400 block mb-1">Frequency (e.g. 94.7 FM)</label>
                                <input type="text" name="frequency" placeholder="e.g. 94.7 FM" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                            </div>
                        </div>

                        <div>
                            <label class="text-xs font-semibold text-gray-400 block mb-1">Parent Media Group (Optional)</label>
                            <input type="text" name="media_group" placeholder="e.g. Royal Media Services, Radio Africa Group, Independent" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                        </div>

                        <div>
                            <label class="text-xs font-semibold text-gray-400 block mb-1">Tagline / Motto</label>
                            <input type="text" name="tagline" placeholder="e.g. Sauti ya Amani na Muziki" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-semibold text-gray-400 block mb-1">County *</label>
                                <select name="county" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
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
                                <label class="text-xs font-semibold text-gray-400 block mb-1">City / Town *</label>
                                <input type="text" name="city" required placeholder="e.g. Nairobi" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-semibold text-gray-400 block mb-1">Primary Language</label>
                                <input type="text" name="language" value="English/Swahili" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                            </div>
                            <div>
                                <label class="text-xs font-semibold text-gray-400 block mb-1">Primary Music/Content Genre</label>
                                <input type="text" name="genre" value="Afrobeat & Talk" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h3 class="text-base font-bold text-white border-b border-gray-800 pb-2">2. Streaming Infrastructure Model</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label class="p-4 rounded-xl border border-orange-500 bg-orange-500/10 cursor-pointer">
                                <input type="radio" name="stream_mode" value="managed" checked class="mr-2">
                                <span class="font-bold text-white text-sm">Managed Icecast Provisioning</span>
                                <p class="text-xs text-gray-400 mt-1">Platform automatically provisions mount and credentials for your studio encoder.</p>
                            </label>
                            <label class="p-4 rounded-xl border border-gray-800 bg-gray-950 cursor-pointer">
                                <input type="radio" name="stream_mode" value="external" class="mr-2">
                                <span class="font-bold text-white text-sm">Aggregator (Direct Stream / HLS)</span>
                                <p class="text-xs text-gray-400 mt-1">Provide your active audio stream URL or .m3u8 manifest.</p>
                            </label>
                        </div>

                        <div>
                            <label class="text-xs font-semibold text-gray-400 block mb-1">Stream URL (Optional if Managed)</label>
                            <input type="url" name="stream_url" placeholder="https://stream.yourstation.com/live.mp3 or .m3u8" class="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-orange-500">
                        </div>
                    </div>

                    <button type="submit" class="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base transition shadow-xl shadow-orange-500/30">
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
                <div class="rounded-3xl bg-[#111827] border border-gray-800 shadow-2xl p-8 md:p-10 space-y-7">
                    
                    <!-- Portal Icon & Title -->
                    <div class="text-center space-y-2">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-xl shadow-orange-500/25 mb-2 text-3xl">
                            ${active.icon}
                        </div>
                        <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">${active.title}</h1>
                        <p class="text-xs md:text-sm text-gray-400 max-w-sm mx-auto">${active.subtitle}</p>
                    </div>

                    <!-- Role Switcher Pills -->
                    <div class="space-y-2">
                        <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block text-center">Select Your Broadcaster Workspace:</span>
                        <div class="grid grid-cols-3 gap-2">
                            <button onclick="window.App.fillDemoLogin('station_admin')" class="p-3 rounded-2xl border ${targetRole === 'station_admin' ? 'border-orange-500 bg-orange-500/10' : 'border-gray-800 bg-gray-950 hover:bg-gray-900'} text-center transition">
                                <span class="text-xl block mb-1">📻</span>
                                <span class="text-xs font-bold text-white block">Station Owner</span>
                                <span class="text-[10px] text-gray-400 block">ENE FM</span>
                            </button>
                            <button onclick="window.App.fillDemoLogin('presenter')" class="p-3 rounded-2xl border ${targetRole === 'presenter' ? 'border-red-500 bg-red-500/10' : 'border-gray-800 bg-gray-950 hover:bg-gray-900'} text-center transition">
                                <span class="text-xl block mb-1">🎙️</span>
                                <span class="text-xs font-bold text-white block">Studio Presenter</span>
                                <span class="text-[10px] text-gray-400 block">DJ Marcus</span>
                            </button>
                            <button onclick="window.App.fillDemoLogin('super_admin')" class="p-3 rounded-2xl border ${targetRole === 'super_admin' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-800 bg-gray-950 hover:bg-gray-900'} text-center transition">
                                <span class="text-xl block mb-1">⚡</span>
                                <span class="text-xs font-bold text-white block">Super Admin</span>
                                <span class="text-[10px] text-gray-400 block">Network Ops</span>
                            </button>
                        </div>
                    </div>

                    <!-- Login Form -->
                    <form onsubmit="window.App.handleLoginSubmit(event)" class="space-y-4 pt-2">
                        <div>
                            <label class="block text-xs font-bold text-gray-300 mb-1.5">Broadcast Email</label>
                            <input 
                                type="email" 
                                id="portal-email" 
                                required 
                                value="${active.defaultEmail}"
                                placeholder="name@yourstation.co.ke" 
                                class="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                            />
                        </div>

                        <div>
                            <div class="flex items-center justify-between mb-1.5">
                                <label class="block text-xs font-bold text-gray-300">Access Key / Password</label>
                                <span class="text-[11px] text-orange-400 font-medium">Demo: ${active.defaultPass}</span>
                            </div>
                            <input 
                                type="password" 
                                id="portal-password" 
                                required 
                                value="${active.defaultPass}"
                                placeholder="••••••••" 
                                class="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                            />
                        </div>

                        <button 
                            type="submit" 
                            class="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 transition transform active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span>Authenticate & Open Workspace</span>
                        </button>
                    </form>

                    <div class="text-center pt-2 border-t border-gray-800/80">
                        <button onclick="window.App.navigate('home')" class="text-xs text-gray-400 hover:text-orange-400 transition font-medium flex items-center justify-center gap-1.5 mx-auto">
                            <span>←</span> Back to Public Radio Directory (Listen Freely)
                        </button>
                    </div>

                </div>
            </div>
        `;
    }
};

window.Components = Components;
