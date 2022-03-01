import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View} from 'react-native'
import { Ionicons } from '@expo/vector-icons'; 
import {useRoute} from '@react-navigation/native';
import useTheme from '../myThemes/useTheme';
import useThemedStyles from '../myThemes/useThemedStyles';
export default function Header({name, withBack}) {
    const theme = useTheme();
    const style = useThemedStyles(styles);
    return (
        <View style={[style.header,{marginLeft : withBack == "true"?-20 :0}]}>
            <View>
                <Text style={style.headerText}>{name}</Text>
            </View>
        </View>
    )
}
const styles = theme => StyleSheet.create( {
    header: {
        width: "100%",
        height: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    headerText : {
        fontWeight: "bold",
        fontSize: 20,
        letterSpacing: 1,
        color: theme.TEXT_SECONDARY,
        textAlign: "center"
    }
});
