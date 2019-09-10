import React,{Component} from 'react';
import {View,Text,StyleSheet,SafeAreaView,Image,ScrollView} from 'react-native';
import firebase from 'react-native-firebase';
import {Navigation} from 'react-native-navigation';
import Masonry from 'react-native-masonry';
import {Card,CardItem,Left,Body,Right,Thumbnail,Segment,ListItem} from "native-base";
import {Button} from 'react-native-elements';

const db = firebase.firestore();

db.settings({timestampsInSnapshots:true})

class FriendModal extends Component{

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this); // <== Will be automatically unregistered when unmounted
        this.state = {
            friendData:null,
            friend:false,
            haveHeSentMeFriendRequest:false,
            haveBecomeMyFriend:false
        }
    }

    navigationButtonPressed({ buttonId }) {
        if(buttonId == "closeModal"){
            Navigation.dismissModal(this.props.componentId);
        }
    }

    componentDidMount(){
        db.collection("users").doc(this.props.id).get().then(snapshot => {
            console.log(snapshot)
            this.setState({
                friendData:snapshot,
                friend:true
            })

            this.checkFriendReq();

            this.haveHeSentMeFriendRequest();

            this.haveBecomeMyFriend();
        })
    }

    checkFriendReq = () => {
        const {currentUser} = firebase.auth()
        db.collection("users").doc(currentUser.uid).get().then(snapshot => {
            if(snapshot.data().sentFriendReq && snapshot.data().sentFriendReq.includes(this.props.id)){
                this.setState({
                    friendReqSent:true
                })
            }
        })
    }

    sendFriendRequest = () => {
        const {currentUser} = firebase.auth();
        db.collection("users").doc(this.props.id).update({
            receivedFriendReq:firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
        }).then(() => {
            db.collection("users").doc(currentUser.uid).update({
                sentFriendReq: firebase.firestore.FieldValue.arrayUnion(this.props.id)
            }).then(() => {
                alert("Friends Request sent!")
                this.checkFriendReq()
            })
        })
    }

    haveHeSentMeFriendRequest = () => {
        const {currentUser} = firebase.auth();
        db.collection("users").doc(currentUser.uid).get().then(snapshot => {
            if(snapshot.data().receivedFriendReq && snapshot.data().receivedFriendReq.includes(this.props.id)){
                this.setState({
                    haveHeSentMeFriendRequest:true
                })
            }else{
                this.setState({
                    haveHeSentMeFriendRequest:false
                });
            }
        })
    }

    acceptFriendRequest = () => {
        const {currentUser} = firebase.auth();
        db.collection("users").doc(currentUser.uid).update({
            receivedFriendReq: firebase.firestore.FieldValue.arrayRemove(this.props.id),
            friends:firebase.firestore.FieldValue.arrayUnion(this.props.id)
        }).then(() => {
            db.collection("users").doc(this.props.id).update({
                sentFriendReq:firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
                friends:firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
            }).then(() => {
                alert("Both of you have become friends!")
            })
        })
    }

    haveBecomeMyFriend = () => {
        const {currentUser} = firebase.auth()
        db.collection("users").doc(currentUser.uid).get().then(snapshot => {
            if(snapshot.data().friends && snapshot.data().friends.includes(this.props.id)){
                this.setState({
                    haveBecomeMyFriend:true
                })
            }else{
                this.setState({
                    haveBecomeMyFriend:false
                });
            }
        })
    }

    render(){
        let friend = null;
        let button = (
            <Button disabled={this.state.friendReqSent} title={this.state.friendReqSent ? "Friend Request Sent":"Send friend request"} buttonStyle={{backgroundColor:"#e42045"}} color="#fff" onPress={() => this.sendFriendRequest()}/>
        )
        if(this.state.haveHeSentMeFriendRequest){
            button = (
                <Button title="Accept friend request"  buttonStyle={{backgroundColor:"#e42045"}} color="#fff" onPress={() => this.acceptFriendRequest()}/>
            )
        }

        if(this.state.haveBecomeMyFriend){
            button = (
                <Button title="Message" buttonStyle={{backgroundColor:"#e42045"}} color="#fff" onPress={() => alert("Message")}/>
            )
        }

        if(this.state.friend){
            friend = (
                <View>
                    <View>
                        <View style={{alignItems:"center",margin:10,flexDirection:"row",justifyContent:"space-evenly"}}>
                            <View>
                                <Image source={{uri:this.state.friendData._data.photoUrl ? this.state.friendData._data.photoUrl : 'https://images.unsplash.com/photo-1546629313-ea9c287a8b9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ'}} style={{width:100,height:100,borderRadius:50}}/>
                            </View>
                            <View>
                                <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
                                    <View style={{flexDirection:"column"}}>
                                        <Text>
                                            20
                                        </Text>
                                        <Text>
                                            shares
                                        </Text>
                                    </View>
                                    <View style={{flexDirection:"column"}}>
                                        <Text>
                                            20
                                        </Text>
                                        <Text>
                                            friends
                                        </Text>
                                    </View>
                                    <View style={{flexDirection:"column"}}>
                                        <Text>
                                            20
                                        </Text>
                                        <Text>
                                            wishes
                                        </Text>
                                    </View>
                                </View>
                                <View>
                                    {button}
                                </View>
                            </View>
                        </View>
                        <View style={{paddingLeft:10}}>
                            <Text style={{fontFamily:"Roboto-Medium",fontSize:20}}>{this.state.friendData._data.name}</Text>
                        </View>
                    </View>
                        <ListItem itemDivider>
                            <Text style={{fontFamily:"Roboto-Medium"}}>Gifts that shared by this friend</Text>
                        </ListItem>  
                        <Card>
                        <CardItem>
                        <Left>
                            <Thumbnail source={{uri: 'https://images.unsplash.com/photo-1546629313-ea9c287a8b9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ'}} />
                            <Body>
                            <Text>Shared</Text>
                            <Text note>GeekyAnts</Text>
                            </Body>
                        </Left>
                        </CardItem>
                        <CardItem cardBody>
                        <Image source={{uri: 'https://images.unsplash.com/photo-1546629313-ea9c287a8b9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ'}} style={{height: 200, width: null, flex: 1}}/>
                        </CardItem>
                        <CardItem>
                        <Left>
                            <Thumbnail source={{uri: 'https://images.unsplash.com/photo-1546629313-ea9c287a8b9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ'}} />
                            <Body>
                            <Text>Shared</Text>
                            <Text note>GeekyAnts</Text>
                            </Body>
                        </Left>
                        </CardItem>
                        <CardItem cardBody>
                        <Image source={{uri: 'https://images.unsplash.com/photo-1546629313-ea9c287a8b9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ'}} style={{height: 200, width: null, flex: 1}}/>
                        </CardItem>
                        <CardItem>
                        <Left>
                            <Thumbnail source={{uri: 'https://images.unsplash.com/photo-1546629313-ea9c287a8b9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ'}} />
                            <Body>
                            <Text>Shared</Text>
                            <Text note>GeekyAnts</Text>
                            </Body>
                        </Left>
                        </CardItem>
                        <CardItem cardBody>
                        <Image source={{uri: 'https://images.unsplash.com/photo-1546629313-ea9c287a8b9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ'}} style={{height: 200, width: null, flex: 1}}/>
                        </CardItem>
                    </Card>
            </View>
            )
        }
        return(
            <SafeAreaView>
                <ScrollView>
                {friend}
                </ScrollView>
            </SafeAreaView>
        )
    }
}

export default FriendModal;