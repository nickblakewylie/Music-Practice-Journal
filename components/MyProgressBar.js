import React from 'react'
import { View, StyleSheet } from 'react-native'
import useTheme from '../myThemes/useTheme';
import useThemedStyles from '../myThemes/useThemedStyles';

// progress percent should be a decimal percent
function MyProgressBar({progressPercent}) {
    const theme = useTheme();
    const style = useThemedStyles(styles);
    var percent = (progressPercent *100).toString() + " %"
    if(progressPercent > 1){
        percent = "100%"
    }
    return (
        <View style={style.outerBar}>
            <View style={[style.innerBar, {width: percent}]}>

            </View>
        </View>
    )     
}
export default MyProgressBar;

const styles = theme => StyleSheet.create({
    outerBar: {
        backgroundColor : theme.colors.SECONDARY,
        width: "100%",
        height: 25,
        borderRadius: 15
    },
    innerBar: {
        alignSelf:"flex-start",
        height: "100%",
        backgroundColor: theme.colors.ACCENT,
        borderRadius: 15,
        shadowOffset: {
            width: 2,
            height: 0
        },
        shadowOpacity: 100,
        shadowRadius: 1,
        shadowColor: theme.colors.TEXT
    }
})