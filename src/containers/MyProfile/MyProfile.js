import React,{Component} from 'react';
import {View,Text,StyleSheet,SafeAreaView,Image,ScrollView,Dimensions,TouchableHighlight} from 'react-native';
import {Navigation} from 'react-native-navigation';
import firebase from 'react-native-firebase';
import {Button} from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import Loader from '../../components/Loader/Loader';
import {Card,CardItem,Left,Body,Right,Thumbnail,Segment,List,ListItem} from "native-base";
import ImagePicker from 'react-native-image-picker';
import DateTimePicker from 'react-native-modal-datetime-picker';

const options = {
    title: 'Select Avatar',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};

const db = firebase.firestore();

db.settings({timestampsInSnapshots:true})

const FBSDK = require('react-native-fbsdk');
const {
    GraphRequest,
    GraphRequestManager,
  } = FBSDK;

class MyProfile extends Component{

    state = {
        userData:null,
        editProfile:false,
        mailingAddressArray:[
            "houseNumber","street","area","town","posCode","state","country"
        ],
        mailingAddress:{
            houseNumber:{
                id:"houseNumber",
                value:"",
                label:"House No."
            },
            street:{
                id:"street",
                value:"",
                label:"Street"
            },
            area:{
                id:"area",
                value:"",
                label:"Area"
            },
            town:{
                id:"town",
                value:"",
                label:"Town"
            },
            posCode:{
                id:"posCode",
                value:"",
                label:"Poscode"
            },
            state:{
                id:"state",
                value:"",
                label:"State"
            },
            country:{
                id:"country",
                value:"",
                label:"Country"
            }
        },
        emailAddress:"",
        logInViaEmail:false,
        info:{name:false,location:false,imageUrl:false,birthday:false},
        isDateTimePickerVisible: false,

    }

