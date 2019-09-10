import React,{Component} from 'react';
import {View,Text,StyleSheet,SafeAreaView,Dimensions,ScrollView,Image,TouchableOpacity,} from 'react-native';
import Icons from 'react-native-vector-icons/MaterialIcons';
import Iconss from 'react-native-vector-icons/FontAwesome';
import {Navigation} from 'react-native-navigation';
import BottomNavigation, {FullTab,ShiftingTab,IconTab} from 'react-native-material-bottom-navigation';
import {Divider,Icon,ListItem,SearchBar} from "react-native-elements";
import SavedGifts from '../../assets/images/savedGifts.jpg';
import AllGifts from '../../assets/images/AllGifts.jpg';
import {Card,CardItem,Left,Body,Right,Thumbnail,Segment,Button} from "native-base";
import Carousel from 'react-native-snap-carousel';
import Masonry from 'react-native-masonry';
import firebase from 'react-native-firebase';

const db = firebase.firestore();

db.settings({timestampsInSnapshots:true})

const SAVED_GIFTS = "SAVED_GIFTS";
const NEW_GIFTS = "NEW_GIFTS";
const SHARED_GIFTS = "SHARED_GIFTS"
const NUM_OF_TABS = 3;

class Home extends Component{

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this); // <== Will be automatically unregistered when unmounted
        this.offset = 0;
        this.state = {
            height:Dimensions.get("screen").height,
            swapScreen:false,
            currentPage:null,
            search:"",
            savedGiftEntries:[
                {
                    image:AllGifts,
                    text:"eiwofoiw"
                },
                {
                    image:AllGifts,
                    text:"eiwofoiw"
                },
                {
                    image:AllGifts,
                    text:"eiwofoiw"
                },
                {
                    image:AllGifts,
                    text:"eiwofoiw"
                }
            ],
            newGiftEntries:null,
            sharedGiftEntries:[
                {
                    image:AllGifts,
                    text:"eiwofoiw"
                },
                {
                    image:AllGifts,
                    text:"eiwofoiw"
                },
                {
                    image:AllGifts,
                    text:"eiwofoiw"
                },
                {
                    image:AllGifts,
                    text:"eiwofoiw"
                }
            ]
        }
    }

    navigationButtonPressed({ buttonId }) {
        if(buttonId == "closeModal"){
            Navigation.dismissModal(this.props.componentId);
        }
    }

    _renderItem = ({item,index}) => {
        return (
            <View key={Math.random().toString(36).substring(7)}>
                <View>
                    <Image style={styles.giftImage} 
                    source={
                        {uri:`https://images.unsplash.com/photo-1546629313-ea9c287a8b9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ`}
                    }/>
                </View>
            </View>
        )
    }

    componentDidMount = () => {
        db.collection("gifts").get().then(snapshot => {
            this.setState({newGiftEntries:snapshot._docs})
        })
    }

    render(){

        let searchBar = (
                <SearchBar
                placeholder="Search for gifts here..."
                onChangeText={(text) => {
                    this.setState({
                        search:text
                    })
                }}
                value={this.state.search}
                containerStyle={{backgroundColor:"#f1f3f4",borderTopColor:"#f1f3f4",borderBottomColor:"#f1f3f4",height:50}}
                inputStyle={{backgroundColor:"#f1f3f4"}}
                />
        )

        let savedGift = null;
        let sharedGift = null;
        let newGift = (
            <View key={Math.random().toString(36).substring(7)}>
                {
                    this.state.newGiftEntries && this.state.newGiftEntries.map(item => {
                        return (
                            <View key={Math.random().toString(36).substring(7)}>
                                <Card key={item.id}>
                                    <TouchableOpacity onPress={() => alert("hi")}>
                                        <CardItem cardBody>
                                            <Image source={{uri: item.data().imageUrl}} style={{height: 250, width: null, flex: 1}}/>
                                        </CardItem>
                                        <CardItem>
                                            <View style={{flexDirection:"column"}}>
                                                <Text style={{fontFamily:"Roboto-Bold",fontSize:20}}>{item.data().name}</Text>
                                                <Text>Price : RM {item.data().price}</Text>
                                                <Text>No. of views to claim this : {item.data().num_of_shares}</Text>
                                            </View>
                                        </CardItem>
                                    </TouchableOpacity>
                                </Card>
                            </View>
                        )
                    })
                }
            </View>
        );

        if(!this.state.currentPage){
            newGift = (
                <View key={Math.random().toString(36).substring(7)}>
                    {
                        this.state.newGiftEntries && this.state.newGiftEntries.map(item => {
                            return (
                                <View key={Math.random().toString(36).substring(7)}>
                                    <Card key={item.id}>
                                        <TouchableOpacity onPress={() => alert("hi")}>
                                            <CardItem cardBody>
                                                <Image source={{uri: item.data().imageUrl}} style={{height: 250, width: null, flex: 1}}/>
                                            </CardItem>
                                            <CardItem>
                                                <View style={{flexDirection:"column"}}>
                                                    <Text style={{fontFamily:"Roboto-Bold",fontSize:20}}>{item.data().name}</Text>
                                                    <Text>Price : RM {item.data().price}</Text>
                                                    <Text>No. of views to claim this : {item.data().num_of_shares}</Text>
                                                </View>
                                            </CardItem>
                                        </TouchableOpacity>
                                    </Card>
                                </View>
                            )
                        })
                    }
                </View>
            );

            savedGift = null;
            sharedGift = null;
        }

        if(!this.state.newGiftEntries){
            newGift = <Text>Loading...</Text>
        }

        if(this.state.currentPage == SAVED_GIFTS){
            savedGift = (
                <View key={Math.random().toString(36).substring(7)}>
                {
                    true && this.state.savedGiftEntries.map(() => {
                        return (
                            <View key={Math.random().toString(36).substring(7)}>
                                <Card>
                                    <CardItem>
                                    <Left>
                                        <Thumbnail source={{uri: 'https://images.unsplash.com/photo-1546629313-ea9c287a8b9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQ5MDU5fQ'}} />
                                        <Body>
                                        <Text>Saved</Text>
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
                    })
                }
            </View>
                
            )

            sharedGift = null;
            newGift = null;
        }

        if(this.state.currentPage == SHARED_GIFTS){
            sharedGift = (
                <View key={Math.random().toString(36).substring(7)} style={{width:"100%"}}>
                {
                    true && this.state.sharedGiftEntries.map(() => {
                        return (
                            <View key={Math.random().toString(36).substring(7)}>
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
                                </Card>
                            </View>
                        )
                    })
                }
            </View>
            )

            newGift = null;
            savedGift = null;
        }

        

        return(
            <SafeAreaView style={styles.height}>
            <View style={{height:"100%",paddingBottom:50,paddingTop:50}}>
                <View style={{position:"absolute",bottom:0}}>
                    <View style={{flexDirection:"row",flex:1}}>
                        <TouchableOpacity 
                        onPress={() => {
                            this.setState({
                                currentPage:SAVED_GIFTS
                            })
                        }}
                        style={[styles.tabs,this.state.currentPage == SAVED_GIFTS ? styles.bg : styles.bgnone]}>
                                <View style={styles.tabsView}>
                                    <Iconss name={"heart"} size={20} color={this.state.currentPage == SAVED_GIFTS ? "#fff":"#e42045"} />
                                    <Text style={[styles.tabsFont,this.state.currentPage == SAVED_GIFTS ? styles.fontColor : styles.fontColorGone]}>Saved</Text>
                                </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                        onPress={() => {
                            this.setState({
                                currentPage:null
                            })
                        }}
                        style={[styles.tabs,!this.state.currentPage ? styles.bg : styles.bgnone]}>
                                <View style={styles.tabsView}>
                                    <Iconss name={"list"} size={20} color={!this.state.currentPage ? "#fff":"#e42045"} />
                                    <Text style={[styles.tabsFont,!this.state.currentPage ? styles.fontColor : styles.fontColorGone]}>New</Text>
                                </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                currentPage:SHARED_GIFTS
                            })
                        }}
                        style={[styles.tabs,this.state.currentPage == SHARED_GIFTS ? styles.bg : styles.bgnone]}>
                                <View style={styles.tabsView}>
                                    <Iconss name={"tags"} size={20} color={this.state.currentPage == SHARED_GIFTS ? "#fff":"#e42045"} />
                                    <Text style={[styles.tabsFont,this.state.currentPage == SHARED_GIFTS ? styles.fontColor : styles.fontColorGone]}>Shared</Text>
                                </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{position:"absolute",top:0,width:"100%"}}>
                    {searchBar}
                </View>
                <ScrollView>
                    {newGift}
                    {savedGift}
                    {sharedGift}
                </ScrollView>
            </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    giftImage:{
        width:"100%",
        height: Dimensions.get("screen").height - 0.5 * Dimensions.get("screen").height
    },
    tabs:{
        height:50,
        width:Dimensions.get("screen").width/NUM_OF_TABS
    },
    tabsView:{
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        paddingLeft:10,
        height:"100%"
    },
    tabsFont:{
        fontFamily:"Roboto-Medium",
        fontSize:15,
        paddingLeft:5
    },
    height:{
        height:"100%"
    },
    bg:{
        backgroundColor:"#e42045"
    },
    bgnone:{
        backgroundColor:"#f1f3f4"
    },
    fontColor:{
        color:"#fff"
    },
    fontColorGone:{
        color:"#e42045"
    }
})

export default Home;