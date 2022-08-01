import React, { useRef, useState, useEffect, useContext } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Alert, Pressable, TextInput, Button, Dimensions, Keyboard, TouchableWithoutFeedback, Easing, TouchableHighlight, Vibration} from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PracticeSessions} from '../PracticeSessions';
import {SetLists} from '../SetLists'
import useTheme from '../myThemes/useTheme';
import useThemedStyles from '../myThemes/useThemedStyles';
import DropDownPicker from 'react-native-dropdown-picker';
import { AdMobBanner } from 'expo-ads-admob';

function AddPractice() {
    const theme = useTheme();
    const style = useThemedStyles(styles);
    const wavesAnim = useRef(new Animated.Value(0)).current
    const fadeOut = useRef(new Animated.Value(1)).current
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
    const [practiceSong, setPracticeSong] = useState(null);
    const {practiceSessions, setPracticeSessions} = useContext(PracticeSessions)
    const {setLists, setMySetList} = useContext(SetLists)
    const [dropDownOpen, setDropDownOpen] = useState(false)
    const [dropDownItems, setDropDownItems] = useState([
      ]);
    async function askForCameraPermission(){
        const { status } = await Camera.requestCameraPermissionsAsync();
        const { microphone } = await Camera.requestMicrophonePermissionsAsync()
        setHasPermission(status === 'granted' && microphone == 'granted');

    }
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
    useEffect(() => {
        (async () => {
            setDownloading(false);
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            createTheDropDownList()
        })();
      }, []);
      useEffect(() => {
          createTheDropDownList()
      },[JSON.stringify(setLists)])
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
            setDropDownOpen(false)
            setPracticeSong(null);
        }
      }
    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    Date.prototype.subtractDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() - days);
        return date;
    }
    const storePracticeSession = async (newFileName) => {
        var getPracticeSession = [];
        getPracticeSession = await AsyncStorage.getItem('practiceSessions');
        getPracticeSession = getPracticeSession != null ? JSON.parse(getPracticeSession) : null
        var myDate = new Date();
        const sessionInfo = {
            date : new Date(),
            practiceTime : practiceTime,
            notes: notes,
            quality: quality,
            videoUri : newFileName,
            practiceSong: practiceSong
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
                            <View style={{marginBottom:10, width:"90%", alignSelf:"center"}}>
                                <Text style={style.practiceSessionTitle}>Practice Session</Text>
                            </View>
                            <View style={{width: "90%",alignSelf:"center"}}>
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
                            <View style={{width: "90%",alignSelf:"center"}}>
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
                            <View style={{width: "90%",alignSelf:"center"}}>
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
                            <View style={{width:"100%"}} >
                                <View style={{width: "90%",alignSelf:"center"}}>
                                    <Text style={style.inputHeader}>Record Video</Text>
                                
                            { videoUri ?
                            <View style={style.myVideoContainer}>
                                <Pressable
                                     onPress={() => deleteVideoUri()}
                                     style={style.deleteRecordedVideoButton}
                                >
                                    <Text style={{fontSize: theme.typography.size.M, color: theme.colors.BACKGROUND, fontWeight:"bold"}}>X</Text>
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
                                    style={style.myVideoContainer}
                                    onPress={() => {
                                        console.log("has permission = " + hasPermission)
                                        if(hasPermission !== true){
                                            Alert.alert("Oops", "To record your practices you need to allow access to your camera",[{text: "OK"}])
                                        }else{
                                            setCameraVisible(true);
                                        }
                                    }}
                                    >
                                            <Ionicons name="camera"  size={theme.typography.size.L} color={theme.colors.TEXT_SECONDARY} style={{textAlign: "center"}}/>
                                            <Text style={{textAlign:"center", color: theme.colors.TEXT_SECONDARY, fontSize:theme.typography.size.S }}>Take Video (optional) </Text>
                                    </TouchableOpacity>
                            }
                            </View>
                            
                            {
                                        dropDownItems != null && dropDownItems.length > 0 ?
                                        <View style={{width: "90%",alignSelf:"center"}} >
                                    <Text style={style.inputHeader}>Song Your Working On</Text>
                                        <DropDownPicker
                                            open={dropDownOpen}
                                            value={practiceSong}
                                            items={dropDownItems}
                                            setOpen={setDropDownOpen}
                                            setValue={setPracticeSong}
                                            style={style.practiceInfoText}
                                            dropDownDirection="TOP"
                                        /> 
                                </View>
                                : <View></View>}
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
                                    setDropDownOpen(false);
                                    setPracticeSong(null);
                                }}
                                style={[style.exitSaveButtons, {marginRight: 5}]}
                                >
                                    <Text style={style.exitButtonsStyle}>Cancel</Text>
                                </Pressable>
                                <View style={[style.exitSaveButtons, style.rightSide, {marginLeft: 5}]}>
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
                                            if(recording){
                                                startRecord()
                                            }
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
            </Modal>
            <View style={{width:"100%",alignItems:"center", position:"absolute", top: 0}}>
                    <AdMobBanner
                    bannerSize="banner"
                    adUnitID={process.env.GOOGLE_ADS_IDENTIFER}
                    onDidFailToReceiveAdWithError={(e) => console.log(e)}
                    servePersonalizedAds={false}
                    />
            </View>
            <Animated.View 
                style={{transform:[{translateY:wavesAnim}], opacity: fadeOut}}
                >
                <TouchableOpacity onPress={() => {
                    setModalVisible(true);
                    }} style={{alignSelf:"center"}}>
                    <Ionicons style={style.addButton} name="add-circle-outline" size={theme.typography.size.XXL} color={theme.colors.TEXT}/>
                </TouchableOpacity>
                <Text style={style.addPracticeText}>Add Your Practice Session</Text>
            </Animated.View>
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
        fontSize: theme.typography.size.L,
        fontWeight: "bold" 
    },
    practiceInfoText: {
        color: theme.colors.TEXT_SECONDARY,
        height: Dimensions.get('window').height / 18,
        borderWidth: 1,
        padding: 10,
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
        marginBottom: 5,
        marginTop: 5,
        padding:10,
        width: "100%",
        borderRadius: 15,
        fontSize: theme.typography.size.XS
    },
    myVideoContainer: {
        color: theme.colors.TEXT_SECONDARY,
        // height was 210
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
        width: "48%",
        bottom: Dimensions.get('window').height/ 20,
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
