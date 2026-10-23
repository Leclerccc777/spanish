package com.leclerccc777.hola;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import org.json.JSONObject;

/** Small offline host; learning rules and records remain in the shared web app. */
public class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String START = ORIGIN + "/assets/index.html";
    private static final int IMPORT = 10, EXPORT = 11;
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private String pendingBackup;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.setBackgroundColor(Color.WHITE);
        setContentView(web);
        // Android 15 draws edge-to-edge; keep content above bars, cutouts and the keyboard.
        web.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (isLocal(request.getUrl())) {
                    WebResourceResponse response = loader.shouldInterceptRequest(request.getUrl());
                    if (response != null) {
                        response.setResponseHeaders(Collections.singletonMap("Content-Security-Policy",
                                "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; "
                                + "img-src data:; media-src data:; connect-src 'none'; frame-src 'none'; "
                                + "object-src 'none'; base-uri 'none'; form-action 'none'"));
                        return response;
                    }
                }
                return new WebResourceResponse("text/plain", "UTF-8", 403, "Blocked",
                        Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (isLocal(request.getUrl())) return false;
                if (request.isForMainFrame()) openReference(request.getUrl().toString());
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                    FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT)
                        .addCategory(Intent.CATEGORY_OPENABLE).setType("*/*")
                        .putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/json", "text/plain", "application/octet-stream"});
                try { startActivityForResult(intent, IMPORT); }
                catch (ActivityNotFoundException error) {
                    fileCallback.onReceiveValue(null); fileCallback = null;
                    message("未找到文件选择器，请安装或启用系统文件应用。");
                }
                return true;
            }
        });
        web.addJavascriptInterface(new BackupBridge(), "HolaAndroid");
        web.loadUrl(START);
    }

    private boolean isLocal(Uri uri) {
        return "https".equals(uri.getScheme()) && "appassets.androidplatform.net".equals(uri.getHost())
                && uri.getPort() == -1 && "/assets/index.html".equals(uri.getPath());
    }

    private void message(String text) { Toast.makeText(this, text, Toast.LENGTH_LONG).show(); }

    private void openReference(String url) {
        Uri uri = Uri.parse(url);
        if (!"https".equals(uri.getScheme()) || uri.getHost() == null) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE)); }
        catch (ActivityNotFoundException error) { message("未找到浏览器，请安装浏览器后查阅资料。"); }
    }

    public class BackupBridge {
        @JavascriptInterface public void openReference(String url) {
            runOnUiThread(() -> MainActivity.this.openReference(url));
        }
        @JavascriptInterface public void saveBackup(String json, String filename) {
            // Native checks complement the existing web storage-failure protection.
            try {
                if (json == null || json.getBytes(StandardCharsets.UTF_8).length > 8000000)
                    throw new IllegalArgumentException();
                JSONObject value = new JSONObject(json);
                if (value.getInt("version") != 1 || !(value.get("reviews") instanceof JSONObject)
                        || !(value.get("days") instanceof JSONObject) || !(value.get("lessons") instanceof JSONObject))
                    throw new IllegalArgumentException();
            } catch (Exception error) {
                runOnUiThread(() -> message("备份内容无效或超过 8 MB，未导出。")); return;
            }
            String safeName = filename != null && filename.matches("hola-[0-9-]+(?:-before-replace)?\\.json")
                    ? filename : "hola-backup.json";
            runOnUiThread(() -> {
                if (pendingBackup != null) { message("请先完成当前备份保存。"); return; }
                pendingBackup = json;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT)
                        .addCategory(Intent.CATEGORY_OPENABLE).setType("application/json")
                        .putExtra(Intent.EXTRA_TITLE, safeName);
                try { startActivityForResult(intent, EXPORT); }
                catch (ActivityNotFoundException error) {
                    pendingBackup = null; message("未找到文件保存应用，备份尚未导出。");
                }
            });
        }
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        Uri uri = result == RESULT_OK && data != null ? data.getData() : null;
        if (request == IMPORT && fileCallback != null) {
            fileCallback.onReceiveValue(uri == null ? null : new Uri[]{uri}); fileCallback = null;
        }
        if (request == EXPORT) {
            String json = pendingBackup; pendingBackup = null;
            if (uri == null) { message("已取消导出，学习记录仍在手机上。"); return; }
            if (json == null) { message("导出中断，请回到学习进度重新导出。"); return; }
            new Thread(() -> {
                String status;
                try (OutputStream out = getContentResolver().openOutputStream(uri, "wt")) {
                    if (out == null) throw new IllegalStateException();
                    out.write(json.getBytes(StandardCharsets.UTF_8));
                    out.flush();
                    status = "JSON 备份已保存。";
                } catch (Exception error) { status = "备份保存失败，请重试；手机内的记录未改变。"; }
                String message = status;
                runOnUiThread(() -> message(message));
            }, "hola-backup").start();
        }
    }

    @Override public void onBackPressed() {
        web.evaluateJavascript("window.HolaNativeBack ? window.HolaNativeBack() : false", handled -> {
            if ("true".equals(handled)) return;
            if (web.canGoBack()) web.goBack();
            else new AlertDialog.Builder(this).setMessage("回到桌面？已保存的学习记录会保留。")
                    .setNegativeButton("继续学习", null)
                    .setPositiveButton("回到桌面", (dialog, which) -> moveTaskToBack(true)).show();
        });
    }

    @Override protected void onPause() {
        web.evaluateJavascript("window.HolaAudio && window.HolaAudio.stop()", null);
        web.onPause(); super.onPause();
    }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }
    @Override protected void onDestroy() {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        web.removeJavascriptInterface("HolaAndroid"); web.destroy(); super.onDestroy();
    }
}
