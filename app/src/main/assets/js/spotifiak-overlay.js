/**
 * SpotiFiak Overlay — Spicetify Mobile Center injected into Spotify Web Player
 * Includes the Peach Floating Action Button (🍑), Bottom Navigation Bar,
 * Marketplace UI, Live Theme Switcher, and Extensions.
 */
(function() {
  'use strict';

  function initSpotiFiak() {
    if (document.getElementById('spotifiak-fab')) return;
    if (!document.body) {
      setTimeout(initSpotiFiak, 200);
      return;
    }

    // Ensure SpotiFiak API is present or initialize fallback
    window.SpotiFiak = window.SpotiFiak || {
      version: '1.1.0',
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
          document.head.appendChild(el);
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
      }
    };

    const SF = window.SpotiFiak;
    let installedAddons = SF.getStorage('installed_addons', {
      'theme-peach-sunset': { enabled: true, date: Date.now() }
    });

    // ── 1. Floating Action Button with Peach Logo (🍑) ──
    const fab = document.createElement('button');
    fab.id = 'spotifiak-fab';
    fab.title = 'Ouvrir Spicetify Mobile';
    fab.innerHTML = `
      <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
        <svg viewBox="0 0 108 108" width="36" height="36" style="filter: drop-shadow(0 2px 8px rgba(255,110,110,0.6));">
          <!-- Leaf -->
          <path d="M54,34 C58,22 72,18 78,22 C78,28 72,36 58,38 Z" fill="#1DB954"/>
          <!-- Peach Lobe Left -->
          <path d="M54,36 C42,36 26,44 26,60 C26,76 42,88 54,88 C54,72 54,54 54,36 Z" fill="#FF6E6E"/>
          <!-- Peach Lobe Right -->
          <path d="M54,36 C66,36 82,44 82,60 C82,76 66,88 54,88 C54,72 54,54 54,36 Z" fill="#FFA07A"/>
          <!-- Cleft -->
          <path d="M54,36 C55,48 55,62 54,78" stroke="#E0485A" stroke-width="2" stroke-linecap="round"/>
          <!-- Sound waves -->
          <path d="M35,58 C42,54 50,54 58,58 C64,61 68,60 72,57" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" fill="none"/>
          <path d="M38,66 C44,63 50,63 56,66 C61,68 65,68 69,65" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/>
        </svg>
      </div>
    `;
    fab.style.cssText = `
      position: fixed; bottom: 72px; right: 16px; z-index: 99999;
      width: 54px; height: 54px; border-radius: 50%;
      background: rgba(14, 15, 23, 0.94); backdrop-filter: blur(14px);
      border: 2px solid rgba(255, 110, 110, 0.5);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(255, 110, 110, 0.3);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); padding: 0; outline: none;
    `;
    fab.addEventListener('click', togglePanel);
    document.body.appendChild(fab);

    // Draggable FAB
    let isDragging = false, startY = 0, startBottom = 72;
    fab.addEventListener('touchstart', (e) => {
      isDragging = false;
      startY = e.touches[0].clientY;
      startBottom = parseInt(fab.style.bottom) || 72;
    }, { passive: true });
    fab.addEventListener('touchmove', (e) => {
      const dy = startY - e.touches[0].clientY;
      if (Math.abs(dy) > 6) isDragging = true;
      const newBottom = Math.max(65, Math.min(window.innerHeight - 80, startBottom + dy));
      fab.style.bottom = newBottom + 'px';
    }, { passive: true });
    fab.addEventListener('touchend', (e) => {
      if (isDragging) e.preventDefault();
    });

    // ── 2. Mobile Bottom Navigation Bar ──
    injectBottomNav();

    // ── 3. Spicetify Mobile Panel Bottom Sheet ──
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

    function togglePanel() {
      if (isDragging) return;
      panelOpen = !panelOpen;
      panel.style.top = panelOpen ? '0' : '100%';
      fab.style.transform = panelOpen ? 'rotate(90deg)' : 'rotate(0)';
      fab.style.borderColor = panelOpen ? 'rgba(255, 110, 110, 0.9)' : 'rgba(255, 110, 110, 0.5)';
      if (panelOpen) renderPanel();
    }

    // Expose toggle to global for native Android button call
    window.toggleSpotiFiakPanel = togglePanel;

    function getBundledRegistry() {
      return [
        { id:'theme-peach-sunset', name:'Peach Sunset 🍑', description:'Thème officiel SpotiFiak aux accents pêche et corail lumineux.', type:'theme', author:'SpotiFiak Team', version:'1.0.0', tags:['peach','coral','glow'], downloads:48200, rating:5.0 },
        { id:'theme-midnight-wave', name:'Midnight Wave', description:'Thème sombre et élégant avec néons bleu nuit.', type:'theme', author:'SpotiFiak Team', version:'1.0.0', tags:['dark','neon'], downloads:12450, rating:4.8 },
        { id:'theme-aurora-borealis', name:'Aurora Borealis', description:'Dégradés dynamiques aurore verte et violette.', type:'theme', author:'NightCoder', version:'2.1.0', tags:['gradient','nature'], downloads:8930, rating:4.6 },
        { id:'theme-retro-synthwave', name:'Retro Synthwave', description:'Esthétique rétro-futuriste 80s néon magenta & cyan.', type:'theme', author:'VaporDev', version:'1.3.0', tags:['retro','80s'], downloads:15200, rating:4.9 },
        { id:'theme-amoled-black', name:'AMOLED Pure Black', description:'Noir 100% pur pour écran OLED et économie d\'énergie.', type:'theme', author:'OledDev', version:'1.0.0', tags:['amoled','minimal'], downloads:29100, rating:4.9 },
        { id:'ext-lyrics-plus', name:'Lyrics+', description:'Affichage des paroles synchronisées en temps réel.', type:'extension', author:'LyricsMaster', version:'3.0.0', tags:['lyrics','karaoke'], downloads:25600, rating:4.7 },
        { id:'ext-visualizer', name:'Audio Visualizer', description:'Spectre visuel animé sur la barre de lecture.', type:'extension', author:'WaveForm', version:'2.0.0', tags:['visualizer','audio'], downloads:18300, rating:4.5 },
        { id:'ext-sleep-timer', name:'Sleep Timer', description:'Minuteur de sommeil avec fondu doux du volume.', type:'extension', author:'DreamDev', version:'1.5.0', tags:['sleep','timer'], downloads:9800, rating:4.4 },
        { id:'ext-equalizer', name:'Equalizer Pro', description:'Égaliseur graphique avec presets audio optimisés.', type:'extension', author:'AudioTech', version:'1.8.0', tags:['equalizer','audio'], downloads:11200, rating:4.6 }
      ];
    }

    function renderPanel() {
      const installedCount = Object.keys(installedAddons).length;
      panel.innerHTML = `
        <div style="padding: 18px 16px 0; padding-top: max(18px, env(safe-area-inset-top));">
          <!-- Header with Peach Branding -->
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg, #ff6e6e, #ffa07a); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(255,110,110,0.4);">
                <span style="font-size:24px;">🍑</span>
              </div>
              <div>
                <h1 style="margin:0; font-size:1.4rem; font-weight:800; background:linear-gradient(135deg,#ff6e6e,#ffa07a); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
                  SpotiFiak
                </h1>
                <p style="margin:2px 0 0; font-size:0.75rem; color:#a0a0b0;">Spicetify Mobile • Personnalisation Spotify</p>
              </div>
            </div>
            <button id="sf-close-btn" style="width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,0.08); border:none; color:#ffffff; font-size:1.1rem; cursor:pointer; display:flex; align-items:center; justify-content:center;">
              ✕
            </button>
          </div>

          <!-- Navigation Tabs -->
          <div id="sf-tabs" style="display:flex; gap:6px; margin-bottom:16px; overflow-x:auto; scrollbar-width:none;">
            <button class="sf-tab sf-tab-active" data-tab="themes" style="${tabStyle(true)}">🎨 Thèmes</button>
            <button class="sf-tab" data-tab="extensions" style="${tabStyle(false)}">🧩 Extensions</button>
            <button class="sf-tab" data-tab="custom-css" style="${tabStyle(false)}">✏️ CSS Perso</button>
            <button class="sf-tab" data-tab="settings" style="${tabStyle(false)}">⚙️ Réglages</button>
          </div>
        </div>

        <!-- Content Area -->
        <div id="sf-tab-content" style="padding: 0 16px 120px;">
          ${renderThemes()}
        </div>
      `;

      document.getElementById('sf-close-btn').addEventListener('click', togglePanel);

      panel.querySelectorAll('.sf-tab').forEach(tab => {
        tab.addEventListener('click', () => {
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

          const content = panel.querySelector('#sf-tab-content');
          switch(tab.dataset.tab) {
            case 'themes': content.innerHTML = renderThemes(); break;
            case 'extensions': content.innerHTML = renderExtensions(); break;
            case 'custom-css': content.innerHTML = renderCustomCSS(); break;
            case 'settings': content.innerHTML = renderSettings(); break;
          }
          bindActions();
        });
      });

      bindActions();
    }

    function tabStyle(active) {
      return `
        padding: 8px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 600;
        cursor: pointer; white-space: nowrap; border: 1px solid ${active ? 'rgba(255,110,110,0.4)' : 'transparent'};
        background: ${active ? 'rgba(255,110,110,0.15)' : 'rgba(255,255,255,0.06)'};
        color: ${active ? '#ff6e6e' : '#a0a0b0'}; transition: all 0.2s ease;
      `;
    }

    function renderThemes() {
      const themes = addonRegistry.filter(a => a.type === 'theme');
      const activeTheme = SF.getStorage('active_theme_id', 'theme-peach-sunset');

      return `
        <div style="margin-bottom:12px; font-size:0.85rem; color:#888;">
          Sélectionnez un thème pour transformer instantanément l'apparence de Spotify :
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${themes.map(t => {
            const isActive = activeTheme === t.id;
            return `
              <div style="background:rgba(25,27,38,0.7); border:1px solid ${isActive ? '#ff6e6e' : 'rgba(255,255,255,0.08)'}; border-radius:14px; padding:14px; display:flex; align-items:center; justify-content:space-between; box-shadow:${isActive ? '0 0 16px rgba(255,110,110,0.2)' : 'none'};">
                <div style="max-width:70%;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-weight:700; font-size:0.95rem; color:white;">${t.name}</span>
                    ${isActive ? '<span style="background:#ff6e6e; color:#0c0d14; font-size:0.65rem; font-weight:800; padding:2px 6px; border-radius:6px;">ACTIF</span>' : ''}
                  </div>
                  <div style="font-size:0.75rem; color:#9a9ab0; margin-top:3px;">${t.description}</div>
                  <div style="font-size:0.68rem; color:#606070; margin-top:4px;">Par ${t.author} • ⭐ ${t.rating}</div>
                </div>
                <button class="sf-action-btn" data-action="apply-theme" data-id="${t.id}" style="padding:8px 16px; border-radius:18px; border:none; font-weight:700; font-size:0.8rem; cursor:pointer; background:${isActive ? 'rgba(255,255,255,0.1)' : '#ff6e6e'}; color:${isActive ? '#fff' : '#0c0d14'};">
                  ${isActive ? 'Réappliquer' : 'Appliquer'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    function renderExtensions() {
      const exts = addonRegistry.filter(a => a.type === 'extension');
      return `
        <div style="margin-bottom:12px; font-size:0.85rem; color:#888;">
          Activez ou désactivez les extensions Spicetify Mobile en un clic :
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${exts.map(e => {
            const isInstalled = !!installedAddons[e.id];
            return `
              <div style="background:rgba(25,27,38,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:14px; display:flex; align-items:center; justify-content:space-between;">
                <div style="max-width:72%;">
                  <div style="font-weight:700; font-size:0.95rem; color:white;">${e.name}</div>
                  <div style="font-size:0.75rem; color:#9a9ab0; margin-top:3px;">${e.description}</div>
                  <div style="font-size:0.68rem; color:#606070; margin-top:4px;">Par ${e.author} • ⭐ ${e.rating}</div>
                </div>
                <button class="sf-action-btn" data-action="toggle-ext" data-id="${e.id}" style="padding:8px 14px; border-radius:18px; border:none; font-weight:700; font-size:0.78rem; cursor:pointer; background:${isInstalled ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)'}; color:${isInstalled ? '#22c55e' : '#fff'};">
                  ${isInstalled ? 'Activé ✓' : 'Activer'}
                </button>
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
          <button id="sf-save-custom-css" style="flex:1; padding:10px; border-radius:12px; background:#ff6e6e; border:none; color:#0c0d14; font-weight:700; cursor:pointer;">
            Sauvegarder & Injecter
          </button>
          <button id="sf-clear-custom-css" style="padding:10px 16px; border-radius:12px; background:rgba(255,255,255,0.08); border:none; color:#aaa; font-weight:600; cursor:pointer;">
            Effacer
          </button>
        </div>
      `;
    }

    function renderSettings() {
      return `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="background:rgba(25,27,38,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px;">
            <div style="font-weight:700; font-size:0.95rem; margin-bottom:4px;">Affichage Mobile Optimisé</div>
            <div style="font-size:0.75rem; color:#888; margin-bottom:12px;">Adapte Spotify Desktop sur écran de téléphone (plein écran, barre de navigation tactile).</div>
            <button id="sf-toggle-library" style="padding:8px 14px; border-radius:10px; background:rgba(255,110,110,0.2); border:1px solid rgba(255,110,110,0.4); color:#ff6e6e; font-weight:700; font-size:0.8rem; cursor:pointer;">
              Ouvrir / Fermer le tiroir Bibliothèque
            </button>
          </div>

          <div style="background:rgba(25,27,38,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px;">
            <div style="font-weight:700; font-size:0.95rem; margin-bottom:4px;">À propos de SpotiFiak</div>
            <div style="font-size:0.78rem; color:#a0a0b0; line-height:1.5;">
              SpotiFiak v1.1.0 • Client Spicetify Mobile pour Android.<br/>
              Inspiré de l'architecture WebView et MediaSession, avec gestion complète des thèmes et extensions.
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
          document.getElementById('sf-custom-css-input').value = '';
          SF.setStorage('custom_user_css', '');
          SF.removeCSS('user-custom');
          SF.showNotification('CSS Réinitialisé', 'Le style personnalisé a été retiré.');
        });
      }

      // Drawer toggle
      const toggleLibBtn = document.getElementById('sf-toggle-library');
      if (toggleLibBtn) {
        toggleLibBtn.addEventListener('click', () => {
          document.body.classList.toggle('sf-show-library');
          togglePanel();
        });
      }
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
        `
      };

      if (themeStyles[themeId]) {
        SF.injectCSS('active-theme', themeStyles[themeId]);
      }
      SF.showNotification('Thème Appliqué', 'Thème activé avec succès !');
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

    function injectBottomNav() {
      if (document.getElementById('sf-bottom-nav')) return;

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
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1.5-.866l-5 3zM8.5 2.134A1 1 0 0 0 7 3v18a1 1 0 0 0 1.5.866l5-3A1 1 0 0 0 14 18V3a1 1 0 0 0-1.5-.866l-4 2.4z"/></svg>
          Bibliothèque
        </button>
        <button class="sf-nav-item sf-nav-item-peach" id="sf-nav-spicetify">
          <span style="font-size:20px; line-height:1;">🍑</span>
          Spicetify
        </button>
      `;

      document.body.appendChild(nav);

      document.getElementById('sf-nav-home').addEventListener('click', () => {
        setActiveNav('sf-nav-home');
        document.body.classList.remove('sf-show-library');
        const homeBtn = document.querySelector('a[href="/"]') || document.querySelector('[data-testid="home-button"]');
        if (homeBtn) homeBtn.click();
        else window.location.href = 'https://open.spotify.com/';
      });

      document.getElementById('sf-nav-search').addEventListener('click', () => {
        setActiveNav('sf-nav-search');
        document.body.classList.remove('sf-show-library');
        const searchBtn = document.querySelector('a[href="/search"]') || document.querySelector('[data-testid="search-button"]');
        if (searchBtn) searchBtn.click();
        else window.location.href = 'https://open.spotify.com/search';
      });

      document.getElementById('sf-nav-library').addEventListener('click', () => {
        setActiveNav('sf-nav-library');
        document.body.classList.toggle('sf-show-library');
      });

      document.getElementById('sf-nav-spicetify').addEventListener('click', () => {
        togglePanel();
      });
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
  }

  // Initialize once DOM is accessible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpotiFiak);
  } else {
    initSpotiFiak();
  }

  // Also retry periodically in case of client-side navigation or body re-mount
  setInterval(() => {
    if (!document.getElementById('spotifiak-fab')) {
      initSpotiFiak();
    }
  }, 2000);
})();
