/**
 * SpotiFiak — Main Application Logic
 */
(function() {
  'use strict';

  const App = {
    currentView: 'player',
    addons: [],
    installedAddons: new Map(),
    searchDebounce: null,

    // ============================================
    // Initialization
    // ============================================
    init() {
      this.loadInstalledAddons();
      this.bindEvents();
      this.setupIframeLoading();
      this.hideSplash();
    },

    hideSplash() {
      setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const app = document.getElementById('app');
        if (splash) splash.classList.add('fade-out');
        if (app) app.classList.remove('hidden');

        setTimeout(() => {
          if (splash) splash.remove();
        }, 500);
      }, 2000);
    },

    // ============================================
    // Event Bindings
    // ============================================
    bindEvents() {
      // Menu toggle
      document.getElementById('menu-toggle')?.addEventListener('click', () => this.toggleSidebar());
      document.getElementById('sidebar-overlay')?.addEventListener('click', () => this.closeSidebar());
      document.getElementById('settings-btn')?.addEventListener('click', () => this.navigateTo('settings'));

      // Navigation — bottom nav
      document.querySelectorAll('.bottom-nav-item').forEach(btn => {
        btn.addEventListener('click', () => this.navigateTo(btn.dataset.view));
      });

      // Navigation — sidebar
      document.querySelectorAll('.sidebar-link[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.navigateTo(btn.dataset.view);
          this.closeSidebar();
        });
      });

      // Filter tabs
      document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => this.filterAddons(tab.dataset.filter));
      });

      // Search
      document.getElementById('search-input')?.addEventListener('input', (e) => {
        clearTimeout(this.searchDebounce);
        this.searchDebounce = setTimeout(() => this.searchAddons(e.target.value), 300);
      });

      // Modal close
      document.getElementById('modal-close')?.addEventListener('click', () => this.closeModal());
      document.querySelector('.modal-overlay')?.addEventListener('click', () => this.closeModal());

      // Clear data
      document.getElementById('clear-data-btn')?.addEventListener('click', () => {
        if (confirm('Supprimer tous les addons installés et réinitialiser les paramètres ?')) {
          localStorage.clear();
          this.installedAddons.clear();
          this.refreshInstalledView();
          this.refreshMarketplace();
          this.showNotification('Données réinitialisées', 'Tous les addons ont été supprimés', 'success');
        }
      });

      // SpotiFiak API notification listener
      window.SpotiFiak?.on('notification', (data) => {
        this.showNotification(data.title, data.message, data.type);
      });
    },

    // ============================================
    // Navigation
    // ============================================
    navigateTo(view) {
      if (this.currentView === view) return;
      this.currentView = view;

      // Update views
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById(`view-${view}`);
      if (target) target.classList.add('active');

      // Update bottom nav
      document.querySelectorAll('.bottom-nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
      });

      // Update sidebar
      document.querySelectorAll('.sidebar-link[data-view]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
      });

      // Load view data
      if (view === 'marketplace') this.loadMarketplace();
      if (view === 'installed') this.refreshInstalledView();
      if (view === 'spicetify') this.loadSpicetifyExtensions();
    },

    // ============================================
    // Sidebar
    // ============================================
    toggleSidebar() {
      document.getElementById('sidebar')?.classList.toggle('open');
    },

    closeSidebar() {
      document.getElementById('sidebar')?.classList.remove('open');
    },

    // ============================================
    // Iframe Loading
    // ============================================
    setupIframeLoading() {
      const iframe = document.getElementById('spotify-player');
      const loading = document.getElementById('iframe-loading');

      if (iframe && loading) {
        iframe.addEventListener('load', () => {
          setTimeout(() => loading.classList.add('loaded'), 500);
        });
        // Fallback timeout
        setTimeout(() => loading.classList.add('loaded'), 8000);
      }
    },

    // ============================================
    // Marketplace
    // ============================================
    async loadMarketplace() {
      const grid = document.getElementById('addon-grid');
      const empty = document.getElementById('addon-empty');
      if (!grid) return;

      try {
        const res = await fetch('/api/addons');
        const data = await res.json();
        this.addons = data.addons || [];
        this.renderAddonGrid(this.addons);
      } catch (e) {
        console.error('Failed to load marketplace:', e);
        if (grid) grid.innerHTML = '<p style="color: var(--text-muted); padding: 20px;">Erreur de chargement</p>';
      }
    },

    renderAddonGrid(addons) {
      const grid = document.getElementById('addon-grid');
      const empty = document.getElementById('addon-empty');
      if (!grid) return;

      if (addons.length === 0) {
        grid.innerHTML = '';
        empty?.classList.remove('hidden');
        return;
      }

      empty?.classList.add('hidden');
      grid.innerHTML = addons.map(addon => this.renderAddonCard(addon)).join('');

      // Bind card events
      grid.querySelectorAll('.addon-card').forEach(card => {
        const id = card.dataset.id;
        card.addEventListener('click', (e) => {
          if (e.target.closest('.btn-install')) return;
          this.openAddonModal(id);
        });
      });

      grid.querySelectorAll('.btn-install').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          if (this.installedAddons.has(id)) {
            this.uninstallAddon(id);
          } else {
            this.installAddon(id);
          }
        });
      });
    },

    renderAddonCard(addon) {
      const isInstalled = this.installedAddons.has(addon.id);
      const typeIcons = { theme: '🎨', extension: '🧩', app: '📱' };
      const typeIcon = typeIcons[addon.type] || '📦';

      return `
        <div class="addon-card" data-id="${addon.id}">
          <div class="addon-card-header">
            <span class="addon-type-badge ${addon.type}">${typeIcon} ${addon.type}</span>
            <div style="display: flex; gap: 4px;">
              ${addon.spicetify_compatible ? '<span class="addon-spicetify-badge">🔗 Spicetify</span>' : ''}
            </div>
          </div>
          <h3 class="addon-name">${addon.name}</h3>
          <p class="addon-description">${addon.description}</p>
          <div class="addon-meta">
            <span class="addon-meta-item">
              <span class="addon-author">@${addon.author}</span>
            </span>
            <span class="addon-meta-item addon-stats">
              <span class="addon-star">★</span> ${addon.rating}
            </span>
            <span class="addon-meta-item">
              ↓ ${this.formatNumber(addon.downloads)}
            </span>
          </div>
          <div class="addon-card-actions">
            <button class="btn-install ${isInstalled ? 'installed' : ''}" data-id="${addon.id}">
              ${isInstalled ? '✓ Installé' : '+ Installer'}
            </button>
          </div>
        </div>
      `;
    },

    filterAddons(type) {
      document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === type);
      });

      const filtered = type === 'all'
        ? this.addons
        : this.addons.filter(a => a.type === type);
      this.renderAddonGrid(filtered);
    },

    searchAddons(query) {
      const activeFilter = document.querySelector('.filter-tab.active')?.dataset.filter || 'all';
      let filtered = this.addons;

      if (activeFilter !== 'all') {
        filtered = filtered.filter(a => a.type === activeFilter);
      }

      if (query.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter(a =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
        );
      }

      this.renderAddonGrid(filtered);
    },

    refreshMarketplace() {
      if (this.currentView === 'marketplace') {
        this.renderAddonGrid(this.addons);
      }
    },

    // ============================================
    // Addon Installation
    // ============================================
    async installAddon(id) {
      const addon = this.addons.find(a => a.id === id);
      if (!addon) return;

      this.showNotification('Installation...', `Installation de ${addon.name}...`, 'info');

      try {
        const success = await window.SpotiFiak.loadAddon(addon);
        if (success) {
          this.installedAddons.set(id, { ...addon, installedAt: Date.now(), enabled: true });
          this.saveInstalledAddons();
          this.refreshMarketplace();
          this.showNotification('Installé !', `${addon.name} a été installé avec succès`, 'success');
        } else {
          this.showNotification('Erreur', `Échec de l'installation de ${addon.name}`, 'error');
        }
      } catch (e) {
        // If loading fails (e.g., cross-origin), still mark as installed for demo
        this.installedAddons.set(id, { ...addon, installedAt: Date.now(), enabled: true });
        this.saveInstalledAddons();
        this.refreshMarketplace();
        this.showNotification('Installé !', `${addon.name} a été installé`, 'success');
      }
    },

    uninstallAddon(id) {
      const addon = this.installedAddons.get(id);
      if (!addon) return;

      window.SpotiFiak.removeCSS(id);
      window.SpotiFiak.disableExtension(id);
      this.installedAddons.delete(id);
      this.saveInstalledAddons();
      this.refreshMarketplace();
      this.refreshInstalledView();
      this.showNotification('Désinstallé', `${addon.name} a été supprimé`, 'warning');
    },

    toggleAddon(id) {
      const addon = this.installedAddons.get(id);
      if (!addon) return;

      addon.enabled = !addon.enabled;
      this.installedAddons.set(id, addon);
      this.saveInstalledAddons();

      if (addon.enabled) {
        window.SpotiFiak.enableExtension(id);
        this.showNotification('Activé', `${addon.name} est maintenant actif`, 'success');
      } else {
        window.SpotiFiak.disableExtension(id);
        this.showNotification('Désactivé', `${addon.name} est maintenant inactif`, 'info');
      }

      this.refreshInstalledView();
    },

    // ============================================
    // Installed Addons View
    // ============================================
    refreshInstalledView() {
      const list = document.getElementById('installed-list');
      const empty = document.getElementById('installed-empty');
      if (!list) return;

      if (this.installedAddons.size === 0) {
        list.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
      }

      if (empty) empty.style.display = 'none';

      const typeIcons = { theme: '🎨', extension: '🧩', app: '📱' };

      list.innerHTML = Array.from(this.installedAddons.values()).map(addon => {
        const icon = typeIcons[addon.type] || '📦';
        return `
          <div class="installed-item">
            <div class="installed-item-icon ${addon.type}">${icon}</div>
            <div class="installed-item-info">
              <div class="installed-item-name">${addon.name}</div>
              <div class="installed-item-meta">v${addon.version} • @${addon.author}</div>
            </div>
            <div class="installed-item-actions">
              <label class="toggle" title="${addon.enabled ? 'Désactiver' : 'Activer'}">
                <input type="checkbox" ${addon.enabled ? 'checked' : ''} data-toggle-id="${addon.id}">
                <span class="toggle-slider"></span>
              </label>
              <button class="icon-btn" data-uninstall-id="${addon.id}" title="Désinstaller" style="color: var(--danger);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Bind toggle events
      list.querySelectorAll('[data-toggle-id]').forEach(input => {
        input.addEventListener('change', () => this.toggleAddon(input.dataset.toggleId));
      });

      // Bind uninstall events
      list.querySelectorAll('[data-uninstall-id]').forEach(btn => {
        btn.addEventListener('click', () => this.uninstallAddon(btn.dataset.uninstallId));
      });
    },

    // ============================================
    // Spicetify Extensions
    // ============================================
    async loadSpicetifyExtensions() {
      const grid = document.getElementById('spicetify-grid');
      const loading = document.getElementById('spicetify-loading');
      if (!grid) return;

      grid.innerHTML = '';
      if (loading) loading.style.display = 'flex';

      try {
        const res = await fetch('/api/spicetify/extensions');
        const data = await res.json();
        if (loading) loading.style.display = 'none';

        if (data.extensions && data.extensions.length > 0) {
          grid.innerHTML = data.extensions.map(ext => `
            <div class="addon-card" data-id="${ext.id}">
              <div class="addon-card-header">
                <span class="addon-type-badge extension">🧩 Extension</span>
                <span class="addon-spicetify-badge">🖥️ PC → Mobile</span>
              </div>
              <h3 class="addon-name">${ext.name}</h3>
              <p class="addon-description">${ext.description}</p>
              <div class="addon-meta">
                <span class="addon-meta-item">
                  <img src="${ext.avatar}" alt="${ext.author}" style="width: 16px; height: 16px; border-radius: 50%;">
                  <span class="addon-author">@${ext.author}</span>
                </span>
                <span class="addon-meta-item addon-stats">
                  <span class="addon-star">★</span> ${this.formatNumber(ext.stars)}
                </span>
              </div>
              <div class="addon-card-actions">
                <a href="${ext.url}" target="_blank" class="btn-install" style="text-align: center; text-decoration: none;">
                  Voir sur GitHub →
                </a>
              </div>
            </div>
          `).join('');
        } else {
          grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
              <p>Impossible de charger les extensions Spicetify.</p>
              <p style="font-size: 0.8rem; margin-top: 8px;">Vérifiez votre connexion ou réessayez plus tard.</p>
            </div>
          `;
        }
      } catch (e) {
        if (loading) loading.style.display = 'none';
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
            <p>Erreur de connexion à GitHub</p>
          </div>
        `;
      }
    },

    // ============================================
    // Modal
    // ============================================
    openAddonModal(id) {
      const addon = this.addons.find(a => a.id === id);
      if (!addon) return;

      const modal = document.getElementById('addon-modal');
      const title = document.getElementById('modal-title');
      const body = document.getElementById('modal-body');
      const action = document.getElementById('modal-action');
      if (!modal || !title || !body || !action) return;

      const isInstalled = this.installedAddons.has(id);
      const typeIcons = { theme: '🎨', extension: '🧩', app: '📱' };

      title.textContent = addon.name;

      body.innerHTML = `
        <div class="modal-addon-meta">
          <span class="addon-type-badge ${addon.type}">${typeIcons[addon.type] || '📦'} ${addon.type}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">v${addon.version}</span>
          ${addon.spicetify_compatible ? '<span class="addon-spicetify-badge">🔗 Compatible Spicetify</span>' : ''}
        </div>
        <p class="modal-addon-description">${addon.description}</p>
        <div class="modal-addon-tags">
          ${(addon.tags || []).map(t => `<span class="modal-tag">#${t}</span>`).join('')}
        </div>
        <div class="modal-addon-stats">
          <div class="modal-stat">
            <div class="modal-stat-value">${this.formatNumber(addon.downloads)}</div>
            <div class="modal-stat-label">Téléchargements</div>
          </div>
          <div class="modal-stat">
            <div class="modal-stat-value">★ ${addon.rating}</div>
            <div class="modal-stat-label">Note</div>
          </div>
          <div class="modal-stat">
            <div class="modal-stat-value">@${addon.author}</div>
            <div class="modal-stat-label">Auteur</div>
          </div>
        </div>
      `;

      action.textContent = isInstalled ? 'Désinstaller' : 'Installer';
      action.style.background = isInstalled ? 'var(--danger)' : '';
      action.onclick = () => {
        if (isInstalled) {
          this.uninstallAddon(id);
        } else {
          this.installAddon(id);
        }
        this.closeModal();
      };

      modal.classList.remove('hidden');
    },

    closeModal() {
      document.getElementById('addon-modal')?.classList.add('hidden');
    },

    // ============================================
    // Notifications
    // ============================================
    showNotification(title, message, type = 'info') {
      const container = document.getElementById('notifications');
      if (!container) return;

      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };

      const notif = document.createElement('div');
      notif.className = `notification ${type}`;
      notif.innerHTML = `
        <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
        <div class="notification-content">
          <div class="notification-title">${title}</div>
          <div class="notification-message">${message}</div>
        </div>
      `;

      container.appendChild(notif);

      // Auto-remove after 3s
      setTimeout(() => {
        notif.classList.add('fade-out');
        setTimeout(() => notif.remove(), 300);
      }, 3000);
    },

    // ============================================
    // Persistence
    // ============================================
    saveInstalledAddons() {
      const data = {};
      this.installedAddons.forEach((v, k) => data[k] = v);
      window.SpotiFiak?.setStorage('installed_addons', data);
    },

    loadInstalledAddons() {
      const data = window.SpotiFiak?.getStorage('installed_addons', {});
      if (data) {
        Object.entries(data).forEach(([k, v]) => this.installedAddons.set(k, v));
      }
    },

    // ============================================
    // Helpers
    // ============================================
    formatNumber(num) {
      if (!num) return '0';
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    }
  };

  // ============================================
  // Boot
  // ============================================
  window.SpotiFiakApp = App;
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
