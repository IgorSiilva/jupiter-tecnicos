package com.jupiter_tecnicos;

import android.app.ActivityManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.util.Log;

import com.facebook.react.HeadlessJsTaskService;
import com.jupiter_tecnicos.NetworkService;

import java.util.List;

public class NetworkChangeReceiver extends BroadcastReceiver {

    //@Override
    //public void onReceive(final Context context, final Intent intent) {
        //if(isAppOnForeground(context)) {
        //        boolean hasInternet = isNetworkAvailable(context);
        //        Intent serviceIntent = new Intent(context, NetworkService.class);
        //        serviceIntent.putExtra("hasInternet", hasInternet);
        //        context.startService(serviceIntent);
        //        HeadlessJsTaskService.acquireWakeLockNow(context);
          //  }

      //  mConnectivityReceiverListener.onNetworkConnectionChanged(isConnected(context));

    private ConnectivityReceiverListener mConnectivityReceiverListener;

    NetworkChangeReceiver(ConnectivityReceiverListener listener) {
        mConnectivityReceiverListener = listener;
    }

    public NetworkChangeReceiver() {

    }


    @Override
    public void onReceive(Context context, Intent intent) {
        mConnectivityReceiverListener.onNetworkConnectionChanged(isConnected(context));
    }

    public static boolean isConnected(Context context) {
        ConnectivityManager cm = (ConnectivityManager)
                context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        return activeNetwork != null && activeNetwork.isConnectedOrConnecting();
    }

    public interface ConnectivityReceiverListener {
        void onNetworkConnectionChanged(boolean isConnected);
    }





    private boolean isAppOnForeground(Context context) {
        /**
          We need to check if app is in foreground otherwise the app will crash.
         http://stackoverflow.com/questions/8489993/check-android-application-is-in-foreground-or-not
        **/
        ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> appProcesses =
        activityManager.getRunningAppProcesses();
        if (appProcesses == null) {
            return false;
        }
        final String packageName = context.getPackageName();
        for (ActivityManager.RunningAppProcessInfo appProcess : appProcesses) {
            if (appProcess.importance ==
            ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND &&
             appProcess.processName.equals(packageName)) {
                return true;
            }
        }
        return false;
    }

    public static boolean isNetworkAvailable(Context context) {
        ConnectivityManager cm = (ConnectivityManager)
        context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo netInfo = cm.getActiveNetworkInfo();
        return (netInfo != null && netInfo.isConnected());
    }


}