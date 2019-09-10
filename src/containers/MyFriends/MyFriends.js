import React,{Component} from 'react';
import {View,StyleSheet,TouchableOpacity,Dimensions,SafeAreaView,ScrollView,FlatList,Modal,TouchableHighlight} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomNavigation, {IconTab,FullTab} from 'react-native-material-bottom-navigation';
import {Navigation} from 'react-native-navigation';
import AllGifts from '../../assets/images/AllGifts.jpg'
import {List, ListItem, Thumbnail, Text, Left, Body, Right, Button} from 'native-base';
import Share from 'react-native-share';
import {SearchBar,Divider} from "react-native-elements";
import firebase from "react-native-firebase";
const algoliaSearch = require("algoliasearch");

const db = firebase.firestore();

db.settings({timestampsInSnapshots:true})

const FBSDK = require('react-native-fbsdk');

const {
    GraphRequest,
    GraphRequestManager,
  } = FBSDK;

class MyFriends extends Component{

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this); // <== Will be automatically unregistered when unmounted
        this.state = {
            height:Dimensions.get("screen").height,
            swapScreen:false,
            search:"",
            friendRequest:[],
            modalFriendsVisible:false,
            currentModalFriendsId:null,
            facebookFriends:["hello"],
            otherFriends:[],
            uid:null
        }
    }

    navigationButtonPressed({ buttonId }) {
        if(buttonId == "closeModal"){
            Navigation.dismissModal(this.props.componentId);
        }
    }

    componentDidMount = () => {
        const responseInfoCallback = (error,result) => {
            if(result){
                console.log(result)
                this.setState({
                    facebookFriends: /*result.friends.data*/ ["hello"]
                })
            }else{
                console.log(error)
            }
        }
        const infoRequest = new GraphRequest(
            '/me',
            {
                parameters: {
                    fields: {
                        string: 'friends'
                    }
                }
            },
            responseInfoCallback
        )
        new GraphRequestManager().addRequest(infoRequest).start();
        db.collection("users").where("name","==","Jared Lee").get().then(snapshot => {
            console.log(snapshot._docs)
            this.setState({
                otherFriends:snapshot._docs
            })
        })
    }

    openModal = uid => {
        Icon.getImageSource('clear',35,'white').then(source => {
        Navigation.showModal({
            stack: {
            children: [{
                component: {
                name: "application.Oozuki.FriendModal",
                id:"FriendModal",
                passProps: {
                   id:uid
                },
                options: {
                    topBar: {
                    title: {
                        text: "Friend Search",
                        color:"white"
                    },
                    rightButtons: [
                        {
                            id: 'closeModal',
                            icon: source
                        }
                    ],
                    leftButtons:[
                        
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
    }

    search = (text) => {
        db.collection("users").orderBy("name").startAt(text).get().then(snapshot => {
            console.log(snapshot._docs)
            this.setState({
                otherFriends:snapshot._docs
            })
        })
    }

    render(){

        let friendRequests = (
            <ListItem>
                <Text>No Friends Request.</Text>
            </ListItem>
        )
        if(this.state.friendRequest.length > 0){
            friendRequests = (
                <ListItem thumbnail>
                    <Left>
                        <Thumbnail square source={{ uri: 'https://images.unsplash.com/photo-1546629313-ea9c287a8b9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ' }} />
                    </Left>
                    <Body>
                        <Text>Sankhadeep</Text>
                        <Text note numberOfLines={1}>Its time to build a difference . .</Text>
                    </Body>
                    <Right>
                        <Button transparent onPress={() => this.openModal("id")}>
                        <Text>View</Text>
                        </Button>
                    </Right>
                </ListItem>
            )
        }
        let shareOptions = {
            title: "Join me at Oozuki today!",
            message: "Download and start passing gifts today!",
            url: "http://oozuki.com",
            subject: "Join me at Oozuki today!" //  for email
        };

        let items = (
            <View>
                <Text>Search for friends or invite friends!</Text>
            </View>
        )

        let otherFriends = null;

        let {currentUser} = firebase.auth()

        if(this.state.otherFriends.length > 0){
            let otherFriendsArray = this.state.otherFriends.filter(friend => friend._data.uid != currentUser.uid );
            console.log(otherFriendsArray)
            otherFriends = otherFriendsArray.map((friend,index) => {
                return (
                    <ListItem thumbnail key={index}>
                        <Left>
                            <Thumbnail square source={{ uri: 'https://images.unsplash.com/photo-1546629313-ea9c287a8b9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ' }} />
                        </Left>
                        <Body>
                            <Text>{friend._data.name}</Text>
                            <Text note numberOfLines={1}>{friend._data.location}</Text>
                        </Body>
                        <Right>
                            <Button transparent onPress={() => this.openModal(friend.id)}>
                            <Text>View</Text>
                            </Button>
                        </Right>
                    </ListItem>
                )
            })
        }

        if(this.state.facebookFriends.length > 0){
            items = this.state.facebookFriends.map(friend => {
                return (
                <ListItem thumbnail>
                    <Left>
                        <Thumbnail square source={{ uri: 'https://images.unsplash.com/photo-1546629313-ea9c287a8b9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ' }} />
                    </Left>
                    <Body>
                        <Text>Sankhadeep</Text>
                        <Text note numberOfLines={1}>Its time to build a difference . .</Text>
                    </Body>
                    <Right>
                        <Button transparent>
                        <Text>View</Text>
                        </Button>
                    </Right>
                </ListItem>
                )
            })
        }
      
      
        return(
            <SafeAreaView style={{height:"100%",width:"100%"}}>
            <View style={{paddingBottom:60,width:"100%"}}>
                <ScrollView style={styles.height}>
                    <View style={styles.height}>
                        <View>
                            <List>
                                <ListItem itemDivider>
                                <Text>Friends Request ({this.state.friendRequest.length})</Text>
                                </ListItem>  
                                {friendRequests}
                            </List>
                            <List>
                                <ListItem itemDivider>
                                    <SearchBar
                                        placeholder="Search for friends here..."
                                        onChangeText={(text) => {
                                            this.setState({
                                                search:text
                                            })
                                            this.search(text);
                                        }}
                                        value={this.state.search}
                                        containerStyle={{backgroundColor:"#f1f3f4",borderTopColor:"#f1f3f4",borderBottomColor:"#f1f3f4",height:50}}
                                        inputStyle={{backgroundColor:"#f1f3f4"}}
                                    />
                                </ListItem>  
                                <Divider style={{backgroundColor:"#fff"}} />
                                <ListItem itemDivider>
                                    <Text>Facebook friends who are using this app</Text>
                                </ListItem>  
                                {items}
                                <ListItem itemDivider>
                                    <Text>Other Friends</Text>
                                </ListItem>  
                                {otherFriends}
                            </List>
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.inviteFriendsContainer}>
                    <TouchableOpacity onPress={() => {Share.open(shareOptions)}} style={styles.inviteFriendsPress}>
                            <Text style={styles.inviteFriendsText}>Invite friends to Oozuki!</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    inviteFriendsText:{
        fontFamily:"Roboto-Medium",
        color:"#fff"
    },
    inviteFriendsContainer:{
        position:"absolute",
        bottom:0,
        width:"100%",
        height:55,
        justifyContent:"center",
        alignItems:"center",
        flex:1
    },
    inviteFriendsPress:{
        height:"100%",
        width:"100%",
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#e42045"
    },
    height:{
        height:"100%"
    }
})

export default MyFriends;