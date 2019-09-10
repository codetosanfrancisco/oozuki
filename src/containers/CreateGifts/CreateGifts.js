import React,{Component} from 'react';
import {Text,View,StyleSheet,SafeAreaView,Image,ScrollView,TouchableOpacity,Dimensions,Modal} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import {Navigation} from 'react-native-navigation';
import { TextField } from 'react-native-material-textfield';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Button} from 'react-native-elements';
import {Card,CardItem,Left,Body,Right,Thumbnail,Segment} from "native-base";
import SavedGifts from '../../assets/images/savedGifts.jpg';
import firebase from 'react-native-firebase';
import Loader from '../../components/Loader/Loader';
import MdalCreatedGifts from '../ModalCreatedGifts/ModalCreatedGifts';
import ModalCreatedGifts from '../ModalCreatedGifts/ModalCreatedGifts';
import { RNPhotoEditor } from 'react-native-photo-editor'

//***Firestore Real-time Database***//
let db = firebase.firestore()

db.settings({timestampsInSnapshots: true})

//Image Picker//
const options = {
    title: 'Select Avatar',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};

const CANNOT_BE_NULL = "CANNOT_BE_NULL";
const MUST_BE_NUMBER = "MUST_BE_NUMBER";
const MUST_BE_LESS_THAN_100 = "MUST_BE_LESS_THAN_100"
const MUST_BE_LESS_THAN_30 = "MUST_BE_LESS_THAN_30"
const MUST_BE_LESS_THAN_50 = "MUST_BE_LESS_THAN_50"
const NUM_OF_TABS = 2;
const CREATE_GIFTS = "CREATE_GIFTS";
const CREATED_GIFTS = "CREATED_GIFTS";