    componentDidMount = () => {
        const {currentUser} = firebase.auth();
        if(currentUser.providerData[0].providerId == "facebook.com"){
            const responseInfoCallback = (error,result) => {
                if(result){
                    this.setState({
                        userData:result
                    })
                }else{
                    this.setState({
                        userData:null
                    })
                }
            }
            const infoRequest = new GraphRequest(
                '/me',
                {
                    parameters: {
                        fields: {
                            string: 'email, name, first_name, middle_name,last_name, picture.type(large), cover, birthday, location, friends'
                        }
                    }
                },
                responseInfoCallback
            )
            new GraphRequestManager().addRequest(infoRequest).start();
        }else{
            this.setState({
                logInViaEmail:true
            })
            db.collection("users").doc(currentUser.uid).get().then(snapshot => {
                this.setState({
                   info:{
                       name:snapshot.data().name,
                       location:snapshot.data().location,
                       imageUrl:snapshot.data().imageUrl,
                       birthday:snapshot.data().birthday,
                       email: snapshot.data().email
                   }  
                })
            })
        }

        db.collection("users").doc(currentUser.uid).get().then(snapshot => {
            console.log(snapshot.data())
            this.setState({
                emailAddress:snapshot.data().emailAddress,
                mailingAddress:{
                    houseNumber:{
                        id:"houseNumber",
                        value:snapshot.data().houseNumber,
                        label:"House No."
                    },
                    street:{
                        id:"street",
                        value:snapshot.data().street,
                        label:"Street"
                    },
                    area:{
                        id:"area",
                        value:snapshot.data().area,
                        label:"Area"
                    },
                    town:{
                        id:"town",
                        value:snapshot.data().town,
                        label:"Town"
                    },
                    posCode:{
                        id:"posCode",
                        value:snapshot.data().posCode,
                        label:"Poscode"
                    },
                    state:{
                        id:"state",
                        value:snapshot.data().state,
                        label:"State"
                    },
                    country:{
                        id:"country",
                        value:snapshot.data().country,
                        label:"Country"
                    }
                },
            })
        })
    }

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this); 
    }

    navigationButtonPressed({ buttonId }) {
        if(buttonId == "closeModal"){
            Navigation.dismissModal(this.props.componentId);
        }
    }

    updateValue = (field,text) => {
        const mailingAddressClone = this.state.mailingAddress;
        mailingAddressClone[field].value = text;
        this.setState({
            mailingAddress: mailingAddressClone
        })
    }

    updateProfile = () => {
        const {currentUser} = firebase.auth()
        const form = this.state.mailingAddress
        db.collection("users").doc(currentUser.uid).update({
                houseNumber:form.houseNumber.value,
                street:form.street.value,
                area:form.area.value,
                town:form.town.value,
                posCode:form.posCode.value,
                state:form.state.value,
                country:form.country.value,
                emailAddress:this.state.emailAddress
        }).then(() => {
            if(this.state.logInViaEmail){
                db.collection("users").doc(currentUser.uid).update({
                    birthday:this.state.info.birthday,
                    name:this.state.info.name,
                    location:this.state.info.location
                }).then(() => {
                    alert("Update Successful")
                })
            }else{
                alert("Update Successful")
            }
        })
    }

    updateInfo = (field,text) => {
        const info = this.state.info;
        this.state.info[field] = text;
        this.setState({
            info:info
        })
    }

    selectImage = () => {
        const { currentUser } = firebase.auth();
        const imageRef = firebase.storage().ref(`users/${currentUser.uid}`)
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);
          
            if (response.didCancel) {
              console.log('User cancelled image picker');
            } else if (response.error) {
              console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton);
            } else {
              const source = {uri:response.uri,path:response.path};
                imageRef.put(uri, { contentType: 'image/jpeg'})
                .then(() => {
                    return imageRef.getDownloadURL();
                })
                .then(url => {
                    const form = this.state.form
                    db.collection("users").doc(currentUser.uid).update({
                        imageUrl:url
                    })
                    .then(docRef => {
                        alert("Image uploaded!");
                        let info = this.state.info
                        this.state.info.imageUrl = url;
                        this.setState({
                            info:info
                        })
                    })
                    .catch(error => {
                        alert("Oops!Fail to upload image")
                    });
                })
                .catch(error => {
                console.log(error);
                alert("Oops!Fail to upload the image!")
                })
            }
          });
    }

    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

    _handleDatePicked = (date) => {
        this.updateInfo("birthday",`${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`);
    };

    render(){
        
        //Data
        const user = this.state.userData
        const {currentUser} = firebase.auth();
        let view = (
            <View style={{height:Dimensions.get("screen").height - 100}}>
                <Loader />
            </View>
        )
        let image = (
            <TouchableHighlight onPress={() => this.selectImage()}>
                <View style={{width:200,height:200,backgroundColor:"#e42045",alignItems:"center",justifyContent:"center"}}>
                    <Text style={{fontFamily:"Roboto-Medium",color:"#fff"}}>Click to upload profile photo</Text>
                </View>
            </TouchableHighlight>
        )

        let update = null;

        if(this.state.logInViaEmail){
            update = (
                <View>
                    <TextField
                        label={"Name"}
                        value={this.state.info.name ? this.state.info.name : ""}
                        onChangeText={ text => this.updateInfo("name",text) }
                        labelFontSize={20}
                    />
                    <TextField
                        label={"Home Town"}
                        value={this.state.info.location ? this.state.info.location : ""}
                        onChangeText={ text => this.updateInfo("location",text) }
                        labelFontSize={20}
                    />
                    <Button title="Update birthday" onPress={this._showDateTimePicker}/>
                    <DateTimePicker
                    isVisible={this.state.isDateTimePickerVisible}
                    onConfirm={this._handleDatePicked}
                    onCancel={this._hideDateTimePicker}
                    />
                </View>
            )
        }

        //IFF 
        if(this.state.userData || this.state.logInViaEmail){
            let editProfile = null;
            if(this.state.editProfile){
                editProfile = (
                    <View>
                        <List>
                            <ListItem itemDivider>
                                <Text style={{fontFamily:"Roboto-Medium",fontSize:16}}>Email Address:</Text>
                            </ListItem>
                            <TextField
                                label={"Email Address"}
                                value={this.state.logInViaEmail ? this.state.info.email : this.state.emailAddress}
                                onChangeText={ text => this.setState({emailAddress:text}) }
                                labelFontSize={20}
                                editable={!this.state.logInViaEmail}
                            />
                            {update}
                            <ListItem itemDivider>
                                <Text style={{fontFamily:"Roboto-Medium",fontSize:16}}>Delivery Address:</Text>
                            </ListItem>
                        
                        {this.state.mailingAddressArray.map((comp,index) => {
                            return(
                                <View key={index}>
                                    <TextField
                                    label={this.state.mailingAddress[comp].label}
                                    value={this.state.mailingAddress[comp].value}
                                    onChangeText={ text => this.updateValue(comp,text) }
                                    labelFontSize={20}
                                    />
                                </View>
                            )
                        })}
                        </List>
                    </View>
                )
            }

            if(!this.state.logInViaEmail || this.state.info.photoUrl){
                image = <Image source={{uri: !this.state.logInViaEmail ? `https://graph.facebook.com/${user.id}/picture?type=large` : this.state.info.photoUrl}}
                style={{width:200, height: 200,borderRadius: 100}} />
            }
            view = (
                <View style={{padding:10}}>
                    <View style={{justifyContent:"center",alignItems:"center"}}>
                        <View style={{paddingBottom:10}}>
                            {image}
                        </View>
                        <Text style={styles.text}>Name : {user ? user.name : this.state.info.name ? this.state.info.name : "----------"}</Text>
                        <Text style={styles.text}>Birthday : {user ? user.birthday : this.state.info.birthday ? this.state.info.birthday:"---/---/---"}</Text>
                        <Text style={styles.text}>Hometown : {user ? user.location.name : this.state.info.location ? this.state.info.location : "----------"}</Text>
                    </View>
                    <View style={{paddingTop:20}}>
                    {!this.state.editProfile && <Button buttonStyle={{backgroundColor:"#e42045"}} color="#fff" title="Update my profile info" onPress={() => this.setState({
                        editProfile:true
                    })}/>}
                    </View>
                    <View style={{alignItems:"center",justifyContent:"center",paddingBottom:10}}>
                        <View style={{width:"95%"}}>
                            {editProfile}
                        </View>
                        <View style={{paddingTop:10,paddingBottom:10}}>
                            {this.state.editProfile && <Button buttonStyle={{backgroundColor:"#e42045"}} color="#fff" title="Update my profile info" onPress={() => 
                                this.updateProfile()
                            }/>}
                        </View>
                    </View>
                </View>
            )
        }


        return (
            <SafeAreaView style={{height:"100%"}}>
                <ScrollView style={{height:"100%"}}>
                    <View style={{height:"100%"}}>
                        {view}
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    text:{
        fontSize:16,
        padding:5,
        fontFamily:"Roboto-Medium"
    }
})

export default MyProfile;