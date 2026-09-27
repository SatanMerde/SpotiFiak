/**
 * SpotiFiak Overlay — Spicetify Mobile Center injected into Spotify Web Player
 * Includes the Peach Floating Action Button (🍑), Bottom Navigation Bar,
 * Marketplace UI, Live Theme Switcher, and Extensions.
 */
(function() {
  'use strict';

  const PEACH_LOGO_SRC = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0icGciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmOWE4YiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2ZmNmU2ZSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlODUzNGEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8cmFkaWFsR3JhZGllbnQgaWQ9InBzIiBjeD0iMC4zIiBjeT0iMC4zIiByPSIwLjciPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMzUpIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0icmdiYSgyNTUsMjU1LDI1NSwwKSIvPgogICAgPC9yYWRpYWxHcmFkaWVudD4KICA8L2RlZnM+CiAgPGNpcmNsZSBjeD0iMzIiIGN5PSIzNSIgcj0iMjciIGZpbGw9InVybCgjcGcpIi8+CiAgPGNpcmNsZSBjeD0iMzIiIGN5PSIzNSIgcj0iMjciIGZpbGw9InVybCgjcHMpIi8+CiAgPHBhdGggZD0iTTMyIDEwIFEzNyAzIDQzIDUgUTM4IDEwIDM0IDE3IFoiIGZpbGw9IiM0Q0FGNTAiLz4KICA8cGF0aCBkPSJNMzIgMTAgUTI3IDMgMjEgNiBRMjYgMTEgMzAgMTcgWiIgZmlsbD0iIzY2QkI2QSIvPgogIDxwYXRoIGQ9Ik0xOSAzMCBDMTkgMTkgNDUgMTkgNDUgMzAiIHN0cm9rZT0iIzFhMWEyZSIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8cGF0aCBkPSJNMjEgMzcgQzIxIDI3IDQzIDI3IDQzIDM3IiBzdHJva2U9IiMxYTFhMmUiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPHBhdGggZD0iTTIzIDQ0IEMyMyAzNSA0MSAzNSA0MSA0NCIgc3Ryb2tlPSIjMWExYTJlIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=';

  function initSpotiFiak() {
    if (document.getElementById('sf-bottom-nav')) return;
    if (!document.body) {
      setTimeout(initSpotiFiak, 200);
      return;
    }

    // Ensure SpotiFiak API is present or initialize fallback
    window.SpotiFiak = window.SpotiFiak || {
      version: '1.2.0',
      platform: 'android',
      injectedStyles: new Map(),
      getStorage(k, def) {
        try { const v = localStorage.getItem('sf_' + k); return v ? JSON.parse(v) : def; } catch(e) { return def; }
      },
      setStorage(k, val) {
        try { localStorage.setItem('sf_' + k, JSON.stringify(val)); } catch(e) {}
      },
      injectCSS(id, css) {
        let el = document.getElementById('sf-style-' + id);
        if (!el) {
          el = document.createElement('style');
          el.id = 'sf-style-' + id;
          (document.head || document.documentElement).appendChild(el);
        }
        el.textContent = css;
        this.injectedStyles.set(id, css);
      },
      removeCSS(id) {
        const el = document.getElementById('sf-style-' + id);
        if (el) el.remove();
        this.injectedStyles.delete(id);
      },
      showNotification(title, msg) {
        if (window.SpotiFiakNative && window.SpotiFiakNative.showToast) {
          window.SpotiFiakNative.showToast(title + ': ' + msg);
        }
        // Also show in-app toast
        showInAppToast(title, msg);
      }
    };

    const SF = window.SpotiFiak;
    let installedAddons = SF.getStorage('installed_addons', {
      'theme-peach-sunset': { enabled: true, date: Date.now() }
    });

    // ── In-App Update State & Handlers ──
    const currentAppVersion = (window.SpotiFiakNative && window.SpotiFiakNative.getVersion) ? window.SpotiFiakNative.getVersion() : '1.2.0';
    let latestUpdateInfo = null;
    let isCheckingUpdate = false;
    let isDownloadingUpdate = false;

    function isVersionNewer(latest, current) {
      if (!latest || !current) return false;
      const l = latest.replace(/^v/i, '').split('.').map(n => parseInt(n) || 0);
      const c = current.replace(/^v/i, '').split('.').map(n => parseInt(n) || 0);
      for (let i = 0; i < Math.max(l.length, c.length); i++) {
        const lv = l[i] || 0;
        const cv = c[i] || 0;
        if (lv > cv) return true;
        if (lv < cv) return false;
      }
      return false;
    }

    SF.onUpdateCheckResult = function(info) {
      isCheckingUpdate = false;
      latestUpdateInfo = info;
      if (info && info.isUpdateAvailable) {
        showInAppToast('Mise à jour disponible 🚀', 'La version v' + info.latestVersion + ' est disponible !');
      } else if (window._userRequestedUpdateCheck) {
        showInAppToast('SpotiFiak à jour ✨', 'Vous utilisez déjà la dernière version (v' + (info ? info.currentVersion : currentAppVersion) + ')');
        window._userRequestedUpdateCheck = false;
      }
      if (panelOpen) renderPanel();
    };

    SF.onUpdateCheckError = function(err) {
      isCheckingUpdate = false;
      if (window._userRequestedUpdateCheck) {
        showInAppToast('Mises à jour', err || 'Erreur lors de la vérification');
        window._userRequestedUpdateCheck = false;
      }
      if (panelOpen) renderPanel();
    };

    SF.onUpdateProgress = function(percent, downloaded, total) {
      isDownloadingUpdate = true;
      const progContainer = document.getElementById('sf-update-progress-container');
      const progBar = document.getElementById('sf-update-progress-bar');
      const progPercent = document.getElementById('sf-update-progress-percent');
      const progText = document.getElementById('sf-update-progress-text');
      if (progContainer) progContainer.style.display = 'block';
      if (progBar) progBar.style.width = percent + '%';
      if (progPercent) progPercent.textContent = percent + '%';
      if (progText && total > 0) {
        const dMb = (downloaded / (1024 * 1024)).toFixed(1);
        const tMb = (total / (1024 * 1024)).toFixed(1);
        progText.textContent = `Téléchargement : ${dMb} / ${tMb} Mo`;
      }
    };

    SF.onUpdateComplete = function() {
      isDownloadingUpdate = false;
      showInAppToast('Prêt à installer 📦', 'Ouverture de l\'installateur Android...');
      const progText = document.getElementById('sf-update-progress-text');
      if (progText) progText.textContent = 'Téléchargement terminé ! Installation...';
    };

    SF.onUpdateError = function(err) {
      isDownloadingUpdate = false;
      showInAppToast('Erreur', err || 'Échec du téléchargement');
      if (panelOpen) renderPanel();
    };

    // ── In-App Toast Notification ──
    function showInAppToast(title, message) {
      let container = document.getElementById('sf-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'sf-toast-container';
        container.style.cssText = 'position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:999999;display:flex;flex-direction:column;gap:8px;pointer-events:none;width:90%;max-width:340px;';
        (document.body || document.documentElement).appendChild(container);
      }
      const toast = document.createElement('div');
      toast.style.cssText = 'background:rgba(255,110,110,0.95);color:#fff;padding:12px 16px;border-radius:12px;font-size:0.85rem;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.4);backdrop-filter:blur(12px);pointer-events:auto;animation:sfToastIn 0.3s ease forwards;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;';
      toast.innerHTML = '<div style="font-weight:800;font-size:0.8rem;margin-bottom:2px;">' + title + '</div><div style="font-size:0.75rem;opacity:0.9;">' + message + '</div>';
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }

    // Inject toast animation
    if (!document.getElementById('sf-toast-keyframes')) {
      const style = document.createElement('style');
      style.id = 'sf-toast-keyframes';
      style.textContent = '@keyframes sfToastIn{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}';
      (document.head || document.documentElement).appendChild(style);
    }

    // ── 1. Mobile Bottom Navigation Bar ──
    injectBottomNav();

    // ── 2. Spicetify Mobile Panel Bottom Sheet ──
    const panel = document.createElement('div');
    panel.id = 'spotifiak-panel';
    panel.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; top: 100%;
      background: rgba(10, 11, 16, 0.98); backdrop-filter: blur(28px);
      z-index: 99998; transition: top 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      overflow-y: auto; -webkit-overflow-scrolling: touch;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: white; border-top: 1px solid rgba(255, 110, 110, 0.25);
    `;
    document.body.appendChild(panel);

    let panelOpen = false;
    let addonRegistry = getBundledRegistry();
    let searchQuery = '';
    let filterType = 'all';
    let sortBy = 'popular';
    let currentTab = 'marketplace';

    function togglePanel() {
      panelOpen = !panelOpen;
      panel.style.top = panelOpen ? '0' : '100%';
      if (panelOpen) renderPanel();
    }

    // ── 3. Spotify Header & Panels Watcher ──
    function replaceHeaderLogo() {
      const logoLink = document.querySelector('#global-nav-bar a[href="/"]') ||
                       document.querySelector('#global-nav-bar .azTGVyS_7WuUbhEDoCgH a') ||
                       document.querySelector('.Root__top-bar a[href="/"]');
      if (logoLink && !logoLink.querySelector('.sf-header-peach-logo')) {
        logoLink.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <img class="sf-header-peach-logo" src="${PEACH_LOGO_SRC}" style="width:30px; height:30px; border-radius:50%; object-fit:cover; filter:drop-shadow(0 2px 6px rgba(255,110,110,0.5));" alt="SpotiFiak" onerror="this.style.display='none'" />
            <span style="font-size:16px; font-weight:800; background:linear-gradient(135deg,#ff7a7a,#ffa570); -webkit-background-clip:text; -webkit-text-fill-color:transparent; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; letter-spacing:-0.3px;">SpotiFiak</span>
          </div>
        `;
      }
    }

    function updateRouteState() {
      const path = window.location.pathname;
      const isSearch = path.startsWith('/search');
      const isLib = path.startsWith('/collection');

      if (isSearch) {
        if (!document.body.classList.contains('sf-page-search')) {
          document.body.classList.add('sf-page-search');
        }
        setActiveNav('sf-nav-search');
      } else if (isLib) {
        if (document.body.classList.contains('sf-page-search')) {
          document.body.classList.remove('sf-page-search');
        }
        setActiveNav('sf-nav-library');
      } else {
        if (document.body.classList.contains('sf-page-search')) {
          document.body.classList.remove('sf-page-search');
        }
        if (!document.body.classList.contains('sf-show-library')) {
          setActiveNav('sf-nav-home');
        }
      }
    }

    function watchPanels() {
      replaceHeaderLogo();
      updateRouteState();

      // Find Spotify CSS Grid or react-resizable-panels
      const leftSidebar = document.getElementById('Desktop_LeftSidebar_Id');
      if (leftSidebar && !leftSidebar.classList.contains('sf-sidebar-panel')) {
        leftSidebar.classList.add('sf-sidebar-panel');
      }

      const mainView = document.getElementById('main-view');
      if (mainView && !mainView.classList.contains('sf-main-panel')) {
        mainView.classList.add('sf-main-panel');
      }

      const panelGroup = document.querySelector('[data-panel-group]') || document.querySelector('[data-panel-group-id]');
      if (panelGroup) {
        const panels = panelGroup.querySelectorAll(':scope > [data-panel]');
        if (panels.length >= 2) {
          if (!panels[0].classList.contains('sf-sidebar-panel')) {
            panels[0].classList.add('sf-sidebar-panel');
          }
          if (!panels[1].classList.contains('sf-main-panel')) {
            panels[1].classList.add('sf-main-panel');
          }
        }
      }

      // Also mark library by content/aria
      const libContainer = document.querySelector('div.main-yourLibraryX-header') ||
                           document.querySelector('[data-testid="your-library"]') ||
                           document.querySelector('div[aria-label*="bibliothèque" i]') ||
                           document.querySelector('div[aria-label*="library" i]');
      if (libContainer) {
        const parentPanel = libContainer.closest('#Desktop_LeftSidebar_Id') || libContainer.closest('[data-panel]') || libContainer.closest('aside') || libContainer.parentElement;
        if (parentPanel && !parentPanel.classList.contains('sf-sidebar-panel')) {
          parentPanel.classList.add('sf-sidebar-panel');
        }
      }

      // Fix "Se connecter" button in top bar to prevent 2-line wrap
      const loginBtns = document.querySelectorAll('button[data-testid="login-button"], a[data-testid="login-button"]');
      loginBtns.forEach(btn => {
        if (btn.style.whiteSpace !== 'nowrap') {
          btn.style.whiteSpace = 'nowrap';
          btn.style.fontSize = '12px';
          btn.style.padding = '4px 14px';
          btn.style.height = '32px';
          btn.style.minHeight = '32px';
          btn.style.lineHeight = '1';
        }
      });
    }

    // Run watcher immediately and on every DOM mutation (throttled)
    watchPanels();
    let watchTimeout = null;
    const panelObserver = new MutationObserver(() => {
      if (watchTimeout) return;
      watchTimeout = setTimeout(() => {
        watchPanels();
        watchTimeout = null;
      }, 150);
    });
    panelObserver.observe(document.documentElement, { childList: true, subtree: true });

    // Listen to history popstate for route changes
    window.addEventListener('popstate', updateRouteState);

    // Auto-close library drawer when tapping outside or selecting a song/playlist
    document.addEventListener('click', (e) => {
      if (document.body.classList.contains('sf-show-library')) {
        const isInsideLib = e.target.closest('#Desktop_LeftSidebar_Id') || e.target.closest('.sf-sidebar-panel') || e.target.closest('[data-testid="your-library"]');
        const isNavToggle = e.target.closest('#sf-nav-library');
        if (!isInsideLib && !isNavToggle) {
          document.body.classList.remove('sf-show-library');
        }
        if (isInsideLib && (e.target.closest('a[href*="/playlist/"]') || e.target.closest('a[href*="/album/"]') || e.target.closest('a[href*="/track/"]'))) {
          document.body.classList.remove('sf-show-library');
        }
      }
    });

    // Expose toggle to global for native Android button call
    window.toggleSpotiFiakPanel = togglePanel;

    function getBundledRegistry() {
      return [
        // ── Thèmes ──
        { id:'theme-peach-sunset', name:'Peach Sunset', emoji:'🍑', description:'Thème officiel SpotiFiak aux accents pêche et corail lumineux. Couleurs chaleureuses et contrastes doux.', type:'theme', author:'SpotiFiak Team', version:'1.0.0', tags:['peach','coral','glow','officiel'], downloads:48200, rating:5.0, featured:true },
        { id:'theme-midnight-wave', name:'Midnight Wave', emoji:'🌊', description:'Thème sombre et élégant avec néons bleu nuit. Parfait pour écouter de la musique la nuit.', type:'theme', author:'SpotiFiak Team', version:'1.0.0', tags:['dark','neon','blue'], downloads:12450, rating:4.8 },
        { id:'theme-aurora-borealis', name:'Aurora Borealis', emoji:'🌌', description:'Dégradés dynamiques aurore verte et violette. Une explosion de couleurs inspirée du ciel nordique.', type:'theme', author:'NightCoder', version:'2.1.0', tags:['gradient','nature','aurora'], downloads:8930, rating:4.6 },
        { id:'theme-retro-synthwave', name:'Retro Synthwave', emoji:'🕹️', description:'Esthétique rétro-futuriste 80s néon magenta & cyan. Ambiance cyberpunk garantie.', type:'theme', author:'VaporDev', version:'1.3.0', tags:['retro','80s','neon','synthwave'], downloads:15200, rating:4.9 },
        { id:'theme-amoled-black', name:'AMOLED Pure Black', emoji:'🖤', description:'Noir 100% pur pour écrans OLED. Économie de batterie maximale avec un style minimal.', type:'theme', author:'OledDev', version:'1.0.0', tags:['amoled','minimal','battery'], downloads:29100, rating:4.9 },
        { id:'theme-forest-green', name:'Forest Green', emoji:'🌲', description:'Palette verte naturelle inspirée de la forêt. Apaisant et rafraîchissant.', type:'theme', author:'NatureDev', version:'1.1.0', tags:['green','nature','calm'], downloads:6700, rating:4.5 },
        { id:'theme-ocean-depth', name:'Ocean Depth', emoji:'🐋', description:'Bleus profonds et teintes aquatiques. Plongez dans les abysses sonores.', type:'theme', author:'DeepBlue', version:'1.0.0', tags:['ocean','deep','blue'], downloads:5200, rating:4.4 },
        { id:'theme-candy-pop', name:'Candy Pop', emoji:'🍬', description:'Couleurs vives et fun, rose bonbon et violet néon. Pour les amateurs de kpop et de bonne humeur.', type:'theme', author:'PopStar', version:'1.2.0', tags:['pink','fun','pop','colorful'], downloads:7800, rating:4.7 },
        // ── Extensions ──
        { id:'ext-lyrics-plus', name:'Lyrics+', emoji:'🎤', description:'Affichage des paroles synchronisées en temps réel directement dans le lecteur. Compatible avec LRClib et Musixmatch.', type:'extension', author:'LyricsMaster', version:'3.0.0', tags:['lyrics','karaoke','paroles'], downloads:25600, rating:4.7, featured:true },
        { id:'ext-visualizer', name:'Audio Visualizer', emoji:'📊', description:'Spectre visuel animé sur la barre de lecture. Barres colorées réactives à la musique.', type:'extension', author:'WaveForm', version:'2.0.0', tags:['visualizer','audio','spectrum'], downloads:18300, rating:4.5 },
        { id:'ext-sleep-timer', name:'Sleep Timer', emoji:'😴', description:'Minuteur de sommeil avec fondu doux du volume. Idéal pour s\'endormir en musique.', type:'extension', author:'DreamDev', version:'1.5.0', tags:['sleep','timer','night'], downloads:9800, rating:4.4 },
        { id:'ext-equalizer', name:'Equalizer Pro', emoji:'🎛️', description:'Égaliseur graphique 10 bandes avec presets audio optimisés (Bass Boost, Vocal, Concert, etc.).', type:'extension', author:'AudioTech', version:'1.8.0', tags:['equalizer','audio','bass'], downloads:11200, rating:4.6 },
        { id:'ext-stats-dashboard', name:'Stats Dashboard', emoji:'📈', description:'Statistiques détaillées de vos habitudes d\'écoute. Top artistes, genres, heures d\'écoute.', type:'extension', author:'DataViz', version:'2.0.0', tags:['stats','analytics','data'], downloads:14500, rating:4.6 },
        { id:'ext-queue-manager', name:'Queue Manager+', emoji:'📋', description:'Gestion avancée de la file d\'attente : réorganiser, supprimer, sauvegarder les queues.', type:'extension', author:'QueueDev', version:'1.3.0', tags:['queue','playlist','manage'], downloads:8900, rating:4.3 },
        { id:'ext-ad-skipper', name:'Smart Ad Skipper', emoji:'🚫', description:'Détection et passage automatique des interruptions publicitaires. Écoute sans interruption.', type:'extension', author:'AdBlock42', version:'2.5.0', tags:['ads','skip','block'], downloads:52000, rating:4.9, featured:true },
        { id:'ext-genre-playlists', name:'Genre Explorer', emoji:'🗺️', description:'Explorez la musique par genre avec des playlists auto-générées selon vos goûts.', type:'extension', author:'DiscoverDev', version:'1.0.0', tags:['genre','discover','explore'], downloads:4200, rating:4.2 },
      ];
    }

    function getFilteredAddons() {
      let items = addonRegistry.slice();

      // Filter by type
      if (filterType !== 'all') {
        items = items.filter(a => a.type === filterType);
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        items = items.filter(a =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.tags.some(t => t.toLowerCase().includes(q))
        );
      }

      // Sort
      switch (sortBy) {
        case 'popular': items.sort((a, b) => b.downloads - a.downloads); break;
        case 'rating': items.sort((a, b) => b.rating - a.rating); break;
        case 'name': items.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'newest': items.sort((a, b) => b.version.localeCompare(a.version)); break;
      }

      return items;
    }

    function formatDownloads(n) {
      if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
      return n.toString();
    }

    function renderPanel() {
      const installedCount = Object.keys(installedAddons).length;
      const totalAddons = addonRegistry.length;
      const themeCount = addonRegistry.filter(a => a.type === 'theme').length;
      const extCount = addonRegistry.filter(a => a.type === 'extension').length;

      let contentHtml = renderMarketplace();
      if (currentTab === 'installed') contentHtml = renderInstalled();
      else if (currentTab === 'custom-css') contentHtml = renderCustomCSS();
      else if (currentTab === 'settings') contentHtml = renderSettings();

      panel.innerHTML = `
        <div style="padding: 18px 16px 0; padding-top: max(18px, env(safe-area-inset-top));">
          <!-- Header with Peach Branding -->
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${PEACH_LOGO_SRC}" style="width:42px; height:42px; border-radius:50%; box-shadow:0 4px 16px rgba(255,110,110,0.4);" alt="SpotiFiak" onerror="this.style.display='none'" />
              <div>
                <h1 style="margin:0; font-size:1.4rem; font-weight:800; background:linear-gradient(135deg,#ff6e6e,#ffa07a); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
                  SpotiFiak
                </h1>
                <p style="margin:2px 0 0; font-size:0.72rem; color:#a0a0b0;">Spicetify Mobile • ${totalAddons} addons • ${installedCount} installé${installedCount > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button id="sf-close-btn" style="width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,0.08); border:none; color:#ffffff; font-size:1.1rem; cursor:pointer; display:flex; align-items:center; justify-content:center;">
              ✕
            </button>
          </div>

          <!-- Search Bar -->
          <div style="position:relative; margin-bottom:12px;">
            <input id="sf-search-input" type="text" placeholder="🔍 Rechercher thèmes, extensions, auteurs..." value="${searchQuery}" style="width:100%; height:40px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:20px; color:#fff; font-size:0.85rem; padding:0 16px 0 16px; box-sizing:border-box; outline:none; font-family:inherit; transition:border-color 0.2s;" />
          </div>

          <!-- Filter Pills -->
          <div style="display:flex; gap:6px; margin-bottom:8px; flex-wrap:wrap;">
            <button class="sf-filter-pill" data-filter="all" style="${filterPillStyle('all')}">Tout (${totalAddons})</button>
            <button class="sf-filter-pill" data-filter="theme" style="${filterPillStyle('theme')}">🎨 Thèmes (${themeCount})</button>
            <button class="sf-filter-pill" data-filter="extension" style="${filterPillStyle('extension')}">🧩 Extensions (${extCount})</button>
          </div>

          <!-- Sort + Navigation Tabs -->
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
            <div id="sf-tabs" style="display:flex; gap:6px; overflow-x:auto; scrollbar-width:none; flex:1;">
              <button class="sf-tab ${currentTab==='marketplace'?'sf-tab-active':''}" data-tab="marketplace" style="${tabStyle(currentTab==='marketplace')}">🏪 Boutique</button>
              <button class="sf-tab ${currentTab==='installed'?'sf-tab-active':''}" data-tab="installed" style="${tabStyle(currentTab==='installed')}">📦 Installés</button>
              <button class="sf-tab ${currentTab==='custom-css'?'sf-tab-active':''}" data-tab="custom-css" style="${tabStyle(currentTab==='custom-css')}">✏️ CSS</button>
              <button class="sf-tab ${currentTab==='settings'?'sf-tab-active':''}" data-tab="settings" style="${tabStyle(currentTab==='settings')}">⚙️ Réglages</button>
            </div>
            <select id="sf-sort-select" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#a0a0b0;font-size:0.72rem;padding:4px 8px;outline:none;cursor:pointer;margin-left:6px;">
              <option value="popular" ${sortBy==='popular'?'selected':''}>📈 Populaires</option>
              <option value="rating" ${sortBy==='rating'?'selected':''}>⭐ Notes</option>
              <option value="name" ${sortBy==='name'?'selected':''}>🔤 A-Z</option>
              <option value="newest" ${sortBy==='newest'?'selected':''}>🆕 Récents</option>
            </select>
          </div>
          ${latestUpdateInfo && latestUpdateInfo.isUpdateAvailable ? `
          <div id="sf-top-update-alert" style="background:linear-gradient(135deg,rgba(255,110,110,0.22),rgba(255,160,122,0.16));border:1px solid rgba(255,110,110,0.45);border-radius:12px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:1.2rem;">🚀</span>
              <div>
                <div style="font-size:0.8rem;font-weight:800;color:#fff;">Mise à jour v${(latestUpdateInfo.latestVersion || '').replace(/^v+/i, '')} disponible</div>
                <div style="font-size:0.7rem;color:#ffb0b0;">Installation directe en 1 clic sans désinstaller</div>
              </div>
            </div>
            <button id="sf-alert-update-btn" style="padding:6px 12px;border-radius:8px;background:linear-gradient(135deg,#ff6e6e,#ffa07a);border:none;color:#fff;font-weight:800;font-size:0.72rem;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px rgba(255,110,110,0.35);">
              Mettre à jour
            </button>
          </div>
          ` : ''}
        </div>

        <!-- Content Area -->
        <div id="sf-tab-content" style="padding: 0 16px 120px;">
          ${contentHtml}
        </div>
      `;

      // Bind close button
      document.getElementById('sf-close-btn').addEventListener('click', togglePanel);

      // Bind search
      const searchInput = document.getElementById('sf-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          updateTabContent();
        });
        searchInput.addEventListener('focus', () => {
          searchInput.style.borderColor = 'rgba(255,110,110,0.5)';
        });
        searchInput.addEventListener('blur', () => {
          searchInput.style.borderColor = 'rgba(255,255,255,0.1)';
        });
      }

      // Bind filter pills
      panel.querySelectorAll('.sf-filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          filterType = pill.dataset.filter;
          renderPanel();
        });
      });

      // Bind sort
      const sortSelect = document.getElementById('sf-sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          sortBy = e.target.value;
          updateTabContent();
        });
      }

      // Bind tab navigation
      panel.querySelectorAll('.sf-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          currentTab = tab.dataset.tab;
          panel.querySelectorAll('.sf-tab').forEach(t => {
            t.style.background = 'rgba(255,255,255,0.06)';
            t.style.color = '#a0a0b0';
            t.style.borderColor = 'transparent';
            t.classList.remove('sf-tab-active');
          });
          tab.style.background = 'rgba(255,110,110,0.15)';
          tab.style.color = '#ff6e6e';
          tab.style.borderColor = 'rgba(255,110,110,0.4)';
          tab.classList.add('sf-tab-active');
          updateTabContent(tab.dataset.tab);
        });
      });

      bindActions();
    }

    function updateTabContent(tabId) {
      if (tabId) currentTab = tabId;
      const activeTab = currentTab || 'marketplace';
      const content = panel.querySelector('#sf-tab-content');
      if (!content) return;

      switch(activeTab) {
        case 'marketplace': content.innerHTML = renderMarketplace(); break;
        case 'installed': content.innerHTML = renderInstalled(); break;
        case 'custom-css': content.innerHTML = renderCustomCSS(); break;
        case 'settings': content.innerHTML = renderSettings(); break;
      }
      bindActions();
    }

    function filterPillStyle(type) {
      const active = filterType === type;
      return `padding:6px 12px;border-radius:16px;font-size:0.75rem;font-weight:600;cursor:pointer;white-space:nowrap;border:1px solid ${active ? 'rgba(255,110,110,0.4)' : 'transparent'};background:${active ? 'rgba(255,110,110,0.15)' : 'rgba(255,255,255,0.04)'};color:${active ? '#ff6e6e' : '#8e8e9f'};transition:all 0.2s ease;font-family:inherit;`;
    }

    function tabStyle(active) {
      return `
        padding: 7px 12px; border-radius: 18px; font-size: 0.78rem; font-weight: 600;
        cursor: pointer; white-space: nowrap; border: 1px solid ${active ? 'rgba(255,110,110,0.4)' : 'transparent'};
        background: ${active ? 'rgba(255,110,110,0.15)' : 'rgba(255,255,255,0.06)'};
        color: ${active ? '#ff6e6e' : '#a0a0b0'}; transition: all 0.2s ease; font-family: inherit;
      `;
    }

    function renderMarketplace() {
      const items = getFilteredAddons();

      if (items.length === 0) {
        return `
          <div style="text-align:center; padding:40px 20px; color:#606070;">
            <div style="font-size:2.5rem; margin-bottom:12px;">🔍</div>
            <div style="font-size:0.9rem; font-weight:600; color:#8e8e9f;">Aucun résultat</div>
            <div style="font-size:0.78rem; margin-top:6px;">Essayez un autre mot-clé ou changez les filtres.</div>
          </div>
        `;
      }

      // Featured section (only on initial view with no search)
      let featuredHtml = '';
      if (!searchQuery.trim() && filterType === 'all') {
        const featured = addonRegistry.filter(a => a.featured);
        if (featured.length > 0) {
          featuredHtml = `
            <div style="margin-bottom:16px;">
              <div style="font-size:0.85rem; font-weight:700; color:#fff; margin-bottom:8px;">⭐ Mis en avant</div>
              <div style="display:flex; gap:10px; overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; padding-bottom:4px;">
                ${featured.map(a => {
                  const isInstalled = !!installedAddons[a.id];
                  return `
                    <div style="min-width:220px; background:linear-gradient(135deg,rgba(255,110,110,0.15),rgba(255,160,122,0.08)); border:1px solid rgba(255,110,110,0.25); border-radius:16px; padding:14px; flex-shrink:0;">
                      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                        <span style="font-size:1.4rem;">${a.emoji || ''}</span>
                        <div>
                          <div style="font-weight:700; font-size:0.9rem; color:white;">${a.name}</div>
                          <div style="font-size:0.68rem; color:#a0a0b0;">${a.author} • v${a.version}</div>
                        </div>
                      </div>
                      <div style="font-size:0.73rem; color:#9a9ab0; margin-bottom:10px; line-height:1.4;">${a.description.substring(0, 80)}${a.description.length > 80 ? '...' : ''}</div>
                      <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-size:0.68rem; color:#606070;">📥 ${formatDownloads(a.downloads)} • ⭐ ${a.rating}</div>
                        <button class="sf-action-btn" data-action="${a.type === 'theme' ? 'apply-theme' : 'toggle-ext'}" data-id="${a.id}" style="padding:6px 12px; border-radius:14px; border:none; font-weight:700; font-size:0.72rem; cursor:pointer; background:${isInstalled ? 'rgba(34,197,94,0.2)' : '#ff6e6e'}; color:${isInstalled ? '#22c55e' : '#0c0d14'}; font-family:inherit;">
                          ${isInstalled ? '✓' : 'Installer'}
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }
      }

      return `
        ${featuredHtml}
        <div style="font-size:0.8rem; color:#606070; margin-bottom:10px;">${items.length} résultat${items.length > 1 ? 's' : ''}</div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${items.map(a => renderAddonCard(a)).join('')}
        </div>
      `;
    }

    function renderAddonCard(a) {
      const isInstalled = !!installedAddons[a.id];
      const isTheme = a.type === 'theme';
      const activeTheme = SF.getStorage('active_theme_id', 'theme-peach-sunset');
      const isActive = isTheme && activeTheme === a.id;

      return `
        <div style="background:rgba(25,27,38,0.7); border:1px solid ${isActive ? '#ff6e6e' : 'rgba(255,255,255,0.06)'}; border-radius:14px; padding:14px; display:flex; align-items:flex-start; gap:12px; box-shadow:${isActive ? '0 0 16px rgba(255,110,110,0.15)' : 'none'}; transition:all 0.2s;">
          <div style="font-size:1.6rem; width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border-radius:10px; flex-shrink:0;">${a.emoji || (isTheme ? '🎨' : '🧩')}</div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span style="font-weight:700; font-size:0.92rem; color:white;">${a.name}</span>
              ${isActive ? '<span style="background:#ff6e6e; color:#0c0d14; font-size:0.6rem; font-weight:800; padding:2px 6px; border-radius:6px;">ACTIF</span>' : ''}
              ${a.featured ? '<span style="background:rgba(255,215,0,0.15); color:#ffd700; font-size:0.6rem; font-weight:800; padding:2px 6px; border-radius:6px;">★</span>' : ''}
              <span style="background:rgba(255,255,255,0.06); color:#8e8e9f; font-size:0.6rem; font-weight:600; padding:2px 6px; border-radius:6px;">${isTheme ? 'Thème' : 'Extension'}</span>
            </div>
            <div style="font-size:0.75rem; color:#9a9ab0; margin-top:4px; line-height:1.4;">${a.description}</div>
            <div style="display:flex; align-items:center; gap:10px; margin-top:6px; flex-wrap:wrap;">
              <span style="font-size:0.68rem; color:#606070;">Par ${a.author}</span>
              <span style="font-size:0.68rem; color:#606070;">v${a.version}</span>
              <span style="font-size:0.68rem; color:#606070;">📥 ${formatDownloads(a.downloads)}</span>
              <span style="font-size:0.68rem; color:#ffd700;">⭐ ${a.rating}</span>
            </div>
            <div style="display:flex; gap:4px; margin-top:6px; flex-wrap:wrap;">
              ${a.tags.slice(0, 4).map(t => '<span style="background:rgba(255,255,255,0.04);color:#7a7a90;font-size:0.62rem;padding:2px 6px;border-radius:8px;">#' + t + '</span>').join('')}
            </div>
          </div>
          <button class="sf-action-btn" data-action="${isTheme ? 'apply-theme' : 'toggle-ext'}" data-id="${a.id}" style="padding:8px 14px; border-radius:16px; border:none; font-weight:700; font-size:0.78rem; cursor:pointer; background:${isActive ? 'rgba(255,255,255,0.1)' : isInstalled ? 'rgba(34,197,94,0.2)' : '#ff6e6e'}; color:${isActive ? '#fff' : isInstalled ? '#22c55e' : '#0c0d14'}; flex-shrink:0; font-family:inherit; white-space:nowrap;">
            ${isActive ? 'Réappliquer' : isInstalled ? 'Activé ✓' : isTheme ? 'Appliquer' : 'Activer'}
          </button>
        </div>
      `;
    }

    function renderInstalled() {
      const installedIds = Object.keys(installedAddons);
      if (installedIds.length === 0) {
        return `
          <div style="text-align:center; padding:40px 20px; color:#606070;">
            <div style="font-size:2.5rem; margin-bottom:12px;">📦</div>
            <div style="font-size:0.9rem; font-weight:600; color:#8e8e9f;">Aucun addon installé</div>
            <div style="font-size:0.78rem; margin-top:6px;">Parcourez la boutique pour installer des thèmes et extensions.</div>
          </div>
        `;
      }

      const installed = addonRegistry.filter(a => installedIds.includes(a.id));
      return `
        <div style="font-size:0.85rem; color:#888; margin-bottom:12px;">
          ${installed.length} addon${installed.length > 1 ? 's' : ''} installé${installed.length > 1 ? 's' : ''} :
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${installed.map(a => {
            const isTheme = a.type === 'theme';
            const activeTheme = SF.getStorage('active_theme_id', 'theme-peach-sunset');
            const isActive = isTheme && activeTheme === a.id;
            return `
              <div style="background:rgba(25,27,38,0.7); border:1px solid ${isActive ? '#ff6e6e' : 'rgba(255,255,255,0.06)'}; border-radius:14px; padding:14px; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
                  <span style="font-size:1.3rem;">${a.emoji || ''}</span>
                  <div style="min-width:0;">
                    <div style="display:flex;align-items:center;gap:6px;">
                      <span style="font-weight:700; font-size:0.9rem; color:white;">${a.name}</span>
                      ${isActive ? '<span style="background:#ff6e6e;color:#0c0d14;font-size:0.6rem;font-weight:800;padding:2px 6px;border-radius:6px;">ACTIF</span>' : ''}
                    </div>
                    <div style="font-size:0.72rem; color:#606070; margin-top:2px;">${a.author} • v${a.version}</div>
                  </div>
                </div>
                <div style="display:flex; gap:6px; flex-shrink:0;">
                  ${isTheme ? '<button class="sf-action-btn" data-action="apply-theme" data-id="' + a.id + '" style="padding:6px 12px;border-radius:12px;border:none;font-weight:700;font-size:0.72rem;cursor:pointer;background:' + (isActive ? 'rgba(255,255,255,0.1)' : '#ff6e6e') + ';color:' + (isActive ? '#fff' : '#0c0d14') + ';font-family:inherit;">' + (isActive ? 'Actif' : 'Appliquer') + '</button>' : ''}
                  <button class="sf-action-btn" data-action="uninstall" data-id="${a.id}" style="padding:6px 12px;border-radius:12px;border:none;font-weight:700;font-size:0.72rem;cursor:pointer;background:rgba(239,68,68,0.15);color:#ef4444;font-family:inherit;">
                    Retirer
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    function renderCustomCSS() {
      const currentCSS = SF.getStorage('custom_user_css', '');
      return `
        <div style="font-size:0.85rem; color:#888; margin-bottom:10px;">
          Injectez vos propres règles CSS ou snippets Spicetify :
        </div>
        <textarea id="sf-custom-css-input" placeholder="/* Entrez votre CSS Spicetify ici... */\nbody { filter: contrast(105%); }" style="width:100%; height:200px; background:#12131b; border:1px solid rgba(255,110,110,0.3); border-radius:12px; color:#e0e0e0; font-family:monospace; font-size:12px; padding:12px; box-sizing:border-box; outline:none; resize:none;">${currentCSS}</textarea>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button id="sf-save-custom-css" style="flex:1; padding:10px; border-radius:12px; background:#ff6e6e; border:none; color:#0c0d14; font-weight:700; cursor:pointer; font-family:inherit;">
            Sauvegarder & Injecter
          </button>
          <button id="sf-clear-custom-css" style="padding:10px 16px; border-radius:12px; background:rgba(255,255,255,0.08); border:none; color:#aaa; font-weight:600; cursor:pointer; font-family:inherit;">
            Effacer
          </button>
        </div>
        <div style="margin-top:16px;">
          <div style="font-size:0.8rem; font-weight:700; color:#fff; margin-bottom:8px;">💡 Snippets rapides</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <button class="sf-snippet-btn" data-css="body { filter: saturate(120%) !important; }" style="text-align:left;padding:10px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#9a9ab0;font-size:0.75rem;cursor:pointer;font-family:monospace;">🎨 Saturation +20%</button>
            <button class="sf-snippet-btn" data-css="body { filter: contrast(110%) brightness(95%) !important; }" style="text-align:left;padding:10px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#9a9ab0;font-size:0.75rem;cursor:pointer;font-family:monospace;">🔲 Contraste amélioré</button>
            <button class="sf-snippet-btn" data-css=".main-card-card { border-radius: 20px !important; }" style="text-align:left;padding:10px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;color:#9a9ab0;font-size:0.75rem;cursor:pointer;font-family:monospace;">🟠 Cartes ultra-rondes</button>
          </div>
        </div>
      `;
    }

    function renderSettings() {
      const hasUpdate = latestUpdateInfo && latestUpdateInfo.isUpdateAvailable;
      const cleanLatestVer = (latestUpdateInfo?.latestVersion || '').replace(/^v+/i, '');
      const statusPillText = hasUpdate ? `v${cleanLatestVer} disponible !` : (isCheckingUpdate ? 'Vérification...' : 'À jour');
      const statusPillStyle = hasUpdate 
        ? 'background:rgba(255,110,110,0.2); color:#ff6e6e; border:1px solid rgba(255,110,110,0.5); font-weight:800;'
        : 'background:rgba(34,197,94,0.15); color:#22c55e; border:1px solid rgba(34,197,94,0.3);';

      return `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <!-- In-App Auto-Updater Card -->
          <div style="background:rgba(25,27,38,0.7); border:1px solid ${hasUpdate ? 'rgba(255,110,110,0.45)' : 'rgba(255,255,255,0.08)'}; border-radius:14px; padding:16px; position:relative; overflow:hidden;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.4rem;">🚀</span>
                <div>
                  <div style="font-weight:700; font-size:0.95rem;">Mises à jour SpotiFiak</div>
                  <div style="font-size:0.75rem; color:#888;">Version installée : <span style="color:#ff6e6e; font-weight:700;">v${currentAppVersion}</span></div>
                </div>
              </div>
              <span id="sf-update-status-pill" style="font-size:0.68rem; font-weight:700; padding:3px 8px; border-radius:10px; ${statusPillStyle}">
                ${statusPillText}
              </span>
            </div>
            
            <div id="sf-update-details" style="font-size:0.75rem; color:#a0a0b0; margin-bottom:12px; line-height:1.4;">
              ${hasUpdate 
                ? `Nouvelle version <b>v${latestUpdateInfo.latestVersion}</b> disponible ! Touchez "Mettre à jour" pour installer directement la mise à jour sans désinstaller l'application.`
                : 'Mettez à jour SpotiFiak directement depuis l\'application sans devoir désinstaller ni passer par un navigateur.'}
            </div>

            <!-- Progress bar container -->
            <div id="sf-update-progress-container" style="display:${isDownloadingUpdate ? 'block' : 'none'}; margin-bottom:12px;">
              <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:#ff6e6e; margin-bottom:4px; font-weight:600;">
                <span id="sf-update-progress-text">Téléchargement en cours...</span>
                <span id="sf-update-progress-percent">0%</span>
              </div>
              <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                <div id="sf-update-progress-bar" style="width:0%; height:100%; background:linear-gradient(90deg,#ff6e6e,#ffa07a); transition:width 0.2s;"></div>
              </div>
            </div>

            <div style="display:flex; gap:8px;">
              <button id="sf-check-update-btn" style="flex:1; padding:9px 14px; border-radius:10px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; font-weight:700; font-size:0.8rem; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:6px;">
                <span>🔄</span> ${isCheckingUpdate ? 'Vérification...' : 'Vérifier'}
              </button>
              ${hasUpdate ? `
              <button id="sf-install-update-btn" style="flex:1.2; padding:9px 14px; border-radius:10px; background:linear-gradient(135deg,#ff6e6e,#ffa07a); border:none; color:#fff; font-weight:800; font-size:0.8rem; cursor:pointer; font-family:inherit; box-shadow:0 4px 14px rgba(255,110,110,0.4); display:flex; align-items:center; justify-content:center; gap:6px;">
                <span>📥</span> Mettre à jour
              </button>
              ` : ''}
            </div>
          </div>

          <div style="background:rgba(25,27,38,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px;">
            <div style="font-weight:700; font-size:0.95rem; margin-bottom:4px;">📱 Affichage Mobile Optimisé</div>
            <div style="font-size:0.75rem; color:#888; margin-bottom:12px;">Adapte Spotify Desktop sur écran de téléphone (plein écran, barre de navigation tactile).</div>
            <button id="sf-toggle-library" style="padding:8px 14px; border-radius:10px; background:rgba(255,110,110,0.2); border:1px solid rgba(255,110,110,0.4); color:#ff6e6e; font-weight:700; font-size:0.8rem; cursor:pointer; font-family:inherit;">
              Ouvrir / Fermer le tiroir Bibliothèque
            </button>
          </div>

          <div style="background:rgba(25,27,38,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px;">
            <div style="font-weight:700; font-size:0.95rem; margin-bottom:4px;">🔄 Réinitialiser</div>
            <div style="font-size:0.75rem; color:#888; margin-bottom:12px;">Remet tous les paramètres à leurs valeurs d'origine.</div>
            <button id="sf-reset-all" style="padding:8px 14px; border-radius:10px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#ef4444; font-weight:700; font-size:0.8rem; cursor:pointer; font-family:inherit;">
              Tout réinitialiser
            </button>
          </div>

          <div style="background:rgba(25,27,38,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px;">
            <div style="font-weight:700; font-size:0.95rem; margin-bottom:4px;">ℹ️ À propos de SpotiFiak</div>
            <div style="font-size:0.78rem; color:#a0a0b0; line-height:1.6;">
              SpotiFiak v${currentAppVersion} • Client Spicetify Mobile pour Android.<br/>
              Inspiré de l'architecture WebView de SpotiDuck, avec gestion complète des thèmes et extensions.<br/><br/>
              <span style="color:#606070;">
                📜 Ce projet est open-source sous licence MIT.<br/>
                ⚠️ Non affilié à Spotify AB. Usage éducatif uniquement.<br/>
                🔒 Aucune donnée personnelle n'est collectée.<br/>
                🍑 Fait avec ❤️ par SatanMerde
              </span>
            </div>
          </div>
        </div>
      `;
    }

    function bindActions() {
      // Apply Theme buttons
      panel.querySelectorAll('[data-action="apply-theme"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const themeId = btn.dataset.id;
          applyTheme(themeId);
          if (!installedAddons[themeId]) {
            installedAddons[themeId] = { enabled: true, date: Date.now() };
            SF.setStorage('installed_addons', installedAddons);
          }
          renderPanel();
        });
      });

      // Toggle Extension buttons
      panel.querySelectorAll('[data-action="toggle-ext"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const extId = btn.dataset.id;
          toggleExtension(extId);
          renderPanel();
        });
      });

      // Uninstall buttons
      panel.querySelectorAll('[data-action="uninstall"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          delete installedAddons[id];
          SF.setStorage('installed_addons', installedAddons);
          SF.removeCSS('ext-' + id);
          SF.removeCSS('active-theme');
          SF.showNotification('Addon retiré', id);
          renderPanel();
        });
      });

      // Custom CSS
      const saveCssBtn = document.getElementById('sf-save-custom-css');
      if (saveCssBtn) {
        saveCssBtn.addEventListener('click', () => {
          const css = document.getElementById('sf-custom-css-input').value;
          SF.setStorage('custom_user_css', css);
          SF.injectCSS('user-custom', css);
          SF.showNotification('CSS Appliqué', 'Vos règles personnalisées sont actives !');
        });
      }

      const clearCssBtn = document.getElementById('sf-clear-custom-css');
      if (clearCssBtn) {
        clearCssBtn.addEventListener('click', () => {
          const input = document.getElementById('sf-custom-css-input');
          if (input) input.value = '';
          SF.setStorage('custom_user_css', '');
          SF.removeCSS('user-custom');
          SF.showNotification('CSS Réinitialisé', 'Le style personnalisé a été retiré.');
        });
      }

      // Snippet buttons
      panel.querySelectorAll('.sf-snippet-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const input = document.getElementById('sf-custom-css-input');
          if (input) {
            input.value = (input.value ? input.value + '\n' : '') + btn.dataset.css;
          }
        });
      });

      // Drawer toggle
      const toggleLibBtn = document.getElementById('sf-toggle-library');
      if (toggleLibBtn) {
        toggleLibBtn.addEventListener('click', () => {
          document.body.classList.toggle('sf-show-library');
          togglePanel();
        });
      }

      // Reset all
      const resetBtn = document.getElementById('sf-reset-all');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          SF.setStorage('active_theme_id', 'theme-peach-sunset');
          SF.setStorage('installed_addons', { 'theme-peach-sunset': { enabled: true, date: Date.now() } });
          SF.setStorage('custom_user_css', '');
          SF.removeCSS('user-custom');
          installedAddons = { 'theme-peach-sunset': { enabled: true, date: Date.now() } };
          applyTheme('theme-peach-sunset');
          SF.showNotification('Réinitialisé', 'Tous les paramètres ont été réinitialisés.');
          renderPanel();
        });
      }

      // Update buttons
      const checkUpdateBtn = document.getElementById('sf-check-update-btn');
      if (checkUpdateBtn) {
        checkUpdateBtn.addEventListener('click', () => {
          isCheckingUpdate = true;
          window._userRequestedUpdateCheck = true;
          renderPanel();
          if (window.SpotiFiakNative && window.SpotiFiakNative.checkForUpdates) {
            window.SpotiFiakNative.checkForUpdates();
          } else {
            fetch('https://api.github.com/repos/SatanMerde/SpotiFiak/releases/latest')
              .then(r => r.json())
              .then(data => {
                const latestTag = data.tag_name || 'v1.2.0';
                const hasUp = isVersionNewer(latestTag, currentAppVersion);
                let apkUrl = 'https://github.com/SatanMerde/SpotiFiak/releases/latest/download/SpotiFiak.apk';
                if (data.assets) {
                  const apkAsset = data.assets.find(a => a.name.endsWith('.apk'));
                  if (apkAsset) apkUrl = apkAsset.browser_download_url;
                }
                SF.onUpdateCheckResult({
                  isUpdateAvailable: hasUp,
                  latestVersion: latestTag.replace(/^v/, ''),
                  currentVersion: currentAppVersion,
                  title: data.name || latestTag,
                  releaseNotes: data.body || '',
                  apkDownloadUrl: apkUrl
                });
              })
              .catch(err => SF.onUpdateCheckError(err.message));
          }
        });
      }

      const triggerInstall = () => {
        if (!latestUpdateInfo || !latestUpdateInfo.apkDownloadUrl) return;
        isDownloadingUpdate = true;
        const progContainer = document.getElementById('sf-update-progress-container');
        if (progContainer) progContainer.style.display = 'block';
        if (window.SpotiFiakNative && window.SpotiFiakNative.downloadAndInstallUpdate) {
          window.SpotiFiakNative.downloadAndInstallUpdate(latestUpdateInfo.apkDownloadUrl);
        } else {
          window.open(latestUpdateInfo.apkDownloadUrl, '_blank');
        }
      };

      const installUpdateBtn = document.getElementById('sf-install-update-btn');
      if (installUpdateBtn) installUpdateBtn.addEventListener('click', triggerInstall);

      const alertUpdateBtn = document.getElementById('sf-alert-update-btn');
      if (alertUpdateBtn) alertUpdateBtn.addEventListener('click', triggerInstall);
    }

    function applyTheme(themeId) {
      SF.setStorage('active_theme_id', themeId);
      // Theme CSS files bundled directly in APK assets or injected inline
      const themeStyles = {
        'theme-peach-sunset': `
          :root { --spice-button:#ff6e6e!important; --spice-main:#0c0d14!important; }
          body, [data-testid="root"], div[data-testid="main-view"] { background: #0c0d14 !important; color: #fff !important; }
          [data-testid="control-button-playpause"], button[data-testid="play-button"], .main-playButton-PlayButton { background-color: #ff6e6e !important; color:#0c0d14!important; box-shadow:0 4px 18px rgba(255,110,110,0.5)!important; }
          .playback-progressbar-isInteractive .progress-bar__slider { background-color: #ff6e6e !important; }
          .main-card-card { border: 1px solid rgba(255,110,110,0.15) !important; background: rgba(22,24,34,0.7) !important; }
        `,
        'theme-midnight-wave': `
          :root { --spice-button:#00d4ff!important; --spice-main:#060814!important; }
          body, [data-testid="root"], div[data-testid="main-view"] { background: #060814 !important; color: #e0f2fe !important; }
          [data-testid="control-button-playpause"], button[data-testid="play-button"] { background-color: #00d4ff !important; color:#060814!important; box-shadow:0 4px 18px rgba(0,212,255,0.4)!important; }
        `,
        'theme-aurora-borealis': `
          body, [data-testid="root"], div[data-testid="main-view"] { background: linear-gradient(180deg, #09131c 0%, #0d091a 100%) !important; color: #f0fdf4 !important; }
          [data-testid="control-button-playpause"], button[data-testid="play-button"] { background-color: #22c55e !important; color:#09131c!important; box-shadow:0 4px 18px rgba(34,197,94,0.4)!important; }
        `,
        'theme-retro-synthwave': `
          body, [data-testid="root"], div[data-testid="main-view"] { background: #120422 !important; color: #ffd6f0 !important; }
          [data-testid="control-button-playpause"], button[data-testid="play-button"] { background-color: #ff007f !important; color:#fff!important; box-shadow:0 4px 20px rgba(255,0,127,0.5)!important; }
        `,
        'theme-amoled-black': `
          body, [data-testid="root"], div[data-testid="main-view"], .Root__now-playing-bar { background: #000000 !important; color: #ffffff !important; }
          [data-testid="control-button-playpause"], button[data-testid="play-button"] { background-color: #ffffff !important; color:#000!important; }
          .main-card-card { background: #070707 !important; border: 1px solid #1c1c1c !important; }
        `,
        'theme-forest-green': `
          body, [data-testid="root"], div[data-testid="main-view"] { background: #0a1a0a !important; color: #d4edda !important; }
          [data-testid="control-button-playpause"], button[data-testid="play-button"] { background-color: #2d6a4f !important; color:#d4edda!important; box-shadow:0 4px 18px rgba(45,106,79,0.4)!important; }
          .main-card-card { border: 1px solid rgba(45,106,79,0.2) !important; background: rgba(10,26,10,0.7) !important; }
        `,
        'theme-ocean-depth': `
          body, [data-testid="root"], div[data-testid="main-view"] { background: #020617 !important; color: #e0f7fa !important; }
          [data-testid="control-button-playpause"], button[data-testid="play-button"] { background-color: #0284c7 !important; color:#fff!important; box-shadow:0 4px 18px rgba(2,132,199,0.4)!important; }
        `,
        'theme-candy-pop': `
          body, [data-testid="root"], div[data-testid="main-view"] { background: #1a0a1a !important; color: #fce4ec !important; }
          [data-testid="control-button-playpause"], button[data-testid="play-button"] { background-color: #ec407a !important; color:#fff!important; box-shadow:0 4px 18px rgba(236,64,122,0.5)!important; }
          .main-card-card { border: 1px solid rgba(236,64,122,0.2) !important; }
        `
      };

      if (themeStyles[themeId]) {
        SF.injectCSS('active-theme', themeStyles[themeId]);
      }
      SF.showNotification('Thème Appliqué', addonRegistry.find(a => a.id === themeId)?.name || themeId);
    }

    function toggleExtension(extId) {
      if (installedAddons[extId]) {
        delete installedAddons[extId];
        SF.setStorage('installed_addons', installedAddons);
        SF.removeCSS('ext-' + extId);
        SF.showNotification('Extension Désactivée', extId);
      } else {
        installedAddons[extId] = { enabled: true, date: Date.now() };
        SF.setStorage('installed_addons', installedAddons);
        SF.showNotification('Extension Activée', extId);
      }
    }

    // ── Dedicated Mobile Search Bar ──
    function injectMobileSearchBar() {
      if (document.getElementById('sf-mobile-search-bar')) return;
      const bar = document.createElement('div');
      bar.id = 'sf-mobile-search-bar';
      bar.innerHTML = `
        <div class="sf-search-input-wrapper">
          <span class="sf-search-icon-prefix">🔍</span>
          <input type="text" id="sf-search-query-input" placeholder="Que souhaitez-vous écouter ?" autocomplete="off" />
          <button id="sf-search-clear-btn" class="sf-search-clear-btn" style="display:none;">✕</button>
        </div>
      `;
      document.body.appendChild(bar);

      const input = bar.querySelector('#sf-search-query-input');
      const clearBtn = bar.querySelector('#sf-search-clear-btn');

      function syncToSpotify(query) {
        // Try finding Spotify's internal React search input
        const spInput = document.querySelector('input[data-testid="search-input"]') || 
                        document.querySelector('#global-nav-bar input') ||
                        document.querySelector('form[role="search"] input');
        if (spInput) {
          try {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
            if (nativeSetter) {
              nativeSetter.call(spInput, query);
            } else {
              spInput.value = query;
            }
            spInput.dispatchEvent(new Event('input', { bubbles: true }));
            spInput.dispatchEvent(new Event('change', { bubbles: true }));
            spInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
          } catch(e) {}
        }
      }

      input.addEventListener('input', (e) => {
        const val = e.target.value;
        clearBtn.style.display = val ? 'flex' : 'none';
        syncToSpotify(val);
      });

      clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.style.display = 'none';
        syncToSpotify('');
        input.focus();
      });
    }

    function navigateToSearch(callback) {
      document.body.classList.remove('sf-show-library');
      document.body.classList.add('sf-page-search');
      setActiveNav('sf-nav-search');

      const searchBtn = document.querySelector('a[href="/search"]') || document.querySelector('[data-testid="search-button"]');
      if (searchBtn) {
        searchBtn.click();
      } else if (!window.location.pathname.startsWith('/search')) {
        window.history.pushState(null, '', '/search');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }

      setTimeout(() => {
        const barInput = document.getElementById('sf-search-query-input');
        if (barInput) barInput.focus();
        if (callback) callback();
      }, 300);
    }

    function injectBottomNav() {
      if (document.getElementById('sf-bottom-nav')) return;

      injectMobileSearchBar();

      const nav = document.createElement('nav');
      nav.id = 'sf-bottom-nav';
      nav.innerHTML = `
        <button class="sf-nav-item active" id="sf-nav-home">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h5v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6h5V7.577l-7.5-4.33z"/></svg>
          Accueil
        </button>
        <button class="sf-nav-item" id="sf-nav-search">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.279 7.407-7.279s7.407 3.273 7.407 7.279-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.279z"/></svg>
          Recherche
        </button>
        <button class="sf-nav-item" id="sf-nav-library">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 2.134a1 1 0 0 1 1 0l6 3.464a1 1 0 0 1 .5.866V21a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V3a1 1 0 0 1 .5-.866zM16 4.732V20h4V7.041l-4-2.309zM3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zm6 0a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1z"/></svg>
          Bibliothèque
        </button>
        <button class="sf-nav-item sf-nav-item-peach" id="sf-nav-spicetify">
          <img src="${PEACH_LOGO_SRC}" style="width:22px; height:22px; border-radius:50%; margin-bottom:2px;" alt="Spicetify" onerror="this.outerHTML='<span style=\\'font-size:20px; line-height:1;\\'>🍑</span>'" />
          Spicetify
        </button>
      `;

      document.body.appendChild(nav);

      document.getElementById('sf-nav-home').addEventListener('click', (e) => {
        e.preventDefault();
        setActiveNav('sf-nav-home');
        document.body.classList.remove('sf-show-library');
        document.body.classList.remove('sf-page-search');
        const homeBtn = document.querySelector('a[href="/"]') || document.querySelector('[data-testid="home-button"]');
        if (homeBtn) homeBtn.click();
        else if (window.location.pathname !== '/') {
          window.history.pushState(null, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      });

      document.getElementById('sf-nav-search').addEventListener('click', (e) => {
        e.preventDefault();
        navigateToSearch();
      });

      document.getElementById('sf-nav-library').addEventListener('click', (e) => {
        e.preventDefault();
        setActiveNav('sf-nav-library');
        document.body.classList.remove('sf-page-search');
        document.body.classList.toggle('sf-show-library');
        const libLink = document.querySelector('a[href="/collection"]') || 
                        document.querySelector('a[href="/collection/playlists"]') ||
                        document.querySelector('[data-testid="your-library"] a');
        if (libLink && !document.body.classList.contains('sf-show-library')) {
          libLink.click();
        }
      });

      document.getElementById('sf-nav-spicetify').addEventListener('click', (e) => {
        e.preventDefault();
        togglePanel();
      });

      // Media click watcher for play buttons and unauthenticated assistance
      document.addEventListener('click', (e) => {
        const playTarget = e.target.closest('[data-testid="play-button"]') ||
                           e.target.closest('.main-playButton-PlayButton') ||
                           e.target.closest('[data-testid="control-button-playpause"]') ||
                           e.target.closest('button[aria-label*="Lecture" i]') ||
                           e.target.closest('button[aria-label*="Play" i]');

        if (playTarget) {
          setTimeout(() => {
            document.querySelectorAll('audio').forEach(a => {
              if (a.paused && a.src) a.play().catch(() => {});
            });
          }, 150);

          const isLoggedOut = !document.querySelector('[data-testid="user-widget-link"]') && 
                              (document.querySelector('[data-testid="login-button"]') || document.querySelector('button[data-testid="signup-button"]'));
          if (isLoggedOut && !sessionStorage.getItem('sf_login_hint')) {
            showInAppToast('Connexion Spotify', 'Connectez-vous avec le bouton "Log in" (en haut à droite) pour débloquer l\'écoute complète et vos playlists !');
            sessionStorage.setItem('sf_login_hint', 'true');
          }
        }
      }, true);
    }

    function setActiveNav(id) {
      document.querySelectorAll('.sf-nav-item').forEach(el => el.classList.remove('active'));
      const target = document.getElementById(id);
      if (target) target.classList.add('active');
    }

    // Apply saved theme on start
    const savedTheme = SF.getStorage('active_theme_id', 'theme-peach-sunset');
    applyTheme(savedTheme);

    // Apply saved custom CSS on start
    const savedCustomCss = SF.getStorage('custom_user_css', '');
    if (savedCustomCss) {
      SF.injectCSS('user-custom', savedCustomCss);
    }

    // Auto-check for updates silently 3s after startup
    setTimeout(() => {
      if (window.SpotiFiakNative && window.SpotiFiakNative.checkForUpdates) {
        window.SpotiFiakNative.checkForUpdates();
      }
    }, 3000);
  }

  // Initialize once DOM is accessible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpotiFiak);
  } else {
    initSpotiFiak();
  }

  // Also retry periodically in case of client-side navigation or body re-mount
  setInterval(() => {
    if (!document.getElementById('sf-bottom-nav')) {
      initSpotiFiak();
    }
  }, 2000);
})();
