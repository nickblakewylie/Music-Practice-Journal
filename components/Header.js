import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View} from 'react-native'
import { Ionicons } from '@expo/vector-icons'; 
import {useRoute} from '@react-navigation/native';
export default function Header({name}) {
    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.headerText}>{name}</Text>
            </View>
        </View>
    )
}
const styles = StyleSheet.create( {
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
        color: "#333",
        textAlign: "center"
    }
});
