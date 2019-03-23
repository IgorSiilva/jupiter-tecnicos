import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({

     botoesContainer: {
        flex: 1, 
        flexDirection: 'row',
        justifyContent : 'space-around',
        marginTop : 50
    },
    picker : {
        marginTop : 30,
        marginBottom : 30,
    },
    signature: {
        flex: 1,
        borderColor: '#000033',
        borderWidth: 1,
    },
    buttonStyle: {
        flex: 1, justifyContent: "center", alignItems: "center",
        backgroundColor: "#eeeeee",
        margin: 10
    },
    assinante: {
        marginBottom: 10,
        marginLeft : '5%',

    },
    textarea : {
        marginLeft : '5%',
        marginVertical : 15
    }
})