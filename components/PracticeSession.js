import React, { useRef, useContext, useState, useEffect } from 'react'
import { Video } from 'expo-av'
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, TextInput, Keyboard, TouchableWithoutFeedback, ActionSheetIOS, Pressable, Alert, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import {PracticeSessions} from '../PracticeSessions';
import { Entypo } from '@expo/vector-icons'; 
import { Camera } from 'expo-camera';
import useTheme from '../myThemes/useTheme';
import useThemedStyles from '../myThemes/useThemedStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import { SetLists } from '../SetLists';
import { UpdatePState } from '../UpdatePState';


const PracticeSession = ({navigation, route}) =>{
    const theme = useTheme();
    const style = useThemedStyles(styles);
    const data = route.params.data
    const video = useRef(null)
    const [status, setStatus] = React.useState({});
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [camera, setCamera] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [recording, setRecording] = useState(false);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September','October', 'November', 'December']
    const [makeEditable,setMakeEditable] = useState(false)
    const {setLists, setMySetList} = useContext(SetLists)
    const {practiceSessions, setPracticeSessions} = useContext(PracticeSessions);
    const {updatePState, setUpdatePState} = useContext(UpdatePState)
    const [quality, setQuality] = useState(data.quality)
    const [practiceTime, setPracticeTime] = useState(data.practiceTime)
    const [notes, setNotes] = useState(data.notes)
    const [videoUri, setVideoUri] = useState(data.videoUri)

    const [dropDownOpen, setDropDownOpen] = useState(false)
    const [dropDownItems, setDropDownItems] = useState([
      ]);
    const [practiceSong, setPracticeSong] = useState(data.practiceSong);
    function createTheDropDownList(){
        var newDropDown = []
        if(setLists != null){
            for(var i =0; i < setLists.length; i ++){
                if(setLists[i].songName != null){
                    newDropDown.push({
                        label : setLists[i].songName,
                        value: setLists[i].songName
                    })
                }
            }
            setDropDownItems(newDropDown)
        }
    }
    function deleteDateFromPracticeSessions(){
        const tempArray = (practiceSessions => practiceSessions.filter((el) => el.date !== data.date))
        setPracticeSessions(tempArray)
    }
    const editOrDelete = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Edit", "Delete"],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light'
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex === 2) {
          deleteDateFromPracticeSessions()
          navigation.navigate('Home')
        } else if (buttonIndex === 1) {
          setMakeEditable(true)
        }
      }
    );
    function checkInputsAreCorrect(){
        if(practiceTime != null &&  Number.isInteger(Number(practiceTime)) && Number(practiceTime) > 0 && Number(practiceTime) < 1000){
            if( quality != null && Number.isInteger(Number(quality)) && Number(quality) > 0 && Number(quality) < 11){
                return true
            }else{
              Alert.alert("Quality of session required", "Enter a number 1 - 10", [{
                  text : "OK"
              }]) 
              return false
            }
        }else{
            Alert.alert("Practice time required", "Enter a time 1 - 500", [{
                text : "OK"
            }])
            return false
        }
    }
    async function updatePracticeSession(){
        if(checkInputsAreCorrect() == true){
            var tempArray = practiceSessions;
            for(var i = 0; i < tempArray.length; i++){
                if(tempArray[i].date == data.date){
                    tempArray[i].notes = notes
                    tempArray[i].practiceTime = practiceTime
                    tempArray[i].quality = quality
                    tempArray[i].videoUri = videoUri
                    if(practiceSong != null){
                        tempArray[i].practiceSong = practiceSong
                    }
                }
            }
            setUpdatePState(Math.round(Math.random() * 1000000))
            setPracticeSessions(tempArray)
            await AsyncStorage.setItem('practiceSessions', JSON.stringify(tempArray));
            navigation.navigate('Main', {update:"true"})
        }
    }
    function deleteVideoUri(){
        setVideoUri(null);
    }
    async function askForCameraPermission(){
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');

    }
    const startRecord = async () => {
        console.log("clicked")
        console.log(recording);
        if(camera){
            if(!recording){
                setRecording(true)
                let video = await camera.recordAsync()
                setVideoUri(video.uri)
                console.log("This is the video uri")
                console.log(video.uri)
            }
            else{
                setRecording(false);
                await camera.stopRecording();
                setCameraVisible(false);
            }
        }
        else{
            setRecording(false)
        }
    }
    useEffect(() => {
        createTheDropDownList()
    }, [])
    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss()}}>
            <View style={style.practiceContainer}>
                <View style={{width:"100%", flexDirection: "row", paddingLeft:15, paddingRight:15 }} >
                    <View style={{alignItems:"flex-start", width:"50%"}}>
                        <TouchableOpacity onPress={() => {navigation.navigate('Home')}}>
                            <Ionicons name="arrow-back" size={30} color={theme.colors.ACCENT} style={{alignContent:"flex-start"}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{alignItems: "flex-end", width: "50%"}}>
                        <TouchableOpacity onPress={() => {editOrDelete()}}>
                            <Entypo name="dots-three-vertical" size={30} color={theme.colors.ACCENT} style={{alignSelf: "flex-end"}}/>
                        </TouchableOpacity>
                    </View>
                </View>
                    <View style={{marginBottom:10, width:"90%", alignSelf:"center"}}>
                        <Text style={style.practiceSessionTitle}>Practice Session </Text>
                    </View>
                    <View style={{width:"90%", alignSelf:"center"}} >
                        <Text style={style.inputHeader}>Time (mins)</Text>
                        <TextInput 
                            style={[style.practiceInfoText, makeEditable?{backgroundColor: "white"}: {backgroundColor:"#e3e3e3"}]}
                            onChangeText={setPracticeTime}
                            value={practiceTime ? practiceTime.toString() : practiceTime}
                            placeholder="Enter Time of Session"
                            placeholderTextColor="gray"
                            keyboardType="number-pad"
                            maxLength={3}
                            editable={makeEditable}
                        />
                    </View>
                    <View style={{ width:"90%", alignSelf:"center"}}>
                        <Text style={style.inputHeader}>Quality of Session</Text>
                        <TextInput 
                                style={[style.practiceInfoText, makeEditable?{backgroundColor: "white"}: {backgroundColor:"#e3e3e3"}]}
                                onChangeText={setQuality}
                                value={quality ? quality.toString() : quality}
                                placeholder="Enter a Number 1 - 10"
                                placeholderTextColor="gray"
                                maxLength={3}
                                keyboardType="number-pad"
                                editable={makeEditable}
                            />
                    </View>
                    <View style={{width:"90%", alignSelf:"center"}}>
                        <Text style={style.inputHeader} >Notes For Session</Text>
                        <TextInput 
                            style={[style.notesInfo, makeEditable?{backgroundColor: "white"}: {backgroundColor:"#e3e3e3"}]}
                            placeholder="Enter Notes (optional)"
                            value={notes}
                            onChangeText={setNotes}
                            placeholderTextColor="gray"
                            keyboardType="default"
                            multiline
                            editable={makeEditable}
                        />
                    </View>
                        { videoUri ?
                            <View style={{width:"90%", alignSelf:"center"}}>
                                <Text style={style.inputHeader}>Record Video</Text>
                                <View style={style.myVideoContainer}>
                                    { makeEditable ?
                                    <Pressable
                                        onPress={() => deleteVideoUri()}
                                        style={style.deleteRecordedVideoButton}
                                    >
                                        <Text style={{fontSize: theme.typography.size.M, color: theme.colors.BACKGROUND, fontWeight:"bold"}}>X</Text>
                                    </Pressable> : <View></View>
                                    }
                                    <Video
                                        ref={video}
                                        style={style.video}
                                        source={{uri: videoUri}}
                                        useNativeControls
                                        resizeMode="cover"
                                        isLooping
                                        onPlaybackStatusUpdate={status => setStatus(() => status)}
                                    />
                                    </View>
                                </View> : 
                                <View style={{width:"100%"}}>
                                    {makeEditable ?
                                    
                                    <View style={{ width:"90%", alignSelf:"center"}}>
                                        <Text style={style.inputHeader}>Record Video</Text>
                                        <TouchableOpacity
                                            style={{alignSelf:"center"}}
                                            onPress={() => {
                                                if(hasPermission !== 'granted'){
                                                    askForCameraPermission().then(res => {
                                                        setCameraVisible(true);
                                                    })
                                                }
                                                setCameraVisible(true);
                                            }}
                                            style={style.myVideoContainer}
                                        >
                                                <Ionicons name="camera"  size={40} color={theme.colors.TEXT_SECONDARY} style={{textAlign: "center"}}/>
                                                <Text style={{textAlign:"center", color: theme.colors.TEXT_SECONDARY}}>Take Video (optional) </Text>
                                        </TouchableOpacity>
                                    </View> : <View></View>}
                                </View>
                                }
                                <View style={{width:"90%", alignSelf:"center"}}>
                                <Text style={style.inputHeader}>Song Your Working On</Text>
                                    <DropDownPicker
                                        open={dropDownOpen}
                                        value={practiceSong}
                                        items={dropDownItems}
                                        setOpen={setDropDownOpen}
                                        setValue={setPracticeSong}
                                        style={[style.practiceInfoText, makeEditable?{backgroundColor: "white"}: {backgroundColor:"#e3e3e3"}]}
                                        disabled={!makeEditable}
                                    />

                            </View>
                            
                            { makeEditable?
                            <View style={style.exitSaveButtonsContainer}>
                                <TouchableOpacity
                                onPress={() => {
                                    updatePracticeSession()
                                }}
                                style={style.exitSaveButtons}
                                >
                                    <Text style={style.exitButtonsStyle}>Save your Changes</Text>
                                </TouchableOpacity> 
                                </View>: <View></View>
                            }
                      <Modal 
                        animationType="fade"
                        transparent="true"
                        visible={cameraVisible}
                        onRequestClose={() => {
                            Alert.alert("Modal closed")
                            setCameraVisible(false)
                        }}
                        >
                            { hasPermission?
                            <View style={{flex: 1}}>
                                <Camera style={style.camera} type={type}
                                    ref={ref => setCamera(ref)}
                                >
                                    <View style={style.buttonContainer}>
                                        <TouchableOpacity
                                            style={style.button}
                                            onPress={() => {
                                            setType(
                                                type === Camera.Constants.Type.back
                                                ? Camera.Constants.Type.front
                                                : Camera.Constants.Type.back
                                            );
                                            }}>
                                            <Text style={{fontSize: theme.typography.size.SM,  color: theme.colors.TEXT}}> Flip </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                        style={style.button}
                                        onPress={startRecord}
                                        >
                                        <Ionicons name="stop-circle-outline" size={70} color={recording ? "red" : theme.colors.TEXT}/>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                        onPress={() => {
                                            setCameraVisible(false)
                                            setModalVisible(true)
                                            if(recording){
                                                startRecord()
                                            }
                                        }}
                                        style={style.button}>
                                            <Text style={{fontSize: theme.typography.size.SM, color: theme.colors.TEXT}}>Back</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Camera> 
                            </View> : <View style={style.container} >
                                <Text>We need camera permission</Text>
                                <TouchableOpacity
                                    style={style.addButton}
                                    onPress={() => askForCameraPermission()}
                                >
                                    <Text>
                                        Press for permission
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            }
                        </Modal>  
                </View>
        </TouchableWithoutFeedback>
        
    )
}
export default PracticeSession

