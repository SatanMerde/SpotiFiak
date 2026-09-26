/**
 * SpotiFiak Addon Loader
 * Loads and manages themes, extensions, and Spicetify PC plugins
 * Injected automatically into the WebView context
 */
(function() {
  'use strict';

  console.log('[SpotiFiak] Initializing Addon Loader...');

  const SF = window.SpotiFiak;
  if (!SF) {
    console.error('[SpotiFiak] Core API not found. Addon loader aborting.');
    return;
  }

  // Built-in bundled addons catalogue (available offline directly in the APK)
  const BUNDLED_ADDONS = {
    'midnight-wave': {
      id: 'midnight-wave',
      name: 'Midnight Wave Theme',
      type: 'theme',
      author: 'SpotiFiak Community',
      version: '1.2.0',
      css: `
        /* Midnight Wave Theme */
        :root {
          --spice-main: #0b0e14 !important;
          --spice-sidebar: #07090e !important;
          --spice-player: #0d1117 !important;
          --spice-card: #151b23 !important;
          --spice-text: #e6edf3 !important;
          --spice-subtext: #8b949e !important;
          --spice-accent: #58a6ff !important;
        }
        .Root__main-view, main {
          background: linear-gradient(180deg, #0f172a 0%, #080b12 100%) !important;
        }
        .Root__now-playing-bar {
          background: rgba(13, 17, 23, 0.95) !important;
          border-top: 1px solid rgba(88, 166, 255, 0.2) !important;
        }
        [data-testid="play-button"], .Button-accent-is-green {
          background-color: #58a6ff !important;
        }
      `
    },
    'ad-skipper': {
      id: 'ad-skipper',
      name: 'Smart Ad Skipper & Muter',
      type: 'extension',
      author: 'SpotiFiak Team',
      version: '2.1.0',
      js: `
        (function() {
          console.log('[SpotiFiak] Smart Ad Skipper extension activated');
          setInterval(() => {
            const adWidget = document.querySelector('[data-testid="ad-widget"]');
            const adText = document.querySelector('[aria-label="Advertisement"]');
            const skipButton = document.querySelector('[data-testid="control-button-skip-forward"]');
            
            // Check if current track is labeled as advertisement
            const trackName = document.querySelector('[data-testid="context-item-info-title"]')?.innerText || '';
            const isAd = adWidget || adText || trackName.toLowerCase().includes('advertisement') || trackName.toLowerCase().includes('sponsor');
            
            if (isAd && skipButton) {
              console.log('[SpotiFiak] Ad detected! Auto-skipping...');
              skipButton.click();
            }
          }, 1000);
        })();
      `
    },
    'lyrics-plus': {
      id: 'lyrics-plus',
      name: 'Floating Lyrics Overlay',
      type: 'extension',
      author: 'Spicetify Community',
      version: '1.4.0',
      js: `
        (function() {
          console.log('[SpotiFiak] Lyrics+ helper loaded');
          if (document.getElementById('sf-lyrics-toggle')) return;
          
          const lyricsBtn = document.createElement('button');
          lyricsBtn.id = 'sf-lyrics-toggle';
          lyricsBtn.innerHTML = '🎤';
          lyricsBtn.title = 'Paroles SpotiFiak';
          lyricsBtn.style.cssText = 'position:fixed;bottom:90px;left:16px;z-index:99998;width:44px;height:44px;border-radius:50%;background:rgba(24,24,24,0.9);border:1px solid rgba(255,255,255,0.2);font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(0,0,0,0.4);';
          
          lyricsBtn.addEventListener('click', () => {
            const currentTitle = document.querySelector('[data-testid="context-item-info-title"]')?.innerText || 'Titre inconnu';
            const currentArtist = document.querySelector('[data-testid="context-item-info-subtitles"]')?.innerText || 'Artiste';
            if (window.SpotiFiak) {
              window.SpotiFiak.showNotification('Paroles (Lyrics+)', currentTitle + ' - ' + currentArtist + '\\nRecherche des paroles en cours...', 'info');
            }
          });
          document.body.appendChild(lyricsBtn);
        })();
      `
    }
  };

  /**
   * Load and apply all active addons from LocalStorage
   */
  function loadInstalledAddons() {
    const installed = SF.getStorage('installed_addons', {});
    console.log('[SpotiFiak] Found installed addons:', Object.keys(installed).length);

    // Apply installed items
    for (const [id, addon] of Object.entries(installed)) {
      if (!addon.enabled) continue;

      if (addon.type === 'theme') {
        if (addon.css) {
          SF.injectCSS(id, addon.css);
        } else if (BUNDLED_ADDONS[id]?.css) {
          SF.injectCSS(id, BUNDLED_ADDONS[id].css);
        }
      } else if (addon.type === 'extension') {
        if (addon.js) {
          SF.injectScript(id, addon.js);
        } else if (BUNDLED_ADDONS[id]?.js) {
          SF.injectScript(id, BUNDLED_ADDONS[id].js);
        }
      }
    }
  }

  // Hook into storage events for cross-tab or overlay communication
  window.addEventListener('storage', (e) => {
    if (e.key === 'sf_installed_addons') {
      loadInstalledAddons();
    }
  });

  // Custom event listener for instant toggle from overlay
  window.addEventListener('spotifiak:toggle-addon', (e) => {
    const { id, enabled, addon } = e.detail || {};
    if (!id) return;

    if (!enabled) {
      SF.removeCSS(id);
      console.log('[SpotiFiak] Disabled addon:', id);
    } else {
      const data = addon || BUNDLED_ADDONS[id];
      if (data) {
        if (data.type === 'theme' && data.css) SF.injectCSS(id, data.css);
        if (data.type === 'extension' && data.js) SF.injectScript(id, data.js);
        console.log('[SpotiFiak] Enabled addon:', id);
      }
    }
  });

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadInstalledAddons);
  } else {
    loadInstalledAddons();
  }

  // Expose bundled catalogue to SpotiFiak global
  SF.BUNDLED_ADDONS = BUNDLED_ADDONS;
  SF.loadInstalledAddons = loadInstalledAddons;

})();
