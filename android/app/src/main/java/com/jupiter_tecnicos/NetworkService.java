package com.jupiter_tecnicos;

import android.app.IntentService;
import android.app.Service;
import android.app.job.JobParameters;
import android.app.job.JobService;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.net.ConnectivityManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.support.annotation.RequiresApi;
import android.util.Log;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import com.google.android.gms.common.internal.Constants;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.net.URLConnection;

@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
public class NetworkService extends JobService implements NetworkChangeReceiver.ConnectivityReceiverListener {

    private static final String TAG = NetworkService.class.getSimpleName();

    private NetworkChangeReceiver mConnectivityReceiver;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(TAG, "Service created");
        mConnectivityReceiver = new NetworkChangeReceiver(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "onStartCommand");
        return START_NOT_STICKY;
    }

    @Override
    public boolean onStartJob(JobParameters params) {
        Log.i(TAG, "onStartJob" + mConnectivityReceiver);
        registerReceiver(mConnectivityReceiver, new IntentFilter("android.net.conn.CONNECTIVITY_CHANGE"));
        return true;
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        Log.i(TAG, "onStopJob");
        unregisterReceiver(mConnectivityReceiver);
        return true;
    }


    public static void doPost(JSONObject jsonParams) {
        final JSONObject jsonParam = jsonParams;

        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    URL url = new URL("https://api.jupiter.com.br/api/action/OrdemDeServico/salvarAtendimentoOrdemDeServico");
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json");
                    conn.setDoOutput(true);
                    conn.setDoInput(true);


                    Log.i("JSON", jsonParam.toString());
                    DataOutputStream os = new DataOutputStream(conn.getOutputStream());



                    conn.getOutputStream().write(jsonParam.toString().getBytes("UTF-8"));

                    os.flush();
                    os.close();

                    Log.i("STATUS", String.valueOf(conn.getResponseCode()));
                    Log.i("MSG" , conn.getResponseMessage());

                    conn.disconnect();
                } catch (Exception e) {
                    System.out.println(e);
                    e.printStackTrace();
                }
            }
        });

        thread.start();

    }


    @Override
    public void onNetworkConnectionChanged(boolean isConnected) {
        String message = isConnected ? "Good! Connected to Internet" : "Sorry! Not connected to internet";
        //System.out.println(message);

        if(isConnected) {

            DatabaseHelper mDbHelper = new DatabaseHelper(this);
            SQLiteDatabase db = mDbHelper.getReadableDatabase();

            String[] columns = null;
            String selection = "finalizada =?";
            String[] selectionArgs = {"1"};
            String groupBy = null;
            String having = null;
            String orderBy = null;
            String limit = null;

            Cursor cursor = db.query("OS", columns, selection, selectionArgs, groupBy, having, orderBy, limit);

            if (cursor.moveToFirst()){
                JSONObject jsonParam = new JSONObject();
                JSONObject jsonFotos = new JSONObject();
                JSONArray jsonArray = new JSONArray();

                Cursor cursorFotos = db.query("fotosViabilidade", columns, "id =?", new String[]{cursor.getString(cursor.getColumnIndex("id"))}, groupBy, having, orderBy, limit);
                //db.close();
                if(cursorFotos.moveToFirst()) {
                    while (!cursorFotos.isAfterLast()) {
                        try {
                            jsonFotos.put("foto",cursorFotos.getString(cursorFotos.getColumnIndex("foto")));
                            jsonFotos.put("id",cursorFotos.getString(cursorFotos.getColumnIndex("id")));

                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        jsonArray.put(jsonFotos);
                        cursorFotos.moveToNext();
                    }
                }
                while(!cursor.isAfterLast()){
                    try {
                        jsonParam.put("imagens", jsonArray);
                        jsonParam.put("id", cursor.getInt(cursor.getColumnIndex("id")));
                        jsonParam.put("idordem", cursor.getInt(cursor.getColumnIndex("idordem")));

                        jsonParam.put("servicorealizado", cursor.getString(cursor.getColumnIndex("servicorealizado")));
                        jsonParam.put("servico", cursor.getString(cursor.getColumnIndex("servico")));
                        jsonParam.put("tipo_servico", cursor.getInt(cursor.getColumnIndex("tipo_servico")));

                        jsonParam.put("edificacao", cursor.getString(cursor.getColumnIndex("edificacao")));
                        jsonParam.put("status", cursor.getInt(cursor.getColumnIndex("status")));
                        jsonParam.put("descricao_status", cursor.getString(cursor.getColumnIndex("descricao_status")));
                        jsonParam.put("contrato", cursor.getInt(cursor.getColumnIndex("contrato")));
                        jsonParam.put("rank", cursor.getInt(cursor.getColumnIndex("rank")));
                        jsonParam.put("sistema", cursor.getString(cursor.getColumnIndex("sistema")));
                        jsonParam.put("endereco", cursor.getString(cursor.getColumnIndex("endereco")));
                        jsonParam.put("latitudeInicio", cursor.getString(cursor.getColumnIndex("latitudeInicio")));
                        jsonParam.put("longitudeInicio", cursor.getString(cursor.getColumnIndex("longitudeInicio")));
                        jsonParam.put("latitudeTermino", cursor.getString(cursor.getColumnIndex("latitudeTermino")));
                        jsonParam.put("longitudeTermino", cursor.getString(cursor.getColumnIndex("longitudeTermino")));
                        jsonParam.put("fimatendimento", cursor.getString(cursor.getColumnIndex("fimatendimento")));
                        jsonParam.put("inicioatendimento", cursor.getString(cursor.getColumnIndex("inicioatendimento")));
                        jsonParam.put("solucao", cursor.getInt(cursor.getColumnIndex("solucao")));
                        jsonParam.put("historico", cursor.getString(cursor.getColumnIndex("historico")));
                        jsonParam.put("assinatura", cursor.getString(cursor.getColumnIndex("assinatura")));
                        jsonParam.put("usuariofo", cursor.getString(cursor.getColumnIndex("usuariofo")));
                        jsonParam.put("nomeDoAssinante", cursor.getString(cursor.getColumnIndex("nomeDoAssinante")));
                        jsonParam.put("cpfDoAssinante", cursor.getString(cursor.getColumnIndex("cpfDoAssinante")));
                        jsonParam.put("presencaDoTitular", cursor.getInt(cursor.getColumnIndex("presencaDoTitular")));
                        jsonParam.put("esticadores", cursor.getInt(cursor.getColumnIndex("esticadores")));
                        jsonParam.put("drops", cursor.getInt(cursor.getColumnIndex("drops")));
                        jsonParam.put("fotoDoMapa", cursor.getString(cursor.getColumnIndex("fotoDoMapa")));
                        jsonParam.put("nomecliente", cursor.getString(cursor.getColumnIndex("nomecliente")));
                        jsonParam.put("terminalSelecionado", cursor.getString(cursor.getColumnIndex("terminalSelecionado")));
                        jsonParam.put("distanciaTerminalSelecionado", cursor.getString(cursor.getColumnIndex("distanciaTerminalSelecionado")));

                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    doPost(jsonParam);

                    SQLiteDatabase writableDB = mDbHelper.getWritableDatabase();
                    writableDB.delete("OS", "id=?", new String[] {cursor.getString(cursor.getColumnIndex("id"))});
                    writableDB.delete("fotosViabilidade", "id=?", new String[] {cursor.getString(cursor.getColumnIndex("id"))});
                    //writableDB.close();

                    cursor.moveToNext();
                }

            }

        }
    }
}
