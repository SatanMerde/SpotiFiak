/**
 * SpotiFiak API — Spicetify Compatibility Layer
 * 
 * Provides a global `SpotiFiak` object that mirrors key Spicetify APIs,
 * allowing PC Spicetify extensions to run on the web version.
 * Also provides the native SpotiFiak extension API.
 */
(function() {
  'use strict';

  // ============================================
  // SpotiFiak Core API
  // ============================================
  const SpotiFiakAPI = {
    version: '1.0.0',
    extensions: new Map(),
    installedAddons: new Map(),
    injectedStyles: new Map(),
    settings: {},
    _listeners: {},

    /**
     * Register an extension
     */
    registerExtension(config) {
      if (!config.id) {
        console.error('[SpotiFiak] Extension must have an id');
        return;
      }
      this.extensions.set(config.id, config);
      console.log(`[SpotiFiak] Registered extension: ${config.name || config.id}`);
    },

    /**
     * Enable an extension
     */
    enableExtension(id) {
      const ext = this.extensions.get(id);
      if (ext && typeof ext.onEnable === 'function') {
        try {
          ext.onEnable();
          console.log(`[SpotiFiak] Enabled: ${ext.name || id}`);
        } catch (e) {
          console.error(`[SpotiFiak] Error enabling ${id}:`, e);
        }
      }
    },

    /**
     * Disable an extension
     */
    disableExtension(id) {
      const ext = this.extensions.get(id);
      if (ext && typeof ext.onDisable === 'function') {
        try {
          ext.onDisable();
          console.log(`[SpotiFiak] Disabled: ${ext.name || id}`);
        } catch (e) {
          console.error(`[SpotiFiak] Error disabling ${id}:`, e);
        }
      }
    },

    /**
     * Inject CSS into the Spotify iframe
     */
    injectCSS(id, css) {
      const iframe = document.getElementById('spotify-player');
      if (!iframe) return;

      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        let style = doc.getElementById(`sf-style-${id}`);
        if (style) {
          style.textContent = css;
        } else {
          style = doc.createElement('style');
          style.id = `sf-style-${id}`;
          style.textContent = css;
          doc.head.appendChild(style);
        }
        this.injectedStyles.set(id, css);
        console.log(`[SpotiFiak] Injected CSS: ${id}`);
      } catch (e) {
        // Cross-origin — inject into main page as fallback
        let style = document.getElementById(`sf-style-${id}`);
        if (style) {
          style.textContent = css;
        } else {
          style = document.createElement('style');
          style.id = `sf-style-${id}`;
          style.textContent = css;
          document.head.appendChild(style);
        }
        this.injectedStyles.set(id, css);
        console.log(`[SpotiFiak] Injected CSS (fallback): ${id}`);
      }
    },

    /**
     * Remove injected CSS
     */
    removeCSS(id) {
      const style = document.getElementById(`sf-style-${id}`);
      if (style) style.remove();

      try {
        const iframe = document.getElementById('spotify-player');
        if (iframe) {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          const iStyle = doc.getElementById(`sf-style-${id}`);
          if (iStyle) iStyle.remove();
        }
      } catch (e) { /* cross-origin */ }

      this.injectedStyles.delete(id);
    },

    /**
     * Inject a script
     */
    injectScript(id, code) {
      try {
        const fn = new Function(code);
        fn();
        console.log(`[SpotiFiak] Injected script: ${id}`);
      } catch (e) {
        console.error(`[SpotiFiak] Script error (${id}):`, e);
      }
    },

    /**
     * Load addon from source
     */
    async loadAddon(addon) {
      try {
        const response = await fetch(`/api/addons/${addon.id}/source`);
        const data = await response.json();

        if (data.content) {
          if (addon.type === 'theme') {
            this.injectCSS(addon.id, data.content);
          } else {
            this.injectScript(addon.id, data.content);
          }
        } else if (data.url) {
          const res = await fetch(data.url);
          const content = await res.text();
          if (addon.type === 'theme') {
            this.injectCSS(addon.id, content);
          } else {
            this.injectScript(addon.id, content);
          }
        }

        return true;
      } catch (e) {
        console.error(`[SpotiFiak] Failed to load addon ${addon.id}:`, e);
        return false;
      }
    },

    /**
     * Show notification
     */
    showNotification(title, message, type = 'info') {
      this._emit('notification', { title, message, type });
    },

    /**
     * Event system
     */
    on(event, callback) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(callback);
    },

    off(event, callback) {
      if (!this._listeners[event]) return;
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    },

    _emit(event, data) {
      if (!this._listeners[event]) return;
      this._listeners[event].forEach(cb => {
        try { cb(data); } catch (e) { console.error(e); }
      });
    },

    /**
     * Storage helpers
     */
    getStorage(key, defaultValue) {
      try {
        const v = localStorage.getItem(`sf_${key}`);
        return v !== null ? JSON.parse(v) : defaultValue;
      } catch { return defaultValue; }
    },

    setStorage(key, value) {
      try {
        localStorage.setItem(`sf_${key}`, JSON.stringify(value));
      } catch (e) {
        console.error('[SpotiFiak] Storage error:', e);
      }
    }
  };

  // ============================================
  // Spicetify Compatibility Layer
  // ============================================
  const SpicetifyCompat = {
    Player: {
      addEventListener: (event, cb) => console.log(`[Spicetify Compat] Player.addEventListener(${event})`),
      removeEventListener: (event, cb) => {},
      togglePlay: () => console.log('[Spicetify Compat] Player.togglePlay()'),
      next: () => console.log('[Spicetify Compat] Player.next()'),
      back: () => console.log('[Spicetify Compat] Player.back()'),
      seek: (ms) => console.log(`[Spicetify Compat] Player.seek(${ms})`),
      setVolume: (v) => console.log(`[Spicetify Compat] Player.setVolume(${v})`),
      getVolume: () => 0.7,
      isPlaying: () => false,
      data: null
    },

    CosmosAsync: {
      get: async (url) => {
        console.log(`[Spicetify Compat] CosmosAsync.get(${url})`);
        return {};
      },
      post: async (url, body) => {
        console.log(`[Spicetify Compat] CosmosAsync.post(${url})`);
        return {};
      },
      put: async (url, body) => {
        console.log(`[Spicetify Compat] CosmosAsync.put(${url})`);
        return {};
      },
      del: async (url) => {
        console.log(`[Spicetify Compat] CosmosAsync.del(${url})`);
        return {};
      }
    },

    LocalStorage: {
      get: (key) => localStorage.getItem(`spicetify_${key}`),
      set: (key, value) => localStorage.setItem(`spicetify_${key}`, value),
      remove: (key) => localStorage.removeItem(`spicetify_${key}`)
    },

    Topbar: {
      Button: class {
        constructor(label, icon, onClick, disabled = false) {
          this.label = label;
          this.icon = icon;
          this.onClick = onClick;
          this.disabled = disabled;
          this.element = document.createElement('button');
          this.element.className = 'sf-topbar-btn';
          this.element.title = label;
          this.element.innerHTML = icon;
          this.element.addEventListener('click', onClick);
          console.log(`[Spicetify Compat] Topbar button created: ${label}`);
        }
      }
    },

    PopupModal: {
      display: (config) => {
        const { title, content, isLarge } = config;
        SpotiFiakAPI.showNotification(title, 'Modal affiché via Spicetify Compat', 'info');
        console.log(`[Spicetify Compat] PopupModal.display: ${title}`);
      },
      hide: () => {
        console.log('[Spicetify Compat] PopupModal.hide');
      }
    },

    ContextMenu: {
      Item: class {
        constructor(name, onClick, shouldAdd = () => true, icon = null) {
          this.name = name;
          this.onClick = onClick;
          this.shouldAdd = shouldAdd;
          this.icon = icon;
          console.log(`[Spicetify Compat] ContextMenu item: ${name}`);
        }
        register() {}
        deregister() {}
      }
    },

    showNotification: (text, isError = false) => {
      SpotiFiakAPI.showNotification(
        isError ? 'Erreur' : 'Info',
        text,
        isError ? 'error' : 'info'
      );
    },

    Platform: {
      History: {
        push: (path) => console.log(`[Spicetify Compat] Navigate to: ${path}`),
        listen: (cb) => {}
      }
    },

    URI: {
      fromString: (str) => ({ type: 'track', id: str }),
      isTrack: (uri) => uri?.startsWith('spotify:track:'),
      isPlaylist: (uri) => uri?.startsWith('spotify:playlist:'),
      isAlbum: (uri) => uri?.startsWith('spotify:album:')
    },

    React: typeof React !== 'undefined' ? React : null,
    ReactDOM: typeof ReactDOM !== 'undefined' ? ReactDOM : null,

    // Placeholder for extensions that check for Spicetify readiness
    test: () => true
  };

  // ============================================
  // Expose globals
  // ============================================
  window.SpotiFiak = SpotiFiakAPI;
  window.Spicetify = SpicetifyCompat;

  console.log(`
  ╔═══════════════════════════════════════╗
  ║  🎵 SpotiFiak API v${SpotiFiakAPI.version}            ║
  ║  Spicetify Compatibility Layer Active ║
  ╚═══════════════════════════════════════╝
  `);
})();
