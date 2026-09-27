(function() {
    if (window.__desktop_spoof_applied) return;
    window.__desktop_spoof_applied = true;

    // =========================================================================
    // SECTION 1: WORKER NEUTRALIZER & INTERVAL THROTTLE & VIDEO PARKING
    // =========================================================================

    /* === Service Worker: unregister + prevent re-registration ===
     * Unregisters Spotify's service worker and blocks Workbox from registering it.
     * The SW intercepts all network requests to maintain an offline cache map,
     * which poisons IndexedDB/CacheStorage and causes UI freezes and blank screens
     * after Spotify web updates, forcing users to "Clear Data". Blocking it forces
     * standard HTTP network-first loading via the WebView cache. */
    if (navigator.serviceWorker) {
        try {
            navigator.serviceWorker.register = function() {
                return Promise.reject(new Error('SW blocked by SpotiDuck'));
            };
        } catch(e) {}
        try {
            navigator.serviceWorker.getRegistrations().then(function(regs) {
                if (regs && regs.length) {
                    regs.forEach(function(reg) {
                        reg.unregister().catch(function() {});
                    });
                }
            }).catch(function() {});
        } catch(e) {}
    }

    /* === Interval throttle: 250ms -> 500ms ===
     * Throttles aggressive 250ms burst polling loops from web-player.js to 500ms,
     * cutting idle CPU wakeups by 50% with zero perceptible UX impact. */
    try {
        var origSI = window.setInterval.bind(window);
        window.setInterval = function(fn, delay) {
            if (delay === 250) delay = 500;
            return origSI(fn, delay);
        };
    } catch(e) {}

    /* === Background video park/restore ===
     * Stashes src and pauses background canvas videos when the app is hidden or
     * screen is locked. Restores them on return to save GPU, CPU, and RAM. */
    try {
        var parkedVideos = [];

        function isCanvasVid(v) {
            try {
                if (v.muted) return true;
                if (v.hasAttribute && v.hasAttribute('loop')) return true;
                if (v.style && v.style.objectFit === 'cover') return true;
            } catch(e) {}
            return false;
        }

        function parkLiveVideos() {
            var vs = document.querySelectorAll('video');
            for (var i = 0; i < vs.length; i++) {
                var v = vs[i];
                if (v.__sdParked) continue;
                if (!isCanvasVid(v)) continue;
                var src = v.currentSrc || v.getAttribute('src') || '';
                if (!src || src.indexOf('blob:') === 0) continue;
                v.__sdParked = true;
                parkedVideos.push({ el: v, src: src, t: (v.currentTime || 0), playing: (!v.paused && !v.ended) });
                try { v.pause(); } catch(e) {}
                try { v.removeAttribute('src'); } catch(e) {}
                try { v.load(); } catch(e) {}
            }
        }

        function restoreLiveVideos() {
            if (!parkedVideos.length) return;
            for (var i = 0; i < parkedVideos.length; i++) {
                var b = parkedVideos[i];
                var v = b.el;
                if (!v || !v.isConnected) continue;
                if (v.getAttribute('src') || v.currentSrc) {
                    v.__sdParked = false;
                    continue;
                }
                try {
                    v.src = b.src;
                    v.currentTime = b.t || 0;
                    if (b.playing) {
                        var p = v.play();
                        if (p && p.catch) p.catch(function() {});
                    }
                } catch(e) {}
                v.__sdParked = false;
            }
            parkedVideos = [];
        }

        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') parkLiveVideos();
            else restoreLiveVideos();
        });
    } catch(e) {}

    // =========================================================================
    // SECTION 2: GOOGLE ANALYTICS & TELEMETRY NEUTRALIZER
    // =========================================================================

    /* Replaces window.ga with a noop that still fires hitCallbacks so pages
     * depending on GA callbacks don't break, and proxies dataLayer.push. */
    try {
        var noopfn = function() {};
        var Tracker = function() {};
        Tracker.prototype.get = noopfn;
        Tracker.prototype.set = noopfn;
        Tracker.prototype.send = noopfn;

        var ga = function() {
            var args = Array.from(arguments);
            var len = args.length;
            if (len === 0) return;
            var fn = null;
            var last = args[len - 1];
            if (last instanceof Object && last.hitCallback instanceof Function) {
                fn = last.hitCallback;
            } else if (last instanceof Function) {
                fn = function() { last(new Tracker()); };
            } else {
                var pos = args.indexOf('hitCallback');
                if (pos !== -1 && args[pos + 1] instanceof Function) {
                    fn = args[pos + 1];
                }
            }
            if (fn instanceof Function) {
                try { fn(); } catch(ex) {}
            }
        };
        ga.create = function() { return new Tracker(); };
        ga.getByName = function() { return new Tracker(); };
        ga.getAll = function() { return [new Tracker()]; };
        ga.remove = noopfn;
        ga.loaded = true;
        window.ga = ga;
        window.GoogleAnalyticsObject = 'ga';

        var dl = window.dataLayer;
        if (dl instanceof Object && typeof dl.push === 'function') {
            var doCallback = function(item) {
                if (item instanceof Object && typeof item.eventCallback === 'function') {
                    setTimeout(item.eventCallback, 1);
                    item.eventCallback = function() {};
                }
            };
            dl.push = new Proxy(dl.push, {
                apply: function(target, thisArg, args) {
                    doCallback(args[0]);
                    return Reflect.apply(target, thisArg, args);
                }
            });
        }
    } catch(e) {}

    // =========================================================================
    // SECTION 3: SCREEN & BROWSER USER-AGENT & CLIENT HINTS SPOOFING
    // =========================================================================

    function safeDefine(obj, name, getter) {
        try { Object.defineProperty(obj, name, { get: getter, configurable: true }); } catch(e) {}
    }

    safeDefine(navigator, 'webdriver', function() { return false; });
    safeDefine(navigator, 'vendor', function() { return 'Google Inc.'; });
    safeDefine(navigator, 'productSub', function() { return '20030107'; });
    safeDefine(navigator, 'platform', function() { return 'Win32'; });
    safeDefine(navigator, 'oscpu', function() { return 'Windows NT 10.0; Win64; x64'; });
    safeDefine(navigator, 'languages', function() { return ['en-US', 'en']; });
    safeDefine(navigator, 'language', function() { return 'en-US'; });

    // Mock HTML5 fullscreen capabilities to false so Spotify Web Player does not mount the desktop fullscreen button
    try {
        var retFalse = function() { return false; };
        safeDefine(document, 'fullscreenEnabled', retFalse);
        safeDefine(Document.prototype, 'fullscreenEnabled', retFalse);
        safeDefine(document, 'webkitFullscreenEnabled', retFalse);
        safeDefine(Document.prototype, 'webkitFullscreenEnabled', retFalse);
    } catch(e) {}

    // Mock Document Picture-in-Picture API wired to native Android PiP mode
    try {
        var activePipWindow = null;

        function createPipWindow() {
            var pipDoc = document.implementation.createHTMLDocument('SpotiDuck PiP');
            var listeners = {};
            var pipWin = {
                document: pipDoc,
                width: 512,
                height: 512,
                onpagehide: null,
                onunload: null,
                addEventListener: function(type, listener) {
                    if (!listener) return;
                    if (!listeners[type]) listeners[type] = [];
                    listeners[type].push(listener);
                },
                removeEventListener: function(type, listener) {
                    if (!listeners[type] || !listener) return;
                    listeners[type] = listeners[type].filter(function(l) { return l !== listener; });
                },
                dispatchEvent: function(event) {
                    var type = event ? event.type : '';
                    if (type === 'pagehide' && typeof pipWin.onpagehide === 'function') {
                        try { pipWin.onpagehide.call(pipWin, event); } catch(e) {}
                    }
                    if (type === 'unload' && typeof pipWin.onunload === 'function') {
                        try { pipWin.onunload.call(pipWin, event); } catch(e) {}
                    }
                    if (listeners[type]) {
                        var list = listeners[type].slice();
                        for (var i = 0; i < list.length; i++) {
                            try { list[i].call(pipWin, event); } catch(e) {}
                        }
                    }
                    return true;
                },
                close: function() {
                    if (activePipWindow === pipWin) {
                        activePipWindow = null;
                        try {
                            var ev = new Event('pagehide');
                            pipWin.dispatchEvent(ev);
                            var uev = new Event('unload');
                            pipWin.dispatchEvent(uev);
                        } catch(e) {}
                    }
                },
                matchMedia: window.matchMedia ? window.matchMedia.bind(window) : function() { return { matches: false, addListener: function(){}, removeListener: function(){} }; },
                getComputedStyle: window.getComputedStyle ? window.getComputedStyle.bind(window) : function() { return {}; },
                requestAnimationFrame: window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(fn) { return setTimeout(fn, 16); },
                cancelAnimationFrame: window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : function(id) { clearTimeout(id); }
            };
            try { pipDoc.defaultView = pipWin; } catch(e) {}
            return pipWin;
        }

        window.documentPictureInPicture = {
            get window() { return activePipWindow; },
            onenter: null,
            requestWindow: async function(options) {
                try {
                    var vs = document.querySelectorAll('video');
                    var pv = null;
                    for (var i = 0; i < vs.length; i++) {
                        var v = vs[i];
                        var src = v.currentSrc || v.src || '';
                        if (src.indexOf('canvaz') === -1) {
                            pv = v;
                            break;
                        }
                    }
                    if (pv && window.AndBridge && window.AndBridge.enterPipVideo) {
                        var w = pv.videoWidth || 0, h = pv.videoHeight || 0;
                        try { pv.requestFullscreen(); } catch(e) {}
                        window.AndBridge.enterPipVideo(w, h);
                    } else if (window.AndBridge && window.AndBridge.enterPip) {
                        window.AndBridge.enterPip();
                    }
                } catch(e) {}
                activePipWindow = createPipWindow();
                if (typeof this.onenter === 'function') {
                    try { this.onenter({ window: activePipWindow }); } catch(e) {}
                }
                return activePipWindow;
            },
            addEventListener: function(type, listener) {},
            removeEventListener: function(type, listener) {}
        };

        window.onNativePipChanged = function(isInPip) {
            if (!isInPip && activePipWindow) {
                var win = activePipWindow;
                activePipWindow = null;
                try {
                    var ev = new Event('pagehide');
                    win.dispatchEvent(ev);
                    var uev = new Event('unload');
                    win.dispatchEvent(uev);
                } catch(e) {}
            }
        };
    } catch(e) {}

    // Mock navigator.userAgentData to align JS client hints with desktop User-Agent
    if (navigator.userAgentData) {
        var mockUserAgentData = {
            brands: [
                { brand: 'Not;A=Brand', version: '8' },
                { brand: 'Chromium', version: '134' },
                { brand: 'Google Chrome', version: '134' }
            ],
            mobile: false,
            platform: 'Windows',
            architecture: 'x86',
            bitness: '64',
            model: '',
            platformVersion: '10.0.0',
            uaFullVersion: '134.0.0.0',
            getHighEntropyValues: async function(hints) {
                return {
                    brands: [
                        { brand: 'Not;A=Brand', version: '8' },
                        { brand: 'Chromium', version: '134' },
                        { brand: 'Google Chrome', version: '134' }
                    ],
                    mobile: false,
                    platform: 'Windows',
                    platformVersion: '10.0.0',
                    architecture: 'x86',
                    bitness: '64',
                    model: '',
                    uaFullVersion: '134.0.0.0'
                };
            },
            toJSON: function() {
                return {
                    brands: this.brands,
                    mobile: this.mobile,
                    platform: this.platform
                };
            }
        };
        safeDefine(navigator, 'userAgentData', function() { return mockUserAgentData; });
    }

    // =========================================================================
    // SECTION 4: NON-BLOCKING ASYNC FETCH & CAPABILITIES INTERCEPTOR
    // =========================================================================

    // Non-blocking fetch interceptor: Rewrites connect-state device capabilities in JS
    // without invoking synchronous Java bridge calls, keeping the UI at 60fps.
    (function() {
        var _origFetch = window.fetch;
        window.fetch = async function(input, init) {
            var url = (typeof input === 'string') ? input : (input && input.url ? input.url : '');
            var method = (init && init.method || (input && input.method) || 'GET').toUpperCase();

            // Rewrite connect-state capabilities
            if (url && url.indexOf('connect-state/v1/devices') !== -1 && method === 'PUT') {
                try {
                    var bodyText = null;
                    if (init && init.body) {
                        bodyText = (typeof init.body === 'string') ? init.body : await new Response(init.body).text();
                    } else if (input && input.body) {
                        bodyText = await input.clone().text();
                    }
                    if (bodyText) {
                        var payload = JSON.parse(bodyText);
                        var caps = payload && payload.device && payload.device.device_info && payload.device.device_info.capabilities;
                        if (caps) {
                            caps.can_be_player = true;
                            caps.hidden = false;
                        }
                        var newBody = JSON.stringify(payload);
                        if (init) {
                            init.body = newBody;
                        } else if (typeof input === 'object') {
                            init = Object.assign({}, input, { body: newBody });
                        }
                    }
                } catch(e) {}
            }

            return _origFetch.call(this, input, init);
        };
    })();

    // =========================================================================
    // SECTION 5: TOUCHSCREEN PLAY BUTTON INJECTION
    // =========================================================================

    // Inject custom CSS to make play buttons permanently visible on touchscreen
    (function() {
        var style = document.createElement('style');
        style.innerHTML = `
            /* Force play/pause buttons to be permanently visible */
            [data-testid="tracklist-row"] button[aria-label*="Play" i],
            [data-testid="tracklist-row"] button[aria-label*="Pause" i],
            [data-testid="tracklist-row"] button[aria-label*="Lire" i],
            [data-testid="tracklist-row"] button[aria-label*="Lecture" i],
            [data-testid="tracklist-row"] button[aria-label*="Écouter" i],
            [data-testid="tracklist-row"] button[class*="qrR_"],
            [data-testid="tracklist-row"] [role="gridcell"]:first-child button {
                opacity: 1 !important;
                visibility: visible !important;
                display: flex !important;
            }
            /* Hide track list index numbers so the play button sits in its place */
            [data-testid="tracklist-row"] [role="gridcell"]:first-child span {
                display: none !important;
            }
        `;
        if (document.documentElement) {
            document.documentElement.appendChild(style);
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                document.documentElement.appendChild(style);
            });
        }
    })();
})();