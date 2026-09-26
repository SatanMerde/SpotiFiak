// SpotiFiak Extension: Equalizer Pro
(function EqualizerPro() {
  'use strict';
  const SpotiFiak = window.SpotiFiak;
  if (!SpotiFiak) return;

  SpotiFiak.registerExtension({
    id: 'ext-equalizer',
    name: 'Equalizer Pro',
    version: '1.8.0',

    onEnable() {
      console.log('[Equalizer] Enabled');
    },

    onDisable() {
      const el = document.getElementById('sf-equalizer');
      if (el) el.remove();
    }
  });
})();
