// SpotiFiak Extension: Audio Visualizer
(function AudioVisualizer() {
  'use strict';
  const SpotiFiak = window.SpotiFiak;
  if (!SpotiFiak) return;

  SpotiFiak.registerExtension({
    id: 'ext-visualizer',
    name: 'Audio Visualizer',
    version: '2.0.0',
    canvas: null,
    ctx: null,
    animFrame: null,

    onEnable() {
      console.log('[Visualizer] Enabled');
      this.createVisualizer();
    },

    onDisable() {
      if (this.animFrame) cancelAnimationFrame(this.animFrame);
      const el = document.getElementById('sf-visualizer');
      if (el) el.remove();
    },

    createVisualizer() {
      const container = document.createElement('div');
      container.id = 'sf-visualizer';
      container.style.cssText = `
        position: fixed; bottom: 80px; left: 0; right: 0;
        height: 60px; z-index: 1; pointer-events: none;
        opacity: 0.6;
      `;
      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText = 'width: 100%; height: 100%;';
      container.appendChild(this.canvas);
      document.body.appendChild(container);

      this.canvas.width = window.innerWidth;
      this.canvas.height = 60;
      this.ctx = this.canvas.getContext('2d');
      this.animate();
    },

    animate() {
      const { ctx, canvas } = this;
      const bars = 40;
      const barW = canvas.width / bars;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < bars; i++) {
        const h = Math.random() * canvas.height * 0.8;
        const hue = (i / bars) * 120 + 120;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.7)`;
        ctx.fillRect(i * barW + 1, canvas.height - h, barW - 2, h);
      }

      this.animFrame = requestAnimationFrame(() => this.animate());
    }
  });
})();
