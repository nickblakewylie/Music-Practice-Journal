import React, { useRef, useState, useEffect, useContext } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Alert, Pressable, TextInput, Button, Dimensions, Keyboard, TouchableWithoutFeedback, Easing, TouchableHighlight, Vibration} from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { Video, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import { RECORDING_OPTION_IOS_OUTPUT_FORMAT_ILBC } from 'expo-av/build/Audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PracticeSessions} from '../PracticeSessions';
import useTheme from '../myThemes/useTheme';
import useThemedStyles from '../myThemes/useThemedStyles';
function AddPractice() {
    const theme = useTheme();
    const style = useThemedStyles(styles);
    function clicked(){
        console.log("clicked")
    }
    const wavesAnim = useRef(new Animated.Value(0)).current
    const createWaves = () => {
        Animated.timing(wavesAnim, {
            toValue: 500,
            easing: Easing.back(),
            duration: 5000
        }).start()
        
    }
    const [modalVisible, setModalVisible] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [practiceTime, setPracticeTime] = useState(null);
    const [notes, setNotes] = useState(null);
    const [quality, setQuality] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [camera, setCamera] = useState(null);
    const [recording, setRecording] = useState(false);
    const [videoUri, setVideoUri] = useState(null);
    const video = useRef(null)
    const [downloading, setDownloading] = useState(false);
    const [status, setStatus] = React.useState({});
    const [downloadedVid, setDownloadedVid] = useState(null)

    const {practiceSessions, setPracticeSessions} = useContext(PracticeSessions)


    async function askForCameraPermission(){
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');

    }
    useEffect(() => {
        // createWaves()
        setDownloading(false);
        (async () => {
          const { status } = await Camera.requestCameraPermissionsAsync();
          const { microphone } = await Camera.requestMicrophonePermissionsAsync()
          setHasPermission(status === 'granted' && microphone == 'granted');
        })();
      }, []);

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
      function deleteVideoUri(){
          setVideoUri(null);
          setDownloadedVid(null);
      }
      const downloadFile = async () => {
        if(checkInputsAreCorrect()){
            setDownloading(true)
            if(videoUri != null){
                const groupsDir = FileSystem.documentDirectory + "videos/";
                let getInfo = await FileSystem.getInfoAsync(groupsDir);
                if(!getInfo.exists){
                await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'videos/',{intermediates: true});
                }
                const fileName = FileSystem.documentDirectory + "videos/"+ uuid.v4() +".mov"
                await FileSystem.moveAsync({
                from: videoUri,
                to: fileName
                });
                console.log(fileName)
                setDownloadedVid(fileName)
                await storePracticeSession(fileName)
            }
            else{
                await storePracticeSession(null)
            }
            setDownloading(false)
            setModalVisible(false)
            setVideoUri(null);
            setPracticeTime(null)
            setDownloadedVid(null);
            setNotes(null);
            setQuality(null);
        }
      }
    const storePracticeSession = async (newFileName) => {
        var getPracticeSession = await AsyncStorage.getItem('practiceSessions');
        getPracticeSession = getPracticeSession != null ? JSON.parse(getPracticeSession) : null
        console.log(getPracticeSession)
        const sessionInfo = {
            date : new Date(),
            practiceTime : practiceTime,
            notes: notes,
            quality: quality,
            videoUri : newFileName
        }
        if(getPracticeSession == null){
            getPracticeSession = [sessionInfo]
            await AsyncStorage.setItem('practiceSessions', JSON.stringify(getPracticeSession));
        }else{
            getPracticeSession.push(sessionInfo)
            await AsyncStorage.setItem('practiceSessions', JSON.stringify(getPracticeSession));
        }
        setPracticeSessions(getPracticeSession)
    }
    const startRecord = async () => {
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
        <View style={style.container}>
            {/* <Animated.View 
            style={{width: wavesAnim, borderRadius:10000,height: wavesAnim, backgroundColor: "white", opacity:1, position: "absolute", zIndex: 0}} >
            </Animated.View> */}
            <Modal
            animationType="slide"
            transparent="true"
            visible={modalVisible}
            onRequestClose={() => {
                Alert.alert("Modal has been closed");
                setModalVisible(!modalVisible);
            }}
            >
                <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss()}}>
                <View style={style.practiceContainer}>
                        <View>
                            <View style={{margin: 5, marginBottom:15}}>
                                <Text style={style.practiceSessionTitle}>Practice Session</Text>
                            </View>
                            <View>
                                <Text style={style.inputHeader}>Time (mins)</Text>
                                <TextInput 
                                    style={style.practiceInfoText}
                                    onChangeText={setPracticeTime}
                                    value={practiceTime ? practiceTime.toString() : practiceTime}
                                    placeholder="Enter Time of Session"
                                    placeholderTextColor="gray"
                                    keyboardType="number-pad"
                                    maxLength={3}
                                 />
                            </View>
                            <View >
                                <Text style={style.inputHeader}>Quality of Session</Text>
                                <TextInput 
                                        style={style.practiceInfoText}
                                        onChangeText={setQuality}
                                        value={quality ? quality.toString() : quality}
                                        placeholder="Enter a Number 1 - 10"
                                        placeholderTextColor="gray"
                                        keyboardType="number-pad"
                                    />
                            </View>
                            <View>
                                <Text style={style.inputHeader} >Notes For Session</Text>
                                <TextInput 
                                    style={style.notesInfo}
                                    placeholder="Enter Notes (optional)"
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholderTextColor="gray"
                                    keyboardType="default"
                                    multiline
                                />
                            </View>
                                <View>
                                    <Text style={style.inputHeader}>Record Video</Text>
                                
                            { videoUri ?
                            <View style={style.myVideoContainer}>
                                <Pressable
                                     onPress={() => deleteVideoUri()}
                                     style={style.deleteRecordedVideoButton}
                                >
                                    <Text style={{fontSize: 25, color: theme.colors.BACKGROUND, fontWeight:"bold"}}>X</Text>
                                </Pressable>
                                <Video
                                    ref={video}
                                    style={style.video}
                                    source={{uri: videoUri}}
                                    useNativeControls
                                    resizeMode="cover"
                                    isLooping
                                    onPlaybackStatusUpdate={status => setStatus(() => status)}
                                />
                            </View> : 
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
                                        <View style={style.myVideoContainer}>
                                            <Ionicons name="camera"  size={40} color={theme.colors.TEXT_SECONDARY} style={{textAlign: "center"}}/>
                                            <Text style={{textAlign:"center", color: theme.colors.TEXT_SECONDARY}}>Take Video (optional) </Text>
                                        </View>
                                    </TouchableOpacity>
                            }
                            </View>
                            <View style={style.exitSaveButtonsContainer}>
                                <Pressable
                                onPress={() => {
                                    setModalVisible(!modalVisible)
                                    setVideoUri(null);
                                    setPracticeTime(null)
                                    setDownloadedVid(null);
                                    setNotes(null);
                                    setQuality(null);
                                }}
                                style={style.exitSaveButtons}
                                >
                                    <Text style={style.exitButtonsStyle}>Cancel</Text>
                                </Pressable>
                                <View style={[style.exitSaveButtons, style.rightSide]}>
                                    <TouchableOpacity
                                        onPress={downloadFile}
                                        >
                                        { downloading?
                                            <Text style={style.exitButtonsStyle}>Downloading</Text>
                                            : <Text style={style.exitButtonsStyle}>Save</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
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
                                            <Text style={{fontSize: 20,  color: theme.colors.TEXT}}> Flip </Text>
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
                                        }}
                                        style={style.button}>
                                            <Text style={{fontSize: 20, color: theme.colors.TEXT}}>Back button</Text>
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
            </Modal>
            <TouchableOpacity onPress={() => {setModalVisible(true)}} >
            <Ionicons style={style.addButton} name="add-circle-outline" size={100} color={theme.colors.TEXT}/>
            </TouchableOpacity>
            <Text style={style.addPracticeText} >Add Your Practice Session</Text>
        </View>
    )
}
export default AddPractice

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
        fontSize: 35,
        fontWeight: "bold" 
    },
    practiceInfoText: {
        color: theme.colors.TEXT_SECONDARY,
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
        color: theme.colors.TEXT_SECONDARY,
        height: 80,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "white",
        margin: 5,
        padding:10,
        width: 350,
        borderRadius: 15
    },
    myVideoContainer: {
        color: theme.colors.TEXT_SECONDARY,
        height: 210,
        borderWidth: 1,
        backgroundColor: "white",
        margin: 5,
        width: 350,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center"
    },
    inputHeader: {
        margin: 5,
        fontSize: 18,
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
        fontSize: 25,
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
        backgroundColor: theme.colors.BACKGROUND,
        alignItems: 'center',
        color: "#CF5C36",
        paddingTop: 60
    },
    absoluteFill : {
      backgroundColor: theme.colors.ACCENT,
      width : "100%",
      height: 100
    },
    exitSaveButtonsContainer: {
        flex: 1,
        flexDirection: "row",
    },
    exitSaveButtons: {
        backgroundColor: "white",
        position: "absolute",
        justifyContent:"center",
        alignSelf:"flex-end",
        height: 50,
        width: 160,
        bottom: 50,
        margin: 5,
        borderRadius: 15
    },
    rightSide:{
        right: 0,
        backgroundColor: theme.colors.ACCENT,
    },
    exitButtonsStyle: {
        fontSize: 18,
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
