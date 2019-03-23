import React, { Component } from "react";
import {
  Container,
  Content,
  Card,
  CardItem,
  Text,
  Body,
  Button,
  ActionSheet,
  Root
} from "native-base";

import { styles } from "./atendimentoStyle";
import { StackActions, NavigationActions } from 'react-navigation'
import { StatusBar } from "react-native"
import { iniciarAtendimento } from '../../helpers/databaseHelper'
import RNAndroidLocationEnabler from 'react-native-android-location-enabler'


const options = ["Sim", "Não"]

class InicioAtendimento extends Component {
  constructor(props) {
    super(props);

    this.state = {
      posicao: ""
    };


  }


  confirmacaoAtendimento(props, confirmacao) {
    if (confirmacao == 'Sim') {
      navigator.geolocation.getCurrentPosition(position => {
        this.setState(
          {
            posicao: position.coords
          },
          () => {
            let data = new Date();
            formatedDate = data.toISOString().split('T')[0] + " " + data.toLocaleTimeString()
            
            const dados = {
              ordem: props.navigation.state.params,
              posicao: this.state.posicao,
              data: formatedDate,
            };

            iniciarAtendimento(dados)

            const servico_orcamento = 13
            const servico_viabilidade = 3

            if (dados.ordem.tipo_servico != servico_orcamento && dados.ordem.tipo_servico != servico_viabilidade) {
              const reset = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Ordens' })]
              })
              this.props.navigation.dispatch(reset);
            } else {

              const reset = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Mapa', params : {...props.navigation.state.params} })]
              })
              this.props.navigation.dispatch(reset);
            }
          }
        )
      })
    }
    else {
      this.props.navigation.goBack();
    }

  }

  iniciarAtendimento(props) {
    ActionSheet.show(
      {
        options: options,
        title: "Realmente deseja iniciar?"
      },
      buttonIndex => {
        console.log(options[buttonIndex])
        this.confirmacaoAtendimento(props, options[buttonIndex])
      }
    )

  }

  cancelarAtendimento() {
    console.log("atendimento cancelado");
    this.props.navigation.goBack();

  }

  componentDidMount() {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({ interval: 10000, fastInterval: 5000 })
  }

  render() {
    return (
      <Root>
        <StatusBar
          backgroundColor="#F78154"
          barStyle="light-content" />
        <Container>
          <Content padder>
            <Card>
              <CardItem style={styles.dadosCard}>
                <Text>{this.props.navigation.state.params.idordem}</Text>
              </CardItem>
              <CardItem style={styles.dadosCard}>
                <Text>{this.props.navigation.state.params.nome}</Text>
              </CardItem>
              <CardItem bordered style={styles.dadosCard}>
                <Text>{this.props.navigation.state.params.servico}</Text>
              </CardItem>
              <CardItem style={styles.botoesContainer}>
                <Button danger onPress={() => this.cancelarAtendimento()}>
                  <Text> Cancelar </Text>
                </Button>
                <Button primary onPress={() => this.iniciarAtendimento(this.props)}>
                  <Text> Iniciar </Text>
                </Button>
              </CardItem>
            </Card>

          </Content>
        </Container>
      </Root>
    );
  }
}

export { InicioAtendimento };
