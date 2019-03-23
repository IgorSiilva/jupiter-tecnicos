import { createStackNavigator } from "react-navigation";
import { LoginScreen } from "../components/login/login";
import {InicioAtendimento} from "../components/iniciarAtendimento/iniciarAtendimento"
import {FinalizarAtendimento} from "../components/finalizarAtendimento/finalizarAtendimento"
import {Ordens} from "../components/lista-ordens/ordens"
import {Assinatura} from "../components/assinatura/Assinatura"
import {PopupMenu} from "../components/navbar/popUpMenu"
import {Mapa} from "../components/mapa/Mapa"
import {FinalizarViabilidade} from "../components/finalizarViabilidade/finalizarViabilidade"



const AppStackNavigator = createStackNavigator(
  {
    Login: LoginScreen,
    InicioAtendimento : InicioAtendimento,
    FinalizarAtendimento : FinalizarAtendimento,
    Ordens : Ordens,
    Assinatura : {
      screen: Assinatura,
      navigationOptions: () => ({ header: null })
    },
    Mapa : Mapa,
    FinalizarViabilidade : FinalizarViabilidade,
    //passar a props do navigation
    PopupMenu : PopupMenu,
  },
  {
    initialRouteName: 'Login',
    navigationOptions: {
      headerTitle: "Júpiter Técnicos",
      headerStyle: {
        backgroundColor: "#F78154",
        statusBarStyle: 'dark-content',
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold"
      }
    }
  }
);

export { AppStackNavigator };
