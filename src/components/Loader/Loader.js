import React,{Component} from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {DoubleBounce} from 'react-native-loader';

const Loader = props => {
    return (
        <View style={{height:"100%",justifyContent:"center",alignItems:"center"}}>
            <DoubleBounce size={50} color="#1CAFF6" />
        </View>
    )
}

export default Loader;