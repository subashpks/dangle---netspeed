package com.luckydangle.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.core.app.NotificationCompat;

public class FloatingDangleService extends Service {
    private WindowManager windowManager;
    private View floatingView;
    private WebView webView;
    private static final String CHANNEL_ID = "LuckyDangleControlsChannel";
    private static final int NOTIFICATION_ID = 2002;

    public static final String ACTION_NEXT_CHARM = "com.luckydangle.app.ACTION_NEXT_CHARM";
    public static final String ACTION_TOGGLE_DRAWER = "com.luckydangle.app.ACTION_TOGGLE_DRAWER";
    public static final String ACTION_SET_CHARM = "com.luckydangle.app.ACTION_SET_CHARM";

    private static final String[] CHARM_IDS = {
            "sai_isai",
            "meme_megan_fox",
            "meme_sydney_sweeney",
            "meme_ajith",
            "meme_vijay",
            "meme_wamiqa",
            "sai_dwarkamai",
            "sai_samadhi",
            "sai_silver",
            "murugan_vel_pendant",
            "murugan_vel_mayil",
            "murugan_yamirukka",
            "murugan_bayamen_badge",
            "shiva_gold_nataraj",
            "shiva_shivling",
            "shiva_gold_trishul",
            "shiva_rudraksham",
            "nimbu",
            "nazar",
            "daruma",
            "drishti"
    };

    private static final String[] CHARM_NAMES = {
            "📱 iSai Baba (Meme)",
            "✨ Megan Fox",
            "🌸 Sydney Sweeney",
            "🏍️ Thala Ajith",
            "🔥 Thalapathy Vijay",
            "💫 Wamiqa Gabbi",
            "🧡 Dwarkamai Sai",
            "👑 Samadhi Mandir Sai",
            "🪑 Shirdi Silver Throne",
            "⚡ Golden Gnana Vel",
            "🦚 Mayil & Vel",
            "🙏 Yamirukka Bayamen",
            "✨ Bayamen Badge",
            "🕺 Chidambaram Nataraja",
            "🪔 Surya Prabha Shivling",
            "⚡ Gold Trishul & Damru",
            "📿 Trishul & Rudraksha",
            "🍋 Nimbu Mirchi",
            "🧿 Nazar Boncuğu",
            "🎋 Daruma Wishing Doll",
            "👹 Drishti Bommai"
    };

