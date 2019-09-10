import React,{Component} from 'react';
import {View,Text,StyleSheet,SafeAreaView,Dimensions,Modal,ScrollView,Image,Alert,Animated,Button,AsyncStorage,TouchableOpacity,TouchableHighlight} from 'react-native';
import Icons from 'react-native-vector-icons/MaterialIcons';
import {Navigation} from 'react-native-navigation';
import BottomNavigation, {FullTab,ShiftingTab,IconTab} from 'react-native-material-bottom-navigation';
import { DoubleBounce} from 'react-native-loader';
import Carousel from 'react-native-snap-carousel';
import {Thumbnail} from 'native-base';
import { Icon } from 'react-native-elements'
import ModalGift from '../ModalGift/ModalGift';
import firebase from "react-native-firebase";
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from "react-native-fcm";


class Gifts extends Component{

    constructor(props) {
        const {currentUser} = firebase.auth();
        super(props);
        Navigation.events().bindComponent(this); 
        this.state = {
            height:Dimensions.get("screen").height,
            swapScreen:false,
            entries:[{
                image:"",
                views:"",
                price:"",
                description:"vdwvwevvvdvnlvnwvmwmdvwm[oow["
            },
            {
                image:"",
                views:"",
                price:"",
                description:"wqdfnofqifjpiqwjopfjoq[wkf[wqk[f"
            },
            {
                image:"",
                views:"",
                price:"",
                description:"dnwvoiwn0ixj0qj"
            }],
            backgroundAnimation: new Animated.Value(0),
            modalVisible:false
        }
        
        }

    navigationButtonPressed({ buttonId }) {
        if(buttonId == "openSideBar"){
            Navigation.mergeOptions("Oozuki.SideBar",{
                sideMenu:{
                    left:{
                        visible:true
                    }
                }    
            })
        }
    }

