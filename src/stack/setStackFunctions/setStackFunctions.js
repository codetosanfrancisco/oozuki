import {Navigation} from 'react-native-navigation';
import Icons from 'react-native-vector-icons/MaterialIcons';
import {Dimensions} from 'react-native';

export const setNewStackAfterLogin = () => {
    Icons.getImageSource('menu',35,'white').then(source => {
        Navigation.setRoot({
            root: {
                sideMenu: {
                left: {
                    component: {
                        id:"Oozuki.SideBar",
                        name: 'application.Oozuki.SideBar'
                    }
                    
                },
                center: {
                    stack: {
                        options: {
                            topBar:{
                                visible:true,
                                title:{
                                    text:"Oozuki",
                                    color:"white"
                                }
                            }
                        },
                        children: [{
                        component:{
                            name:"application.Oozuki.MyFriends"
                        },
                        component:{
                            name:"application.Oozuki.Home"
                        },
                        component: {
                            name: 'application.Oozuki.Gifts',
                            options:{
                                topBar:{
                                    rightButtons: [
                                        {
                                        id: 'openSideBar',
                                        icon: source
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
                },
                options:{
                    sideMenu: {
                        left: {
                          width: 300,
                          height: Dimensions.get('screen').height,
                          visible: false,
                          enabled: true
                        }
                      }
                }
                }
            }
            })
        })
}