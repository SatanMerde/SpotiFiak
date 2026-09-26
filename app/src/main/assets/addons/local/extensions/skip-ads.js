// SpotiFiak Extension: Ad Skipper
(function AdSkipper() {
  'use strict';
  const SpotiFiak = window.SpotiFiak;
  if (!SpotiFiak) return;

  SpotiFiak.registerExtension({
    id: 'ext-skip-ads',
    name: 'Ad Skipper',
    version: '4.2.1',
    observer: null,

    onEnable() {
      console.log('[AdSkipper] Enabled — monitoring for ads');
      this.startMonitoring();
    },

    onDisable() {
      if (this.observer) this.observer.disconnect();
    },

    startMonitoring() {
      // Monitor the Spotify iframe for ad indicators
      this.observer = new MutationObserver(() => this.checkForAds());
      this.observer.observe(document.body, { childList: true, subtree: true });
      setInterval(() => this.checkForAds(), 2000);
    },

    checkForAds() {
      const iframe = document.getElementById('spotify-player');
      if (!iframe || !iframe.contentDocument) return;

      try {
        const adIndicators = iframe.contentDocument.querySelectorAll(
          '[data-testid="ad-slot"], .ad-container, [class*="Advertisement"]'
        );
        adIndicators.forEach(ad => {
          ad.style.display = 'none';
          console.log('[AdSkipper] Ad element hidden');
        });
      } catch (e) {
        // Cross-origin restrictions
      }
    }
  });
})();
