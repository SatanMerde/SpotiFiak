// SpotiFiak Android — WebView Activity
// Incorporates the battle-tested SpotiDuck mobile engine with Spicetify addons & in-app updater.

package com.spotifiak.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.media.AudioManager;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.json.JSONObject;

public class MainActivity extends Activity {

    private WebView webView;
    private final UpdateManager updateManager = new UpdateManager();
    private MediaSession mediaSession;
    private boolean isPlaying = false;
    private PowerManager.WakeLock wakeLock;

    // Spotify Web Player URL
    private static final String SPOTIFY_URL = "https://open.spotify.com";

    // Desktop Chrome 134 User Agent — matches SpotiDuck desktop spoofing
    private static final String DESKTOP_USER_AGENT =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36";

    // Adblock hosts set loaded from adblock_hosts.txt
    private final Set<String> adHosts = new HashSet<>();

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Load adblock hosts
        loadAdblockHosts();

        // Setup wake lock for background playback
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SpotiFiak:PlaybackWakeLock");
            }
        } catch (Exception e) {
            android.util.Log.e("SpotiFiak", "Error creating wake lock", e);
        }

        // Fullscreen immersive mode
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );

        // Dark status & nav bars
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(Color.parseColor("#0a0a0a"));
            getWindow().setNavigationBarColor(Color.parseColor("#0a0a0a"));
        }

        // Root layout
        FrameLayout rootLayout = new FrameLayout(this);
        rootLayout.setBackgroundColor(Color.parseColor("#0a0a0a"));

        webView = new WebView(this);
        setupWebView();

        rootLayout.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        // SpotiFiak Peach Button — replaces SpotiDuck's top settings button
        android.widget.ImageButton btnSpotiFiak = new android.widget.ImageButton(this);
        btnSpotiFiak.setId(android.view.View.generateViewId());
        btnSpotiFiak.setBackgroundResource(R.drawable.btn_peach_circle);
        btnSpotiFiak.setImageResource(R.drawable.ic_launcher_foreground_img);
        btnSpotiFiak.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
        btnSpotiFiak.setPadding(dpToPx(4), dpToPx(4), dpToPx(4), dpToPx(4));
        btnSpotiFiak.setContentDescription("Ouvrir SpotiFiak");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            btnSpotiFiak.setElevation(dpToPx(10));
        }

        FrameLayout.LayoutParams btnParams = new FrameLayout.LayoutParams(
            dpToPx(40),
            dpToPx(40),
            android.view.Gravity.TOP | android.view.Gravity.CENTER_HORIZONTAL
        );
        btnParams.topMargin = dpToPx(6);
        rootLayout.addView(btnSpotiFiak, btnParams);

        btnSpotiFiak.setOnClickListener(v -> {
            if (webView != null) {
                webView.evaluateJavascript("(function() { if (window.toggleSpotiFiakPanel) { window.toggleSpotiFiakPanel(); } else if (window.SpotiFiak && window.SpotiFiak.togglePanel) { window.SpotiFiak.togglePanel(); } })();", null);
            }
        });

        setContentView(rootLayout);

        // MediaSession for lock screen & notification controls
        setupMediaSession();
        createNotificationChannel();

        // Start background playback service
        try {
            Intent serviceIntent = new Intent(this, PlaybackService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }
        } catch (Exception e) {
            android.util.Log.e("SpotiFiak", "Error starting playback service", e);
        }

        // Load Spotify
        webView.loadUrl(SPOTIFY_URL);
    }

    /**
     * Loads ad-blocking domains from assets/adblock_hosts.txt
     */
    private void loadAdblockHosts() {
        try {
            InputStream is = getAssets().open("adblock_hosts.txt");
            BufferedReader r = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            String line;
            while ((line = r.readLine()) != null) {
                line = line.trim();
                if (!line.isEmpty() && !line.startsWith("#")) {
                    int space = line.indexOf(' ');
                    if (space != -1) {
                        line = line.substring(space + 1).trim();
                    }
                    adHosts.add(line.toLowerCase(Locale.ROOT));
                }
            }
            r.close();
        } catch (Exception e) {
            android.util.Log.e("SpotiFiak", "Failed to load adblock_hosts.txt", e);
        }
    }

    @SuppressLint({"SetJavaScriptEnabled", "RequiresFeature"})
    private void setupWebView() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        // 1. Enable Cookies & Third Party Cookies for Spotify authentication
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        }

        // 2. DOCUMENT_START_SCRIPT: Inject desktop_spoof.js before any Spotify scripts execute
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            String desktopSpoof = loadAsset("js/desktop_spoof.js");
            if (desktopSpoof != null) {
                try {
                    WebViewCompat.addDocumentStartJavaScript(webView, desktopSpoof, Collections.singleton("*"));
                } catch (Exception e) {
                    android.util.Log.e("SpotiFiak", "Error adding document start script", e);
                }
            }
        }

        WebSettings settings = webView.getSettings();

        // 3. Strip X-Requested-With header: CRITICAL to allow DRM license & audio stream requests!
        if (WebViewFeature.isFeatureSupported(WebViewFeature.REQUESTED_WITH_HEADER_ALLOW_LIST)) {
            try {
                WebSettingsCompat.setRequestedWithHeaderOriginAllowList(settings, Collections.emptySet());
            } catch (Exception e) {
                android.util.Log.e("SpotiFiak", "Error setting requested with header allow list", e);
            }
        }

        // 4. Configure WebSettings to match SpotiDuck
        settings.setUserAgentString(DESKTOP_USER_AGENT);
        settings.setJavaScriptEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(false);
        }
        try {
            settings.setOffscreenPreRaster(true);
        } catch (Exception ignored) {}

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webView.setInitialScale(100);
        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        webView.setScrollBarStyle(WebView.SCROLLBARS_INSIDE_OVERLAY);
        webView.setBackgroundColor(Color.parseColor("#121212"));

        // 5. JavaScript Interfaces: AndBridge (for SpotiDuck bridge) + SpotiFiakNative (for updater/store)
        webView.addJavascriptInterface(new AndBridge(), "AndBridge");
        webView.addJavascriptInterface(new SpotiFiakBridge(), "SpotiFiakNative");

        // 6. WebViewClient: Ad interception + script injection
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                // Fallback injection of desktop spoofing on start
                String spoof = loadAsset("js/desktop_spoof.js");
                if (spoof != null) {
                    view.evaluateJavascript(spoof, null);
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                injectSpotiDuckAndSpotiFiak(view);
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();

                // 1. Block ad domains from adblock_hosts.txt
                if (host != null && adHosts.contains(host.toLowerCase(Locale.ROOT))) {
                    return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(new byte[0]));
                }

                // 2. Intercept audio ads ONLY and serve silent.mp3 (NEVER intercept real Spotify CDN audio!)
                String url = uri.toString();
                if (url.contains("/mp3-ad/") || 
                    url.contains("audio-ads.spotify.com") || 
                    url.contains("mp3ad.scdn.co") || 
                    url.contains("/ad-logic/")) {
                    try {
                        InputStream is = getAssets().open("silent.mp3");
                        Map<String, String> headers = new HashMap<>();
                        headers.put("Access-Control-Allow-Origin", "*");
                        headers.put("Accept-Ranges", "bytes");
                        return new WebResourceResponse("audio/mpeg", "utf-8", 200, "OK", headers, is);
                    } catch (Exception ignored) {}
                }

                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.contains("spotify.com") || 
                    url.contains("spotify.link") ||
                    url.contains("accounts.google.com") ||
                    url.contains("facebook.com") ||
                    url.contains("appleid.apple.com")) {
                    return false;
                }
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                } catch (Exception e) {
                    android.util.Log.e("SpotiFiak", "Failed to open external URL: " + url, e);
                }
                return true;
            }
        });

        // 7. WebChromeClient: Auto-grant DRM Protected Media ID for music streaming
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    // Crucial: Automatically grant Widevine DRM Protected Media ID
                    request.grant(request.getResources());
                });
            }

            @Override
            public boolean onConsoleMessage(android.webkit.ConsoleMessage msg) {
                android.util.Log.d("SpotiFiakWeb", msg.message());
                return true;
            }
        });
    }

    /**
     * Injects SpotiDuck's mobile engine and SpotiFiak's Spicetify addons/updater
     */
    private void injectSpotiDuckAndSpotiFiak(WebView view) {
        int width = getResources().getDisplayMetrics().widthPixels;
        int height = getResources().getDisplayMetrics().heightPixels;

        // 1. SpotiDuck Config Object
        String sfConfig = String.format(Locale.ROOT,
            "window.SF_CONFIG = { " +
            "  isAndAutoEnabled: false, " +
            "  guiMode: 'csshack', " +
            "  isCanvasDisabled: true, " +
            "  isFullScreenEnabled: true, " +
            "  isAmoled: true, " +
            "  autoPlayMode: 'off', " +
            "  closeNowPlay: false, " +
            "  takeControl: true, " +
            "  closeLibText: 'Fermer', " +
            "  hideStatusBar: true, " +
            "  statusBarHeight: 0, " +
            "  screenWidth: %d, " +
            "  screenHeight: %d " +
            "};",
            width, height
        );
        view.evaluateJavascript(sfConfig, null);

        // 2. Desktop Spoofing (ServiceWorker blocker, touch play button, connect-state rewriter)
        String desktopSpoof = loadAsset("js/desktop_spoof.js");
        if (desktopSpoof != null) {
            view.evaluateJavascript(desktopSpoof, null);
        }

        // 3. SpotiDuck Spotify Bridge (captures Spotify platform, player bar, touch controls)
        String spotifyBridge = loadAsset("js/spotify_bridge.js");
        if (spotifyBridge != null) {
            view.evaluateJavascript(spotifyBridge, null);
        }

        // 4. SpotiDuck CSS Hacks (43KB tailored mobile responsive layout)
        String cssHacks = loadAsset("css/css_hacks.css");
        if (cssHacks != null) {
            String cssInj = "(function() { " +
                "var s = document.getElementById('sf-custom-style'); " +
                "if (!s) { " +
                "  s = document.createElement('style'); " +
                "  s.id = 'sf-custom-style'; " +
                "  (document.head || document.documentElement).appendChild(s); " +
                "} " +
                "s.textContent = " + escapeForJS(cssHacks) + "; " +
                "document.body.classList.add('sf-fullscreen-enabled', 'sf-video-bg'); " +
                "})();";
            view.evaluateJavascript(cssInj, null);
        }

        // 5. SpotiFiak Custom Styling (Peach accents, bottom navigation, in-app updater)
        String mobileCss = loadAsset("css/mobile-fixes.css");
        if (mobileCss != null) {
            String spotifiakCssInj = "(function() { " +
                "var s = document.getElementById('spotifiak-mobile-fixes'); " +
                "if (!s) { " +
                "  s = document.createElement('style'); " +
                "  s.id = 'spotifiak-mobile-fixes'; " +
                "  (document.head || document.documentElement).appendChild(s); " +
                "} " +
                "s.textContent = " + escapeForJS(mobileCss) + "; " +
                "})();";
            view.evaluateJavascript(spotifiakCssInj, null);
        }

        // 6. SpotiFiak Spicetify API, Marketplace & Addon Loader
        String apiScript = loadAsset("js/spotifiak-api.js");
        if (apiScript != null) view.evaluateJavascript(apiScript, null);

        String overlayScript = loadAsset("js/spotifiak-overlay.js");
        if (overlayScript != null) view.evaluateJavascript(overlayScript, null);

        String loaderScript = loadAsset("js/addon-loader.js");
        if (loaderScript != null) view.evaluateJavascript(loaderScript, null);
    }

    private String loadAsset(String filename) {
        try {
            InputStream is = getAssets().open(filename);
            BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            reader.close();
            return sb.toString();
        } catch (Exception e) {
            android.util.Log.e("SpotiFiak", "Failed to load asset: " + filename, e);
            return null;
        }
    }

    private String escapeForJS(String content) {
        return JSONObject.quote(content);
    }

    /**
     * AndBridge — JavascriptInterface implementing the SpotiDuck bridge API
     */
    public class AndBridge {
        @JavascriptInterface
        public void recMediaStatus(String statusJson) {
            try {
                JSONObject obj = new JSONObject(statusJson);
                String track = obj.optString("track", "");
                String artist = obj.optString("artist", "");
                long duration = obj.optLong("duration", 0);
                long position = obj.optLong("position", 0);
                boolean playing = obj.optBoolean("playing", false);
                String cover = obj.optString("cover", "");

                isPlaying = playing;
                runOnUiThread(() -> updateMediaSessionState(track, artist, cover, playing, position, duration));
            } catch (Exception e) {
                android.util.Log.e("SpotiFiak", "Error in recMediaStatus", e);
            }
        }

        @JavascriptInterface
        public void recMediaPosition(long pos) {
            if (mediaSession != null && isPlaying) {
                try {
                    mediaSession.setPlaybackState(new PlaybackState.Builder()
                        .setState(PlaybackState.STATE_PLAYING, pos, 1.0f)
                        .setActions(PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE |
                                    PlaybackState.ACTION_SKIP_TO_NEXT | PlaybackState.ACTION_SKIP_TO_PREVIOUS |
                                    PlaybackState.ACTION_SEEK_TO)
                        .build());
                } catch (Exception ignored) {}
            }
        }

        @JavascriptInterface
        public void wakeUp() {
            try {
                if (wakeLock != null && !wakeLock.isHeld()) {
                    wakeLock.acquire(10 * 60 * 1000L /* 10 minutes */);
                }
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void wakeOff() {
            try {
                if (wakeLock != null && wakeLock.isHeld()) {
                    wakeLock.release();
                }
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public boolean isWoke() {
            return wakeLock != null && wakeLock.isHeld();
        }

        @JavascriptInterface
        public void cssInjected() {
            android.util.Log.d("SpotiFiak", "CSS Injected successfully");
        }

        @JavascriptInterface
        public void playLoaded() {
            android.util.Log.d("SpotiFiak", "Playback loaded successfully");
        }

        @JavascriptInterface
        public void onUserInfoCaptured(String token, String cliToken, String devId) {
            android.util.Log.d("SpotiFiak", "User info captured: devId=" + devId);
        }

        @JavascriptInterface
        public void setExpanded(boolean expanded) {
            android.util.Log.d("SpotiFiak", "Fullscreen player state: " + expanded);
        }

        @JavascriptInterface
        public void setSearchActive(boolean active) {
            android.util.Log.d("SpotiFiak", "Search active: " + active);
        }

        @JavascriptInterface
        public void enterPip() {}

        @JavascriptInterface
        public void enterPipVideo(int w, int h) {}

        @JavascriptInterface
        public boolean isSignatureValid() {
            return true;
        }

        @JavascriptInterface
        public void loginDetected() {}

        @JavascriptInterface
        public void deferMessage(String msg) {}

        @JavascriptInterface
        public void setCanvasDisabled(boolean disabled) {}

        @JavascriptInterface
        public void manageTSleep(boolean sleep) {}

        @JavascriptInterface
        public void manageTShut(boolean shut) {}

        @JavascriptInterface
        public void onMediaItemsLoaded(String rootId, String itemsJson) {}

        @JavascriptInterface
        public void onSearchCompleted(String query, String resultJson) {}

        @JavascriptInterface
        public String nativeFetch(String url, String method, String headersJson, String body) {
            return null;
        }
    }

    /**
     * MediaSession setup for system controls
     */
    private void setupMediaSession() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mediaSession = new MediaSession(this, "SpotiFiakMediaSession");
            mediaSession.setCallback(new MediaSession.Callback() {
                @Override
                public void onPlay() {
                    sendMediaKey("play");
                }

                @Override
                public void onPause() {
                    sendMediaKey("pause");
                }

                @Override
                public void onSkipToNext() {
                    sendMediaKey("next");
                }

                @Override
                public void onSkipToPrevious() {
                    sendMediaKey("previous");
                }

                @Override
                public void onSeekTo(long pos) {
                    runOnUiThread(() -> {
                        String js = "window.SpotiDuck && window.SpotiDuck.Platform && window.SpotiDuck.Platform.getPlayerAPI().seekTo(" + pos + ");";
                        webView.evaluateJavascript(js, null);
                    });
                }
            });
            mediaSession.setActive(true);
        }
    }

    private void sendMediaKey(String action) {
        runOnUiThread(() -> {
            String js;
            switch (action) {
                case "play":
                case "pause":
                    js = "window.togglePlayPause ? window.togglePlayPause() : (document.querySelector('[data-testid=\"control-button-playpause\"]') && document.querySelector('[data-testid=\"control-button-playpause\"]').click());";
                    break;
                case "next":
                    js = "window.playNextTrack ? window.playNextTrack() : (document.querySelector('[data-testid=\"control-button-skip-forward\"]') && document.querySelector('[data-testid=\"control-button-skip-forward\"]').click());";
                    break;
                case "previous":
                    js = "window.playPrevTrack ? window.playPrevTrack() : (document.querySelector('[data-testid=\"control-button-skip-back\"]') && document.querySelector('[data-testid=\"control-button-skip-back\"]').click());";
                    break;
                default:
                    return;
            }
            webView.evaluateJavascript(js, null);
        });
    }

    private void updateMediaSessionState(String title, String artist, String coverUrl, boolean playing, long position, long duration) {
        if (mediaSession == null) return;

        MediaMetadata.Builder metaBuilder = new MediaMetadata.Builder()
            .putString(MediaMetadata.METADATA_KEY_TITLE, title.isEmpty() ? "SpotiFiak" : title)
            .putString(MediaMetadata.METADATA_KEY_ARTIST, artist.isEmpty() ? "Spotify" : artist)
            .putLong(MediaMetadata.METADATA_KEY_DURATION, duration);

        mediaSession.setMetadata(metaBuilder.build());

        PlaybackState.Builder stateBuilder = new PlaybackState.Builder()
            .setActions(
                PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE |
                PlaybackState.ACTION_SKIP_TO_NEXT | PlaybackState.ACTION_SKIP_TO_PREVIOUS |
                PlaybackState.ACTION_SEEK_TO
            )
            .setState(
                playing ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED,
                position,
                playing ? 1.0f : 0.0f
            );

        mediaSession.setPlaybackState(stateBuilder.build());
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                "spotifiak_playback",
                "SpotiFiak Audio",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Contrôles de lecture SpotiFiak");
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    /**
     * SpotiFiakBridge — JavascriptInterface for in-app updates and settings
     */
    public class SpotiFiakBridge {
        @JavascriptInterface
        public String getAppVersion() {
            try {
                return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "1.4.3";
            }
        }

        @JavascriptInterface
        public String getVersion() {
            return getAppVersion();
        }

        @JavascriptInterface
        public void checkForUpdates() {
            updateManager.checkForUpdates(MainActivity.this, new UpdateManager.UpdateCheckCallback() {
                @Override
                public void onResult(UpdateManager.UpdateInfo info) {
                    runOnUiThread(() -> {
                        if (info.isUpdateAvailable) {
                            String js = String.format(
                                "window.SpotiFiak && window.SpotiFiak.onUpdateAvailable && window.SpotiFiak.onUpdateAvailable(%s, %s, %s);",
                                JSONObject.quote(info.latestVersion),
                                JSONObject.quote(info.releaseNotes),
                                JSONObject.quote(info.apkDownloadUrl)
                            );
                            webView.evaluateJavascript(js, null);
                        } else {
                            String js = "window.SpotiFiak && window.SpotiFiak.onNoUpdateAvailable && window.SpotiFiak.onNoUpdateAvailable();";
                            webView.evaluateJavascript(js, null);
                        }
                    });
                }

                @Override
                public void onError(String error) {
                    runOnUiThread(() -> {
                        String js = "window.SpotiFiak && window.SpotiFiak.onUpdateError && window.SpotiFiak.onUpdateError(" + JSONObject.quote(error) + ");";
                        webView.evaluateJavascript(js, null);
                    });
                }
            });
        }

        @JavascriptInterface
        public void downloadAndInstallUpdate(String downloadUrl) {
            updateManager.downloadAndInstall(MainActivity.this, downloadUrl, new UpdateManager.DownloadProgressCallback() {
                @Override
                public void onProgress(int progressPercent, long downloadedBytes, long totalBytes) {
                    runOnUiThread(() -> {
                        String js = String.format(Locale.ROOT,
                            "window.SpotiFiak && window.SpotiFiak.onUpdateProgress && window.SpotiFiak.onUpdateProgress(%d, %d, %d);",
                            progressPercent, downloadedBytes, totalBytes
                        );
                        webView.evaluateJavascript(js, null);
                    });
                }

                @Override
                public void onComplete(File apkFile) {
                    runOnUiThread(() -> {
                        String js = "window.SpotiFiak && window.SpotiFiak.onUpdateComplete && window.SpotiFiak.onUpdateComplete();";
                        webView.evaluateJavascript(js, null);
                    });
                }

                @Override
                public void onError(String error) {
                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, error, Toast.LENGTH_LONG).show();
                        String js = "window.SpotiFiak && window.SpotiFiak.onUpdateError && window.SpotiFiak.onUpdateError(" + JSONObject.quote(error) + ");";
                        webView.evaluateJavascript(js, null);
                    });
                }
            });
        }

        @JavascriptInterface
        public void showToast(String message) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public void log(String message) {
            android.util.Log.d("SpotiFiak-JS", message);
        }

        @JavascriptInterface
        public void openExternal(String url) {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(intent);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        UpdateManager.handleActivityResult(this, requestCode, resultCode);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            webView.evaluateJavascript(
                "(() => {" +
                "  let fs = document.getElementById('sf-fs-player');" +
                "  if (fs) { fs.remove(); return 'closed_fs'; }" +
                "  let p = document.getElementById('spotifiak-panel');" +
                "  if (p && (p.style.top === '0px' || p.style.top === '0%')) {" +
                "    if (window.toggleSpotiFiakPanel) window.toggleSpotiFiakPanel();" +
                "    return 'closed_panel';" +
                "  }" +
                "  if (document.body.classList.contains('sf-show-library')) {" +
                "    document.body.classList.remove('sf-show-library');" +
                "    return 'closed_library';" +
                "  }" +
                "  return 'none';" +
                "})();",
                value -> {
                    if (value == null || "\"none\"".equals(value)) {
                        runOnUiThread(() -> {
                            if (webView.canGoBack()) {
                                webView.goBack();
                            } else {
                                finish();
                            }
                        });
                    }
                }
            );
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    private void requestAudioFocus() {
        try {
            AudioManager audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            if (audioManager != null) {
                audioManager.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
            }
        } catch (Exception e) {
            android.util.Log.e("SpotiFiak", "Error requesting audio focus", e);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        requestAudioFocus();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Keep playing in background
    }

    @Override
    protected void onDestroy() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
        }
        webView.destroy();
        super.onDestroy();
    }

    private int dpToPx(int dp) {
        return (int) (dp * getResources().getDisplayMetrics().density + 0.5f);
    }
}
