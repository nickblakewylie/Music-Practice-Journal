import React, { useRef, useState, useEffect, useContext } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Alert, Pressable, TextInput, Button, Dimensions, Keyboard, TouchableWithoutFeedback, Easing} from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { Video, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import { RECORDING_OPTION_IOS_OUTPUT_FORMAT_ILBC } from 'expo-av/build/Audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PracticeSessions} from '../PracticeSessions';
function AddPractice() {
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

      const donwloadFile = async () => {
        setDownloading(true)
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
        setDownloading(false)
        setModalVisible(false)
        setVideoUri(null);
        setPracticeTime(null)
        setDownloadedVid(null);
        setNotes(null);
        setQuality(null);
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
        <View style={styles.container}>
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
                <View style={styles.practiceContainer}>
                        <View>
                            <View style={{margin: 5, marginBottom:15}}>
                                <Text style={styles.practiceSessionTitle}>Practice Session</Text>
                            </View>
                            <View>
                                <Text style={styles.inputHeader}>Practice Time (mins)</Text>
                                <TextInput 
                                    style={styles.practiceInfoText}
                                    onChangeText={setPracticeTime}
                                    value={practiceTime ? practiceTime.toString() : practiceTime}
                                    placeholder="Enter Time"
                                    placeholderTextColor="gray"
                                    keyboardType="number-pad"
                                 />
                            </View>
                            <View >
                                <Text style={styles.inputHeader}>Quality of Session</Text>
                                <TextInput 
                                        style={styles.practiceInfoText}
                                        onChangeText={setQuality}
                                        value={quality ? quality.toString() : quality}
                                        placeholder="Enter a Number 1 - 10"
                                        placeholderTextColor="gray"
                                        keyboardType="number-pad"
                                    />
                            </View>
                            <View>
                                <Text style={styles.inputHeader} >Notes For Session</Text>
                                <TextInput 
                                    style={styles.notesInfo}
                                    placeholder="Enter Notes (optional)"
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholderTextColor="gray"
                                    keyboardType="default"
                                    multiline
                                />
                            </View>
                                <View>
                                    <Text style={styles.inputHeader}>Record Video</Text>
                                
                            { videoUri ?
                            <View style={styles.myVideoContainer}>
                                <Video
                                    ref={video}
                                    style={styles.video}
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
                                        <View style={styles.myVideoContainer}>
                                            <Ionicons name="camera"  size={40} color="black" style={{textAlign: "center"}}/>
                                            <Text style={{textAlign:"center"}}>Take Video</Text>
                                        </View>
                                    </TouchableOpacity>
                            }
                            </View>
                            <View style={styles.exitSaveButtonsContainer}>
                                <Pressable
                                onPress={() => {
                                    setModalVisible(!modalVisible)
                                    setVideoUri(null);
                                    setPracticeTime(null)
                                    setDownloadedVid(null);
                                    setNotes(null);
                                    setQuality(null);
                                }}
                                style={styles.exitSaveButtons}
                                >
                                    <Text style={styles.exitButtonsStyle}>Exit</Text>
                                </Pressable>
                                <View style={[styles.exitSaveButtons, styles.rightSide]}>
                                    <TouchableOpacity
                                        onPress={donwloadFile}
                                        >
                                        { downloading?
                                            <Text style={styles.exitButtonsStyle}>Downloading</Text>
                                            : <Text style={styles.exitButtonsStyle}>Save</Text>
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
                </TouchableWithoutFeedback>
            </Modal>
            <TouchableOpacity onPress={() => setModalVisible(true)} >
            <Ionicons style={styles.addButton} name="add-circle-outline" size={100} color="white" />
            </TouchableOpacity>
            <Text style={styles.addPracticeText} >Add Your Practice Session</Text>
        </View>
    )
}
export default AddPractice

const styles = StyleSheet.create({
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
        padding: 10,
        backgroundColor: "white",
        margin: 5,
        padding:10,
        width: 350,
        borderRadius: 15
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
    inputHeader: {
        margin: 5,
        fontSize: 18,
        color: "white"
    },
    addPracticeContainer: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        backgroundColor: "black",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
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
        color: "#DFDFDF",
        fontSize: 25,
        fontWeight: "900"
    },
    container: {
      flex: 1,
      backgroundColor: "#1F3659",
      alignItems: 'center',
      justifyContent: 'center',
      color: "#CF5C36"
    },
    practiceContainer : {
        flex: 1,
        backgroundColor: "#1F3659",
        alignItems: 'center',
        color: "#CF5C36",
        paddingTop: 60
    },
    absoluteFill : {
      backgroundColor: "#E8DCB8",
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
        // "#1F3659"
        backgroundColor: "#E8DCB8"
    },
    exitButtonsStyle: {
        fontSize: 18,
        textAlign: "center"
    }
  });
