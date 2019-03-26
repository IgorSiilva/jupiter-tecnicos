import React, { Component } from "react";
import { AppStackNavigator } from "./app/config/routes";
import OneSignal from 'react-native-onesignal'; // Import package from node modules
import { AsyncStorage } from "react-native";
import {removerOS} from "./app/helpers/databaseHelper"







export default class App extends Component {

  constructor(props){
    super(props)

    OneSignal.init("afa88f7c-f17f-4a24-bac1-40977fbadaf8");

    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('ids', this.onIds);

    this.onReceived = this.onReceived.bind(this)

    OneSignal.configure() 
  }
  
  componentDidMount() {

  }

  componentWillUnmount() {
    OneSignal.removeEventListener('received', this.onReceived);
    OneSignal.removeEventListener('opened', this.onOpened);
    OneSignal.removeEventListener('ids', this.onIds);
  }

  onReceived(notificacao) {
    const novaOS = notificacao.payload.additionalData
    if(novaOS.status == "1") {
      removerOS(novaOS)
    }    
  }


  onOpened(openResult) {
    //console.log('Message: ', openResult.notification.payload.body);
    //console.log('Data: ', openResult.notification.payload.additionalData);
    //console.log('isActive: ', openResult.notification.isAppInFocus);
    //console.log('openResult: ', openResult);
  }

  onIds(device) {
    console.log(device)
    AsyncStorage.setItem("usuarioid", device.userId)
  }
  
  render() {
    return <AppStackNavigator />;
  }
}