class CreateGifts extends Component{

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this); // <== Will be automatically unregistered when unmounted
        this.state = {
            currentPage:CREATE_GIFTS,
            form:{
                name:{
                    value:"",
                    valid:false,
                    check:{CANNOT_BE_NULL:true,MUST_BE_LESS_THAN_50:true}
                },
                image:{
                    value:null,
                    valid:false,
                    check:{MUST_PRESENT:true}
                },
                description:{
                    value:"",
                    valid:false,
                    check:{CANNOT_BE_NULL:true,MUST_BE_LESS_THAN_50:true}
                },
                brand:{
                    value:"",
                    valid:false,
                    check:{CANNOT_BE_NULL:true,MUST_BE_LESS_THAN_30:true}
                },
                price:{
                    value:"",
                    valid:false,
                    check:{CANNOT_BE_NULL:true,MUST_BE_NUMBER:true}
                },
                num_of_shares:{
                    value:"",
                    valid:false,
                    check:{CANNOT_BE_NULL:true,MUST_BE_NUMBER:true}
                },
                offers:{
                    value:"",
                    valid:false,
                    check:{MUST_BE_LESS_THAN_100:true}
                },
                num_available:{
                    value:"",
                    valid:false,
                    check:{MUST_BE_NUMBER:true}
                }
            },
            formValid:false,
            image:null,
            loading:false,
            createdGifts:null,
            modalCreatedGiftsVisible:false,
            item:null
        }
    }

    uploadImage = (uri, mime = 'image/jpeg') => {
          const { currentUser } = firebase.auth();
          const imageRef = firebase.storage().ref(`giftImages/${currentUser.uid}`)
           imageRef.put(uri, { contentType: mime})
            .then(() => {
              return imageRef.getDownloadURL();
            })
            .then(url => {
              const form = this.state.form
                db.collection("gifts").add({
                    createdBy:firebase.auth().currentUser.uid,
                    description: form.description.value,
                    price:form.price.value,
                    brand:form.brand.value,
                    num_of_shares:form.num_of_shares.value,
                    offers:form.offers.value,
                    imageUrl:url,
                    name: form.name.value,
                    num_available: form.num_available.value
                })
                .then(docRef => {
                    this.setState({
                        loading:false
                    })
                    alert("The gift is created!Appreciate it!")
                    Navigation.dismissModal(this.props.componentId)
                })
                .catch(error => {
                    this.setState({
                        loading:false
                    })
                    alert("Oops!Fail to create the gift!")
                });
            })
            .catch(error => {
              console.log(error);
              this.setState({
                  loading:false
              })
              alert("Oops!Fail to create the gift!")
          })
      }

    navigationButtonPressed({ buttonId }) {
        if(buttonId == "closeModal"){
            Navigation.dismissModal(this.props.componentId);
        }
    }

    selectImage = () => {
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
              RNPhotoEditor.Edit({
                path: source.path,
                onDone:() => {
                    this.updateContent("image",source)
                },
                onCancel:() => {
                    this.updateContent("image",source)
                }
              });
            }
          });
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

    submitForm = () => {
        this.setState({
            loading:true
        })
        this.uploadImage(this.state.form.image.value.uri,"image/jpeg")
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

            if(this.state.form[attr].check.MUST_BE_NUMBER){
                if(/^[0-9]*$/.test(this.state.form[attr].value)){
                    valid = true && valid
                    console.log("It is a number")
                }else{
                    valid = false
                }
            }

            if(this.state.form[attr].check.MUST_BE_LESS_THAN_100){
                if(this.state.form[attr].value.length <= 100 ){
                    valid = true && valid
                }else{
                    valid = false
                }
            }
            
            if(this.state.form[attr].check.MUST_BE_LESS_THAN_30){
                if(this.state.form[attr].value.length <= 30 ){
                    valid = true && valid
                }else{
                    valid = false
                }
            } 

            if(this.state.form[attr].check.MUST_BE_LESS_THAN_50){
                if(this.state.form[attr].value.length <= 50 && valid){
                    valid = true && valid
                }else{
                    valid = false
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
            if(prop == CANNOT_BE_NULL){
                string = "Cannot be empty\n"
            }

            if(prop == MUST_BE_LESS_THAN_100){
                string += "Must be less than 100 characters\n"
            }

            if(prop == MUST_BE_LESS_THAN_30){
                string += "Must be less than 30 characters\n"
            }

            if(prop == MUST_BE_LESS_THAN_50){
                string += "Must be less than 50 characters\n"
            }

            if(prop == MUST_BE_NUMBER){
                string += "Must be a number\n"
            }
        }

        if(!this.state.form[attr].valid){
            return string;
        }else{
            return null;
        }
    }

    loadCreatedGifts = () => {
        const { currentUser } = firebase.auth();

        db.collection("gifts").where("createdBy","==",`${currentUser.uid}`).get().then(querySnapshot => {
            if(querySnapshot._docs.length > 0){
                this.setState({
                    createdGifts:querySnapshot._docs
                })  
            }
            console.log(querySnapshot._docs)
        });
    }

    componentDidMount(){
        this.loadCreatedGifts()
    }

    showOneCreatedGift = id => {
        this.setState({
            modalCreatedGiftsVisible:true
        })
        db.collection("gifts").doc(id).get().then(item => {
            this.setState({
                item:item
            })
        })
    }

    render(){
        let image = (
                <View style={styles.image}>
                    <Icon name="image" size={30} color="#fff" />
                    <Text style={{color:"white"}}>No image uploaded.</Text>
                </View>
        )

        if(this.state.form.image.value){
            image = (
                <Image style={{width:200,height:200}} source={this.state.form.image.value}/>
            )
        }

        let view = (
            <View>
            <Modal
                onRequestClose={() => alert("The modal is closed!")}
                animationType="slide"
                transparent={false}
                visible={this.state.loading}
                >
                <Loader />
            </Modal>
            <View style={{width:"100%",justifyContent:"center",alignItems:"center",margin:10}}>
                    {image}
                </View>
                <Button title="Upload an image" buttonStyle={{backgroundColor:"#e42045"}} onPress={() => this.selectImage()}/>
                <View style={{padding:10}}>
                    <TextField
                        label='Name of gift'
                        value={this.state.form.name.value}
                        onChangeText={ (text) => this.updateContent("name",text) }
                        multiline
                        labelFontSize={20}
                    />
                    <Text>{this.isValid("name")}</Text>
                    <TextField
                        label='Description'
                        value={this.state.form.description.value}
                        onChangeText={ (text) => this.updateContent("description",text) }
                        multiline
                        labelFontSize={20}
                    />
                    <Text>{this.isValid("description")}</Text>
                    <TextField
                        label='Brand'
                        value={this.state.form.brand.value}
                        onChangeText={ (text) => this.updateContent("brand",text) }
                        labelFontSize={20}
                    />
                    <Text>{this.isValid("brand")}</Text>
                    <TextField
                        label='Price (RM)'
                        value={this.state.form.price.value}
                        onChangeText={ (text) => this.updateContent("price",text) }
                        labelFontSize={20}
                    />
                    <Text>{this.isValid("price")}</Text>
                    <TextField
                        label='No. of shares to claim this'
                        value={this.state.form.num_of_shares.value}
                        onChangeText={ (text) => this.updateContent("num_of_shares",text) }
                        labelFontSize={20}
                    />
                    <Text>{this.isValid("num_of_shares")}</Text>
                    <TextField
                        label='No. of gifts available'
                        value={this.state.form.num_available.value}
                        onChangeText={ (text) => this.updateContent("num_available",text) }
                        multiline
                        labelFontSize={20}
                    />
                    <Text>{this.isValid("num_available")}</Text>
                    <TextField
                        label='Offers'
                        value={this.state.form.offers.value}
                        onChangeText={ (text) => this.updateContent("offers",text) }
                        labelFontSize={20}
                        multiline
                    />
                    <Text>{this.isValid("offers")}</Text>
                </View>
                <Button disabled={!this.state.formValid} title="Submit" buttonStyle={{backgroundColor:"#e42045"}} onPress={() => this.submitForm()}/>
            </View>
        )

        if(this.state.currentPage == CREATED_GIFTS){
            let items = <Text>Np gifts created.</Text>
            if(this.state.createdGifts){
                items = this.state.createdGifts.map(item => {
                    return (
                        <Card key={item.id}>
                            <TouchableOpacity onPress={() => this.showOneCreatedGift(item.id)}>
                                <CardItem cardBody>
                                    <Image source={{uri: item.data().imageUrl}} style={styles.cardImage}/>
                                </CardItem>
                                <CardItem>
                                    <View style={styles.column}>
                                        <Text style={styles.font20}>{item.data().name}</Text>
                                        <Text>Price : RM {item.data().price}</Text>
                                        <Text>No. of views to claim this : {item.data().num_of_shares}</Text>
                                    </View>
                                </CardItem>
                            </TouchableOpacity>
                        </Card>
                    )
                })
            }

            item = <Text>Loading....</Text>
            if(this.state.item){
                item = (
                    <View style={{justifyContent:"center",flex:1,height:Dimensions.get("screen").height,backgroundColor:"#fff"}}>
                        <Card key={this.state.item.id}>
                            <CardItem cardBody>
                                <Image source={{uri: this.state.item.data().imageUrl}} style={{height: 250, width: null, flex: 1}}/>
                            </CardItem>
                            <CardItem>
                                <View style={{flexDirection:"column"}}>
                                    <Text style={{fontFamily:"Roboto-Bold",fontSize:20}}>{this.state.item.data().name}</Text>
                                    <Text style={{fontFamily:"Roboto-Medium",fontSize:15}}>Price : RM {this.state.item.data().price}</Text>
                                    <Text style={{fontFamily:"Roboto-Medium",fontSize:15}}>No. of views to claim this : {this.state.item.data().num_of_shares}</Text>
                                    <Text style={{fontFamily:"Roboto-Medium",fontSize:15}}>Brand: {this.state.item.data().brand}</Text>
                                    <Text style={{fontFamily:"Roboto-Medium",fontSize:15}}>Description : {this.state.item.data().description}</Text>
                                    <Text style={{fontFamily:"Roboto-Medium",fontSize:15}}>No. of gifts available : {this.state.item.data().num_available}</Text>
                                    <Text style={{fontFamily:"Roboto-Medium",fontSize:15}}>Offers : {this.state.item.data().offers ? this.state.item.data().offers : "---"}</Text>
                                </View>
                            </CardItem>
                        </Card>
                        <View style={{padding:5}}>
                                <Button title="Edit this gift" onPress={() => this.props.closeModal()} buttonStyle={{backgroundColor:"#e42045",margin:2}} fontFamily="Roboto-Medium" fontSize={15} color="#fff"/>
                                <Button title="Delete this gift" onPress={() => this.props.closeModal()} buttonStyle={{backgroundColor:"#e42045",margin:2}} fontFamily="Roboto-Medium" color="#fff"/>
                                <Button title="Close" onPress={() => this.setState({modalCreatedGiftsVisible:false})} buttonStyle={{backgroundColor:"#e42045",margin:2}} fontFamily="Roboto-Medium" color="#fff"/>
                        </View>
                    </View>
                )
            }
            view = (
                <View style={{height:"100%"}}>
                {
                    items   
                }
                <ModalCreatedGifts visible={this.state.modalCreatedGiftsVisible} closeModal={() => this.setState({
                    modalCreatedGiftsVisible:false
                })}>
                {
                   item
                }
                </ModalCreatedGifts>
                </View>
            )
        }





        return(
            <SafeAreaView style={{width:"100%"}}>
            <View style={{paddingBottom:50}}>
                <ScrollView style={{height:"100%"}}>
                    {view}
                </ScrollView>
                <View style={{position:"absolute",bottom:0}}>
                    <View style={{flexDirection:"row",flex:1}}>
                        <TouchableOpacity 
                        onPress={() => {
                            this.setState({
                                currentPage:CREATE_GIFTS
                            })
                        }}
                        style={[styles.tabs,this.state.currentPage == CREATE_GIFTS ? styles.bg : styles.bgnone]}>
                                <View style={styles.tabsView}>
                                    <Icon name={"heart"} size={20} color={this.state.currentPage == CREATE_GIFTS ? "#fff":"#e42045"} />
                                    <Text style={[styles.tabsFont,this.state.currentPage == CREATE_GIFTS ? styles.fontColor : styles.fontColorGone]}>Create Gift</Text>
                                </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                        onPress={() => {
                            this.setState({
                                currentPage:CREATED_GIFTS
                            })
                        }}
                        style={[styles.tabs,this.state.currentPage == CREATED_GIFTS ? styles.bg : styles.bgnone]}>
                                <View style={styles.tabsView}>
                                    <Icon name={"list"} size={20} color={this.state.currentPage == CREATED_GIFTS ? "#fff":"#e42045"} />
                                    <Text style={[styles.tabsFont,this.state.currentPage == CREATED_GIFTS? styles.fontColor : styles.fontColorGone]}>Created Gift</Text>
                                </View>
                        </TouchableOpacity>
                    </View>
                </View>
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
    },
    image:{
        width:200,
        height:200,
        alignItems:"center",
        justifyContent:"center",
        flexDirection:"row",
        backgroundColor:"#e42045"
    },
    column:{
        flexDirection:"column"
    },
    font20:{
        fontFamily:"Roboto-Bold",
        fontSize:20
    },
    cardImage:{
        height: 250, 
        width: null, 
        flex: 1
    }
})

export default CreateGifts;