import React,{Component} from 'react';
import {Text,View,StyleSheet,SafeAreaView,Modal,Dimensions} from 'react-native';
import {SocialIcon, Icon,Button} from 'react-native-elements';
import firebase from 'react-native-firebase'
import {LoginManager,AccessToken} from 'react-native-fbsdk';
import { DoubleBounce} from 'react-native-loader';
import {Navigation} from 'react-native-navigation';
import {setNewStackAfterLogin} from '../../stack/setStackFunctions/setStackFunctions';
import Icons from 'react-native-vector-icons/MaterialIcons'
import NoInternet from '../NoInternet/NoInternet';
import { TextField } from 'react-native-material-textfield';
import ImagePicker from 'react-native-image-picker';
import {AsyncStorage} from 'react-native';

const color = "#e42045";

const FBSDK = require('react-native-fbsdk');

const {
    GraphRequest,
    GraphRequestManager,
  } = FBSDK;

let db = firebase.firestore()

db.settings({timestampsInSnapshots:true})

const CANNOT_BE_NULL = "CANNOT_BE_NULL";
const MUST_BE_NUMBER = "MUST_BE_NUMBER";
const MUST_BE_MORE_THAN_6 = "MUST_BE_MORE_THAN_6"
const MUST_BE_EMAIl = "MUST_BE_EMAIL"
const MUST_PRESENT = "MUST_PRESENT"

const options = {
    title: 'Select Avatar',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};

let config  = {
    apiKey: "AIzaSyA9mx1j5rpQwu4K2heJyGSst0VBZJ_NJhQ",
    authDomain: "oozuki-4e22d.firebaseapp.com",
    databaseURL: "https://oozuki-4e22d.firebaseio.com",
    projectId: "oozuki-4e22d",
    storageBucket: "oozuki-4e22d.appspot.com",
    messagingSenderId: "955440711075"
  }
  
firebase.initializeApp(config);

class Login extends Component{

    constructor(props){
        super(props);
        this.state = {
            loggingIn:true,
            noInternet:false,
            logInWithEmail:false,
            form:{
                email:{
                    value:"",
                    valid:false,
                    check:{CANNOT_BE_NULL:true,MUST_BE_EMAIL:true}
                },
                password:{
                    value:"",
                    valid:false,
                    check:{CANNOT_BE_NULL:true,MUST_BE_MORE_THAN_6:true}
                }
            },
            signUp:false,
            formValid:false
        }
    }

    componentWillMount = () => {
        const {currentUser} = firebase.auth();
        console.log(currentUser)
        if(currentUser){
            if(currentUser.providerData[0].providerId == "facebook.com"){
                AccessToken.getCurrentAccessToken().then(data => {
                    const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
                    firebase.auth().signInWithCredential(credential).then(data => {
                        setNewStackAfterLogin();
                        this.setState({
                            loggingIn:false
                        })
                        alert("Log in successful!");
                    }).catch(error => {
                        if(error.code == "auth/network-request-failed"){
                            this.setState({
                                noInternet:true
                            })
                        }
                        this.setState({
                            loggingIn:false
                        })
                    })
                }).catch(err => {
                    this.setState({
                        loggingIn:false
                    })
                })
            }else{
                AsyncStorage.getItem("@user:password")
                .then(value => {
                    if(value != null && currentUser){
                        firebase.auth().signInWithEmailAndPassword(currentUser.email,value)
                        .then(() => {
                            setNewStackAfterLogin();
                            this.setState({loggingIn:false})
                            alert("Login Successful!");
                        })
                        .catch((error) => {
                            var errorMessage = error.message;
                            this.setState({loggingIn:false})
                            alert(error.message)
                        });
                    }else{
                        this.setState({
                            loggingIn:false
                        })
                    }
                })
                .catch(() => {
                    this.setState({
                        loggingIn:false
                    })
                })
            }
        }else{
            this.setState({
                loggingIn:false
            })
        }
        
        
    }

