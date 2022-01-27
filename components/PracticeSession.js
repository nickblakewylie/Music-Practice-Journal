import React, { useRef } from 'react'
import { Video } from 'expo-av'
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
const PracticeSession = ({navigation, route}) =>{
    const data = route.params.data
    function makeDateLookNice(date){
        var myDate = new Date(date)
        const nicelookingDate = months[myDate.getMonth()] + " " + myDate.getDate() + ", " + myDate.getFullYear() 
        return nicelookingDate
    }
    const video = useRef(null)
    const [status, setStatus] = React.useState({});
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September','October', 'November', 'December']
    return (
        <View>
            <TouchableOpacity
            onPress={() => {console.log("hello")}}
            >                  
                <View style={styles.sessions}>
                        <Text style={{fontSize: 25, color: 'white'}}>Practice Session {makeDateLookNice(data.date)} <TouchableOpacity onPress={() => {deleteFromArray(data.date)}} ><Ionicons name="trash-sharp" size={24} color="#1F3659" /></TouchableOpacity></Text>
                        <Text style={{color: "#1F3659"}}>{data.practiceTime} mins</Text>
                
                </View>
            </TouchableOpacity>
            <View style={styles.pSessionContainer}>
                <Video
                    ref={video}
                    style={styles.video}
                    source={{uri: data.videoUri}}
                    useNativeControls
                    resizeMode="cover"
                    isLooping
                    onPlaybackStatusUpdate={status => setStatus(() => status)}
                    />
                <Text>Notes : {data.notes}</Text>
                <Text>quality {data.quality}</Text>
                <Text>practice time : {data.practiceTime} minutes</Text>
            </View>
        </View>
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
        // borderWidth: 1,
        // margin: 10,
        // padding: 5,
        // borderRadius: 10
    }
});
