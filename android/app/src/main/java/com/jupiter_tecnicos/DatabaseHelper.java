package com.jupiter_tecnicos;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

public class DatabaseHelper extends SQLiteOpenHelper {
    public static final int DATABASE_VERSION = 1;
    public static final String DATABASE_NAME = "OS";

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE IF NOT EXISTS OS(" +
                "  id INT UNIQUE, idordem INT, emAndamento INT, servicorealizado TEXT," +
                "  edificacao TEXT, status INT, descricao_status TEXT, contrato INT, servico TEXT, nomecliente, tipo_servico INT, rank INT," +
                "  sistema TEXT, finalizada INT, endereco TEXT, latitudeInicio TEXT, longitudeInicio TEXT, latitudeTermino TEXT, longitudeTermino TEXT," +
                "  fimatendimento TEXT, inicioatendimento TEXT, solucao INT, historico TEXT, assinatura BLOB, usuariofo TEXT, nomeDoAssinante TEXT," +
                "  cpfDoAssinante TEXT, terminalSelecionado TEXT, roteadorCliente TEXT, distanciaTerminalSelecionado TEXT, drops INT, esticadores INT, fotoDoMapa BLOB, presencaDoTitular INT, acessoRemoto INT" +
                "  )");

        db.execSQL("CREATE TABLE IF NOT EXISTS fotosViabilidade (foto BLOB, id INT, FOREIGN KEY(id) REFERENCES OS(id) ON DELETE CASCADE)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int i, int i1) {
        //db.execSQL("DROP TABLE IF EXISTS OS");
        //onCreate(db);
    }

}