    logInViaFacebook = () => {
        this.setState({
            loggingIn:true
        })
        LoginManager.logInWithReadPermissions(["public_profile","user_friends","user_birthday","email","user_location"]).then(
          data => {
            AccessToken.getCurrentAccessToken().then(data => {
                const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
                firebase.auth().signInWithCredential(credential).then(data => {
                    let location,birthday;
                    const responseInfoCallback = (error,result) => {
                        if(result){
                            location = result.location.name;
                            birthday = result.birthday
                        }else{
                            console.log(error)
                        }
                    }
                    const infoRequest = new GraphRequest(
                        '/me',
                        {
                            parameters: {
                                fields: {
                                    string: 'location,birthday,email'
                                }
                            }
                        },
                        responseInfoCallback
                    )
                    new GraphRequestManager().addRequest(infoRequest).start();
                    const {currentUser} = firebase.auth()
                    console.log(currentUser)
                    db.collection("users").where("uid","==",currentUser.uid).get().then(user => {
                        if(user._docs.length == 0){
                            db.collection("users").doc(currentUser.uid).set({
                                name: currentUser.displayName,
                                uid: currentUser.uid,
                                imageUrl: `${currentUser.photoURL}?type=large`,
                                location: location,
                                birthday: birthday,
                                facebookUid: currentUser.providerData[0].uid,
                                provider:"facebook",
                                sentFriendReq:[],
                                receivedFriendReq:[],
                                friends:[]
                            }).then(() => {
                                setNewStackAfterLogin();
                                this.setState({
                                    loggingIn:false
                                })
                            })
                        }else{
                            setNewStackAfterLogin();
                            this.setState({
                                loggingIn:false
                            })
                        }
                    })
                }).catch(() => {
                this.setState({
                    loggingIn:false
                })
              })
            }).catch(err => {
                this.setState({
                    loggingIn:false
                })
            }) 
          },
          error =>{
            console.log("Login fail with error: " + error);
            this.setState({
                loggingIn:false,
                noInternet:true
            })
          }
      );
    }

    updateContent = (attr,val) => {
        const newForm = this.state.form;
        newForm[attr].value = val;
        this.setState({
            form:newForm
        })

        this.validateForm();

        this.checkForm();
    }

    validateForm = () => {
        let valid = true;
        const formClone = this.state.form;
        for (var attr in this.state.form) {
            if(this.state.form[attr].check.CANNOT_BE_NULL){
                if(this.state.form[attr].value.replace(/\s+/g,'').length > 0){
                    valid = true && valid
                }else{
                    valid = false
                }
            }  
            
            if(this.state.form[attr].check.MUST_PRESENT){
                if(this.state.form[attr].value != null){
                    valid = true && valid
                }else{
                    valid = false;
                }
            }  

            if(this.state.form[attr].check.MUST_BE_MORE_THAN_6){
                if(this.state.form[attr].value.length > 6){
                    valid = true && valid
                }else{
                    valid = false;
                }
            }

            if(this.state.form[attr].check.MUST_BE_NUMBER){
                if(/^[0-9]*$/.test(this.state.form[attr].value)){
                    valid = true && valid
                    console.log("It is a number")
                }else{
                    valid = false
                }
            }
            
            if(this.state.form[attr].check.MUST_BE_EMAIL){
                if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.form[attr].value)){
                    valid = true && valid;
                }else{
                    valid = false;
                }
            }

            formClone[attr].valid = valid;

            console.log(attr,valid)

            this.setState({
                form:formClone
            })

