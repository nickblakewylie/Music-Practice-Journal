import React, { useState, useContext, useEffect } from 'react'
import {View, StyleSheet, FlatList, Text, ScrollView, TouchableOpacity, Button, Pressable, Modal, Dimensions, TextInput, AsyncStorage, Alert} from 'react-native'
import useTheme from '../myThemes/useTheme';
import useThemedStyles from '../myThemes/useThemedStyles';
import { Entypo } from '@expo/vector-icons'; 
import { Ionicons } from '@expo/vector-icons';
import SetListItem from '../components/SetListItem';
import {SetLists} from '../SetLists';

function SetListScreen() {
    const theme = useTheme();
    const style = useThemedStyles(styles);
    const [addSetListModal, setAddSetListModal] = useState(false);
    const [songName, setSongName] = useState(null);
    const [songDifficulty, setSongDifficulty] = useState(null);
    const {setLists, setSetLists} = useContext(SetLists)

    async function addSong(){
        if(songName != null &&  songDifficulty != null && Number(songDifficulty) > 0 && Number(songDifficulty) < 11){
            console.log("Song " + songName + " difficulty : " + songDifficulty)
            var tempT = setLists
            if(setLists != null && setLists.length > 0){
                tempT.push({'songName': songName, 'songDifficulty' : songDifficulty, 'pTime': 0})
            }else{
                tempT = [{'songName': songName, 'songDifficulty' : songDifficulty, 'pTime': 0}]
            }
            console.log(tempT)
            setSetLists(tempT)
            const jsonValue = JSON.stringify(tempT)
            await AsyncStorage.setItem('setLists', jsonValue)
        }else{
            Alert.alert("Song Name and Song Difficulty Required","", [{
                text : "OK"
            }])
        }
    }
    useEffect(() => {
        console.log("setList updated")
        console.log(setLists)
    }, [SetLists])
    return (
        <View style={style.container}>
            <ScrollView contentContainerStyle={{paddingBottom: 150}}>
                <View style={style.myHeader}>
                    <Text style={[style.setListText, {color: theme.colors.TEXT}]}>Your Songs</Text>
                </View>
                <SetListItem name="Alameda" difficulty="9" pTime="100"/>
                <Modal
                    visible={addSetListModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() =>{
                        setAddSetListModal(false)
                    }}
                    >
                    <TouchableOpacity
                        activeOpacity={1} 
                        onPressOut={() => {setAddSetListModal(false)}}
                        style={style.addSetListModalStyle}
                    >
                            <View style={style.setListModalContainer}>
                                <View style={{flexDirection:"row", justifyContent:"center"}}>
                                    <View style={{flex: 0.6, alignItems:"flex-start"}}>
                                        {/* <Text style={style.createSetListTitle}>New Song</Text> */}
                                    </View>
                                    <View style={{flex: 0.4, alignItems:"flex-end"}}>
                                        <TouchableOpacity onPress={() => setAddSetListModal(false)} style={{justifyContent:"center", backgroundColor:theme.colors.ACCENT,padding: 10,borderTopRightRadius: 13}}>
                                            <Text style={{fontSize:25, color:theme.colors.TEXT}}>X</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{flex: 1, justifyContent:"space-around"}}>
                                    <View style={{flexDirection:"column", width: "90%", alignSelf:"center"}}>
                                        <Text style={style.songInputText}>Song Name</Text>
                                        <TextInput  
                                            onChangeText={setSongName}
                                            value={songName}
                                            style={style.songInput}
                                            maxLength={16}
                                            placeholder="Song Title"
                                            placeholderTextColor="gray"
                                        />
                                    </View>
                                    <View style={{flexDirection:"column", width: "90%", alignSelf:"center"}}>
                                        <Text style={style.songInputText}>Song Difficulty</Text>
                                        <TextInput  
                                            onChangeText={setSongDifficulty}
                                            style={style.songInput}
                                            value={songDifficulty}
                                            maxLength={2}
                                            placeholder="Difficulty 1 - 10"
                                            placeholderTextColor="gray"
                                            keyboardType="number-pad"
                                        />
                                    </View>
                                </View>
                                    <View>
                                        <TouchableOpacity style={style.songButton} onPress={() => addSong()}>
                                            <Text style={style.songButtonText}>Add Song</Text>
                                        </TouchableOpacity>
                                    </View>
                                
                            </View>
                        </TouchableOpacity>
                </Modal>
            </ScrollView>
            <Pressable style={style.addNewSetList} onPress={() => {setAddSetListModal(true)}}>
                <View style={{flex: 0.8}}>
                    <Text style={[style.setListText, {color: theme.colors.TEXT_SECONDARY}]}>Add a Song To Practice</Text>
                </View>
                <View style={{flex:0.2, alignItems:"flex-end", marginRight: 5, justifyContent:"center"}}>
                    <Ionicons name="add" size={30} color={theme.colors.TEXT_SECONDARY}/>
                </View>
            </Pressable>
        </View>
    )
}

export default SetListScreen

const styles = theme => StyleSheet.create({
    createSetListTitle: {
        color: theme.colors.TEXT,
        fontSize: 22,
        padding: 6
    },
    container: {
        flex: 1,
        backgroundColor:theme.colors.BACKGROUND
    },
    myHeader: {
        width: "100%",
        padding: 6,
        alignSelf: "center"
    },
    setListContainer: {
        width: "90%",
        backgroundColor: theme.colors.ACCENT,
        borderRadius: 15,
        alignSelf:"center",
        marginBottom: 20,
        flexDirection:"row",
        borderWidth:2
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
        width:"100%",
        backgroundColor:theme.colors.SECONDARY,
        borderWidth: 2,
        color: theme.colors.TEXT
    },
    addNewSetList: {
        position: "absolute",
        width:"90%",
        backgroundColor:theme.colors.ACCENT,
        bottom: 100,
        padding: 6,
        borderRadius: 15,
        alignSelf:"center",
        flexDirection: "row",
        flex: 1,
    },
    setListText:{
        color: theme.colors.SECONDARY,
        fontSize: 20,
        margin: 10,
        padding: 6,
        fontWeight:"bold"
    },
    addSetListModalStyle:{
        position:"absolute",
        width:"100%",
        justifyContent:"center",
        zIndex: 1000,
        alignItems:"center",
        height: "100%"
    },
    setListModalContainer:{
        backgroundColor:theme.colors.SECONDARY,
        width: Dimensions.get('window').width / 1.3,
        height: Dimensions.get('window').height / 2.5,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: theme.colors.TEXT,
        zIndex: 10000,
        shadowRadius: 2,
        elevation: 5,
        shadowColor:"black",
        shadowOpacity: 0.8,
        shadowOffset:{
            height: 1,
            width: 0
        }
    },
    songInput: {
        backgroundColor: theme.colors.TEXT,
        color: theme.colors.TEXT_SECONDARY,
        width: "100%",
        height: 30,
        fontSize: 20,
        alignSelf:"center",
        borderRadius: 15,
        padding: 6,
        margin: 20
    },
    songInputText:{
        fontSize: 22,
        color: theme.colors.TEXT,
    },
    songButton:{
        bottom: 0,
        padding: 20,
        borderBottomLeftRadius: 13,
        borderBottomRightRadius: 13,
        width:"100%",
        // position:"absolute",
        backgroundColor:theme.colors.ACCENT
    },
    songButtonText: {
        fontSize: 25,
        color: theme.colors.SECONDARY,
        fontWeight:"bold",
        textShadowOffset:{
            width:-1,
            height:1
        },
        textShadowColor:theme.colors.TEXT,
        textShadowRadius:0.5
    }
})
