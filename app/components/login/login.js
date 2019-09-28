import React, { Component } from "react";
import {
  Container,
  Content,
  Form,
  Item,
  Input,
  Button,
  Text
} from "native-base";
import {
  AsyncStorage,
  Alert,
  ActivityIndicator,
  View,
  StatusBar
} from "react-native";
import { styles } from "./loginStyles";
import { loginUrl } from "../../config/api";
import Icon from "react-native-vector-icons/EvilIcons";
import { StackActions, NavigationActions } from "react-navigation";
import Orientation from "react-native-orientation";
import OneSignal from "react-native-onesignal"; // Import package from node modules

class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: "",
      password: "",
      loginStatus: "",
      deviceId: "",
      showSpinner: false,
      loginError: true
    };
    Orientation.lockToPortrait();

  }

  login() {
    //OneSignal.configure()
    //habilita o network no debugger
    // GLOBAL.XMLHttpRequest =
    //   GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

    if (this.state.user == "" || this.state.password == "") {
      Alert.alert("Error", "Preencha os campos de login");
      return;
    } else {
      this.setState({
        showSpinner: true
      });
    }

    try {
      AsyncStorage.getItem("usuarioid").then(userid => {
        fetch(
          `${loginUrl}/api/view/Usuarios/verificarUsuarioSenhaJSON`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `usuario=${this.state.user}&senha=${
              this.state.password
            }&usuarioid=${userid}`
          }
        )
          .then(response => response.json())
          .then(response => {
            console.log(response);
            if (response.success == "1") {
              AsyncStorage.setItem("usuario", this.state.user).then(() => {
                //reseta o stack e não deixa o usuario retornar para o login
                const resetAction = StackActions.reset({
                  index: 0,
                  actions: [NavigationActions.navigate({ routeName: "Ordens" })]
                });
                this.props.navigation.dispatch(resetAction);
              });
            } else {
              this.setState({
                showSpinner: false
              });
              Alert.alert(response.message);
            }
          })
          .catch(error => {
            this.setState({
              showSpinner: false
            });
            Alert.alert("Erro", "Não foi possivel conectar");
            console.log(error);
          });
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possivel conectar");

      console.log(error);
      this.setState({
        showSpinner: false
      });
    }
  }

  componentDidMount() {
    this.setState({
        showSpinner : true
    })

    setTimeout(() => { 
        this.setState({
            showSpinner : false
        })
     }, 5000);

    AsyncStorage.getItem("usuario").then(usuario => {
      if (usuario != null && usuario != undefined) {
        const resetAction = StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Ordens" })]
        });
        this.props.navigation.dispatch(resetAction);
      }
    });
  }

  componentWillMount() {}

  render() {
    return (
      <Container>
        <StatusBar backgroundColor="#F78154" barStyle="light-content" />
        <View style={[styles.loading]}>
          <ActivityIndicator
            size="large"
            color="#0000ff"
            animating={this.state.showSpinner}
          />
        </View>
        {this.state.showSpinner == false ? (
          <Content>
            <Form style={styles.container}>
              <Item rounded style={styles.loginForm}>
                <Icon style={{ color: "#F66600" }} name="user" size={35} />
                <Input
                  placeholder="Usuario"
                  label="Usuario"
                  value={this.state.user}
                  onChangeText={user => this.setState({ user })}
                />
              </Item>

              <Item rounded style={styles.loginForm}>
                <Icon style={{ color: "#F66600" }} name="lock" size={30} />
                <Input
                  placeholder="Senha"
                  secureTextEntry
                  label="Senha"
                  value={this.state.password}
                  onChangeText={password => this.setState({ password })}
                />
              </Item>
            </Form>

            <Button
              rounded
              block
              style={styles.button}
              onPress={() => {
                this.login();
              }}
            >
              <Text style={styles.text}>Login</Text>
            </Button>
          </Content>
        ) : (
          <View />
        )}
      </Container>
    );
  }
}

export { LoginScreen };
