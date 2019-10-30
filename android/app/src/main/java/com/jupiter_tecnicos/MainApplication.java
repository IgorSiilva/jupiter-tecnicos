package com.jupiter_tecnicos;

import android.app.Application;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;

import com.facebook.react.ReactApplication;
import io.sentry.RNSentryPackage;
import com.agontuk.RNFusedLocation.RNFusedLocationPackage;
import com.rnfs.RNFSPackage;
import com.imagepicker.ImagePickerPackage;
import com.heanoria.library.reactnative.locationenabler.RNAndroidLocationEnablerPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.onesignal.OSNotification;
import com.onesignal.OneSignal;
import com.rssignaturecapture.RSSignatureCapturePackage;
import com.geektime.rnonesignalandroid.ReactNativeOneSignalPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.onesignal.ADMMessageHandler;
import org.pgsqlite.SQLitePluginPackage;




import java.util.Arrays;
import java.util.List;



public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNSentryPackage(),
            new RNFusedLocationPackage(),
            new RNFSPackage(),
            new ImagePickerPackage(),
            new RNAndroidLocationEnablerPackage(),
            new MapsPackage(),
            new OrientationPackage(),
            new RSSignatureCapturePackage(),
            new ReactNativeOneSignalPackage(),
            new VectorIconsPackage(),
            new SQLitePluginPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);

      //registerReceiver(new NetworkChangeReceiver(), new IntentFilter("android.net.conn.CONNECTIVITY_CHANGE"));


    DatabaseHelper mDbHelper = new DatabaseHelper(this);
      SQLiteDatabase db = mDbHelper.getWritableDatabase();



      OneSignal.startInit(this)
              .setNotificationReceivedHandler(new NotificationReceiver(this))
      .init();


  }
}
