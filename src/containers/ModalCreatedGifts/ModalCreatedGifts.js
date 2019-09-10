import React,{Component} from 'react';
import {View,Text,StyleSheet,Modal,SafeAreaView,ScrollView} from 'react-native';
import {Card,CardItem,Left,Body,Right,Thumbnail,Segment} from "native-base";
import {Button} from "react-native-elements"

class ModalCreatedGifts extends Component{

    render(){
        return (
            <Modal
                onRequestClose={() => alert("The modal is closed!")}
                animationType="slide"
                transparent={false}
                visible={this.props.visible}
                >
                <SafeAreaView style={{height:"100%"}}>
                    <ScrollView style={{height:"100%"}}>
                        {this.props.children}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        )
    }
}

export default ModalCreatedGifts;