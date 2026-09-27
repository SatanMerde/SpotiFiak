package com.spotifiak.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;

import androidx.core.content.FileProvider;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * In-App Auto Updater for SpotiFiak
 * Checks GitHub Releases API for updates, downloads the latest APK,
 * and launches the Android Package Installer for in-place 1-click updates.
 */
public class UpdateManager {

    private static final String TAG = "SpotiFiakUpdate";
    private static final String GITHUB_RELEASES_URL = "https://api.github.com/repos/SatanMerde/SpotiFiak/releases/latest";
    public static final int REQUEST_INSTALL_UNKNOWN_APPS = 1204;

    private static File pendingApkFile = null;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    public static class UpdateInfo {
        public final boolean isUpdateAvailable;
        public final String latestVersion;
        public final String currentVersion;
        public final String title;
        public final String releaseNotes;
        public final String apkDownloadUrl;

        public UpdateInfo(boolean isUpdateAvailable, String latestVersion, String currentVersion,
                          String title, String releaseNotes, String apkDownloadUrl) {
            this.isUpdateAvailable = isUpdateAvailable;
            this.latestVersion = latestVersion;
            this.currentVersion = currentVersion;
            this.title = title;
            this.releaseNotes = releaseNotes;
            this.apkDownloadUrl = apkDownloadUrl;
        }

        public JSONObject toJson() {
            try {
                JSONObject obj = new JSONObject();
                obj.put("isUpdateAvailable", isUpdateAvailable);
                obj.put("latestVersion", latestVersion);
                obj.put("currentVersion", currentVersion);
                obj.put("title", title);
                obj.put("releaseNotes", releaseNotes);
                obj.put("apkDownloadUrl", apkDownloadUrl);
                return obj;
            } catch (Exception e) {
                return new JSONObject();
            }
        }
    }

    public interface UpdateCheckCallback {
        void onResult(UpdateInfo info);
        void onError(String error);
    }

    public interface DownloadProgressCallback {
        void onProgress(int percent, long downloadedBytes, long totalBytes);
        void onComplete(File apkFile);
        void onError(String error);
    }

    /**
     * Get the current app version name (e.g. "1.2.0")
     */
    public static String getCurrentVersion(Context context) {
        try {
            PackageInfo pInfo = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
            return pInfo.versionName != null ? pInfo.versionName : "1.2.0";
        } catch (PackageManager.NameNotFoundException e) {
            return "1.2.0";
        }
    }

    /**
     * Compare semantic version numbers (e.g. "1.2.1" > "1.2.0")
     */
    public static boolean isVersionNewer(String latestTag, String currentVersion) {
        if (latestTag == null || currentVersion == null) return false;
        
        String cleanLatest = latestTag.replaceAll("(?i)^v", "").trim();
        String cleanCurrent = currentVersion.replaceAll("(?i)^v", "").trim();

        String[] latestParts = cleanLatest.split("\\.");
        String[] currentParts = cleanCurrent.split("\\.");

        int length = Math.max(latestParts.length, currentParts.length);
        for (int i = 0; i < length; i++) {
            int l = 0;
            int c = 0;
            if (i < latestParts.length) {
                try { l = Integer.parseInt(latestParts[i].replaceAll("[^0-9]", "")); } catch (Exception ignored) {}
            }
            if (i < currentParts.length) {
                try { c = Integer.parseInt(currentParts[i].replaceAll("[^0-9]", "")); } catch (Exception ignored) {}
            }
            if (l > c) return true;
            if (l < c) return false;
        }
        return false;
    }

