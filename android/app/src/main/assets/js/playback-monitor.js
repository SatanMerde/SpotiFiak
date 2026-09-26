/**
 * SpotiFiak Playback Monitor
 * Connects Spotify Web Player playback state to native Android MediaSession & Lock Screen
 * Inspired by SpotiDuck's native audio service integration
 */
(function() {
  'use strict';

  console.log('[SpotiFiak] Initializing Playback Monitor...');

  let lastTitle = '';
  let lastArtist = '';
  let lastPlaying = false;

  function checkPlaybackState() {
    // 1. Detect Play/Pause State
    const playPauseBtn = document.querySelector('[data-testid="control-button-playpause"]');
    let isPlaying = false;
    if (playPauseBtn) {
      const ariaLabel = playPauseBtn.getAttribute('aria-label') || '';
      // When playing, the button offers "Pause"
      isPlaying = ariaLabel.toLowerCase().includes('pause');
    }

    // 2. Detect Track Info
    const titleEl = document.querySelector('[data-testid="context-item-info-title"] a') ||
                    document.querySelector('[data-testid="context-item-info-title"]') ||
                    document.querySelector('.Root__now-playing-bar a[data-testid="now-playing-link"]');
    
    const artistEls = document.querySelectorAll('[data-testid="context-item-info-subtitles"] a') ||
                      document.querySelectorAll('[data-testid="context-item-info-artist"]');

    const title = titleEl ? (titleEl.innerText || titleEl.textContent || '').trim() : '';
    let artist = '';
    if (artistEls && artistEls.length > 0) {
      artist = Array.from(artistEls).map(el => el.innerText || el.textContent).join(', ');
    } else {
      const sub = document.querySelector('[data-testid="context-item-info-subtitles"]');
      if (sub) artist = (sub.innerText || sub.textContent || '').trim();
    }

    // Album art
    const coverImg = document.querySelector('[data-testid="cover-art-image"]') ||
                     document.querySelector('.Root__now-playing-bar img');
    const coverUrl = coverImg ? coverImg.getAttribute('src') : '';

    // 3. Update Native Android Bridge if changed
    if (window.SpotiFiakNative) {
      if (isPlaying !== lastPlaying) {
        lastPlaying = isPlaying;
        window.SpotiFiakNative.updatePlayback(isPlaying);
      }

      if (title && (title !== lastTitle || artist !== lastArtist)) {
        lastTitle = title;
        lastArtist = artist;
        window.SpotiFiakNative.updateTrack(title, artist, 'Spotify Web');
        console.log('[SpotiFiak] Now Playing:', title, '-', artist);
      }
    }

    // 4. Update Spicetify Player data shim
    if (window.Spicetify && window.Spicetify.Player) {
      window.Spicetify.Player.data = {
        item: {
          name: title,
          artists: [{ name: artist }],
          album: { images: [{ url: coverUrl }] }
        },
        is_paused: !isPlaying
      };
    }
  }

  // Monitor DOM changes with MutationObserver for instantaneous responsiveness
  const observer = new MutationObserver(() => {
    checkPlaybackState();
  });

  function startObserver() {
    const target = document.querySelector('.Root__now-playing-bar') ||
                   document.querySelector('footer') ||
                   document.body;
    if (target) {
      observer.observe(target, { childList: true, subtree: true, characterData: true });
      console.log('[SpotiFiak] Playback MutationObserver attached.');
    } else {
      setTimeout(startObserver, 1000);
    }
  }

  // Periodic polling fallback (every 1.5s) to guarantee lock screen sync
  setInterval(checkPlaybackState, 1500);

  // Background Audio Keep-Alive trick (prevents Android WebView audio suspension)
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      // Keep audio context running
      document.addEventListener('touchstart', function resumeAudio() {
        if (ctx.state === 'suspended') ctx.resume();
        document.removeEventListener('touchstart', resumeAudio);
      }, { passive: true });
    }
  } catch (e) {
    // Ignore audio context warning
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }

})();
