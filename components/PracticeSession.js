import React, { useRef, useContext, useState } from 'react'
import { Video } from 'expo-av'
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, TextInput, Keyboard, TouchableWithoutFeedback, ActionSheetIOS, Pressable, Alert, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import {PracticeSessions} from '../PracticeSessions';
import { Entypo } from '@expo/vector-icons'; 
import { Camera } from 'expo-camera';
const PracticeSession = ({navigation, route}) =>{
    const data = route.params.data
    function makeDateLookNice(date){
        var myDate = new Date(date)
        const nicelookingDate = months[myDate.getMonth()] + " " + myDate.getDate() + ", " + myDate.getFullYear() 
        return nicelookingDate
    }
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
    const {practiceSessions, setPracticeSessions} = useContext(PracticeSessions);
    const [quality, setQuality] = useState(data.quality)
    const [practiceTime, setPracticeTime] = useState(data.practiceTime)
    const [notes, setNotes] = useState(data.notes)
    const [videoUri, setVideoUri] = useState(data.videoUri)
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
          navigation.navigate('Main')
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
    function updatePracticeSession(){
        if(checkInputsAreCorrect() == true){
            var tempArray = practiceSessions;
            for(var i = 0; i < tempArray.length; i++){
                if(tempArray[i].date == data.date){
                    tempArray[i].notes = notes
                    tempArray[i].practiceTime = practiceTime
                    tempArray[i].quality = quality
                    tempArray[i].videoUri = videoUri
                }
            }
            setPracticeSessions(tempArray)
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
    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss()}}>
            <View style={styles.practiceContainer}>
                <View style={{width:"100%", flexDirection: "row", paddingLeft:15, paddingRight:15 }} >
                    <View style={{alignItems:"flex-start", width:"50%"}}>
                        <TouchableOpacity onPress={() => {navigation.navigate('Main')}}>
                            <Ionicons name="arrow-back" size={30} color="#E8DCB8" style={{alignContent:"flex-start"}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{alignItems: "flex-end", width: "50%"}}>
                        <TouchableOpacity onPress={() => {editOrDelete()}}>
                            <Entypo name="dots-three-vertical" size={30} color="#E8DCB8" style={{alignSelf: "flex-end"}}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View>
                    <View style={{margin: 5, marginBottom:15, marginTop:10}}>
                        <Text style={styles.practiceSessionTitle}>Practice Session </Text>
                    </View>
                    <View>
                        <Text style={styles.inputHeader}>Time (mins)</Text>
                        <TextInput 
                            style={[styles.practiceInfoText, makeEditable?{backgroundColor: "white"}: {backgroundColor:"#e3e3e3"}]}
                            onChangeText={setPracticeTime}
                            value={practiceTime ? practiceTime.toString() : practiceTime}
                            placeholder="Enter Time of Session"
                            placeholderTextColor="gray"
                            keyboardType="number-pad"
                            maxLength={3}
                            editable={makeEditable}
                        />
                    </View>
                    <View >
                        <Text style={styles.inputHeader}>Quality of Session</Text>
                        <TextInput 
                                style={[styles.practiceInfoText, makeEditable?{backgroundColor: "white"}: {backgroundColor:"#e3e3e3"}]}
                                onChangeText={setQuality}
                                value={quality ? quality.toString() : quality}
                                placeholder="Enter a Number 1 - 10"
                                placeholderTextColor="gray"
                                maxLength={3}
                                keyboardType="number-pad"
                                editable={makeEditable}
                            />
                        {/* <Text style={styles.practiceInfoText}>{data.quality}</Text> */}
                    </View>
                    <View>
                        <Text style={styles.inputHeader} >Notes For Session</Text>
                        <TextInput 
                            style={[styles.notesInfo, makeEditable?{backgroundColor: "white"}: {backgroundColor:"#e3e3e3"}]}
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
                            <View>
                                <Text style={styles.inputHeader}>Record Video</Text>
                                <View style={styles.myVideoContainer}>
                                    { makeEditable ?
                                    <Pressable
                                        onPress={() => deleteVideoUri()}
                                        style={styles.deleteRecordedVideoButton}
                                    >
                                        <Text style={{fontSize: 25, color: "#1F3659", fontWeight:"bold"}}>X</Text>
                                    </Pressable> : <View></View>
                                    }
                                    <Video
                                        ref={video}
                                        style={styles.video}
                                        source={{uri: videoUri}}
                                        useNativeControls
                                        resizeMode="cover"
                                        isLooping
                                        onPlaybackStatusUpdate={status => setStatus(() => status)}
                                    />
                                    </View>
                                </View> : 
                                <View>
                                    {makeEditable ?
                                    
                                    <View>
                                        <Text style={styles.inputHeader}>Record Video</Text>
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
                                        >
                                            <View style={styles.myVideoContainer}>
                                                <Ionicons name="camera"  size={40} color="black" style={{textAlign: "center"}}/>
                                                <Text style={{textAlign:"center"}}>Take Video (optional) </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View> : <View></View>}
                                </View>
                                }
                            { makeEditable?
                            <View style={styles.exitSaveButtonsContainer}>
                                <TouchableOpacity
                                onPress={() => {
                                    updatePracticeSession()
                                    // setModalVisible(!modalVisible)
                                    // setVideoUri(null);
                                    // setPracticeTime(null)
                                    // setDownloadedVid(null);
                                    // setNotes(null);
                                    // setQuality(null);
                                }}
                                style={styles.exitSaveButtons}
                                >
                                    <Text style={styles.exitButtonsStyle}>Save your Changes</Text>
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
                                <Camera style={styles.camera} type={type}
                                    ref={ref => setCamera(ref)}
                                >
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => {
                                            setType(
                                                type === Camera.Constants.Type.back
                                                ? Camera.Constants.Type.front
                                                : Camera.Constants.Type.back
                                            );
                                            }}>
                                            <Text style={{fontSize: 20,  color: "white"}}> Flip </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                        style={styles.button}
                                        onPress={startRecord}
                                        >
                                        <Ionicons name="stop-circle-outline" size={70} color={recording ? "red" : "white"}/>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                        onPress={() => {
                                            setCameraVisible(false)
                                            setModalVisible(true)
                                        }}
                                        style={styles.button}>
                                            <Text style={{fontSize: 20, color: "white"}}>Back button</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Camera> 
                            </View> : <View style={styles.container} >
                                <Text>We need camera permission</Text>
                                <TouchableOpacity
                                    style={styles.addButton}
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
            </View>
        </TouchableWithoutFeedback>
        
    )
}
export default PracticeSession

