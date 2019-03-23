import React from 'react';
import {View,TouchableOpacity,UIManager,findNodeHandle} from 'react-native';
import Icon from "react-native-vector-icons/SimpleLineIcons";

const ICON_SIZE = 24;

class PopupMenu extends React.Component {
  constructor(props) {
    super(props)
  }

  handleShowPopupError = () => {
    // show error here
  };

  handleMenuPress = () => {
    const { actions, onPress } = this.props;

    UIManager.showPopupMenu(
      findNodeHandle(this.refs.menu),
      actions,
      this.handleShowPopupError,
      onPress,
    );


      console.log(this.props)
  };

  render() {
    return (
      <View>
        { this.props.children }
        <TouchableOpacity onPress={this.handleMenuPress} style={{alignSelf:'center',backgroundColor:'transparent',paddingLeft:15,paddingRight:15}}>
          <Icon
            name="options-vertical"
            size={ICON_SIZE}
            color='white'
            ref="menu"
          />
        </TouchableOpacity>
      </View>
    );
  }
}

export {PopupMenu};