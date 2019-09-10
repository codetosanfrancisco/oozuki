import React,{Component} from 'react';
import {Image,Text,View,StyleSheet,SafeAreaView,Modal,TouchableHighlight,Dimensions,Animated} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {Thumbnail} from 'native-base';
import {PacmanIndicator,PulseIndicator,BarIndicator} from 'react-native-indicators';
import {Button,Icon} from 'react-native-elements';
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import DoubleClick from 'react-native-double-click';

class ModalGift extends Component{

    state = {
        loading:true,
        animateLoveOne: new Animated.Value(0)
    }

    componentDidMount = () => {
        showMessage({
            message: "Double tap on the gift to save it!",
            type: "default",
        })
    }

    startAnimation = () => {
        Animated.sequence([
            Animated.timing(this.state.animateLoveOne,{
                toValue:1,
                duration:10
            }),
            Animated.timing(this.state.animateLoveOne,{
                toValue:0,
                duration:2000
            })
        ]).start()
    }

    render(){

        let view = (
            <View style={{paddingTop:20}}>
                <PacmanIndicator color="#fff" size={60}/>
            </View>
        )

        share = (
            <View style={{alignItems:"center",jus1ifyContent:"center",paddingBottom:10}}>
                <Text>Sharing the gift...</Text>
            </View>
        )

        if(this.state.loading){
            view  = (

                <Button
                        textStyle={{color:"#e42045",fontFamily:"Roboto-Bold",fontSize:20}}
                        icon={{name:'loyalty',color:"#e42045",size:20}}
                        buttonStyle={{margin:5}}
                        title="This Gift is shared!"
                        backgroundColor="#fff"
                        onPress={() => this.props.closeModal()}
                    />
            )

            share = null
        }

        return(
                <SafeAreaView style={styles.wholeThingContainer}>
                    <FlashMessage position="top" /> 
                    <View style={styles.fullWidth}>
                        <View style={styles.fullWidth}>
                            {share}
                            <DoubleClick onClick={() => this.startAnimation()}>
                                <View>
                                    <Animated.View style={{opacity:this.state.animateLoveOne,position:"absolute",zIndex:100,alignSelf:"center",bottom:"40%"}}>
                                            <Icon
                                                name='favorite'
                                                color="#e42045"
                                                size={80}    
                                            />
                                    </Animated.View>
                                    <Image style={styles.giftImage}
                                    source={
                                        {uri:`https://s3-ap-southeast-1.amazonaws.com/myunilife/images/38666448_2150442321900374_7260687182195589120_n.jpg`}
                                    }/>
                                </View>
                            </DoubleClick>
                        </View>
                        <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-around",paddingBottom:10}}>
                            <View style={{flexDirection:"row",alignItems:"center",padding:10}}>
                                <Thumbnail small source={{uri:`https://s3-ap-southeast-1.amazonaws.com/myunilife/images/38666448_2150442321900374_7260687182195589120_n.jpg`}} />
                                <Text style={styles.textNameLabel}>from </Text><Text style={styles.textValue}>Lim Sheng Hong</Text>
                            </View>
                            <View style={{flexDirection:"row",alignItems:"center",padding:10}}>
                                <Text style={styles.textLabel}>No. of views: </Text>
                                <Text style={styles.textValue}>100</Text>
                            </View>
                        </View>
                        <View style={{paddingTop:5}}>
                            {view}
                        </View>
                    </View>
                </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    giftImage:{
        width:"100%",
        height:Dimensions.get("screen").height - 0.5 * Dimensions.get("screen").height
    },
    fullWidth:{
        width:"100%"
    },
    wholeThingContainer:{
        width:"100%",
        backgroundColor:"#e42045",
        height:"100%",
        justifyContent:"center",
        alignItems:"center"
    },
    textLabel:{
        fontFamily:"Roboto-Medium",
        fontSize:15,
        color:"#fff"
    },
    textValue:{
        fontSize:15,
        color:"#fff",
        fontFamily:"Roboto-Bold"
    },
    textNameLabel:{
        fontSize:15,
        color:"#fff",
        paddingLeft:10
    }
})

export default ModalGift;