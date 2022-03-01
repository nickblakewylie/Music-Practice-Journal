import React from 'react'
import {View, StyleSheet, FlatList, Text, ScrollView, Touchable, TouchableOpacity} from 'react-native'
import useTheme from '../myThemes/useTheme';
import useThemedStyles from '../myThemes/useThemedStyles';
import { Ionicons} from '@expo/vector-icons'; 

function SetListItem({name, difficulty, pTime}) {
    const theme = useTheme();
    const style = useThemedStyles(styles);
    // function deleteThisSong(){
    //     console.log("What's up")
    // }
    return (
        <View style={style.setListContainer} >
            <View style={{flex: 0.5}}>
                <Text style={style.setListText}>{name}</Text>
            </View>
            <View style={[style.editContainer,{ borderTopRightRadius: 0, borderBottomRightRadius:0}, {backgroundColor: difficulty > 7? "#ff5e5e" : difficulty > 4 ? theme.colors.ACCENT : "black"}]}>
                <Text style={style.setListText}>{difficulty}</Text>
            </View>
            <View style={style.editContainer}>
                <Text style={[style.setListText, {color: theme.colors.TEXT_SECONDARY}]}>{pTime} mins</Text>
            </View>
        </View>
    )
}

export default SetListItem

const styles = theme => StyleSheet.create({
    setListContainer: {
        width: "90%",
        backgroundColor: theme.colors.SECONDARY,
        borderRadius: 15,
        alignSelf:"center",
        marginBottom: 20,
        flexDirection:"row",
        borderWidth:2
    },
    setListText:{
        color: theme.colors.TEXT,
        fontSize: 18,
        margin: 10,
        padding: 6
    },
    editContainer:{
        flex:0.3,
        backgroundColor:theme.colors.TEXT, 
        borderTopRightRadius:12, 
        borderBottomRightRadius: 12, 
        alignItems: "center", 
        justifyContent:"center"
    }
})
