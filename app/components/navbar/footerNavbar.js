import React, { Component } from "react";
import { Footer, FooterTab, Button, Icon, Text, Badge } from 'native-base';


class FooterNavbar extends Component {
    componentDidMount() {
        
    }

    render() {
        return (
            <Footer style={{backgroundColor : '#F78154'}}>
              <FooterTab style={{backgroundColor : '#F78154'}}>
                <Button badge vertical>
                  <Badge><Text>2</Text></Badge>
                  <Icon name="map" style={{color : 'white'}}/>
                  <Text>Apps</Text>
                </Button>
                <Button vertical>
                  <Icon name="camera" style={{color : 'white'}}/>
                  <Text>Camera</Text>
                </Button>
                <Button vertical>
                  <Icon name="person" style={{color : 'white'}} />
                  <Text>Contact</Text>
                </Button>
              </FooterTab>
            </Footer>
        )
    }
}


export {FooterNavbar}