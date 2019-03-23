import { apiUrl } from "../config/api"
import {removerFotos} from "../helpers/databaseHelper"

const SQLite = require('react-native-sqlite-storage')

const db = SQLite.openDatabase({ name: "OS", createFromLocation: "1" });

const networkTask = async (networkInfo) => {
  //console.log('aqui')
  //if (networkInfo.hasInternet) {
    db.transaction((tx) => {
      tx.executeSql(`SELECT * FROM OS WHERE finalizada = ${1}`, [], (tx, results) => {
        const arrayOS = results.rows.raw()
        arrayOS.map((OS) => {
          db.transaction((tx) => {
            tx.executeSql(`SELECT fotosViabilidade.* FROM OS LEFT JOIN fotosViabilidade ON OS.id = fotosViabilidade.id WHERE OS.finalizada = ${1} AND OS.id = ${OS.id}`, [], (tx, results) => {
              const imagensDaOS = results.rows.raw()
              try {
                fetch(`http://${apiUrl}/api/action/OrdemDeServico/salvarAtendimentoOrdemDeServico`, {
                  method: "POST",
                  body: JSON.stringify({...OS, imagens : imagensDaOS})
                })
                  .then((response) => {
                    db.transaction((tx) => {
                      tx.executeSql(`DELETE FROM OS WHERE idordem = ${OS.idordem}`, [], (tx, results) => {
                        console.log('removido')
                        removerFotos(OS.id)
                      });
                    });
                  })
              } catch (error) {

              }
            })
          })
        })
        //tx.executeSql(`SELECT fotosViabilidade.* FROM OS LEFT JOIN fotosViabilidade ON OS.id = fotosViabilidade.id WHERE OS.finalizada = 1`, [], (tx, results) => {

        /*         arrayOS.map((OS) => {
                  console.log(OS)
                  try {
                    fetch(`http://${apiUrl}/api/action/OrdemDeServico/salvarAtendimentoOrdemDeServico`, {
                      method: "POST",
                      body: JSON.stringify(OS)
                    })
                      .then((response) => {
                        db.transaction((tx) => {
                          tx.executeSql(`DELETE FROM OS WHERE idordem = ${OS.idordem}`, [], (tx, results) => {
                            console.log('removido')
                          });
                        });
                      })
                  } catch (error) {
        
                  }
        
                }) */
      });
    });
  //}
}


export { networkTask }