    /**
     * Check GitHub Releases for new updates asynchronously
     */
    public void checkForUpdates(Context context, UpdateCheckCallback callback) {
        executor.execute(() -> {
            try {
                URL url = new URL(GITHUB_RELEASES_URL);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("User-Agent", "SpotiFiak-Android-App");
                conn.setRequestProperty("Accept", "application/vnd.github.v3+json");
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(8000);

                int responseCode = conn.getResponseCode();
                if (responseCode != 200) {
                    postError(callback, "Erreur GitHub API : Code " + responseCode);
                    return;
                }

                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line).append("\n");
                }
                reader.close();

                JSONObject release = new JSONObject(sb.toString());
                String tagName = release.optString("tag_name", "");
                String title = release.optString("name", tagName);
                String body = release.optString("body", "");

                String apkDownloadUrl = null;
                JSONArray assets = release.optJSONArray("assets");
                if (assets != null) {
                    for (int i = 0; i < assets.length(); i++) {
                        JSONObject asset = assets.getJSONObject(i);
                        String assetName = asset.optString("name", "");
                        if (assetName.endsWith(".apk")) {
                            apkDownloadUrl = asset.optString("browser_download_url", null);
                            break;
                        }
                    }
                }

                if (apkDownloadUrl == null) {
                    apkDownloadUrl = "https://github.com/SatanMerde/SpotiFiak/releases/latest/download/SpotiFiak.apk";
                }

                String currentVersion = getCurrentVersion(context);
                boolean hasUpdate = isVersionNewer(tagName, currentVersion);
                String cleanVersion = tagName.replaceFirst("^v", "");

                UpdateInfo info = new UpdateInfo(hasUpdate, cleanVersion, currentVersion, title, body, apkDownloadUrl);
                mainHandler.post(() -> callback.onResult(info));

            } catch (Exception e) {
                Log.e(TAG, "Update check failed", e);
                postError(callback, "Impossible de vérifier les mises à jour : " + e.getMessage());
            }
        });
    }

    /**
     * Download the latest APK and start the in-place package installer
     */
    public void downloadAndInstall(Activity activity, String apkUrl, DownloadProgressCallback callback) {
        executor.execute(() -> {
            try {
                URL url = new URL(apkUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestProperty("User-Agent", "SpotiFiak-Android-App");
                conn.setInstanceFollowRedirects(true);
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(30000);

                // Handle HTTP redirects (GitHub Releases redirect to AWS S3)
                int status = conn.getResponseCode();
                if (status == HttpURLConnection.HTTP_MOVED_TEMP || status == HttpURLConnection.HTTP_MOVED_PERM
                        || status == HttpURLConnection.HTTP_SEE_OTHER) {
                    String newUrl = conn.getHeaderField("Location");
                    conn = (HttpURLConnection) new URL(newUrl).openConnection();
                    conn.setRequestProperty("User-Agent", "SpotiFiak-Android-App");
                }

                long totalBytes = conn.getContentLengthLong();
                File cacheDir = new File(activity.getCacheDir(), "updates");
                if (!cacheDir.exists()) cacheDir.mkdirs();

                File apkFile = new File(cacheDir, "SpotiFiak_Update.apk");
                if (apkFile.exists()) apkFile.delete();

                InputStream is = new BufferedInputStream(conn.getInputStream());
                FileOutputStream fos = new FileOutputStream(apkFile);

                byte[] buffer = new byte[8192];
                long downloadedBytes = 0;
                int bytesRead;
                int lastPercent = -1;

                while ((bytesRead = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                    downloadedBytes += bytesRead;

                    if (totalBytes > 0) {
                        int percent = (int) ((downloadedBytes * 100) / totalBytes);
                        if (percent != lastPercent) {
                            lastPercent = percent;
                            long currentDownloaded = downloadedBytes;
                            mainHandler.post(() -> callback.onProgress(percent, currentDownloaded, totalBytes));
                        }
                    }
                }

                fos.flush();
                fos.close();
                is.close();

                Log.d(TAG, "APK Downloaded successfully: " + apkFile.getAbsolutePath() + " (" + apkFile.length() + " bytes)");

                mainHandler.post(() -> {
                    callback.onComplete(apkFile);
                    installApk(activity, apkFile);
                });

            } catch (Exception e) {
                Log.e(TAG, "Download failed", e);
                mainHandler.post(() -> callback.onError("Erreur de téléchargement : " + e.getMessage()));
            }
        });
    }

    /**
     * Launch the Android Package Installer for in-place update
     */
    public static void installApk(Activity activity, File apkFile) {
        if (apkFile == null || !apkFile.exists()) {
            Log.e(TAG, "Cannot install: APK file does not exist");
            return;
        }

        // Android 8.0+ (Oreo): Check permission to install unknown apps
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!activity.getPackageManager().canRequestPackageInstalls()) {
                pendingApkFile = apkFile;
                Intent permIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                permIntent.setData(Uri.parse("package:" + activity.getPackageName()));
                activity.startActivityForResult(permIntent, REQUEST_INSTALL_UNKNOWN_APPS);
                return;
            }
        }

        try {
            Uri apkUri = FileProvider.getUriForFile(
                activity,
                activity.getPackageName() + ".fileprovider",
                apkFile
            );

            Intent installIntent = new Intent(Intent.ACTION_VIEW);
            installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(installIntent);
            pendingApkFile = null;

        } catch (Exception e) {
            Log.e(TAG, "Failed to launch package installer", e);
        }
    }

    /**
     * Handle permission return from Settings (ACTION_MANAGE_UNKNOWN_APP_SOURCES)
     */
    public static void handleActivityResult(Activity activity, int requestCode, int resultCode) {
        if (requestCode == REQUEST_INSTALL_UNKNOWN_APPS) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (activity.getPackageManager().canRequestPackageInstalls() && pendingApkFile != null) {
                    installApk(activity, pendingApkFile);
                }
            }
        }
    }

    private void postError(UpdateCheckCallback callback, String message) {
        mainHandler.post(() -> callback.onError(message));
    }
}
