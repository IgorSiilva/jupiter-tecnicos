package com.jupiter_tecnicos;

import android.app.ActivityManager;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import com.onesignal.OSNotification;
import com.onesignal.OneSignal;

import org.json.JSONObject;

import java.util.List;

public class NotificationReceiver implements OneSignal.NotificationReceivedHandler {


    private Context context;

    public NotificationReceiver(Context context) {
        this.context = context;
    }


    @Override
    public void notificationReceived(OSNotification notification) {

        JSONObject dadosOS = notification.payload.additionalData;
        System.out.println(notification.payload.additionalData);

        try {
            if(!isAppOnForeground(context)) {
                if(dadosOS.getInt("status") == 1) {

                    DatabaseHelper mDbHelper = new DatabaseHelper(context);
                    SQLiteDatabase db = mDbHelper.getWritableDatabase();

                    deletarOS(mDbHelper.getWritableDatabase(), dadosOS.getString("id"));
                } else {
                    DatabaseHelper mDbHelper = new DatabaseHelper(context);
                    SQLiteDatabase db = mDbHelper.getWritableDatabase();
                    ContentValues values = new ContentValues();

                    values.put("id", dadosOS.getString("id"));
                    values.put("idordem", dadosOS.getString("idordem"));
                    values.put("servico", dadosOS.getString("servico"));
                    values.put("nomecliente", dadosOS.getString("nomecliente"));
                    values.put("tipo_servico", dadosOS.getInt("tipo_servico"));
                    values.put("endereco", dadosOS.getString("endereco"));
                    values.put("sistema", dadosOS.getString("sistema"));
                    values.put("status", dadosOS.getString("status"));


                    long newRowId = db.insert("OS", null, values);
                    db.close();
                }
            }

        } catch (Exception e) {
            System.out.println(e);
        }
    }


    public void deletarOS(SQLiteDatabase db, String id) {
        try {
            db.delete("OS", "id=?", new String[] {id});
            db.close();
        } catch (Exception e) {
            System.out.println(e);
        }

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

}