    navigateToThisTab = tab => {
        this.setState({
            swapScreen:true
        })
        Promise.all([Icons.getImageSource('toys',35,'white'),Icons.getImageSource('group',35,'white')]).then(sources => {
            Icons.getImageSource('clear',35,'white').then(source => {
                Navigation.showModal({
                    stack: {
                    children: [{
                        component: {
                        name: tab,
                        id: tab == "application.Oozuki.Home" ? "Oozuki.Home" : "Oozuki.MyFriends",
                        passProps: {
                            text: 'stack with one child'
                        },
                        options: {
                            topBar: {
                            title: {
                                text: tab == "application.Oozuki.Home" ? "All Gifts" : "My Friends",
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
                                    icon: tab == "application.Oozuki.Home" ? sources[0] : sources[1]
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
        this.setState({
            swapScreen:false
        })
    }

    handler = () => {
        this.setState({
            height:Dimensions.get("screen").height
        })
    }

    componentWillMount(){
        Dimensions.addEventListener("change", this.handler);
    }

    closeModal = () => {
        this.setState({
            modalVisible:false
        })
    }


    tabs = [
        {
          key: 'application.Oozuki.Home',
          icon: 'toys',
          label: 'All Gifts',
          barColor: '#e42045',
          pressColor: 'rgba(255, 255, 255, 0.16)'
        },
        {
          key: 'application.Oozuki.MyFriends',
          icon: 'group',
          label: 'Friends',
          barColor: '#e42045',
          pressColor: 'rgba(255, 255, 255, 0.16)'
        }
      ]
    
      renderIcon = icon => ({ isActive }) => (
        <Icon size={24} color="white" name={icon} />
      )
    
      renderTab = ({ tab, isActive }) => (
        <FullTab
          isActive={isActive}
          key={tab.key}
          label={tab.label}
          renderIcon={this.renderIcon(tab.icon)}
        />
      )

    _renderItem = ({item,index}) => {
        return (
            <View>
                <View style={{flexDirection:"row",width:"100%",alignItems:"center",backgroundColor:"#e42045",padding:5,justifyContent:"center"}}>
                    <Thumbnail small source={{uri:`https://images.unsplash.com/photo-1546625075-8223b42ef0d7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ`}} />
                    <Text style={{fontFamily:"Roboto-Medium",color:"#fff",paddingLeft:10}}>Fave</Text>
                </View>
                <View>
                    <Image style={styles.giftImage} 
                    source={
                        {uri:`https://s3-ap-southeast-1.amazonaws.com/myunilife/images/38666448_2150442321900374_7260687182195589120_n.jpg`}
                    }/>
                </View>
                <View style={styles.paragraphContainer}>
                    <View style={styles.flexRowCenter}>
                        <Thumbnail small source={{uri:`https://s3-ap-southeast-1.amazonaws.com/myunilife/images/38666448_2150442321900374_7260687182195589120_n.jpg`}} />
                        <Text style={styles.thumbnailTextFrom}>from </Text><Text style={styles.thumbnailTextName}>Lim Sheng Hong</Text>
                    </View>
                    <View style={styles.flexRowCenter}>
                        <Text style={styles.noOfViewsLabel}>Shares: </Text>
                        <Text style={styles.noOfViewsValue}>100</Text>
                    </View>
                </View>
                <View>
                    <TouchableOpacity style={styles.touchable} onPress={() => this.setState({modalVisible:true})}>
                        <Text style={styles.textShare}>Share this gift!</Text>
                    </TouchableOpacity>
                </View>
                <View>
                </View>
            </View>
        )
    }

    componentDidMount() {

        Animated.timing(this.state.backgroundAnimation,{
            toValue:300,
            duration:1000
        }).start();

        this.setState({
            modalVisible:false
        })
        
        FCM.requestPermissions();
    
        FCM.getFCMToken().then(token => {
          console.log("TOKEN (getFCMToken)", token);
        });
    
        FCM.getInitialNotification().then(notif => {
          console.log("INITIAL NOTIFICATION", notif)
        });
    
        this.notificationListner = FCM.on(FCMEvent.Notification, notif => {
          console.log("Notification", notif);
          if(notif.local_notification){
            return;
          }
          if(notif.opened_from_tray){
            return;
          }
    
          if(Platform.OS ==='ios'){
                  //optional
                  //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
                  //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
                  //notif._notificationType is available for iOS platfrom
                  switch(notif._notificationType){
                    case NotificationType.Remote:
                      notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
                      break;
                    case NotificationType.NotificationResponse:
                      notif.finish();
                      break;
                    case NotificationType.WillPresent:
                      notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
                      break;
                  }
                }
          this.showLocalNotification(notif);
        });
    
        this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, token => {
          console.log("TOKEN (refreshUnsubscribe)", token);
        });
      }
    
      showLocalNotification(notif) {
        FCM.presentLocalNotification({
          title: notif.title,
          body: notif.body,
          priority: "high",
          click_action: notif.click_action,
          show_in_foreground: true,
          local: true
        });
      }
    
      componentWillUnmount() {
        this.notificationListner.remove();
        this.refreshTokenListener.remove();
      }


    render(){
        return(
            <SafeAreaView style={{height:"100%",width:"100%"}}>
            <View style={{paddingBottom:50,width:"100%"}}>
                <ScrollView style={styles.height}>
                    <View style={{height:"100%",paddingBottom:40}}>
                        <View style={styles.height}>
                                <View style={styles.giftNotify}>
                                    <Icon name='toys'/>
                                    <Text>You receive 20 gifts!</Text>
                                    <Icon name='toys' />
                                </View>
                            <View>
                                <Carousel 
                                layout={'default'} 
                                data={this.state.entries}
                                renderItem={this._renderItem}
                                sliderWidth={Dimensions.get('screen').width}
                                itemWidth={Dimensions.get('screen').width}
                                />
                            </View>
                        </View>
                    </View>
                    <Modal
                        onRequestClose={() => alert("The modal is closed!")}
                        animationType="slide"
                        transparent={false}
                        visible={this.state.swapScreen}
                        >
                            <View style={styles.swapScreen}>
                                <DoubleBounce size={50} color="#1CAFF6" />
                            </View>
                        </Modal>
                        <Modal
                            animationType="slide"
                            transparent={false}
                            visible={this.state.modalVisible}
                            onRequestClose={() => {
                                Alert.alert('Modal has been closed.');
                            }}>
                                <View>
                                    <ModalGift closeModal={this.closeModal}/>
                                </View>
                            </Modal>
                </ScrollView>
                <View style={{position:"absolute",bottom:0,width:"100%"}}>
                        <BottomNavigation
                            onTabPress={newTab => this.navigateToThisTab(newTab.key)}
                            renderTab={this.renderTab}
                            tabs={this.tabs}
                        />
                </View>
            </View>
            </SafeAreaView>
        )
    }

    
}

const styles = StyleSheet.create({
    swapScreen:{
        justifyContent:"center",
        alignItems:"center",
        height:"100%"
    },
    paragraphContainer:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"space-around",
        padding:10,
        backgroundColor:"#e42045"
    },
    giftImage:{
        width:"100%",
        height: Dimensions.get("screen").height - 0.55 * Dimensions.get("screen").height
    },
    thumbnailTextFrom:{
        paddingLeft:10,
        fontFamily:"Roboto-Medium",
        fontSize:15,
        color:"#fff"
    },
    thumbnailTextName:{
        fontFamily:"Roboto-Bold",
        fontSize:15,
        color:"#fff"
    },
    noOfViewsLabel:{
        fontFamily:"Roboto-Medium",
        fontSize:15,
        color:"#fff"
    },
    noOfViewsValue:{
        fontFamily:"Roboto-Bold",
        fontSize:15,
        color:"#fff"
    },
    textShare:{
        color:"#e42045",
        fontFamily:"Roboto-Medium",
        fontSize:15,
        paddingLeft:10
    },
    touchable:{
        flexDirection:"row",
        backgroundColor:"#fff",
        padding:20,
        borderWidth:2,
        borderColor:"#e42045",
        justifyContent:"center",
        alignItems:"center"
    },
    giftNotify:{
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        height:"11%"
    },
    height:{
        height:"100%"
    },
    flexRowCenter:{
        flexDirection:"row",
        alignItems:"center"
    }

})

export default Gifts;