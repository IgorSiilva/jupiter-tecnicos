let Datastore = require('react-native-local-mongodb')
let tecnicosDB = new Datastore({ filename: 'tecnicosDB', autoload: true });

export {tecnicosDB}