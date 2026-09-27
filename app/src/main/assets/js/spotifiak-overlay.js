/**
 * SpotiFiak Overlay — Spicetify Mobile Center injected into Spotify Web Player
 * Includes the Peach Floating Action Button (🍑), Bottom Navigation Bar,
 * Marketplace UI, Live Theme Switcher, and Extensions.
 */
(function() {
  'use strict';

  const PEACH_LOGO_SRC = 'data:image/png;base64,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';

  function initSpotiFiak() {
    if (document.getElementById('spotifiak-panel')) return;
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
    const currentAppVersion = (window.SpotiFiakNative && (window.SpotiFiakNative.getAppVersion || window.SpotiFiakNative.getVersion))
      ? (window.SpotiFiakNative.getAppVersion ? window.SpotiFiakNative.getAppVersion() : window.SpotiFiakNative.getVersion())
      : '1.4.3';
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

    SF.onUpdateAvailable = function(latestVersion, releaseNotes, apkDownloadUrl) {
      isCheckingUpdate = false;
      latestUpdateInfo = {
        isUpdateAvailable: true,
        latestVersion: latestVersion,
        releaseNotes: releaseNotes || '',
        apkDownloadUrl: apkDownloadUrl || 'https://github.com/SatanMerde/SpotiFiak/releases/latest/download/SpotiFiak.apk',
        currentVersion: currentAppVersion
      };
      showInAppToast('Mise à jour disponible 🚀', 'La version v' + (latestVersion || '').replace(/^v+/i, '') + ' est disponible !');
      if (panelOpen) renderPanel();
    };

    SF.onNoUpdateAvailable = function() {
      isCheckingUpdate = false;
      latestUpdateInfo = {
        isUpdateAvailable: false,
        latestVersion: currentAppVersion,
        currentVersion: currentAppVersion
      };
      if (window._userRequestedUpdateCheck) {
        showInAppToast('SpotiFiak à jour ✨', 'Vous utilisez déjà la dernière version (v' + currentAppVersion + ')');
        window._userRequestedUpdateCheck = false;
      }
      if (panelOpen) renderPanel();
    };

    SF.onUpdateCheckResult = function(info) {
      isCheckingUpdate = false;
      if (info && info.isUpdateAvailable) {
        SF.onUpdateAvailable(info.latestVersion, info.releaseNotes, info.apkDownloadUrl);
      } else {
        SF.onNoUpdateAvailable();
      }
    };

    SF.onUpdateError = function(err) {
      isCheckingUpdate = false;
      isDownloadingUpdate = false;
      if (window._userRequestedUpdateCheck) {
        showInAppToast('Mises à jour', err || 'Erreur lors de la vérification');
        window._userRequestedUpdateCheck = false;
      }
      if (panelOpen) renderPanel();
    };
    SF.onUpdateCheckError = SF.onUpdateError;

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

    // ── 1. Floating SpotiFiak Peach Button ──
    injectFloatingButton();

    // ── 2. SpotiFiak Mobile Panel Bottom Sheet ──
    const panel = document.createElement('div');
    panel.id = 'spotifiak-panel';
    panel.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; top: 100%;
      background: rgba(14, 15, 22, 0.98); backdrop-filter: blur(32px);
      -webkit-backdrop-filter: blur(32px);
      z-index: 99999; transition: top 0.32s cubic-bezier(0.16, 1, 0.3, 1);
      overflow-y: auto; -webkit-overflow-scrolling: touch;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: white; border-top: 1px solid rgba(255, 110, 110, 0.3);
      border-radius: 24px 24px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,0.7);
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
      if (panelOpen) {
        renderPanel();
      }
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

    // Run header watcher immediately and on DOM changes
    replaceHeaderLogo();
    let watchTimeout = null;
    const headerObserver = new MutationObserver(() => {
      if (watchTimeout) return;
      watchTimeout = setTimeout(() => {
        replaceHeaderLogo();
        watchTimeout = null;
      }, 300);
    });
    headerObserver.observe(document.documentElement, { childList: true, subtree: true });

    // Expose toggle to global for native Android button call
    window.toggleSpotiFiakPanel = togglePanel;
    window.SpotiFiak = window.SpotiFiak || {};
    window.SpotiFiak.togglePanel = togglePanel;

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
        <div style="padding: 12px 16px 0; padding-top: max(12px, env(safe-area-inset-top));">
          <!-- Sheet Drag Handle -->
          <div style="width:40px; height:4px; border-radius:2px; background:rgba(255,255,255,0.25); margin:0 auto 14px;"></div>

          <!-- Header with Official Peach Logo & Title -->
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${PEACH_LOGO_SRC}" style="width:42px; height:42px; border-radius:50%; box-shadow:0 4px 16px rgba(255,110,110,0.45); filter:drop-shadow(0 2px 8px rgba(255,110,110,0.3));" alt="SpotiFiak" />
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <h1 style="margin:0; font-size:1.45rem; font-weight:900; background:linear-gradient(135deg,#ff6e6e,#ffa07a); -webkit-background-clip:text; -webkit-text-fill-color:transparent; letter-spacing:-0.5px;">
                    SpotiFiak
                  </h1>
                  <span style="background:rgba(255,110,110,0.18); border:1px solid rgba(255,110,110,0.35); color:#ffa07a; font-size:0.65rem; font-weight:800; padding:2px 8px; border-radius:10px;">v1.4.3</span>
                </div>
                <p style="margin:2px 0 0; font-size:0.75rem; color:#a0a0b0;">SpotiFiak Hub • ${totalAddons} addons • ${installedCount} actif${installedCount > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button id="sf-close-btn" style="width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,0.08); border:none; color:#ffffff; font-size:1.1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s;">
              ✕
            </button>
          </div>

          <!-- Top Update Banner if update available -->
          ${latestUpdateInfo && latestUpdateInfo.isUpdateAvailable ? `
          <div id="sf-top-update-alert" style="background:linear-gradient(135deg,rgba(255,110,110,0.22),rgba(255,160,122,0.16));border:1px solid rgba(255,110,110,0.45);border-radius:14px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:1.4rem;">🚀</span>
              <div>
                <div style="font-size:0.85rem;font-weight:800;color:#fff;">Mise à jour v${(latestUpdateInfo.latestVersion || '').replace(/^v+/i, '')} disponible</div>
                <div style="font-size:0.72rem;color:#ffb0b0;">Installation directe en 1 clic sans désinstaller</div>
              </div>
            </div>
            <button id="sf-alert-update-btn" style="padding:7px 14px;border-radius:10px;background:linear-gradient(135deg,#ff6e6e,#ffa07a);border:none;color:#fff;font-weight:800;font-size:0.75rem;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px rgba(255,110,110,0.35);">
              Mettre à jour
            </button>
          </div>
          ` : ''}

          <!-- Elegant Segmented Tab Bar -->
          <div id="sf-tabs" style="display:grid; grid-template-columns:repeat(4,1fr); background:rgba(255,255,255,0.06); border-radius:14px; padding:4px; margin-bottom:14px; gap:4px;">
            <button class="sf-tab ${currentTab==='marketplace'?'sf-tab-active':''}" data-tab="marketplace" style="${tabStyle(currentTab==='marketplace')}">🏪 Boutique</button>
            <button class="sf-tab ${currentTab==='installed'?'sf-tab-active':''}" data-tab="installed" style="${tabStyle(currentTab==='installed')}">📦 Mes Addons</button>
            <button class="sf-tab ${currentTab==='custom-css'?'sf-tab-active':''}" data-tab="custom-css" style="${tabStyle(currentTab==='custom-css')}">🎨 Style/CSS</button>
            <button class="sf-tab ${currentTab==='settings'?'sf-tab-active':''}" data-tab="settings" style="${tabStyle(currentTab==='settings')}">⚙️ Réglages</button>
          </div>
        </div>

        <!-- Content Area -->
        <div id="sf-tab-content" style="padding: 0 16px 120px;">
          ${contentHtml}
        </div>
      `;

      // Bind close button
      document.getElementById('sf-close-btn').addEventListener('click', togglePanel);

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
      const themeCount = addonRegistry.filter(a => a.type === 'theme').length;
      const extCount = addonRegistry.filter(a => a.type === 'extension').length;

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
        <!-- Search Bar -->
        <div style="position:relative; margin-bottom:10px;">
          <input id="sf-search-input" type="text" placeholder="🔍 Rechercher thèmes, extensions, auteurs..." value="${searchQuery}" style="width:100%; height:38px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff; font-size:0.82rem; padding:0 14px; box-sizing:border-box; outline:none; font-family:inherit; transition:border-color 0.2s;" />
        </div>

        <!-- Filter Pills & Sort Selector -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; gap:8px;">
          <div style="display:flex; gap:6px; flex-wrap:wrap; flex:1;">
            <button class="sf-filter-pill" data-filter="all" style="${filterPillStyle('all')}">Tout (${addonRegistry.length})</button>
            <button class="sf-filter-pill" data-filter="theme" style="${filterPillStyle('theme')}">🎨 Thèmes (${themeCount})</button>
            <button class="sf-filter-pill" data-filter="extension" style="${filterPillStyle('extension')}">🧩 Extensions (${extCount})</button>
          </div>
          <select id="sf-sort-select" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#a0a0b0; font-size:0.72rem; padding:5px 8px; outline:none; cursor:pointer;">
            <option value="popular" ${sortBy==='popular'?'selected':''}>📈 Populaires</option>
            <option value="rating" ${sortBy==='rating'?'selected':''}>⭐ Notes</option>
            <option value="name" ${sortBy==='name'?'selected':''}>🔤 A-Z</option>
            <option value="newest" ${sortBy==='newest'?'selected':''}>🆕 Récents</option>
          </select>
        </div>

        ${featuredHtml}

        ${items.length === 0 ? `
          <div style="text-align:center; padding:40px 20px; color:#606070;">
            <div style="font-size:2.5rem; margin-bottom:12px;">🔍</div>
            <div style="font-size:0.9rem; font-weight:600; color:#8e8e9f;">Aucun résultat</div>
            <div style="font-size:0.78rem; margin-top:6px;">Essayez un autre mot-clé ou changez les filtres.</div>
          </div>
        ` : `
          <div style="font-size:0.8rem; color:#606070; margin-bottom:10px;">${items.length} résultat${items.length > 1 ? 's' : ''}</div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${items.map(a => renderAddonCard(a)).join('')}
          </div>
        `}
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
          Injectez vos propres règles CSS ou snippets SpotiFiak :
        </div>
        <textarea id="sf-custom-css-input" placeholder="/* Entrez votre CSS SpotiFiak ici... */\nbody { filter: contrast(105%); }" style="width:100%; height:200px; background:#12131b; border:1px solid rgba(255,110,110,0.3); border-radius:12px; color:#e0e0e0; font-family:monospace; font-size:12px; padding:12px; box-sizing:border-box; outline:none; resize:none;">${currentCSS}</textarea>
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
                  <div style="font-size:0.75rem; color:#888;">Version installée : <span style="color:#ff6e6e; font-weight:700;">v${currentAppVersion}</span> <span style="background:rgba(255,165,0,0.15); color:#ffa726; border:1px solid rgba(255,165,0,0.35); font-size:0.62rem; padding:1px 6px; border-radius:10px; font-weight:600;">EN DÉV (WIP)</span></div>
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
              SpotiFiak v${currentAppVersion} <span style="color:#ffa726; font-weight:600;">(Version en développement actif • Alpha)</span> • Client SpotiFiak Mobile pour Android.<br/>
              Inspiré de l'architecture WebView de SpotiDuck, avec gestion complète des thèmes et extensions.<br/><br/>
              <span style="color:#606070;">
                🚧 Projet en cours de développement actif (WIP). Mises à jour régulières.<br/>
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
      // Marketplace Search
      const searchInput = document.getElementById('sf-search-input');
      if (searchInput) {
        let debounceTimer = null;
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            updateTabContent('marketplace');
          }, 250);
        });
        searchInput.addEventListener('focus', () => {
          searchInput.style.borderColor = 'rgba(255,110,110,0.5)';
        });
        searchInput.addEventListener('blur', () => {
          searchInput.style.borderColor = 'rgba(255,255,255,0.1)';
        });
      }

      // Marketplace Filter Pills
      panel.querySelectorAll('.sf-filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          filterType = pill.dataset.filter;
          updateTabContent('marketplace');
        });
      });

      // Marketplace Sort
      const sortSelect = document.getElementById('sf-sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          sortBy = e.target.value;
          updateTabContent('marketplace');
        });
      }

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

    // ── Floating Action Button (Peach) ──
    function injectFloatingButton() {
      if (document.getElementById('sf-floating-btn')) return;
      const btn = document.createElement('button');
      btn.id = 'sf-floating-btn';
      btn.setAttribute('aria-label', 'Ouvrir SpotiFiak');
      btn.innerHTML = `<img src="${PEACH_LOGO_SRC}" style="width:26px; height:26px; border-radius:50%; pointer-events:none;" alt="🍑" />`;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePanel();
      });
      (document.body || document.documentElement).appendChild(btn);
    }

    // Media click watcher for unauthenticated assistance
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

  // Ensure SpotiFiak panel is present
  setInterval(() => {
    if (!document.getElementById('spotifiak-panel')) {
      initSpotiFiak();
    }
  }, 2000);
})();
