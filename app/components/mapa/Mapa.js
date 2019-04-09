import React, { Component } from "react";
import { Text, View, Alert, ActivityIndicator, StatusBar } from "react-native";
import MapView, { Marker, Circle, Polyline } from "react-native-maps";
import { Container, Switch, Fab, Button } from "native-base";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { obterTerminaisV2 } from "../../config/api";
import {
  obterCoordenadaMaisProxima,
  obterRotaEntreDoisPontos
} from "../../config/osrm";
import { StackActions, NavigationActions } from "react-navigation";

import RNAndroidLocationEnabler from "react-native-android-location-enabler";

const terminalIcone = require("../../imagens/terminal.png");
//const dispositivoIcone = require("../../imagens/dispositivo.png");
const dispositivoIcone = require("../../imagens/man.png");
const projetoIcone = require("../../imagens/pino.png");
const terminalSelecionado = require("../../imagens/terminalselecionado.png");

class Mapa extends Component {
  mapa;

  constructor(props) {
    super(props);
    this.state = {
      mapaHibrido: false,
      regiao: {
        latitude: -5.52,
        longitude: -47.48,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      },
      terminais: [],
      fabAtivado: false,
      coordenadasDispositivo: undefined,
      posicaoFoiEditada: false,
      customMapStyle: undefined,
      distanciaMaximaDeTerminaisEmMetros: 300,
      rotaParaTerminal: [],
      terminalSelecionado: undefined,
      carregando: false,
      posicaoTerminalSelecionado: undefined,
      codigoTerminalSelecionado: "",
      posicaoProximoTerminalARemover: 0,
      arrayTerminaisSelecionados: [],
      arrayPosicaoTerminaisSelecionados: [],
      arrayCodigoTerminaisSelecionados: [],
      arrayRotasParaTerminais: []
    };

    console.log(this.props)
  }

  componentDidMount() {
    this.atualizarTerminaisEDispositivo();
  }