const styles = StyleSheet.create({
    video: {
        width: Dimensions.get('window').width,
        height: 400
    },
    dateHeader : {
        fontSize: 25
    },
    pSessionContainer: {
        backgroundColor: "white",
        borderWidth: 2,
    },
    sessions : {
        backgroundColor: "#5F7CA6",
    },
    timeText: {
        color:"#1F3659",
        fontSize: 30,

    },
    practiceSessionTitle: {
        color: "white",
        fontSize: 35,
        fontWeight: "bold" 
    },
    practiceInfoText: {
        color: "black",
        height: 50,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "white",
        margin: 5,
        marginBottom: 23,
        width: 350,
        borderRadius: 15,
        padding:10
    },
    notesInfo: {
        color: "black",
        height: 80,
        borderWidth: 1,
        // padding: 10,
        backgroundColor: "white",
        margin: 5,
        padding:10,
        width: 350,
        borderRadius: 15
    },
    practiceContainer : {
        flex: 1,
        backgroundColor: "#1F3659",
        alignItems: 'center',
        color: "#CF5C36",
        paddingTop: 60
    },
    inputHeader: {
        margin: 5,
        fontSize: 18,
        color: "white"
    },
    video:{
        width: "100%",
        height: "100%",
        zIndex: 0,
        borderRadius:15
    },
    myVideoContainer: {
        color: "black",
        height: 210,
        borderWidth: 1,
        backgroundColor: "white",
        margin: 5,
        width: 350,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center"
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
    },
    exitSaveButtonsContainer: {
        flex: 1,
        // flexDirection: "row",
        // margin: 5,
        // padding:10
    },
    exitSaveButtons: {
        backgroundColor: "#E8DCB8",
        position: "absolute",
        justifyContent:"center",
        alignSelf:"center",
        height: 50,
        width: 350,
        bottom: 60,
        // margin: 5,
        borderRadius: 15,
        borderWidth: 1,
        margin: 5,
        // padding:10
    },
    exitButtonsStyle: {
        fontSize: 18,
        textAlign: "center"
    },
    camera : {
        flex : 1
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
});
