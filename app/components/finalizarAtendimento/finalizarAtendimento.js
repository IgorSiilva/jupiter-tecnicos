import React, { Component } from "react";
import {
  Container,
  Content,
  Form,
  Item,
  Picker,
  Button,
  Text,
  CheckBox,
  ListItem,
  Body,
  Input,
  Icon
} from "native-base";

import { Alert, View, ScrollView, Image, TouchableHighlight } from "react-native";

import { status } from "./statusArr";
import { styles } from "./atendimentoStyle";
import Orientation from "react-native-orientation";
import { StatusBar } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ImagePicker from "react-native-image-picker";
var RNFS = require("react-native-fs");

class FinalizarAtendimento extends Component {
  constructor(props) {
    super(props);

    this.state = {
      solucao: "",
      concluido: false,
      pendente: false,
      historico: "",
      posicao: "",
      presencaDoTitular: true,
      acessoRemotoHabilitado: true,
      nomeDoAssinante: "",
      cpfDoAssinante: "",
      imagens: []
    };

    Orientation.lockToPortrait();
  }

  onValueChange(value) {
    this.setState({
      solucao: value
    });
  }

  finalizarAtendimento(props) {
    if (
      (this.state.pendente == false && this.state.concluido == false) ||
      this.state.historico == ""
    ) {
      Alert.alert("Erro", "Preencha os dados");
    } else {
      navigator.geolocation.getCurrentPosition(position => {
        this.setState(
          {
            posicao: position.coords
          },
          () => {
            let data = new Date();
            //let formatedDate = data.toLocaleString();
            let formatedDate =
              data.toISOString().split("T")[0] +
              " " +
              data.toLocaleTimeString();
            const dados = {
              ordem: props.navigation.state.params,
              posicao: this.state.posicao,
              historico: this.state.historico,
              data: formatedDate,
              solucao: this.state.solucao,
              finalizacaoStatus: this.state.pendente == true ? 0 : 1,
              nomeDoAssinante: this.state.nomeDoAssinante,
              cpfDoAssinante: this.state.cpfDoAssinante,
              presencaDoTitular: this.state.presencaDoTitular,
              acessoRemotoHabilitado: this.state.acessoRemotoHabilitado,
              imagens : this.state.imagens
            };

            this.props.navigation.navigate("Assinatura", { dados });
          }
        );
      });
    }
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
              console.log("FILE DELETED");
            });
          }
        );
      }
    });
  }


  removerImagem(index) {
    this.state.imagens.splice(index, 1)
    this.forceUpdate()
  }

  render() {
    return (
      <Container>
        <StatusBar backgroundColor="#F78154" barStyle="light-content" />

        <Content>
          <Form style={{ width: "95%" }}>
            <Item floatingLabel style={styles.textarea}>
              <Input
                placeholder="Relatorio do Atendimento"
                onChangeText={historico => {
                  this.setState({ historico });
                }}
              />
            </Item>

            <ListItem
              onPress={() => {
                this.setState({
                  pendente: !this.state.pendente,
                  concluido: false
                });
              }}
            >
              <CheckBox
                color="#1B8332"
                checked={this.state.pendente}
                onPress={() => {
                  this.setState({
                    pendente: !this.state.pendente,
                    concluido: false
                  });
                }}
              />
              <Body>
                <Text
                  onPress={() => {
                    this.setState({
                      pendente: !this.state.pendente,
                      concluido: false
                    });
                  }}
                >
                  Atendimento Pendente
                </Text>
              </Body>
            </ListItem>

            <ListItem
              onPress={() => {
                this.setState({
                  concluido: !this.state.concluido,
                  pendente: false
                });
              }}
            >
              <CheckBox
                color="#1B8332"
                checked={this.state.concluido}
                onPress={() => {
                  this.setState({
                    concluido: !this.state.concluido,
                    pendente: false
                  });
                }}
              />
              <Body>
                <Text
                  onPress={() => {
                    this.setState({
                      concluido: !this.state.concluido,
                      pendente: false
                    });
                  }}
                >
                  Atendimento Concluido
                </Text>
              </Body>
            </ListItem>

            <ListItem
              onPress={() => {
                this.setState({
                  acessoRemotoHabilitado: !this.state.acessoRemotoHabilitado
                });
              }}
            >
              <CheckBox
                color="#1B8332"
                checked={this.state.acessoRemotoHabilitado}
                onPress={() => {
                  this.setState({
                    acessoRemotoHabilitado: !this.state.acessoRemotoHabilitado
                  });
                }}
              />
              <Body>
                <Text
                  onPress={() => {
                    this.setState({
                      acessoRemotoHabilitado: !this.state.acessoRemotoHabilitado
                    });
                  }}
                >
                  Acesso Remoto Habilitado
                </Text>
              </Body>
            </ListItem>

            <ListItem
              onPress={() => {
                this.setState({
                  presencaDoTitular: !this.state.presencaDoTitular
                });
              }}
            >
              <CheckBox
                color="#1B8332"
                checked={this.state.presencaDoTitular}
                onPress={() => {
                  this.setState({
                    presencaDoTitular: !this.state.presencaDoTitular
                  });
                }}
              />
              <Body>
                <Text
                  onPress={() => {
                    this.setState({
                      presencaDoTitular: !this.state.presencaDoTitular
                    });
                  }}
                >
                  Presença do Titular
                </Text>
              </Body>
            </ListItem>

            <Item style={styles.picker}>
              <Picker
                mode="dropdown"
                selectedValue={this.state.solucao}
                onValueChange={this.onValueChange.bind(this)}
              >
                {this.state.concluido == true
                  ? status.resolvido.map((status, index) => {
                      return (
                        <Picker.Item
                          key={status.id}
                          label={status.descricao}
                          value={status.id}
                        />
                      );
                    })
                  : status.pendente.map((status, index) => {
                      return (
                        <Picker.Item
                          key={status.id}
                          label={status.descricao}
                          value={status.id}
                        />
                      );
                    })}
              </Picker>
            </Item>

            {this.state.presencaDoTitular ? (
              <View />
            ) : (
              <View>
                <Item regular style={styles.assinante}>
                  <Input
                    maxLength={11}
                    keyboardType="numeric"
                    placeholder="CPF do Assinante"
                    onChangeText={cpfDoAssinante =>
                      this.setState({ cpfDoAssinante })
                    }
                  />
                </Item>

                <Item regular style={styles.assinante}>
                  <Input
                    placeholder="Nome do Assinante"
                    onChangeText={nomeDoAssinante =>
                      this.setState({ nomeDoAssinante })
                    }
                  />
                </Item>
              </View>
            )}

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
          </Form>
          <View style={styles.botoesContainer}>
            <Button primary onPress={this.enviarFoto.bind(this)}>
              <Text style={{ color: "white" }}>
                <MaterialCommunityIcons name="camera" size={20} /> Enviar foto
              </Text>
            </Button>
            <Button
              primary
              onPress={() => this.finalizarAtendimento(this.props)}
            >
              <Text> Assinatura do Cliente </Text>
            </Button>
          </View>
        </Content>
      </Container>
    );
  }
}

export { FinalizarAtendimento };
