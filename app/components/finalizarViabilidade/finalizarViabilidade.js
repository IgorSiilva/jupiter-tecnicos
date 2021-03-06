import React, { Component } from "react";
import {
  Image,
  ScrollView,
  View,
  Alert,
  AsyncStorage,
  NetInfo,
  StatusBar,
  ActivityIndicator,
  TouchableHighlight
} from "react-native";
import {
  Container,
  Content,
  Form,
  Item,
  Input,
  Button,
  Text,
  Icon,
  CheckBox,
  Body
} from "native-base";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ImagePicker from "react-native-image-picker";
import {
  salvarFoto,
  finalizarViabilidade,
  removerOS,
  removerFotos,
  buscarOSEspecifica,
  buscarImagemOS
} from "../../helpers/databaseHelper";
import { apiUrl } from "../../config/api";
import { StackActions, NavigationActions } from "react-navigation";
import Geolocation from "react-native-geolocation-service";

var RNFS = require("react-native-fs");

class FinalizarViabilidade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drops: "",
      esticadores: "",
      imagens: [],
      posicao: "",
      carregando: false,
      historico: "",
      roteadorCliente: false
    };
    this.removerImagem = this.removerImagem.bind(this);

    //console.log(props)
  }

  componentDidMount() {}

  onChangeText(name, value, somenteInteiro = false) {
    if (somenteInteiro) value = this.retirarPontoDeNumero(value);
    this.setState({
      [name]: value
    });
  }

  retirarPontoDeNumero(numero) {
    return numero
      .split(".")
      .join("")
      .split(",")
      .join("");
  }

  enviarFoto() {
    const options = {
      maxWidth: 1366,
      maxHeight: 768,
      quality: 0.5
    };
    ImagePicker.launchCamera(options, response => {
      if (response.didCancel != true) {
        this.setState(
          {
            imagens: [...this.state.imagens, response.data]
          },
          () => {
            return RNFS.unlink(response.path).then(() => {
              //console.log("FILE DELETED");
            });
          }
        );
      }
    });
  }

  async verificarConexaoInternet() {
    return NetInfo.getConnectionInfo().then(status => {
      if (status.type == "wifi" /* || status.type == "cellular" */) {
        return true;
      } else {
        return false;
      }
    });
  }

  retornarParaTelaPrincipal() {
    const reset = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: "Ordens"
        })
      ]
    });
    this.props.navigation.dispatch(reset);
  }

  finalizar() {
    if (this.state.drops == "" && this.state.esticadores == "") {
      Alert.alert("Erro", "Por favor preencha os campos");
      return;
    }

    let data = new Date();
    let formatedDate =
      data.toISOString().split("T")[0] + " " + data.toLocaleTimeString();

    Geolocation.getCurrentPosition(
      position => {
        this.setState(
          {
            posicao: position,
            carregando: true
          },
          () => {
            const dados = {
              ordem: this.props.navigation.state.params.dadosOS,
              data: formatedDate,
              viabilidade: { ...this.state },
              terminalSelecionado: this.props.navigation.state.params
                .terminalSelecionado,
              imagemMapa: this.props.navigation.state.params.fotoDoMapa,
              posicao: this.state.posicao,
              historico: this.state.historico
            };

            AsyncStorage.getItem("usuario").then(usuario => {
              finalizarViabilidade(dados, usuario).then(() => {
                salvarFoto(dados.ordem.idatendimento, this.state.imagens).then(
                  () => {
                    buscarOSEspecifica(dados.ordem.idordem).then(OS => {
                      buscarImagemOS(dados.ordem.idatendimento).then(
                        imagens => {
                          this.verificarConexaoInternet().then(conexao => {
                            if (conexao) {
                              try {
                                fetch(
                                  `${apiUrl}/api/action/OrdemDeServico/salvarAtendimentoOrdemDeServico`,
                                  {
                                    method: "POST",
                                    body: JSON.stringify({ ...OS[0], imagens, versao : '2.9' })
                                  }
                                ).then(response => {
                                    response.json().then((data) => {
                                        if (data.success == "1") {
                                            removerOS(dados.ordem).then(() => {
                                              removerFotos(
                                                dados.ordem.idatendimento
                                              ).then(() => {
                                                this.setState(
                                                  { carregando: false },
                                                  () => {
                                                    this.retornarParaTelaPrincipal();
                                                  }
                                                );
                                              });
                                            });
                                          } else {
                                            this.retornarParaTelaPrincipal();
                                          }
                                    })
                                });
                              } catch (error) {
                                this.setState({ carregando: false }, () => {
                                  this.retornarParaTelaPrincipal();
                                });
                              }
                            } else {
                              this.setState({ carregando: false }, () => {
                                this.retornarParaTelaPrincipal();
                              });
                            }
                          });
                        }
                      );
                    });
                  }
                );
              });
            });
          }
        );
      },
      error => {},
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  }

  removerImagem(index) {
    this.state.imagens.splice(index, 1);
    this.forceUpdate();
  }

  render() {
    return this.state.carregando ? (
      <Container>
        <StatusBar backgroundColor="#F78154" barStyle="light-content" />
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <ActivityIndicator size="large" color="#0000ff" animating={true} />
        </View>
      </Container>
    ) : (
      <Container>
        <StatusBar backgroundColor="#F78154" barStyle="light-content" />
        <Content padder>
          <Form>
            <Item floatingLabel>
              <Input
                placeholder="Quantidade de drops"
                keyboardType="numeric"
                value={this.state.drops}
                onChangeText={value => this.onChangeText("drops", value)}
              />
            </Item>
            <Item floatingLabel>
              <Input
                placeholder="Quantidade de esticadores"
                keyboardType="numeric"
                value={this.state.esticadores}
                onChangeText={value =>
                  this.onChangeText("esticadores", value, true)
                }
              />
            </Item>

            <Item floatingLabel>
              <Input
                placeholder="Observação"
                value={this.state.historico}
                onChangeText={historico => {
                  this.setState({ historico });
                }}
              />
            </Item>

            <Item
              style={{ marginVertical: 35 }}
              onPress={() => {
                this.setState({
                  roteadorCliente: !this.state.roteadorCliente
                });
              }}
            >
              <CheckBox
                style={{ marginVertical: 10 }}
                color="#1B8332"
                checked={this.state.roteadorCliente}
                onPress={() => {
                  this.setState({
                    roteadorCliente: !this.state.roteadorCliente
                  });
                }}
              />
              <Body>
                <Text
                  onPress={() => {
                    this.setState({
                      roteadorCliente: !this.state.roteadorCliente
                    });
                  }}
                >
                  Roteador do Cliente
                </Text>
              </Body>
            </Item>
          </Form>
          <Button
            full
            primary
            style={{ marginVertical: 35 }}
            onPress={this.enviarFoto.bind(this)}
          >
            <Text style={{ color: "white" }}>
              <MaterialCommunityIcons name="camera" size={20} /> Enviar foto
            </Text>
          </Button>
          <View style={{ flex: 1, flexDirection: "row", marginVertical: 10 }}>
            <ScrollView
              style={{ flex: 1, flexDirection: "row" }}
              horizontal={true}
            >
              {this.state.imagens.map((imagem, index) => {
                return (
                  <View key={index}>
                    <Image
                      style={{
                        zIndex: 0,
                        width: 150,
                        height: 150,
                        borderWidth: 1,
                        borderColor: "black",
                        marginHorizontal: 5
                      }}
                      source={{ uri: `data:image/gif;base64,${imagem}` }}
                    />
                    <TouchableHighlight
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                      }}
                    >
                      <Icon
                        onPress={() => {
                          this.removerImagem(index);
                        }}
                        name="md-close"
                        style={{
                          color: "red"
                        }}
                      />
                    </TouchableHighlight>
                  </View>
                );
              })}
            </ScrollView>
          </View>
          <Button full primary onPress={this.finalizar.bind(this)}>
            <Text style={{ color: "white" }}>Finalizar</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}

export { FinalizarViabilidade };
