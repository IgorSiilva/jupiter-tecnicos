import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    button : {        
        backgroundColor : '#F78154',
        marginTop : 50,
        width : '60%',
        alignSelf: 'center',
    },
    text : {
        color : 'white',
    },
    container : {
        marginTop : 50,
    },
    loginForm : {
        marginBottom : 50,
        width : '95%',
        alignSelf: 'center',
        backgroundColor : 'white'
    },  

    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
