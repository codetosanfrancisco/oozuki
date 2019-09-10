import React,{Component} from 'react';
import {View,Text,StyleSheet,SafeAreaView} from 'react-native';
import { Button,Icon } from 'react-native-elements';
import {LoginManager} from 'react-native-fbsdk'
import {Navigation} from 'react-native-navigation'
import Icons from 'react-native-vector-icons/MaterialIcons';
import firebase from "react-native-firebase";

class SideBar extends Component{

    state = {
        buttons:[
            {
                icon:"face",
                title:"My Profile",
                onPress:() => {
                    this.open("application.Oozuki.MyProfile")
                }
            },
            {
                icon:"toys",
                title:"All Gifts",
                onPress:() => this.open("application.Oozuki.Home")
            },
            {
                icon:"group",
                title:"Friends",
                onPress:() => this.open("application.Oozuki.MyFriends")
            },
            {
                icon:"add-circle",
                title:"Create Gifts",
                onPress:() => this.open("application.Oozuki.CreateGifts")
            },{
                icon:"input",
                title:'Logout of Oozuki' ,
                onPress: () => {
                    Navigation.showModal({
                        stack: {
                        children: [{
                            component: {
                            name: "application.Oozuki.Loader",
                            id:"Oozuki.Loader",
                            passProps: {
                                text: 'stack with one child'
                            },
                            options: {
                                topBar: {
                                    visible:false
                                }
                            }
                            }
                        }]
                        }
                    })
                    firebase.auth().signOut().then(() => {
                        alert('Signed Out');
                    });
                    Navigation.setRoot({
                        root: {
                          component: {
                            name: "application.Oozuki.Login"
                          }
                        }
                      });
                    Navigation.dismissAllModals();
                }
            }
        ]
    }

    open = page => {
        Promise.all([Icons.getImageSource('toys',35,'white'),Icons.getImageSource('group',35,'white'),Icons.getImageSource('face',35,'white'),Icons.getImageSource("add-circle",35,"white")]).then(sources => {
            Icons.getImageSource('clear',35,'white').then(source => {
                Navigation.showModal({
                    stack: {
                    children: [{
                        component: {
                        name: page,
                        id: page == "application.Oozuki.Home" ? "Oozuki.Home" : "Oozuki.MyFriends",
                        passProps: {
                            text: 'stack with one child'
                        },
                        options: {
                            topBar: {
                            title: {
                                text: page == "application.Oozuki.Home" ? "All Gifts" : page == "application.Oozuki.MyProfile" ? "My Profile": page == "application.Oozuki.MyFriends" ? "My Friends" : "Create Gifts",
                                color:"white"
                            },
                            rightButtons: [
                                {
                                id: 'closeModal',
                                icon: source
                                }
                            ],
                            leftButtons:[
                                {
                                    icon: page == "application.Oozuki.Home" ? sources[0] : page == "application.Oozuki.MyProfile" ? sources[2] : page == "application.Oozuki.MyFriends" ? sources[1] : sources[3]
                                }
                            ],
                            background:{
                                color:"#e42045"
                            }
                            }
                        }
                        }
                    }]
                    }
                });
            })
        })
        Navigation.mergeOptions("Oozuki.SideBar",{
            sideMenu:{
                left:{
                    visible:false
                }
            }  
        })
    }

    render(){
        return(
            <SafeAreaView style={{backgroundColor:"white",height:"100%"}}>
                <View>
                    <View style={{alignItems:"center",justifyContent:"center",padding:10,paddingBottom:30}}>
                        <Icon
                        size={60}
                        reverse
                        name='ios-american-football'
                        type='ionicon'
                        color='#517fa4'
                        />
                        <View style={{padding:10}}>
                            <Text style={{fontSize:20}}>Welcome to Oozuki!</Text>
                        </View>
                    </View>
                    {
                        true && this.state.buttons.map(element => {
                            return (
                                <Button
                                    key={Math.random().toString(36).substring(7)}
                                    textStyle={styles.text}
                                    borderRadius={10}
                                    small
                                    buttonStyle={{margin:5}}
                                    icon={{name:element.icon}}
                                    title={element.title} backgroundColor="#e42045"
                                    onPress={element.onPress}
                                />
                            )
                        })
                    }
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    text:{
        fontFamily:"Roboto-Medium"
    }
})

export default SideBar;