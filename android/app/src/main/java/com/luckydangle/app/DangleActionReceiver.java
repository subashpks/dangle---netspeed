package com.luckydangle.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class DangleActionReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;

        Intent serviceIntent = new Intent(context, FloatingDangleService.class);
        serviceIntent.setAction(intent.getAction());
        if (intent.hasExtra("charm")) {
            serviceIntent.putExtra("charm", intent.getStringExtra("charm"));
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }
    }
}
