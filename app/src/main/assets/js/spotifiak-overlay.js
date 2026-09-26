/**
 * SpotiFiak Overlay — Floating UI injected on top of Spotify Web Player
 * Provides the Marketplace button, addon panel, and settings
 * Injected directly into Spotify's DOM
 */
(function() {
  'use strict';

  if (document.getElementById('spotifiak-fab')) return;

  const SF = window.SpotiFiak;
  if (!SF) return;

  // ── Registry URL (served by the companion server, or bundled) ──
  const REGISTRY_URL = 'https://raw.githubusercontent.com/SatanMerde/SpotiFiak/main/addons/registry.json';
  let addonRegistry = [];
  let installedAddons = SF.getStorage('installed_addons', {});

  // ── Floating Action Button ──
  const fab = document.createElement('button');
  fab.id = 'spotifiak-fab';
  fab.innerHTML = `
    <svg viewBox="0 0 100 100" width="28" height="28">
      <defs><linearGradient id="sfg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1db954"/><stop offset="100%" style="stop-color:#1ed760"/>
      </linearGradient></defs>
      <circle cx="50" cy="50" r="45" fill="url(#sfg)"/>
      <path d="M35 38C35 38 55 30 70 38" stroke="white" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M37 48C37 48 54 42 66 48" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M39 57C39 57 52 52 62 57" stroke="white" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    </svg>
  `;
  fab.style.cssText = `
    position: fixed; bottom: 90px; right: 16px; z-index: 99999;
    width: 56px; height: 56px; border-radius: 50%;
    background: rgba(18,18,18,0.9); backdrop-filter: blur(10px);
    border: 2px solid rgba(29,185,84,0.4);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    transition: all 0.3s ease; padding: 0;
  `;
  fab.addEventListener('click', togglePanel);
  document.body.appendChild(fab);

  // Make FAB draggable
  let isDragging = false, startY = 0, startBottom = 90;
  fab.addEventListener('touchstart', (e) => {
    isDragging = false;
    startY = e.touches[0].clientY;
    startBottom = parseInt(fab.style.bottom) || 90;
  }, { passive: true });
  fab.addEventListener('touchmove', (e) => {
    const dy = startY - e.touches[0].clientY;
    if (Math.abs(dy) > 5) isDragging = true;
    const newBottom = Math.max(20, Math.min(window.innerHeight - 80, startBottom + dy));
    fab.style.bottom = newBottom + 'px';
  }, { passive: true });
  fab.addEventListener('touchend', (e) => {
    if (isDragging) e.preventDefault();
  });

  // ── Panel ──
  const panel = document.createElement('div');
  panel.id = 'spotifiak-panel';
  panel.style.cssText = `
    position: fixed; bottom: 0; left: 0; right: 0; top: 100%;
    background: rgba(10,10,10,0.97); backdrop-filter: blur(25px);
    z-index: 99998; transition: top 0.35s cubic-bezier(0.4,0,0.2,1);
    overflow-y: auto; -webkit-overflow-scrolling: touch;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    color: white;
  `;
  document.body.appendChild(panel);

  let panelOpen = false;

  function togglePanel() {
    if (isDragging) return;
    panelOpen = !panelOpen;
    panel.style.top = panelOpen ? '0' : '100%';
    fab.style.transform = panelOpen ? 'rotate(45deg)' : 'rotate(0)';
    fab.style.borderColor = panelOpen ? 'rgba(239,68,68,0.6)' : 'rgba(29,185,84,0.4)';

    if (panelOpen && addonRegistry.length === 0) {
      loadRegistry();
    }
    if (panelOpen) renderPanel();
  }

  // ── Load Addon Registry ──
  async function loadRegistry() {
    try {
      const res = await fetch(REGISTRY_URL);
      const data = await res.json();
      addonRegistry = data.addons || [];
      renderPanel();
    } catch (e) {
      // Fallback: use bundled registry
      addonRegistry = getBundledRegistry();
      renderPanel();
    }
  }

  function getBundledRegistry() {
    return [
      { id:'theme-midnight-wave', name:'Midnight Wave', description:'Thème sombre avec accents bleu néon', type:'theme', author:'SpotiFiak Team', version:'1.0.0', tags:['dark','neon'], downloads:12450, rating:4.8, spicetify_compatible:false },
      { id:'theme-aurora-borealis', name:'Aurora Borealis', description:'Dégradés verts et violets dynamiques', type:'theme', author:'NightCoder', version:'2.1.0', tags:['gradient','dynamic'], downloads:8930, rating:4.6, spicetify_compatible:false },
      { id:'theme-retro-synthwave', name:'Retro Synthwave', description:'Esthétique rétro-futuriste 80s néon', type:'theme', author:'VaporDev', version:'1.3.0', tags:['retro','80s','neon'], downloads:15200, rating:4.9, spicetify_compatible:false },
      { id:'ext-lyrics-plus', name:'Lyrics+', description:'Paroles synchronisées en temps réel', type:'extension', author:'LyricsMaster', version:'3.0.0', tags:['lyrics','karaoke'], downloads:25600, rating:4.7, spicetify_compatible:true },
      { id:'ext-visualizer', name:'Audio Visualizer', description:'Visualiseur audio avec barres de fréquence', type:'extension', author:'WaveForm', version:'2.0.0', tags:['visualizer','audio'], downloads:18300, rating:4.5, spicetify_compatible:true },
      { id:'ext-skip-ads', name:'Ad Skipper', description:'Détecte et skip les publicités', type:'extension', author:'FreeFlow', version:'4.2.1', tags:['ads','skip'], downloads:42000, rating:4.9, spicetify_compatible:true },
      { id:'ext-sleep-timer', name:'Sleep Timer', description:'Minuteur de sommeil avec fondu du volume', type:'extension', author:'DreamDev', version:'1.5.0', tags:['sleep','timer'], downloads:9800, rating:4.4, spicetify_compatible:false },
      { id:'app-stats-dashboard', name:'Stats Dashboard', description:'Tableau de bord statistiques d\'écoute', type:'app', author:'DataViz', version:'1.0.0', tags:['stats','analytics'], downloads:7200, rating:4.3, spicetify_compatible:true },
      { id:'app-queue-manager', name:'Queue Manager+', description:'Gestion avancée de la file d\'attente', type:'app', author:'QueueDev', version:'2.0.0', tags:['queue','management'], downloads:5400, rating:4.2, spicetify_compatible:true },
      { id:'ext-equalizer', name:'Equalizer Pro', description:'Égaliseur audio 10 bandes', type:'extension', author:'AudioTech', version:'1.8.0', tags:['equalizer','audio'], downloads:11200, rating:4.6, spicetify_compatible:false }
    ];
  }

  // ── Render Panel ──
  function renderPanel() {
    const typeIcons = { theme:'🎨', extension:'🧩', app:'📱' };
    const typeColors = { theme:'#a855f7', extension:'#3b82f6', app:'#ec4899' };
    const installedCount = Object.keys(installedAddons).length;

    panel.innerHTML = `
      <div style="padding: 16px 16px 0; padding-top: max(16px, env(safe-area-inset-top));">
        <!-- Header -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
          <div>
            <h1 style="margin:0; font-size:1.5rem; font-weight:800;
              background:linear-gradient(135deg,#1db954,#1ed760);
              -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
              SpotiFiak
            </h1>
            <p style="margin:4px 0 0; font-size:0.78rem; color:#6a6a6a;">Spicetify for Mobile • v1.0</p>
          </div>
          <button onclick="document.getElementById('spotifiak-fab').click()" 
            style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.08);border:none;color:#b3b3b3;font-size:1.2rem;cursor:pointer;">
            ✕
          </button>
        </div>

        <!-- Tabs -->
        <div id="sf-tabs" style="display:flex; gap:6px; margin-bottom:16px; overflow-x:auto; scrollbar-width:none;">
          <button class="sf-tab sf-tab-active" data-tab="marketplace" style="${tabStyle(true)}">🏪 Marketplace</button>
          <button class="sf-tab" data-tab="installed" style="${tabStyle(false)}">✅ Installés (${installedCount})</button>
          <button class="sf-tab" data-tab="spicetify" style="${tabStyle(false)}">🔗 Spicetify</button>
          <button class="sf-tab" data-tab="settings" style="${tabStyle(false)}">⚙️ Réglages</button>
        </div>
      </div>

      <!-- Tab Content -->
      <div id="sf-tab-content" style="padding: 0 16px 100px;">
        ${renderMarketplace()}
      </div>
    `;

    // Bind tab clicks
    panel.querySelectorAll('.sf-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        panel.querySelectorAll('.sf-tab').forEach(t => {
          t.style.background = 'rgba(255,255,255,0.05)';
          t.style.color = '#b3b3b3';
          t.style.borderColor = 'transparent';
          t.classList.remove('sf-tab-active');
        });
        tab.style.background = 'rgba(29,185,84,0.1)';
        tab.style.color = '#1db954';
        tab.style.borderColor = 'rgba(29,185,84,0.3)';
        tab.classList.add('sf-tab-active');

        const content = panel.querySelector('#sf-tab-content');
        switch(tab.dataset.tab) {
          case 'marketplace': content.innerHTML = renderMarketplace(); break;
          case 'installed': content.innerHTML = renderInstalled(); break;
          case 'spicetify': content.innerHTML = renderSpicetify(); break;
          case 'settings': content.innerHTML = renderSettings(); break;
        }
        bindActions();
      });
    });

    bindActions();
  }

  function tabStyle(active) {
    return `padding:8px 14px;border-radius:20px;font-size:0.8rem;font-weight:600;white-space:nowrap;border:1px solid ${active ? 'rgba(29,185,84,0.3)' : 'transparent'};cursor:pointer;background:${active ? 'rgba(29,185,84,0.1)' : 'rgba(255,255,255,0.05)'};color:${active ? '#1db954' : '#b3b3b3'};font-family:inherit;`;
  }

  // ── Marketplace Tab ──
  function renderMarketplace() {
    let html = `
      <div style="position:relative;margin-bottom:14px;">
        <input id="sf-search" type="text" placeholder="Rechercher des addons..." 
          style="width:100%;padding:12px 16px 12px 40px;background:rgba(255,255,255,0.06);
            border:1px solid rgba(255,255,255,0.08);border-radius:25px;color:white;
            font-size:0.88rem;outline:none;font-family:inherit;">
        <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#6a6a6a;">🔍</span>
      </div>
      <div id="sf-filters" style="display:flex;gap:6px;margin-bottom:16px;">
        <button class="sf-filter sf-filter-active" data-type="all" style="${filterStyle(true)}">🌟 Tous</button>
        <button class="sf-filter" data-type="theme" style="${filterStyle(false)}">🎨 Thèmes</button>
        <button class="sf-filter" data-type="extension" style="${filterStyle(false)}">🧩 Extensions</button>
        <button class="sf-filter" data-type="app" style="${filterStyle(false)}">📱 Apps</button>
      </div>
    `;
    html += renderAddonCards(addonRegistry);
    return html;
  }

  function filterStyle(active) {
    return `padding:6px 12px;border-radius:16px;font-size:0.75rem;font-weight:600;cursor:pointer;border:none;font-family:inherit;background:${active ? 'rgba(29,185,84,0.15)' : 'rgba(255,255,255,0.05)'};color:${active ? '#1db954' : '#888'};`;
  }

  function renderAddonCards(addons) {
    if (addons.length === 0) {
      return '<p style="text-align:center;color:#6a6a6a;padding:40px 0;">Aucun addon trouvé</p>';
    }
    const typeIcons = { theme:'🎨', extension:'🧩', app:'📱' };
    const typeColors = { theme:'rgba(168,85,247,0.15)', extension:'rgba(59,130,246,0.15)', app:'rgba(236,72,153,0.15)' };
    const typeTextColors = { theme:'#a855f7', extension:'#3b82f6', app:'#ec4899' };
    
    return addons.map(a => {
      const installed = !!installedAddons[a.id];
      return `
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:14px;margin-bottom:10px;transition:all 0.2s;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:3px 8px;border-radius:20px;background:${typeColors[a.type] || typeColors.extension};color:${typeTextColors[a.type] || typeTextColors.extension};">
              ${typeIcons[a.type] || '📦'} ${a.type}
            </span>
            ${a.spicetify_compatible ? '<span style="font-size:0.6rem;font-weight:700;background:rgba(99,102,241,0.15);color:#6366f1;padding:2px 6px;border-radius:20px;">🔗 Spicetify</span>' : ''}
          </div>
          <h3 style="margin:0 0 4px;font-size:1rem;font-weight:700;">${a.name}</h3>
          <p style="margin:0;font-size:0.8rem;color:#b3b3b3;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
            ${a.description}
          </p>
          <div style="display:flex;align-items:center;gap:12px;margin-top:10px;font-size:0.73rem;color:#6a6a6a;">
            <span style="font-weight:600;color:#b3b3b3;">@${a.author}</span>
            <span>★ ${a.rating}</span>
            <span>↓ ${formatNum(a.downloads)}</span>
          </div>
          <button data-action="${installed ? 'uninstall' : 'install'}" data-addon-id="${a.id}"
            style="width:100%;margin-top:10px;padding:10px;border-radius:8px;font-size:0.84rem;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:all 0.2s;
              ${installed 
                ? 'background:rgba(255,255,255,0.06);color:#1db954;border:1px solid rgba(29,185,84,0.3);' 
                : 'background:#1db954;color:#000;'}">
            ${installed ? '✓ Installé' : '+ Installer'}
          </button>
        </div>
      `;
    }).join('');
  }

  // ── Installed Tab ──
  function renderInstalled() {
    const keys = Object.keys(installedAddons);
    if (keys.length === 0) {
      return `
        <div style="text-align:center;padding:60px 20px;">
          <div style="font-size:3rem;opacity:0.2;">📦</div>
          <h3 style="margin:12px 0 6px;font-weight:700;">Aucun addon installé</h3>
          <p style="color:#6a6a6a;font-size:0.85rem;">Explorez le Marketplace pour commencer !</p>
        </div>
      `;
    }

    const typeIcons = { theme:'🎨', extension:'🧩', app:'📱' };

    return keys.map(id => {
      const a = installedAddons[id];
      return `
        <div style="display:flex;align-items:center;gap:12px;padding:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:12px;margin-bottom:8px;">
          <div style="width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;background:rgba(29,185,84,0.1);flex-shrink:0;">
            ${typeIcons[a.type] || '📦'}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:0.92rem;">${a.name}</div>
            <div style="font-size:0.73rem;color:#6a6a6a;">v${a.version} • @${a.author}</div>
          </div>
          <button data-action="uninstall" data-addon-id="${id}"
            style="padding:8px 12px;border-radius:8px;font-size:0.78rem;font-weight:600;cursor:pointer;border:none;background:rgba(239,68,68,0.1);color:#ef4444;font-family:inherit;">
            🗑️
          </button>
        </div>
      `;
    }).join('');
  }

  // ── Spicetify Tab ──
  function renderSpicetify() {
    return `
      <div style="background:linear-gradient(135deg,rgba(99,102,241,0.08),rgba(99,102,241,0.03));border:1px solid rgba(99,102,241,0.2);border-radius:14px;padding:16px;margin-bottom:16px;">
        <div style="display:flex;gap:12px;">
          <span style="font-size:1.5rem;">🔗</span>
          <div>
            <h3 style="margin:0 0 6px;font-size:0.95rem;font-weight:700;">Compatibilité Spicetify</h3>
            <p style="margin:0;font-size:0.82rem;color:#b3b3b3;line-height:1.5;">
              SpotiFiak émule l'API <code style="background:rgba(255,255,255,0.08);padding:1px 4px;border-radius:3px;font-size:0.8em;">Spicetify</code> 
              pour que les extensions PC fonctionnent sur mobile.
            </p>
          </div>
        </div>
      </div>
      <h3 style="font-size:0.85rem;font-weight:700;color:#6a6a6a;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">APIs Supportées</h3>
      ${[
        ['Spicetify.Player', '✅', 'Play, pause, skip, volume'],
        ['Spicetify.CosmosAsync', '✅', 'GET, POST, PUT, DELETE'],
        ['Spicetify.LocalStorage', '✅', 'Natif localStorage'],
        ['Spicetify.PopupModal', '✅', 'Émulé via notifications'],
        ['Spicetify.ContextMenu', '✅', 'Items enregistrés'],
        ['Spicetify.Platform', '⚡', 'Partiel (History)'],
        ['Spicetify.URI', '✅', 'Parse track/playlist/album']
      ].map(([api, status, desc]) => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:4px;">
          <span>${status}</span>
          <code style="font-size:0.8rem;background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:4px;color:#a78bfa;">${api}</code>
          <span style="font-size:0.75rem;color:#6a6a6a;margin-left:auto;">${desc}</span>
        </div>
      `).join('')}
      <p style="margin-top:20px;font-size:0.78rem;color:#6a6a6a;text-align:center;">
        Les extensions Spicetify marquées 🔗 dans le Marketplace sont compatibles.
      </p>
    `;
  }

  // ── Settings Tab ──
  function renderSettings() {
    return `
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden;">
        <div style="padding:12px 14px 6px;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6a6a6a;">
          Lecteur
        </div>
        ${settingItem('Mode Desktop', 'Forcer le mode bureau dans Spotify', true)}
        ${settingItem('Auto-injection', 'Injecter les addons au chargement', true)}
        ${settingItem('Compatibilité Spicetify', 'Charger la couche API Spicetify', true)}
      </div>
      
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden;margin-top:16px;">
        <div style="padding:12px 14px 6px;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6a6a6a;">
          Données
        </div>
        <div style="padding:14px;border-top:1px solid rgba(255,255,255,0.06);cursor:pointer;" id="sf-clear-data">
          <span style="font-weight:600;font-size:0.9rem;color:#ef4444;">🗑️ Réinitialiser les données</span>
          <p style="font-size:0.75rem;color:#6a6a6a;margin:2px 0 0;">Supprimer tous les addons installés</p>
        </div>
      </div>

      <div style="text-align:center;padding:30px 0;font-size:0.78rem;color:#6a6a6a;">
        <p style="margin:0;">SpotiFiak v1.0.0</p>
        <p style="margin:4px 0;">Créé par <span style="color:#1db954;">SatanMerde</span></p>
        <p style="margin:8px 0 0;font-size:0.7rem;opacity:0.6;">Non affilié à Spotify AB. Inspiré de SpotiDuck.</p>
      </div>
    `;
  }

  function settingItem(label, desc, checked) {
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;border-top:1px solid rgba(255,255,255,0.06);">
        <div>
          <div style="font-weight:600;font-size:0.88rem;">${label}</div>
          <div style="font-size:0.75rem;color:#6a6a6a;margin-top:1px;">${desc}</div>
        </div>
        <div style="width:44px;height:24px;border-radius:12px;background:${checked ? '#1db954' : 'rgba(255,255,255,0.1)'};position:relative;cursor:pointer;">
          <div style="width:18px;height:18px;border-radius:50%;background:white;position:absolute;top:3px;${checked ? 'right:3px' : 'left:3px'};transition:all 0.2s;"></div>
        </div>
      </div>
    `;
  }

  // ── Actions ──
  function bindActions() {
    // Search
    const search = panel.querySelector('#sf-search');
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase();
        const filtered = addonRegistry.filter(a =>
          a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) || (a.tags && a.tags.some(t => t.includes(q)))
        );
        const grid = panel.querySelector('#sf-filters')?.nextElementSibling;
        if (grid) grid.outerHTML = renderAddonCards(filtered);
        bindActions();
      });
    }

    // Filters
    panel.querySelectorAll('.sf-filter').forEach(f => {
      f.addEventListener('click', () => {
        panel.querySelectorAll('.sf-filter').forEach(ff => {
          ff.style.background = 'rgba(255,255,255,0.05)';
          ff.style.color = '#888';
        });
        f.style.background = 'rgba(29,185,84,0.15)';
        f.style.color = '#1db954';

        const type = f.dataset.type;
        const filtered = type === 'all' ? addonRegistry : addonRegistry.filter(a => a.type === type);
        
        // Replace the addon cards
        const container = panel.querySelector('#sf-tab-content');
        const searchHTML = container.querySelector('#sf-search')?.parentElement.outerHTML || '';
        const filterHTML = container.querySelector('#sf-filters')?.outerHTML || '';
        container.innerHTML = searchHTML + filterHTML + renderAddonCards(filtered);
        bindActions();
      });
    });

    // Install/Uninstall buttons
    panel.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.addonId;
        const action = btn.dataset.action;

        if (action === 'install') {
          const addon = addonRegistry.find(a => a.id === id);
          if (addon) {
            installedAddons[id] = { ...addon, installedAt: Date.now(), enabled: true };
            SF.setStorage('installed_addons', installedAddons);
            SF.showNotification('Installé !', addon.name + ' activé', 'success');
            renderPanel();
          }
        } else if (action === 'uninstall') {
          const addon = installedAddons[id];
          if (addon) {
            SF.removeCSS(id);
            SF.disableExtension(id);
            delete installedAddons[id];
            SF.setStorage('installed_addons', installedAddons);
            SF.showNotification('Désinstallé', addon.name + ' supprimé', 'warning');
            renderPanel();
          }
        }
      });
    });

    // Clear data
    const clearBtn = panel.querySelector('#sf-clear-data');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        Object.keys(installedAddons).forEach(id => {
          SF.removeCSS(id);
          SF.disableExtension(id);
        });
        installedAddons = {};
        SF.setStorage('installed_addons', {});
        SF.showNotification('Réinitialisé', 'Tous les addons supprimés', 'success');
        renderPanel();
      });
    }
  }

  function formatNum(n) {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }

  console.log('[SpotiFiak] Overlay UI loaded');
})();
