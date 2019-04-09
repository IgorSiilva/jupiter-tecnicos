import React, { Component } from "react";
import { StatusBar, AsyncStorage } from "react-native";
import {
  Container,
  Content,
  Card,
  CardItem,
  Text,
  Button,
  H3,
  View,
  ActionSheet,
  Root
} from "native-base";

import { styles } from "./ordensStyle";
import Orientation from "react-native-orientation";
import OneSignal from "react-native-onesignal"; // Import package from node modules
import { PopupMenu } from "../navbar/popUpMenu";
import { StackActions, NavigationActions } from "react-navigation";
import {
  inserirOS,
  removerOS,
  cancelarAtendimento
} from "../../helpers/databaseHelper";
const SQLite = require("react-native-sqlite-storage");

class Ordens extends Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;

    if (state.params != undefined) {
      return {
        headerRight: (
          <PopupMenu
            actions={["Sair"]}
            onPress={(e, i) => {
              console.log(e);
              if (e == "dismissed") {
                //
              } else {
                AsyncStorage.removeItem("usuario").then(() => {
                  const resetAction = StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({ routeName: "Login" })
                    ]
                  });
                  state.params.navigation.dispatch(resetAction);
                });
              }
            }}
          />
        )
      };
    }
  };

  constructor(props) {
    super(props);
    this.state = { ordemEmAndamento: false, ordens: [] };
    Orientation.lockToPortrait();

    //habilita o network no debugger
    GLOBAL.XMLHttpRequest =
      GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

    this.buscarOrdensNoDb = this.buscarOrdensNoDb.bind(this);
    this.checarOrdensEmAndamento = this.checarOrdensEmAndamento.bind(this);
    this.onReceived = this.onReceived.bind(this);
    OneSignal.addEventListener("received", this.onReceived);

    this.buscarOrdensNoDb();
  }

  componentWillMount() {
    const { setParams } = this.props.navigation;
    setParams({ navigation: this.props.navigation });
  }

  onReceived(notificacao) {
    const novaOS = notificacao.payload.additionalData;
    if (novaOS.status == "1") {
      removerOS(novaOS).then(() => {
        this.buscarOrdensNoDb();
      });
    } else {
      inserirOS(notificacao.payload.additionalData).then(() => {
        console.log(notificacao.payload);
        this.buscarOrdensNoDb();
      });
    }
  }

  buscarOrdensNoDb() {
    const db = SQLite.openDatabase({ name: "OS", createFromLocation: "1" });
    db.transaction(tx => {
      tx.executeSql("SELECT * FROM OS", [], (tx, results) => {
        console.log(results.rows.raw());
        this.setState(
          {
            ordens: results.rows.raw()
          },
          () => this.checarOrdensEmAndamento()
        );
      });
    });
  }

  iniciarAtendimento(idordem, nome, servico, idatendimento, tipo_servico) {
    this.props.navigation.navigate("InicioAtendimento", {
      idordem: idordem,
      nome: nome,
      servico: servico,
      idatendimento: idatendimento,
      tipo_servico: tipo_servico
    });
  }

  finalizarAtendimento(idordem, nome, servico, id, tipo_servico) {
    if(tipo_servico	 == 5) { 
        this.props.navigation.navigate("Mapa", {
            idordem: idordem,
            nome: nome,
            servico: servico,
            idatendimento: id,
            tipo_servico : tipo_servico
          });
    } else {
        this.props.navigation.navigate("FinalizarAtendimento", {
            idordem: idordem,
            nome: nome,
            servico: servico,
            idatendimento: id,
            tipo_servico : tipo_servico
          });
    }

  }

  continuarAtendimentoViabilidade(idordem, nome, servico, idatendimento) {
    this.props.navigation.navigate("Mapa", {
      idordem: idordem,
      nome: nome,
      servico: servico,
      idatendimento: idatendimento
    });
  }

  checarOrdensEmAndamento() {
    for (let index = 0; index < this.state.ordens.length; index++) {
      if (
        this.state.ordens[index].emAndamento != null &&
        this.state.ordens[index].emAndamento != 0
      ) {
        this.setState({
          ordemEmAndamento: true
        });
        break;
      }
      this.setState({
        ordemEmAndamento: false
      });
    }
  }

  cancelarAtendimento(idordem) {
    ActionSheet.show(
      {
        options: ["Sim", "Não"],
        title: "Realmente deseja cancelar o Atendimento?"
      },
      buttonIndex => {
        if (buttonIndex == 0) {
          cancelarAtendimento(idordem);
          this.buscarOrdensNoDb();
        }
      }
    );
  }

  render() {
    return (
      <Root>
        <Container>
          <StatusBar backgroundColor="#F78154" barStyle="light-content" />
          <Content padder>
            {this.state.ordens.length > 0 ? (
              this.state.ordens.map(ordem => {
                return (
                  <Card key={ordem.idordem}>
                    <CardItem style={styles.cardItem} bordered>
                      <Text>{ordem.idordem}</Text>
                    </CardItem>
                    <CardItem style={styles.cardItem} bordered>
                      <Text>{ordem.nomecliente}</Text>
                    </CardItem>
                    <CardItem style={styles.cardItem}>
                      <Text>{ordem.servico}</Text>
                    </CardItem>
                    <CardItem bordered>
                      <Text style={styles.endereco}>{ordem.endereco}</Text>
                    </CardItem>

                    <CardItem style={styles.cardButton}>
                      {ordem.inicioatendimento == "" ||
                      ordem.inicioatendimento == undefined ? (
                        <Button
                          primary
                          block
                          disabled={this.state.ordemEmAndamento}
                          style={styles.button}
                          onPress={() => {
                            this.iniciarAtendimento(
                              ordem.idordem,
                              ordem.nomecliente,
                              ordem.servico,
                              ordem.id,
                              ordem.tipo_servico
                            );
                          }}
                        >
                          <Text>Iniciar Atendimento</Text>
                        </Button>
                      ) : ordem.emAndamento == 1 &&
                        (ordem.tipo_servico == 3 ||
                          ordem.tipo_servico == 16) ? (
                        <View>
                          <Button
                            primary
                            block
                            style={styles.button}
                            onPress={() => {
                              this.continuarAtendimentoViabilidade(
                                ordem.idordem,
                                ordem.nomecliente,
                                ordem.servico,
                                ordem.id
                              );
                            }}
                          >
                            <Text>Continuar Atendimento</Text>
                          </Button>
                          <Button
                            primary
                            block
                            style={styles.button}
                            onPress={() => {
                                this.cancelarAtendimento(ordem.idordem)
                            }}
                          >
                            <Text>Cancelar Atendimento</Text>
                          </Button>
                        </View>
                      ) : ordem.fimatendimento == "" ||
                        ordem.fimatendimento == undefined ? (
                        <View>
                          <Button
                            primary
                            block
                            style={styles.button}
                            onPress={() => {
                              this.finalizarAtendimento(
                                ordem.idordem,
                                ordem.nomecliente,
                                ordem.servico,
                                ordem.id,
                                ordem.tipo_servico
                              );
                            }}
                          >
                            <Text>Finalizar Atendimento</Text>
                          </Button>
                          <Button
                            primary
                            block
                            style={styles.button}
                            onPress={() => {
                              this.cancelarAtendimento(ordem.idordem);
                            }}
                          >
                            <Text>Cancelar Atendimento</Text>
                          </Button>
                        </View>
                      ) : (
                        <Button block disabled onPress={() => {}}>
                          <Text>Atendimento Finalizado</Text>
                        </Button>
                      )}
                    </CardItem>
                  </Card>
                );
              })
            ) : (
              <View style={styles.avisoContainer}>
                <H3 style={styles.avisoText}>Buscando ordens de serviço</H3>
              </View>
            )}
          </Content>
        </Container>
      </Root>
    );
  }
}

export { Ordens };
