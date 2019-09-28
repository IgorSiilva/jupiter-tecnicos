/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import { View, AsyncStorage, StatusBar, NetInfo } from "react-native";
import React, { Component } from "react";

import SignatureCapture from "react-native-signature-capture";

import { styles } from "./assinaturaStyle";

import { Button, Text } from "native-base";
import Orientation from "react-native-orientation";
import { StackActions, NavigationActions } from "react-navigation";
import { apiUrl } from "../../config/api";
import {
  finalizarAtendimento,
  removerOS,
  buscarOSEspecifica,
  salvarFoto,
  removerFotos
} from "../../helpers/databaseHelper";
const SQLite = require("react-native-sqlite-storage");

class Assinatura extends Component {
  constructor(props) {
    super(props);

    Orientation.lockToLandscape();

    this._onSaveEvent = this._onSaveEvent.bind(this);
  }

  componentWillUnmount() {
    Orientation.lockToPortrait();
  }

  render() {
    return (
      <View style={{ flex: 1, flexDirection: "column" }}>
        <StatusBar backgroundColor="#F78154" barStyle="light-content" />
        <SignatureCapture
          style={[{ flex: 1 }, styles.signature]}
          ref="sign"
          onSaveEvent={this._onSaveEvent}
          onDragEvent={this._onDragEvent}
          saveImageFileInExtStorage={false}
          showNativeButtons={false}
          showTitleLabel={false}
        />

        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Button
            style={styles.buttonStyle}
            primary
            onPress={() => {
              this.saveSign();
            }}
          >
            <Text> Finalizar Atendimento </Text>
          </Button>

          <Button
            style={styles.buttonStyle}
            primary
            onPress={() => this.resetSign()}
          >
            <Text> Limpar </Text>
          </Button>
        </View>
      </View>
    );
  }

  saveSign() {
    this.refs["sign"].saveImage();
  }

  resetSign() {
    this.refs["sign"].resetImage();
  }

  _onSaveEvent(assinatura) {
    AsyncStorage.getItem("usuario").then(usuario => {
      const dados = this.props.navigation.state.params.dados;
      finalizarAtendimento(dados, assinatura.encoded, usuario).then(() => {
        salvarFoto(dados.ordem.idatendimento, dados.imagens).then(() => {
          NetInfo.getConnectionInfo().then(statusNetwork => {
            if (
              statusNetwork.type == "wifi" //||
              //statusNetwork.type == "cellular"
            ) {
              const db = SQLite.openDatabase({
                name: "OS",
                createFromLocation: "1"
              });
              return db.transaction(tx => {
                return tx.executeSql(
                  `SELECT * FROM OS WHERE idordem = ${dados.ordem.idordem}`,
                  [],
                  (tx, results) => {
                    const OS = results.rows.raw();
                    db.transaction(tx => {
                      tx.executeSql(
                        `SELECT fotosViabilidade.* FROM OS LEFT JOIN fotosViabilidade ON OS.id = fotosViabilidade.id WHERE OS.finalizada = ${1} AND OS.id = ${
                          dados.ordem.idatendimento
                        }`,
                        [],
                        (tx, results) => {
                          const imagens = results.rows.raw();
                          fetch(
                            `${apiUrl}/api/action/OrdemDeServico/salvarAtendimentoOrdemDeServico`,
                            {
                              method: "POST",
                              body: JSON.stringify({ ...OS[0], imagens })
                            }
                          ).then(response => {
                            response.json().then(data => {
                              if (data.success == "1") {
                                removerOS(dados.ordem).then(() => {
                                  removerFotos(dados.ordem.idatendimento);
                                });
                              }
                            });
                          });
                        }
                      );
                    });
                  }
                );
              });
            }
          });
        });

        const reset = StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Ordens" })]
        });
        this.props.navigation.dispatch(reset);
      });
    });
  }
  _onDragEvent() {
    //desenhado
  }
}

export { Assinatura };