            valid = true;

        }
    }

    checkForm = () => {
        let formValid = true;
        for (var attr in this.state.form) {
            if(!this.state.signUp && attr == "profilePic"){
                break;
            }
            formValid = this.state.form[attr].valid && formValid
        }

        if(formValid){
            this.setState({
                formValid:true
            })
        }else{
            this.setState({
                formValid:false
            })
        }
    }

    isValid = (attr) => {
        let string = "";
        for(let prop in this.state.form[attr].check){
            console.log(prop)
            if(prop == CANNOT_BE_NULL){
                string += "Cannot be empty\n"
            }

            if(prop == MUST_BE_EMAIl){
                string += "Must be a valid email\n"
            }

            if(prop == MUST_BE_NUMBER){
                string += "Must be a number\n"
            }

            if(prop == MUST_BE_MORE_THAN_6){
                string += "Must more than 6 character\n"
            }
            
        }

        if(!this.state.form[attr].valid){
            return string;
        }else{
            return null;
        }
    }

    logIn = () => {
        this.setState({
            loggingIn:true
        })
        firebase.auth().signInWithEmailAndPassword(this.state.form.email.value,this.state.form.password.value)
        .then(() => {
            AsyncStorage.setItem("@user:password",this.state.form.password.value)
            setNewStackAfterLogin();
            this.setState({loggingIn:false})
            alert("Login Successful!");
        })
        .catch((error) => {
            var errorMessage = error.message;
            this.setState({loggingIn:false})
            alert(error.message)
        });
    }

    signUp = () => {
        this.setState({
            loggingIn:true
        })
        firebase.auth().createUserWithEmailAndPassword(this.state.form.email.value,this.state.form.password.value)
        .then(() => {
            AsyncStorage.setItem("@user:password",this.state.form.password.value)
            const {currentUser} = firebase.auth();
            db.collection("users").doc(currentUser.uid).set({
                email:this.state.form.email.value,
                provider:"password"
            }).then(() => {
                setNewStackAfterLogin();
                this.setState({loggingIn:false})
                alert("Login Successful!");
            })
        })
        .catch(error => {
            var errorMessage = error.message;
            this.setState({loggingIn:false})
            alert(error.message)
        })
    }

    render(){
        let loginView = (
            <View>
                <Button onPress={() => this.setState({logInWithEmail:true})} title="Log in with email" buttonStyle={{backgroundColor:color}} color="#fff" fontFamily="Roboto-Medium"/>
                <SocialIcon
                title='Sign In With Facebook'
                button
                type='facebook'
                onPress={() => {
                    this.logInViaFacebook();
                    }}/>
            </View>
        )

        let noInternet = null;

        if(this.state.loggingIn){
            loginView = (
                <View>
                    <Modal
                    onRequestClose={() => alert("The modal is closed!")}
                    animationType="slide"
                    transparent={false}
                    visible={this.state.loggingIn}
                    >
                        <View style={styles.loginView}>
                            <DoubleBounce size={50} color="#fff" />
                        </View>
                    </Modal>
                </View>
            )
        }

        let signUp = (
            <View style={{width:"90%"}}>
                <TextField
                        label='Email'
                        value={this.state.form.email.value}
                        onChangeText={ (text) => this.updateContent("email",text) }
                        multiline
                        labelFontSize={20}
                        baseColor={"#fff"}
                        tintColor={"#fff"}
                        textColor={"#fff"}
                    />
                <Text style={{color:"#fff",fontFamily:"Roboto-Medium"}}>{this.isValid("email")}</Text>
                <TextField
                    label='Password'
                    value={this.state.form.password.value}
                    onChangeText={ (text) => this.updateContent("password",text) }
                    multiline
                    labelFontSize={20}
                    secureTextEntry
                    baseColor={"#fff"}
                    tintColor={"#fff"}
                    textColor={"#fff"}
                />
                <Text style={{color:"#fff",fontFamily:"Roboto-Medium"}}>{this.isValid("password")}</Text>
                <Button buttonStyle={{backgroundColor:"#fff",marginBottom:5}} color={"#e42045"} fontFamily={"Roboto-Medium"} disabled={!this.state.formValid} title="Sign Up" onPress={() => {
                    this.signUp()
                }} />
                <Button buttonStyle={{backgroundColor:"#fff",marginBottom:5}} color={"#e42045"} fontFamily={"Roboto-Medium"} title="Log In" disabled={!this.state.formValid} onPress={() => this.logIn()}/>
                <Button buttonStyle={{backgroundColor:"#fff",marginBottom:5}} color={"#e42045"} fontFamily={"Roboto-Medium"} title="Back" onPress={() => this.setState({logInWithEmail:false})}/>
            </View>
        )
            

        let logInWithEmail = (
            <Modal
            onRequestClose={() => alert("The modal is closed!")}
            animationType="slide"
            transparent={false}
            visible={this.state.logInWithEmail}
            >   
            <View style={{backgroundColor:"#e42045",height:"100%",justifyContent:"center",alignItems:"center"}}>
                {signUp}
            </View>
            </Modal>
        )

        if(this.state.noInternet){
            noInternet = <NoInternet />
        }

        return(
           <SafeAreaView>
               <View>
                    {loginView}
               </View>
               <View>
                   {noInternet}
               </View>
               <View>
                   {logInWithEmail}
               </View>
           </SafeAreaView> 
        )
    }
}

const styles = StyleSheet.create({
    loginView:{
        justifyContent:"center",
        alignItems:"center",
        height:"100%",
        backgroundColor:"#e42045"
    }
})

export default Login;