const styles = theme => StyleSheet.create({
    video:{
        width: "100%",
        height: "100%",
        zIndex: 0,
        borderRadius:15
    },
    videoContainer: {
        width: "100%",
        alignSelf: "center",
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        margin: 50,
      },
      button: {
        zIndex: 1000,
        flex: 0.333,
        alignSelf: 'flex-end',
        // margin: 10,
        height:80,
        alignContent:"center",
        justifyContent: "center",
        alignItems: "center",
        textAlignVertical:"center"
      },
    camera : {
        flex : 1
    },
    practiceSessionTitle: {
        color: theme.colors.TEXT,
        fontSize: theme.typography.size.L,
        fontWeight: "bold" 
    },
    practiceInfoText: {
        color: theme.colors.TEXT_SECONDARY,
        height: Dimensions.get('window').height / 18,
        borderWidth: 1,
        backgroundColor: "white",
        marginBottom: Dimensions.get('window').height / 41,
        width: "100%",
        borderRadius: 15,
        padding:10,
        fontSize: theme.typography.size.XS
    },
    notesInfo: {
        color: theme.colors.TEXT_SECONDARY,
        height: Dimensions.get('window').height /12,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "white",
        padding:10,
        width: "100%",
        borderRadius: 15,
        fontSize: theme.typography.size.XS
    },
    myVideoContainer: {
        color: theme.colors.TEXT_SECONDARY,
        height: Dimensions.get('window').height /4.4,
        borderWidth: 1,
        backgroundColor: "white",
        marginBottom: 5,
        marginTop: 5,
        width: "100%",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center"
    },
    inputHeader: {
        marginBottom: 3,
        fontSize: theme.typography.size.SM,
        color: theme.colors.TEXT,
    },
    addButton: {
        shadowColor: "gray",
         shadowOffset : {
             width: 3,
             height: 2
         },
         shadowOpacity: 0.25,
         shadowRadius: 3.84,
         elevation: 5
       
    },
    addPracticeText: {
        color: theme.colors.TEXT,
        fontSize: theme.typography.size.M,
        fontWeight: "900"
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.BACKGROUND,
      alignItems: 'center',
      justifyContent: 'center',
      color: "#CF5C36"
    },
    practiceContainer : {
        flex: 1,
        flexDirection:"column",
        backgroundColor: theme.colors.BACKGROUND,
        alignItems: 'center',
        color: "#CF5C36",
        paddingTop: Dimensions.get('window').height / 18,
    },
    absoluteFill : {
      backgroundColor: theme.colors.ACCENT,
      width : "100%",
      height: 100
    },
    exitSaveButtonsContainer: {
        flex: 1,
        flexDirection: "row",
        width:"90%",
        alignSelf:"center",
    },
    exitSaveButtons: {
        backgroundColor: "white",
        position: "absolute",
        justifyContent:"center",
        height: Dimensions.get('window').height/ 18,
        width: "100%",
        backgroundColor: theme.colors.ACCENT,
        bottom: Dimensions.get('window').height/ 26,
        borderRadius: 15
    },
    rightSide:{
        right: 0,
        backgroundColor: theme.colors.ACCENT,
    },
    exitButtonsStyle: {
        fontSize: theme.typography.size.SM,
        textAlign: "center",
        color: theme.colors.TEXT_SECONDARY
    },
    deleteRecordedVideoButton : {
        position: "absolute",
        top: 0,
        right: 0,
        width: 35,
        height: 35,
        backgroundColor: "white",
        zIndex: 100,
        justifyContent:"center",
        alignItems: "center",
        borderTopRightRadius: 15
    }
});
