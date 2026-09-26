// SpotiFiak Android — WebView Activity
// This is the main Android activity that loads Spotify Web Player
// and injects SpotiFiak JS/CSS for addons, themes, and extensions.
// Inspired by SpotiDuck's WebView approach.

package com.spotifiak.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {

    private WebView webView;
    private MediaSession mediaSession;
    private boolean isPlaying = false;

    // Spotify Web Player URL
    private static final String SPOTIFY_URL = "https://open.spotify.com";
    
    // Desktop User Agent — forces desktop mode like SpotiDuck
    private static final String DESKTOP_USER_AGENT = 
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Fullscreen immersive mode
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        
        // Dark status/nav bars
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(Color.parseColor("#0a0a0a"));
            getWindow().setNavigationBarColor(Color.parseColor("#0a0a0a"));
        }

        // Create WebView
        FrameLayout rootLayout = new FrameLayout(this);
        rootLayout.setBackgroundColor(Color.parseColor("#0a0a0a"));

        webView = new WebView(this);
        setupWebView();

        rootLayout.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        setContentView(rootLayout);

        // Setup media session for lock screen controls
        setupMediaSession();

        // Create notification channel for Android 8+
        createNotificationChannel();

        // Load Spotify
        webView.loadUrl(SPOTIFY_URL);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();

        // JavaScript — essential for Spotify
        settings.setJavaScriptEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);

        // Desktop mode — like SpotiDuck, trick Spotify into desktop layout
        settings.setUserAgentString(DESKTOP_USER_AGENT);

        // DOM storage & databases
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);

        // Media
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowContentAccess(true);

        // Cache & performance
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        // Mixed content (HTTP resources in HTTPS page)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        }

        // Enable cookies for Spotify login
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        }

        // Add JavaScript interface for native bridge
        webView.addJavascriptInterface(new SpotiFiakBridge(), "SpotiFiakNative");

        // WebView client — handles page loading and JS injection
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                
                // Inject SpotiFiak core scripts when Spotify loads
                if (url.contains("open.spotify.com")) {
                    injectSpotiFiak(view);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                
                // Keep Spotify URLs in WebView
                if (url.contains("spotify.com") || url.contains("accounts.spotify.com")) {
                    return false;
                }
                
                // Open external links in browser
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(intent);
                return true;
            }
        });

        // Chrome client for fullscreen video, console logs etc.
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(android.webkit.ConsoleMessage msg) {
                // Forward console messages for debugging
                android.util.Log.d("SpotiFiak", msg.message());
                return true;
            }
        });

        // Dark background while loading
        webView.setBackgroundColor(Color.parseColor("#0a0a0a"));
    }

    /**
     * Inject SpotiFiak scripts and styles into the Spotify Web Player.
     * This is the core mechanism — same approach as SpotiDuck.
     */
    private void injectSpotiFiak(WebView view) {
        // 1. Inject the SpotiFiak API (Spicetify compatibility layer)
        String apiScript = loadAsset("js/spotifiak-api.js");
        if (apiScript != null) {
            view.evaluateJavascript(apiScript, null);
        }

        // 2. Inject the SpotiFiak overlay UI (marketplace, addon manager)
        String overlayScript = loadAsset("js/spotifiak-overlay.js");
        if (overlayScript != null) {
            view.evaluateJavascript(overlayScript, null);
        }

        // 3. Inject base CSS fixes for mobile
        String mobileCss = loadAsset("css/mobile-fixes.css");
        if (mobileCss != null) {
            String cssInjection = "(() => {" +
                "const style = document.createElement('style');" +
                "style.id = 'spotifiak-mobile-fixes';" +
                "style.textContent = " + escapeForJS(mobileCss) + ";" +
                "document.head.appendChild(style);" +
            "})();";
            view.evaluateJavascript(cssInjection, null);
        }

        // 4. Inject the addon loader (loads installed addons from storage)
        String loaderScript = loadAsset("js/addon-loader.js");
        if (loaderScript != null) {
            view.evaluateJavascript(loaderScript, null);
        }

        // 5. Inject the playback monitor for lock screen/notification controls
        String playbackMonitor = loadAsset("js/playback-monitor.js");
        if (playbackMonitor != null) {
            view.evaluateJavascript(playbackMonitor, null);
        }
    }

    /**
     * Load a file from the assets/ directory
     */
    private String loadAsset(String filename) {
        try {
            InputStream is = getAssets().open(filename);
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(is, StandardCharsets.UTF_8)
            );
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

    /**
     * Escape string content for JavaScript injection
     */
    private String escapeForJS(String content) {
        return "`" + content
            .replace("\\", "\\\\")
            .replace("`", "\\`")
            .replace("$", "\\$") + "`";
    }

    /**
     * Setup Android MediaSession for lock screen controls
     */
    private void setupMediaSession() {
        mediaSession = new MediaSession(this, "SpotiFiak");
        mediaSession.setActive(true);
        
        mediaSession.setCallback(new MediaSession.Callback() {
            @Override
            public void onPlay() {
                webView.evaluateJavascript(
                    "document.querySelector('[data-testid=\"control-button-playpause\"]')?.click();",
                    null
                );
            }

            @Override
            public void onPause() {
                webView.evaluateJavascript(
                    "document.querySelector('[data-testid=\"control-button-playpause\"]')?.click();",
                    null
                );
            }

            @Override
            public void onSkipToNext() {
                webView.evaluateJavascript(
                    "document.querySelector('[data-testid=\"control-button-skip-forward\"]')?.click();",
                    null
                );
            }

            @Override
            public void onSkipToPrevious() {
                webView.evaluateJavascript(
                    "document.querySelector('[data-testid=\"control-button-skip-back\"]')?.click();",
                    null
                );
            }
        });

        updatePlaybackState(false);
    }

    private void updatePlaybackState(boolean playing) {
        this.isPlaying = playing;
        PlaybackState.Builder stateBuilder = new PlaybackState.Builder()
            .setActions(
                PlaybackState.ACTION_PLAY |
                PlaybackState.ACTION_PAUSE |
                PlaybackState.ACTION_SKIP_TO_NEXT |
                PlaybackState.ACTION_SKIP_TO_PREVIOUS |
                PlaybackState.ACTION_PLAY_PAUSE
            )
            .setState(
                playing ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED,
                PlaybackState.PLAYBACK_POSITION_UNKNOWN,
                1.0f
            );
        mediaSession.setPlaybackState(stateBuilder.build());
    }

    private void updateMediaMetadata(String title, String artist, String album) {
        MediaMetadata.Builder metadataBuilder = new MediaMetadata.Builder()
            .putString(MediaMetadata.METADATA_KEY_TITLE, title)
            .putString(MediaMetadata.METADATA_KEY_ARTIST, artist)
            .putString(MediaMetadata.METADATA_KEY_ALBUM, album);
        mediaSession.setMetadata(metadataBuilder.build());
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                "spotifiak_playback",
                "Lecture SpotiFiak",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Contrôles de lecture SpotiFiak");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    /**
     * JavaScript Bridge — Native Android methods callable from JS
     */
    private class SpotiFiakBridge {
        
        @JavascriptInterface
        public void showToast(String message) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public void updatePlayback(boolean playing) {
            runOnUiThread(() -> updatePlaybackState(playing));
        }

        @JavascriptInterface
        public void updateTrack(String title, String artist, String album) {
            runOnUiThread(() -> updateMediaMetadata(title, artist, album));
        }

        @JavascriptInterface
        public String getVersion() {
            return "1.0.0";
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

    // Handle back button — go back in WebView history
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Don't pause WebView — keep playing in background like SpotiDuck
    }

    @Override
    protected void onDestroy() {
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
        }
        webView.destroy();
        super.onDestroy();
    }
}
