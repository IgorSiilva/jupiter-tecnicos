
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'es6-symbol/implement'

import {networkTask} from "./app/helpers/networkService"


global.Buffer = global.Buffer || require('buffer').Buffer

AppRegistry.registerComponent(appName, () => App);


/* CREATE TABLE OS(
  id INT UNIQUE, emAndamento INT, entreguepor TEXT, tecnico TEXT, datahorasaida TEXT, idordem INT, servicorealizado TEXT,
  edificacao TEXT, status INT, descricao_status TEXT, contrato INT, servico TEXT, nomecliente, tipoatendimento INT, rank INT,
  sistema TEXT, finalizada INT, endereco TEXT, latitudeInicio TEXT, longitudeInicio TEXT, latitudeTermino TEXT, longitudeTermino TEXT,
  fimatendimento TEXT, inicioatendimento TEXT, solucao INT, historico TEXT, assinatura BLOB, usuariofo TEXT, nomeDoAssinante TEXT,
  cpfDoAssinante TEXT, presencaDoTitular INT 
  ) */

AppRegistry.registerHeadlessTask('networkTask', () => networkTask);