  definirPosicaoDoDispositivo(event) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    this.setState(
      {
        carregando: true,
        coordenadasDispositivo: { latitude, longitude },
        posicaoFoiEditada: true
      },
      () => {
        this.obterOuAtualizarTerminais();
      }
    );
  }

  atualizarTerminaisEDispositivo() {
    if (this.state.posicaoFoiEditada) {
      this.obterOuAtualizarTerminais();
      return;
    }

    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000
    }).then(data => {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;

        this.setState(
          {
            coordenadasDispositivo: { latitude, longitude }
          },
          () => {
            this.obterOuAtualizarTerminais();
          }
        );
      });
    });
  }

  obterOuAtualizarTerminais() {
    const { latitude, longitude } = this.state.coordenadasDispositivo;
    const { distanciaMaximaDeTerminaisEmMetros } = this.state;
    this.setState({
      carregando: true
    });
    return obterTerminaisV2(
      latitude,
      longitude,
      distanciaMaximaDeTerminaisEmMetros
    ).then(({ terminais }) => {
      this.setState({ terminais, carregando: false }, () =>
        this.posicionarMapaMostrandoTodosTerminais()
      );
    });
  }

  posicionarMapaMostrandoTodosTerminais() {
    const coordenadasTerminais = this.state.terminais.map(terminal => ({
      latitude: Number(terminal.latitude),
      longitude: Number(terminal.longitude)
    }));

    if (coordenadasTerminais.length == 0) return;

    const { latitude, longitude } = this.state.coordenadasDispositivo;
    this.mapa.animateToRegion({
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005
    });
    this.mapa.fitToCoordinates(coordenadasTerminais, { animated: true });
  }

  tirarFotoDoMapa() {
    return this.mapa.takeSnapshot({
      //format: "png",
      format: "jpg",
      quality: 0.1,
      result: "base64"
    });
  }

  tracarRotaParaTerminal(terminal, quantidadeTerminaisSelecionados) {
    const { latitude, longitude } = terminal;
    const LATITUDE = 1;
    const LONGITUDE = 0;

    this.setState(
      {
        carregando: true,
        terminalSelecionado: terminal,
        posicaoTerminalSelecionado: { latitude, longitude },
        codigoTerminalSelecionado: terminal.codigo
      },
      () => {
        console.log(this.state);
      }
    );

     obterCoordenadaMaisProxima({ latitude, longitude }).then(response => {
      const coordenadaTerminal = response.waypoints[0].location; // [longitude, latitude]
      obterCoordenadaMaisProxima(this.state.coordenadasDispositivo).then(
        response => {
          const coordenadaDispositivo = response.waypoints[0].location;
          obterRotaEntreDoisPontos(
            {
              latitude: coordenadaDispositivo[LATITUDE],
              longitude: coordenadaDispositivo[LONGITUDE]
            },
            {
              latitude: coordenadaTerminal[LATITUDE],
              longitude: coordenadaTerminal[LONGITUDE]
            }
          ).then(response => {
            this.setState(
              {
                rotaParaTerminal: response.routes[0].geometry.coordinates,
                carregando: false
              },
              () => {
                console.log(this.state);
              }
            );
          });
        }
      );
    });
  }

  render() {
    return (
      <Container style={{ zIndex: 1 }}>
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
          <ActivityIndicator
            style={{opacity : this.state.carregando ? 1.0 : 0.0}}
            size="large"
            color="#0000ff"
            animating={true}
          />
        </View>
        <Switch
          style={{ position: "absolute", left: "85%", top: 20 }}
          value={this.state.mapaHibrido}
          onValueChange={value => this.setState({ mapaHibrido: value })}
        />

        <Fab
          active={this.state.fabAtivado}
          direction="up"
          containerStyle={{}}
          style={{ backgroundColor: "#FF7900" }}
          position="bottomRight"
          onPress={() => this.setState({ fabAtivado: !this.state.fabAtivado })}
        >
          <SimpleLineIcons name="options-vertical" />

          <Button
            style={{ backgroundColor: "#F57C00" }}
            onPress={() => this.atualizarTerminaisEDispositivo()}
          >
            <FontAwesome name="refresh" size={20} color="white" />
          </Button>

          <Button
            style={{ backgroundColor: "#F57C00" }}
            onPress={() => {
              if (this.state.terminalSelecionado != undefined) {                
                this.tirarFotoDoMapa().then(foto => {
                    //console.log(foto)
                  const dados = {
                    terminalSelecionado: this.state.terminalSelecionado,
                    fotoDoMapa: foto,
                    dadosOS: this.props.navigation.state.params
                  };
                  if(this.props.navigation.state.params.tipo_servico == 5) {
                    this.props.navigation.navigate("FinalizarAtendimento", {
                        ...this.props.navigation.state.params,
                        fotoDoMapa : foto,
                        terminalSelecionado : this.state.terminalSelecionado
                      });
                  } else {
                    this.props.navigation.navigate("FinalizarViabilidade", {
                        dadosOS : this.props.navigation.state.params,
                        fotoDoMapa : foto,
                        terminalSelecionado : this.state.terminalSelecionado
                      });
                  }
                });
              } else {
                Alert.alert(
                  "Erro",
                  "Por favor seleciona alguma caixa de atendimento"
                );
              }
            }}
          >
            <FontAwesome name="check-circle" size={20} color="white" />
          </Button>
        </Fab>

        <MapView
          ref={mapa => (this.mapa = mapa)}
          initialRegion={{ ...this.state.regiao }}
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            zIndex: -1
          }}
          loadingEnabled={true}
          mapType={this.state.mapaHibrido ? "hybrid" : "standard"}
          onPress={event => this.definirPosicaoDoDispositivo(event)}
        >
          {this.state.rotaParaTerminal.length > 0 && (
            <Polyline
              coordinates={this.state.rotaParaTerminal.map(coordenada => ({
                longitude: coordenada[0],
                latitude: coordenada[1]
              }))}
              strokeWidth={3}
              strokeColor="#1a66ff"
              fillColor="rgba(230,238,255,0.5)"
            />
          )}
          
          {this.state.coordenadasDispositivo && (
            <Marker
              key={Date.now()}
              coordinate={{ ...this.state.coordenadasDispositivo }}
              image={dispositivoIcone}
              anchor={{ x: 0.5, y: 1.5 }}
            />
          )}

          {this.state.terminalSelecionado != null ? (
            <Circle
              center={{
                latitude: Number(
                  this.state.posicaoTerminalSelecionado.latitude
                ),
                longitude: Number(
                  this.state.posicaoTerminalSelecionado.longitude
                )
              }}
              radius={30}
              strokeWidth={1}
              strokeColor="#1a66ff"
              fillColor="rgba(230,238,255,0.5)"
            />
          ) : (
            <View />
          )}

          {this.state.terminais.map((terminal, index) => (
            <Marker
              key={index + "_" + Date.now()}
              coordinate={{
                latitude: Number(terminal.latitude),
                longitude: Number(terminal.longitude)
              }}
              image={
                terminal.codigo == this.state.codigoTerminalSelecionado
                  ? terminalSelecionado
                  : terminalIcone
              }
              anchor={{ x: 0.4, y: 0.5 }}
              onPress={() =>
                this.tracarRotaParaTerminal(
                  terminal,
                  this.state.arrayTerminaisSelecionados.length
                )
              }
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignContent: "center"
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    textAlign: "center",
                    color: "black",
                    marginTop: 35
                  }}
                >
                  {terminal.codigo}
                </Text>
              </View>
            </Marker>
          ))}

          {this.state.coordenadasDispositivo && (
            <Circle
              center={{ ...this.state.coordenadasDispositivo }}
              radius={this.state.distanciaMaximaDeTerminaisEmMetros}
              strokeWidth={1}
              strokeColor="#1a66ff"
              fillColor="rgba(230,238,255,0.5)"
            />
          )}
        </MapView>
      </Container>
    );
  }
}

export { Mapa };
