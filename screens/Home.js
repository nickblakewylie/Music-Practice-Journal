import React, { useState, useEffect, useRef, useContext} from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import {PracticeSessions} from '../PracticeSessions'
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PracticeSession from '../components/PracticeSession';
import { VictoryLine, VictoryChart, VictoryTheme, VictoryLabel } from 'victory-native';

const Stack = createNativeStackNavigator();
const Home = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}
            >
            <Stack.Screen
            name="Main"
            component={MainPage}
            >
            </Stack.Screen>
            <Stack.Screen
                name="EditPracticePage"
                component={PracticeSession}
            >
            </Stack.Screen>
        </Stack.Navigator>
    )
}
const MainPage = ({navigation})  => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September','October', 'November', 'December']
    const [timePracticed, setTimePracticed] = useState(null);
    const {practiceSessions, setPracticeSessions} = useContext(PracticeSessions)
    const [currentMonth, setCurrentMonth] = useState(months[new Date().getMonth()])
    const [averageQuality, setAverageQuality] = useState(null);
    const [thisMonthsSessions, setThisMonthsSessions] = useState(null)
    const [chartData, setChartData] = useState(null)
    // weekMonthYear 0 = week, 1 = month, 2 = year
    const [weekMonthYear, setWeekMonthYear] = useState(0)
    function makeDateLookNice(date){
        var myDate = new Date(date)
        const nicelookingDate = months[myDate.getMonth()] + " " + myDate.getDate() + ", " + myDate.getFullYear() 
        return nicelookingDate
    }
    async function deletePracticeSession(date){
        const tempArray = (practiceSessions => practiceSessions.filter((el) => el.date !== date))
        setPracticeSessions(tempArray)
    }
    function getDayNumbersPastWeek(){
        var d = new Date().getDate()
        if(d > 7){
            return [d, d-1, d-2, d - 3, d -4, d-5, d-6]
        }else{
            const pastMonth = months.indexOf(currentMonth)
            const daysInPastMonth = getDaysInMonth(pastMonth, new Date().getFullYear())
            const difference = Math.abs(d - 7);
            var newArray = []
            for(var i = daysInPastMonth + difference; i < daysInPastMonth ; i++){
                newArray.push({day : i, month : pastMonth})
            }
            for(var j = 0; j < d;j ++){
                newArray.push({day:i, month: pastMonth + 1})
            }
            return newArray
        }
    }
    function checkIfDateInWeekArray(currentDay, weekDays){
        const tempD = new Date(currentDay)
        for(var i = 0; i < weekDays.length; i ++){
            if(tempD.getDate() == weekDays[i]){
                console.log("this is true")
                return true
            }
        }
    }
    function getThisMonthsPracticeSessions(){
        if(currentMonth != null && practiceSessions != null && practiceSessions.length > 0 ){
            // show Week bit tricky will work on it later
            var weekDays = getDayNumbersPastWeek()
            console.log(weekDays)
            console.log("trying to get this months practice sessions")
            if(weekMonthYear == 0){
                var week  = practiceSessions.filter(el => checkIfDateInWeekArray(el.date, weekDays) == true)
                setThisMonthsSessions(week)
            }
            else if(weekMonthYear == 1){
                // show Month
                var t = practiceSessions.filter(el => months[new Date(el.date).getMonth()] == currentMonth)
                setThisMonthsSessions(t)
            }
            // show Year
            else{
                var temp = practiceSessions.filter(el => new Date(el.date).getFullYear() == new Date().getFullYear())
                setThisMonthsSessions(temp)
            }
        }
        else{
            console.log("practice Sessions deleted")
            setThisMonthsSessions(null)
        }
    }
    function deleteFromArray(date){
        deletePracticeSession(date)
    }
    async function updatePracticeSessionStorage(){
        await AsyncStorage.setItem('practiceSessions', JSON.stringify(practiceSessions));
    }
    function getTimePracticed(){
        if(practiceSessions == null){
            return 
        }else if(currentMonth != null){
            var timePracticed = 0;
            var quality = 0;
            var amountOfSession = 0;
            for(var i = 0; i < practiceSessions.length; i ++){
                var pDate = months[new Date(practiceSessions[i].date).getMonth()]
                if(pDate == currentMonth){
                    if(Number(practiceSessions[i].practiceTime) != null){
                        timePracticed += Number(practiceSessions[i].practiceTime)
                    }
                    if(Number(practiceSessions[i].quality) != null){
                        amountOfSession ++;
                        quality += Number(practiceSessions[i].quality)
                    }
                }
            }
            setTimePracticed(timePracticed / 60)
            if(amountOfSession > 0){
                setAverageQuality(quality / amountOfSession);
            } else{
                setAverageQuality(0)
            }
        }
    }
    function getYYYYMMDDdate(){
        var myDate = new Date()
        const niceDate = myDate.getFullYear() + "-" + myDate.getMonth() + 1 + "-" + myDate.getDate()
        return niceDate
    }
    useEffect(() => {
        updatePracticeSessionStorage()
        getTimePracticed()
        getThisMonthsPracticeSessions()
    }, [practiceSessions])
    useEffect(() => {
        getTimePracticed()
        getThisMonthsPracticeSessions()
    }, [currentMonth])
    useEffect(() => {
        calculateChartData()
    }, [thisMonthsSessions])
    useEffect(() => {
        getThisMonthsPracticeSessions()
    }, [weekMonthYear])
    useEffect(() => {
        console.log("loaded")
        getThisMonthsPracticeSessions()
    }, [])
    function getDaysInMonth(month, year){
        return new Date(year, month, 0).getDate();
    }
    function dateIsTheSame(dateString, day, month, year){
        var tempDate = new Date(dateString)
        if(tempDate.getDate() != day){
            return false
        }else if(tempDate.getMonth() != month){
            return false
        }else if(tempDate.getFullYear() != year){
            return false
        }
        return true
    }
    // gets day integer and month and year integers and checks to see if the practice session exists
    function findPracticeSessionForDay(day, month, year){
        if(thisMonthsSessions != null){
            var obj = thisMonthsSessions.filter(o => (dateIsTheSame(o.date, day,month, year) == true));
            if(obj != null){
                if(obj.length > 0){
                    var pTime = 0
                    for(var i = 0; i < obj.length; i ++){
                        if(Number(obj[i].practiceTime) != null){
                            pTime += Number(obj[i].practiceTime)
                        }
                    }
                    return pTime
                }
            }
        }
        return 0
    }
    function findPracticeTimeForMonth(month, year){
        const theDaysInMonth = getDaysInMonth(month,year)
        var sum = 0;
        for(var i = 1; i <= theDaysInMonth; i ++){
            const tempPT = findPracticeSessionForDay(i, month, year);
            sum += tempPT
        }
        return sum
    }
    function getDayOfPractice(date){
        var tempD = new Date(date)
        return tempD.getDate()
    }
    function calculateChartData(){
        const theDay = new Date().getDate()
        const year = new Date().getFullYear()
        const daysInMonth = getDaysInMonth(months.indexOf(currentMonth), year);
        var tempData = []
        if(practiceSessions != null){
            // week selected
            if(weekMonthYear == 0){
                if(theDay > 6){
                    for(var i = theDay - 6; i <= theDay; i ++){
                        tempData.push({x: Math.floor(i), y: findPracticeSessionForDay(i,months.indexOf(currentMonth), year)})
                    }
                }
                // this is for the case that it is beginning of month
                else{
                    var otherMonth = months.indexOf(currentMonth);
                    var newY = year
                    if(otherMonth == -1){
                        newY = newY - 1;
                        otherMonth = 11
                    }
                // using 0 indexed months
                }
                // month 
            }else if(weekMonthYear == 1){
                for(var i = 1; i < daysInMonth; i++){
                    const y = findPracticeSessionForDay(i,months.indexOf(currentMonth), year)
                    console.log(y)
                    tempData.push({x: i , y : y})
                }
                // year
            }else{
                for(var monthCount = 0; monthCount < 12; monthCount ++){
                    var tempMonth = monthCount + 1;
                    if( tempMonth < 10){
                        tempMonth = "0" + tempMonth
                    }
                    const dateS = new Date(year.toString() + "-" + tempMonth + "-17")
                    console.log(dateS)
                    tempData.push({x : dateS, y: findPracticeTimeForMonth(monthCount, year)})
                }
            }
        }
        setChartData(tempData)
    }

    if(practiceSessions != null){
        return(
            <ScrollView style={{backgroundColor: "#1F3659"}}>
                <View style={{flex: 1, flexDirection: "row", margin: 5}}>
                        <View style={styles.statBubble}>
                            <TouchableOpacity 
                                onPress={() => {setWeekMonthYear(0)}}
                            >
                                <View style={styles.statBubbleTop}>
                                    <Text>Last Week</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.statBubble}>
                            <TouchableOpacity
                                onPress={() => {setWeekMonthYear(1)}}
                            >
                                <Text>This Month</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.statBubble}>
                            <TouchableOpacity
                            onPress={() => {setWeekMonthYear(2)}}
                            >
                                <Text>This Year</Text>
                            </TouchableOpacity>
                        </View>
                </View>
                <View style={{flex: 1, flexDirection: "row", margin: 5}}>
                    <View style={styles.statBubble}>
                            <View style={styles.statBubbleTop}>
                                <Ionicons name="time" size={40} color="black"  /><Text style={styles.statBubbleHeader}>Time Practiced</Text>
                            </View>
                            <View>
                                <Text style={{fontSize: 20, marginLeft:5}}>{Math.round((timePracticed + Number.EPSILON) * 100) / 100} hrs</Text>
                            </View>
                    </View>
                    <View style={styles.statBubble}>
                        <View style={styles.statBubbleTop}>
                            <Ionicons name="checkmark" size={40} color="green" /><Text style={styles.statBubbleHeader}>Average Quality</Text>
                        </View>
                        <View>
                            <Text style={{fontSize: 20, marginLeft: 5}} >{Math.round((averageQuality + Number.EPSILON) * 100) / 100}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.myChart}>
                    {
                        chartData !=null && chartData.length > 0  && thisMonthsSessions != null? 
                    <VictoryChart
                    width={400}
                    height={275}
                    theme={VictoryTheme.grayscale}
                    data={chartData}
                    >
                    <VictoryLabel 
                        x={25}
                        y={25}
                        text="Practice Time this Month"
                    />
                    <VictoryLine
                        data={chartData}
                        x="x"
                        y="y"
                    />
                    </VictoryChart>: 
                    <View>

                    </View>

                    }
                </View>
                {/* <Calendar
                style={{
                    borderWidth: 1,
                    borderColor: 'gray',
                    height: 350
                }}
                theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#b6c1cd',
                    textSectionTitleDisabledColor: '#d9e1e8',
                    selectedDayBackgroundColor: '#00adf5',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#00adf5',
                    dayTextColor: '#2d4150',
                    textDisabledColor: '#d9e1e8',
                    dotColor: '#00adf5',
                    selectedDotColor: '#ffffff',
                    arrowColor: 'orange',
                    disabledArrowColor: '#d9e1e8',
                    monthTextColor: 'blue',
                    indicatorColor: 'blue',
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 16
                  }}
                    // Initially visible month. Default = now
                    // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
                    minDate={'2012-05-10'}
                    // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
                    maxDate={getYYYYMMDDdate()}
                    // Handler which gets executed on day press. Default = undefined
                    onDayPress={day => {
                        console.log('selected day', day);
                    }}
                    // Handler which gets executed on day long press. Default = undefined
                    onDayLongPress={day => {
                        console.log('selected day', day);
                    }}
                    // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                    monthFormat={'yyyy MM'}
                    // Handler which gets executed when visible month changes in calendar. Default = undefined
                    onMonthChange={month => {
                        setCurrentMonth(months[month.month - 1])
                        console.log('month changed', month);
                    }}
                    // Hide month navigation arrows. Default = false
                    hideArrows={true}
                    // Replace default arrows with custom ones (direction can be 'left' or 'right')
                    renderArrow={direction => <Arrow />}
                    // Do not show days of other months in month page. Default = false
                    hideExtraDays={true}
                    // If hideArrows = false and hideExtraDays = false do not switch month when tapping on greyed out
                    // day from another month that is visible in calendar page. Default = false
                    disableMonthChange={true}
                    // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday
                    firstDay={0}
                    // Hide day names. Default = false
                    hideDayNames={false}
                    // Show week numbers to the left. Default = false
                    showWeekNumbers={false}
                    // Handler which gets executed when press arrow icon left. It receive a callback can go back month
                    onPressArrowLeft={subtractMonth => subtractMonth()}
                    // Handler which gets executed when press arrow icon right. It receive a callback can go next month
                    onPressArrowRight={addMonth => addMonth()}
                    // Disable left arrow. Default = false
                    disableArrowLeft={false}
                    // Disable right arrow. Default = false
                    disableArrowRight={false}
                    // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
                    disableAllTouchEventsForDisabledDays={true}
                    // Replace default month and year title with custom one. the function receive a date as parameter
                    renderHeader={date => {
                    return <Text style={styles.dateHeader}>{months[date.getMonth()]} {date.getFullYear()}</Text>
                    }}
                    // Enable the option to swipe between months. Default = false
                    enableSwipeMonths={true}
                    /> */}

                {
                    thisMonthsSessions?
                    thisMonthsSessions.map((data, index) => 
                    <View key={index}>  
                            <TouchableOpacity
                                    onPress={() => {navigation.navigate(('EditPracticePage'), {data : data})}}
                            >                  
                            <View style={styles.sessions}>
                                    <Text style={{fontSize: 25, color: 'white'}}>Practice Session {makeDateLookNice(data.date)} <TouchableOpacity onPress={() => {deleteFromArray(data.date)}} ><Ionicons name="trash-sharp" size={24} color="#1F3659" /></TouchableOpacity></Text>
                                    <Text style={{color: "#1F3659"}}>{data.practiceTime} mins</Text>
                               
                            </View>
                            </TouchableOpacity>
                            {/* <View style={styles.pSessionContainer}>
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
                        </View> */}
                    </View>
                    ): <View></View>
                }
            </ScrollView>
        )
    }
    return (
        <View>
            <Text>Home</Text>
        </View>
    )
}

export default Home

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
        borderWidth: 1,
        margin: 10,
        padding: 5,
        borderRadius: 10
    },
    statsContainer:{
        flex: 1,
        marginLeft: 15
    },
    statText: {
        color: "white",
        fontSize: 20,
    },
    myChart: {
        padding: 5,
        borderWidth: 2,
        backgroundColor: "#768ca3",
        margin: 10,
        borderRadius: 15,
        width: 400,
        height: 280,
        justifyContent: "center"
    },
    statBubble: {
        backgroundColor: "white",
        flex: 0.5,
        margin: 10,
        padding: 5,
        borderRadius: 15
    },
    statBubbleTop: {
        flexDirection: "row",
        alignItems :"center"
    },
    statBubbleHeader: {
        fontSize: 21,
    }
});
