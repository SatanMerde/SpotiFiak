// SpotiFiak Extension: Sleep Timer
(function SleepTimer() {
  'use strict';
  const SpotiFiak = window.SpotiFiak;
  if (!SpotiFiak) return;

  SpotiFiak.registerExtension({
    id: 'ext-sleep-timer',
    name: 'Sleep Timer',
    version: '1.5.0',
    timer: null,
    fadeInterval: null,

    onEnable() {
      console.log('[SleepTimer] Enabled');
      this.createTimerButton();
    },

    onDisable() {
      if (this.timer) clearTimeout(this.timer);
      if (this.fadeInterval) clearInterval(this.fadeInterval);
      const btn = document.getElementById('sf-sleep-btn');
      if (btn) btn.remove();
    },

    createTimerButton() {
      const btn = document.createElement('button');
      btn.id = 'sf-sleep-btn';
      btn.innerHTML = '🌙';
      btn.title = 'Sleep Timer';
      btn.style.cssText = `
        position: fixed; bottom: 90px; right: 70px; z-index: 10000;
        width: 48px; height: 48px; border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border: none; color: white; font-size: 22px; cursor: pointer;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      `;
      btn.addEventListener('click', () => this.showTimerModal());
      document.body.appendChild(btn);
    },

    showTimerModal() {
      SpotiFiak.showNotification('Sleep Timer', 'Minuteur de 30min activé 🌙', 'info');
    }
  });
})();
