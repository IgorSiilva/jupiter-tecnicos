const decodificador = require("jwt-decode");

export async function fetchAsyncStorage() {
    try {
      const token = await AsyncStorage.getItem('userdata');
      if (token !== null) {
        return decodificador(token);
      }
     } catch (error) {
         return error;
     }
  }