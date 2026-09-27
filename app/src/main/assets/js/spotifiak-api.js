/**
 * SpotiFiak API — Injected into Spotify Web Player
 * Provides the global SpotiFiak object + Spicetify compatibility layer
 * This runs INSIDE the Spotify webpage context (not in a separate frame)
 */
(function() {
  'use strict';
  
  if (window.SpotiFiak) return; // Already injected

  const SpotiFiakAPI = {
    version: '1.0.0',
    platform: 'android',
    extensions: new Map(),
    installedAddons: {},
    injectedStyles: new Map(),
    _listeners: {},

    registerExtension(config) {
      if (!config.id) return;
      this.extensions.set(config.id, config);
      console.log('[SpotiFiak] Registered: ' + (config.name || config.id));
    },

    enableExtension(id) {
      const ext = this.extensions.get(id);
      if (ext && typeof ext.onEnable === 'function') {
        try { ext.onEnable(); } catch (e) { console.error('[SpotiFiak]', e); }
      }
    },

    disableExtension(id) {
      const ext = this.extensions.get(id);
      if (ext && typeof ext.onDisable === 'function') {
        try { ext.onDisable(); } catch (e) { console.error('[SpotiFiak]', e); }
      }
    },

    injectCSS(id, css) {
      let style = document.getElementById('sf-style-' + id);
      if (style) {
        style.textContent = css;
      } else {
        style = document.createElement('style');
        style.id = 'sf-style-' + id;
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
      }
      this.injectedStyles.set(id, css);
    },

    removeCSS(id) {
      const style = document.getElementById('sf-style-' + id);
      if (style) style.remove();
      this.injectedStyles.delete(id);
    },

    injectScript(id, code) {
      try {
        const fn = new Function(code);
        fn();
      } catch (e) {
        console.error('[SpotiFiak] Script error (' + id + '):', e);
      }
    },

    showNotification(title, message, type) {
      // Use native Android toast via bridge
      if (window.SpotiFiakNative) {
        window.SpotiFiakNative.showToast(title + ': ' + message);
      }
      // Also show in-page notification
      this._showInPageNotif(title, message, type);
    },

    _showInPageNotif(title, message, type) {
      const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
      const colors = { success: '#1db954', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };

      const notif = document.createElement('div');
      notif.style.cssText = 
        'position:fixed;top:16px;right:16px;z-index:999999;' +
        'background:rgba(24,24,24,0.95);backdrop-filter:blur(20px);' +
        'border:1px solid rgba(255,255,255,0.1);border-left:3px solid ' + (colors[type] || colors.info) + ';' +
        'border-radius:12px;padding:14px 16px;max-width:320px;' +
        'box-shadow:0 8px 32px rgba(0,0,0,0.5);' +
        'font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:white;' +
        'animation:sfNotifIn 0.35s ease;';

      notif.innerHTML = 
        '<div style="display:flex;gap:10px;align-items:flex-start;">' +
          '<span style="font-size:1.2em;">' + (icons[type] || 'ℹ️') + '</span>' +
          '<div>' +
            '<div style="font-weight:600;font-size:0.85rem;">' + title + '</div>' +
            '<div style="font-size:0.78rem;color:#b3b3b3;margin-top:2px;">' + message + '</div>' +
          '</div>' +
        '</div>';

      // Add animation keyframes
      if (!document.getElementById('sf-notif-styles')) {
        const animStyle = document.createElement('style');
        animStyle.id = 'sf-notif-styles';
        animStyle.textContent = 
          '@keyframes sfNotifIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}' +
          '@keyframes sfNotifOut{from{opacity:1}to{opacity:0;transform:translateX(20px)}}';
        (document.head || document.documentElement).appendChild(animStyle);
      }

      (document.body || document.documentElement).appendChild(notif);

      setTimeout(() => {
        notif.style.animation = 'sfNotifOut 0.3s ease forwards';
        setTimeout(() => notif.remove(), 300);
      }, 3000);
    },

    on(event, cb) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(cb);
    },

    off(event, cb) {
      if (!this._listeners[event]) return;
      this._listeners[event] = this._listeners[event].filter(c => c !== cb);
    },

    _emit(event, data) {
      (this._listeners[event] || []).forEach(cb => { try { cb(data); } catch(e) {} });
    },

    getStorage(key, defaultValue) {
      try {
        const v = localStorage.getItem('sf_' + key);
        return v !== null ? JSON.parse(v) : defaultValue;
      } catch { return defaultValue; }
    },

    setStorage(key, value) {
      try { localStorage.setItem('sf_' + key, JSON.stringify(value)); } catch(e) {}
    }
  };

  // ── Spicetify Compatibility Layer ──
  const Spicetify = {
    Player: {
      addEventListener: (e, cb) => {},
      removeEventListener: (e, cb) => {},
      togglePlay() {
        const btn = document.querySelector('[data-testid="control-button-playpause"]');
        if (btn) btn.click();
      },
      next() {
        const btn = document.querySelector('[data-testid="control-button-skip-forward"]');
        if (btn) btn.click();
      },
      back() {
        const btn = document.querySelector('[data-testid="control-button-skip-back"]');
        if (btn) btn.click();
      },
      seek(ms) {},
      setVolume(v) {},
      getVolume() { return 0.7; },
      isPlaying() {
        const btn = document.querySelector('[data-testid="control-button-playpause"]');
        return btn ? btn.getAttribute('aria-label')?.includes('Pause') : false;
      },
      data: null
    },

    CosmosAsync: {
      get: async (url) => ({}),
      post: async (url, body) => ({}),
      put: async (url, body) => ({}),
      del: async (url) => ({})
    },

    LocalStorage: {
      get: (key) => localStorage.getItem('spicetify_' + key),
      set: (key, val) => localStorage.setItem('spicetify_' + key, val),
      remove: (key) => localStorage.removeItem('spicetify_' + key)
    },

    Topbar: {
      Button: class {
        constructor(label, icon, onClick) {
          this.label = label;
          this.element = document.createElement('button');
        }
      }
    },

    PopupModal: {
      display(config) {
        SpotiFiakAPI.showNotification(config.title || 'Modal', 'Spicetify Modal', 'info');
      },
      hide() {}
    },

    ContextMenu: {
      Item: class {
        constructor(name, onClick) { this.name = name; }
        register() {}
        deregister() {}
      }
    },

    showNotification(text, isError) {
      SpotiFiakAPI.showNotification(isError ? 'Erreur' : 'Info', text, isError ? 'error' : 'info');
    },

    Platform: {
      History: { push(p) {}, listen(cb) {} }
    },

    URI: {
      fromString: (s) => ({ type: 'track', id: s }),
      isTrack: (u) => u?.startsWith('spotify:track:'),
      isPlaylist: (u) => u?.startsWith('spotify:playlist:'),
      isAlbum: (u) => u?.startsWith('spotify:album:')
    },

    test: () => true
  };

  window.SpotiFiak = SpotiFiakAPI;
  window.Spicetify = Spicetify;

  console.log('[SpotiFiak] API v' + SpotiFiakAPI.version + ' loaded (Android WebView)');
  
  if (window.SpotiFiakNative) {
    window.SpotiFiakNative.log('SpotiFiak API injected successfully');
  }
})();