    private int currentCharmIndex = 0;
    private BroadcastReceiver screenStateReceiver;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        startForeground(NOTIFICATION_ID, buildNotification(CHARM_NAMES[currentCharmIndex]));

        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        setupFloatingView();
        setupScreenStateReceiver();
    }

    private void setupScreenStateReceiver() {
        screenStateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null || intent.getAction() == null) return;
                if (Intent.ACTION_SCREEN_OFF.equals(intent.getAction())) {
                    // Halt physics engine to 0% CPU and 0% Battery when screen locks
                    if (webView != null) {
                        webView.evaluateJavascript("if(typeof Matter !== 'undefined' && window.runner) Matter.Runner.stop(window.runner);", null);
                    }
                } else if (Intent.ACTION_SCREEN_ON.equals(intent.getAction()) || Intent.ACTION_USER_PRESENT.equals(intent.getAction())) {
                    // Resume physics smoothly when screen turns on
                    if (webView != null) {
                        webView.evaluateJavascript("if(typeof Matter !== 'undefined' && window.runner && window.engine) Matter.Runner.run(window.runner, window.engine);", null);
                    }
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_SCREEN_OFF);
        filter.addAction(Intent.ACTION_SCREEN_ON);
        filter.addAction(Intent.ACTION_USER_PRESENT);
        registerReceiver(screenStateReceiver, filter);
    }

    private void setupFloatingView() {
        int layoutType;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutType = WindowManager.LayoutParams.TYPE_PHONE;
        }

        // Full-screen transparent overlay window allowing unrestrained pendulum swings across display
        final WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                layoutType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                        | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL
                        | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                        | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                        | WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
                PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = 0;
        params.y = 0;

        webView = new WebView(this);
        webView.setBackgroundColor(Color.TRANSPARENT);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/public/index.html?overlay=true&charm=" + CHARM_IDS[currentCharmIndex]);

        floatingView = webView;
        windowManager.addView(floatingView, params);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_NEXT_CHARM.equals(action)) {
                currentCharmIndex = (currentCharmIndex + 1) % CHARM_IDS.length;
                String nextCharm = CHARM_IDS[currentCharmIndex];
                String charmName = CHARM_NAMES[currentCharmIndex];

                if (webView != null) {
                    webView.evaluateJavascript("window.setDangleCharm('" + nextCharm + "');", null);
                }
                updateNotification(charmName);
            } else if (ACTION_TOGGLE_DRAWER.equals(action)) {
                if (webView != null) {
                    webView.evaluateJavascript("if(document.getElementById('charm-drawer')) document.getElementById('charm-drawer').classList.toggle('hidden');", null);
                }
            } else if (ACTION_SET_CHARM.equals(action) && intent.hasExtra("charm")) {
                String charm = intent.getStringExtra("charm");
                if (webView != null && charm != null) {
                    webView.evaluateJavascript("window.setDangleCharm('" + charm + "');", null);
                    for (int i = 0; i < CHARM_IDS.length; i++) {
                        if (CHARM_IDS[i].equals(charm)) {
                            currentCharmIndex = i;
                            updateNotification(CHARM_NAMES[i]);
                            break;
                        }
                    }
                }
            }
        }
        return START_STICKY;
    }

    private void updateNotification(String charmName) {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(NOTIFICATION_ID, buildNotification(charmName));
        }
    }

    private int dpToPx(int dp) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round((float) dp * density);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Lucky Dangle Controls",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Quick switcher and controls for your on-screen dangle");
            channel.enableVibration(false);
            channel.setSound(null, null);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification buildNotification(String currentCharmName) {
        // 1. Next Charm Broadcast Intent (Guaranteed to show and trigger immediately)
        Intent nextIntent = new Intent(this, DangleActionReceiver.class);
        nextIntent.setAction(ACTION_NEXT_CHARM);
        PendingIntent nextPendingIntent = PendingIntent.getBroadcast(
                this,
                101,
                nextIntent,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE : PendingIntent.FLAG_UPDATE_CURRENT
        );

        // 2. Open Drawer Intent
        Intent drawerIntent = new Intent(this, DangleActionReceiver.class);
        drawerIntent.setAction(ACTION_TOGGLE_DRAWER);
        PendingIntent drawerPendingIntent = PendingIntent.getBroadcast(
                this,
                102,
                drawerIntent,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE : PendingIntent.FLAG_UPDATE_CURRENT
        );

        // 3. Open App Main Intent
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent mainPendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0
        );

        NotificationCompat.BigTextStyle bigStyle = new NotificationCompat.BigTextStyle()
                .setBigContentTitle("Lucky Dangle: " + currentCharmName)
                .bigText("Tap 'Next Dangle' to switch instantly, or tap 'Drawer' to pick from the visual menu.");

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("Lucky Dangle: " + currentCharmName)
                .setContentText("Tap 'Next Dangle' to switch")
                .setStyle(bigStyle)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(mainPendingIntent)
                .addAction(android.R.drawable.ic_media_next, "⚡ Next Dangle", nextPendingIntent)
                .addAction(android.R.drawable.ic_menu_gallery, "🎛️ Drawer", drawerPendingIntent)
                .setOngoing(true)
                .build();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (screenStateReceiver != null) {
            try {
                unregisterReceiver(screenStateReceiver);
            } catch (Exception ignored) {}
            screenStateReceiver = null;
        }
        if (floatingView != null && windowManager != null) {
            windowManager.removeView(floatingView);
            floatingView = null;
        }
    }
}
