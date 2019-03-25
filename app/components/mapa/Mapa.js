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
const dispositivoIcone = require("../../imagens/dispositivo.png");
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
      format: "png",
      quality: 0.8,
      result: "base64"
    });
  }

  async obterRota(latitude, longitude, LATITUDE, LONGITUDE) {
    return obterCoordenadaMaisProxima({ latitude, longitude }).then(
      response => {
        const coordenadaTerminal = response.waypoints[0].location;
        return obterCoordenadaMaisProxima(
          this.state.coordenadasDispositivo
        ).then(response => {
          const coordenadaDispositivo = response.waypoints[0].location;
          return obterRotaEntreDoisPontos(
            {
              latitude: coordenadaDispositivo[LATITUDE],
              longitude: coordenadaDispositivo[LONGITUDE]
            },
            {
              latitude: coordenadaTerminal[LATITUDE],
              longitude: coordenadaTerminal[LONGITUDE]
            }
          ).then(response => {
            let arrayCoordenadas = [];
            const resultado = response.routes[0].geometry.coordinates.map(
              async coordenada => {
                arrayCoordenadas.push({
                  longitude: coordenada[0],
                  latitude: coordenada[1]
                });
              }
            );

            return Promise.all(resultado).then(response => {
              return arrayCoordenadas;
            });
          });
        });
      }
    );
  }

  tracarRotaParaTerminal(terminal, quantidadeTerminaisSelecionados) {
    this.setState({
        carregando : true
    })
    const { latitude, longitude } = terminal;
    const LATITUDE = 1;
    const LONGITUDE = 0;

    if (
      quantidadeTerminaisSelecionados == 2 &&
      this.state.posicaoProximoTerminalARemover == 0
    ) {
      this.state.arrayTerminaisSelecionados.splice(0, 1, terminal);
      this.state.arrayPosicaoTerminaisSelecionados.splice(0, 1, {
        latitude,
        longitude
      });
      this.state.arrayCodigoTerminaisSelecionados.splice(0, 1, terminal.codigo);
      this.obterRota(latitude, longitude, LATITUDE, LONGITUDE).then(
        response => {
          this.state.arrayRotasParaTerminais.splice(0, 1, response);
          this.setState({
            posicaoProximoTerminalARemover: 1,
            carregando : false
          });
        }
      );
    } else if (
      quantidadeTerminaisSelecionados == 2 &&
      this.state.posicaoProximoTerminalARemover == 1
    ) {
      this.state.arrayTerminaisSelecionados.splice(1, 1, terminal);
      this.state.arrayPosicaoTerminaisSelecionados.splice(1, 1, {
        latitude,
        longitude
      });
      this.state.arrayCodigoTerminaisSelecionados.splice(1, 1, terminal.codigo);
      this.obterRota(latitude, longitude, LATITUDE, LONGITUDE).then(
        response => {
          this.state.arrayRotasParaTerminais.splice(1, 1, response);
          this.setState({
            carregando : false,
            posicaoProximoTerminalARemover: 0
        })
        }
      );
    } else {
      this.state.arrayTerminaisSelecionados.push(terminal);
      this.state.arrayPosicaoTerminaisSelecionados.push({
        latitude,
        longitude
      });
      this.state.arrayCodigoTerminaisSelecionados.push(terminal.codigo);
      this.obterRota(latitude, longitude, LATITUDE, LONGITUDE).then(
        response => {
          this.state.arrayRotasParaTerminais.push(response);
          this.setState({
              carregando : false
          })
        }
      );
    }
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
                  const dados = {
                    terminalSelecionado: this.state.terminalSelecionado,
                    fotoDoMapa: foto,
                    dadosOS: this.props.navigation.state.params
                  };
                  const reset = StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({
                        routeName: "FinalizarViabilidade",
                        params: { ...dados }
                      })
                    ]
                  });
                  this.props.navigation.dispatch(reset);
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
          {this.state.arrayRotasParaTerminais.length > 0 &&
            this.state.arrayRotasParaTerminais.map((rota, index) => (
              <Polyline
                key={index}
                coordinates={rota}
                strokeWidth={3}
                strokeColor={
                  "#" + ((Math.random() * 0xffffff) << 0).toString(16)
                }
                fillColor="rgba(230,238,255,0.5)"
              />
            ))}

          {this.state.coordenadasDispositivo && (
            <Marker
              key={Date.now()}
              coordinate={{ ...this.state.coordenadasDispositivo }}
              image={dispositivoIcone}
              anchor={{ x: 0.5, y: 1.5 }}
            />
          )}

            {this.state.arrayTerminaisSelecionados.map((terminal, index) => (
              <Circle
                key={index}
                center={{
                  latitude: Number(terminal.latitude),
                  longitude: Number(terminal.longitude)
                }}
                radius={30}
                strokeWidth={1}
                strokeColor="#1a66ff"
                fillColor="rgba(230,238,255,0.5)"
              />
            ))}

          {this.state.terminais.map((terminal, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: Number(terminal.latitude),
                longitude: Number(terminal.longitude)
              }}
              image={
                this.state.arrayCodigoTerminaisSelecionados.includes(
                  terminal.codigo
                )
                  ? terminalSelecionado
                  : terminalIcone
              }
              anchor={{ x: 0.2, y: 0.3 }}
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
