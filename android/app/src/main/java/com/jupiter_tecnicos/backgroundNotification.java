package com.jupiter_tecnicos;

import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.onesignal.OSNotification;
import com.onesignal.OSNotificationPayload;
import com.onesignal.NotificationExtenderService;
import com.onesignal.OSNotificationReceivedResult;


import com.onesignal.OSNotificationDisplayedResult;
import com.onesignal.OneSignal;

import org.json.JSONException;
import org.json.JSONObject;

import java.math.BigInteger;

public class backgroundNotification extends NotificationExtenderService {


    @Override
    protected boolean onNotificationProcessing(OSNotificationReceivedResult receivedResult) {
        if(receivedResult.payload.additionalData == null) {
            return true;
        }
        try {
            System.out.println(receivedResult.payload.additionalData.getString("acao"));
            if(receivedResult.payload.additionalData.getString("acao").equals("remover")) {
                return true;
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return false;
    }
}
