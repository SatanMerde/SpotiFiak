// SpotiFiak Extension: Lyrics+
// Displays synchronized lyrics with karaoke animations
(function LyricsPlus() {
  'use strict';

  const EXTENSION_ID = 'ext-lyrics-plus';
  const SpotiFiak = window.SpotiFiak;

  if (!SpotiFiak) {
    console.warn('[Lyrics+] SpotiFiak API not found');
    return;
  }

  SpotiFiak.registerExtension({
    id: EXTENSION_ID,
    name: 'Lyrics+',
    version: '3.0.0',

    onEnable() {
      console.log('[Lyrics+] Extension enabled');
      this.createLyricsButton();
    },

    onDisable() {
      console.log('[Lyrics+] Extension disabled');
      const btn = document.getElementById('sf-lyrics-btn');
      if (btn) btn.remove();
      const panel = document.getElementById('sf-lyrics-panel');
      if (panel) panel.remove();
    },

    createLyricsButton() {
      const btn = document.createElement('button');
      btn.id = 'sf-lyrics-btn';
      btn.innerHTML = '🎤';
      btn.title = 'Lyrics+';
      btn.style.cssText = `
        position: fixed; bottom: 90px; right: 16px; z-index: 10000;
        width: 48px; height: 48px; border-radius: 50%;
        background: linear-gradient(135deg, #1db954, #1ed760);
        border: none; color: white; font-size: 22px; cursor: pointer;
        box-shadow: 0 4px 15px rgba(29, 185, 84, 0.4);
        transition: all 0.3s ease;
      `;
      btn.addEventListener('click', () => this.toggleLyricsPanel());
      document.body.appendChild(btn);
    },

    toggleLyricsPanel() {
      let panel = document.getElementById('sf-lyrics-panel');
      if (panel) {
        panel.classList.toggle('sf-lyrics-visible');
        return;
      }

      panel = document.createElement('div');
      panel.id = 'sf-lyrics-panel';
      panel.className = 'sf-lyrics-visible';
      panel.innerHTML = `
        <div style="padding: 20px; color: white; font-family: -apple-system, sans-serif;">
          <h3 style="margin: 0 0 16px; font-size: 18px;">🎤 Lyrics+</h3>
          <p style="opacity: 0.7; font-size: 14px;">Paroles synchronisées</p>
          <div id="sf-lyrics-content" style="margin-top: 20px; font-size: 16px; line-height: 2;">
            <p style="opacity: 0.5;">Lancez une chanson pour voir les paroles...</p>
          </div>
        </div>
      `;
      panel.style.cssText = `
        position: fixed; bottom: 0; left: 0; right: 0; top: 40%;
        background: rgba(18, 18, 18, 0.95); backdrop-filter: blur(20px);
        border-top-left-radius: 20px; border-top-right-radius: 20px;
        z-index: 9999; overflow-y: auto;
        transition: transform 0.3s ease;
        box-shadow: 0 -5px 30px rgba(0,0,0,0.5);
      `;
      document.body.appendChild(panel);
    }
  });
})();
