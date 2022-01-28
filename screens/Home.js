import React, { useState, useEffect, useRef, useContext} from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import {PracticeSessions} from '../PracticeSessions'
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PracticeSession from '../components/PracticeSession';
import { VictoryLine, VictoryChart, VictoryTheme, VictoryLabel, VictoryBar, VictoryAxis, VictoryGroup, VictoryArea, VictoryScatter } from 'victory-native';
import Header from '../components/Header';

const Stack = createNativeStackNavigator();
const Home = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerBackVisible: false,
                headerStyle:{backgroundColor: "#E8DCB8"},
            }}
            >
            <Stack.Screen
            name="Main"
            component={MainPage}
            options={{headerTitle: () => <Header name="Practice Sessions"/> }}
            
            >
            </Stack.Screen>
            <Stack.Screen
                name="EditPracticePage"
                component={PracticeSession}
                options={({navigation}) => ({
                    headerTitle: () => <Header name="Edit Practice Session"/> ,
                    headerLeft : () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Main')}
                            style={{position: "absolute", left: 0}}
                        >
                            <Ionicons name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                    )
                })}
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
    const chartTheme = {
        // axis: {
        //     style: {
        //       tickLabels: {
        //         // this changed the color of my numbers to white
        //         fill: 'white',
        //       },
        //       grid : {
        //           stroke : "transparent"
        //       },
        //       dependentAxis: {
        //           fill: "purple"
        //       },
              
        //     },
        //   },
        axis: {
            style: {
                tickLabels: {
                    fill: "white",
                    padding: 5,
                },
                axisLabel: {
                    fill: "white",
                    padding: 30
                },
                grid: {
                    stroke: "transparent",
                    fill:"white"
                }
            }
        }
        
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
                                    <Text style={[styles.statTextColor]}>Last Week</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.statBubble}>
                            <TouchableOpacity
                                onPress={() => {setWeekMonthYear(1)}}
                            >
                                <Text style={styles.statTextColor}>This Month</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.statBubble}>
                            <TouchableOpacity
                            onPress={() => {setWeekMonthYear(2)}}
                            >
                                <Text style={styles.statTextColor}>This Year</Text>
                            </TouchableOpacity>
                        </View>
                </View>
                <View style={{flex: 1, flexDirection: "row", margin: 5}}>
                    <View style={styles.statBubble}>
                            <View style={styles.statBubbleTop}>
                                <Ionicons name="time" size={40} color="black"  /><Text style={[styles.statBubbleHeader, styles.statTextColor]}>Time Practiced</Text>
                            </View>
                            <View>
                                <Text style={[{fontSize: 20, marginLeft:5}, styles.statTextColor]}>{Math.round((timePracticed + Number.EPSILON) * 100) / 100} hrs</Text>
                            </View>
                    </View>
                    <View style={styles.statBubble}>
                        <View style={styles.statBubbleTop}>
                            <Ionicons name="checkmark" size={40} color="green" /><Text style={[styles.statBubbleHeader, styles.statTextColor]}>Average Quality</Text>
                        </View>
                        <View>
                            <Text style={[{fontSize: 20, marginLeft: 5}, styles.statTextColor]} >{Math.round((averageQuality + Number.EPSILON) * 100) / 100}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.myChart}>
                    {
                        chartData !=null && chartData.length > 0  && thisMonthsSessions != null? 
                    
                    <View>
                        <Text style={[styles.chartTitle,styles.statTextColor]} >My Practice Sessions</Text>
                        <VictoryChart
                        width={400}
                        height={230}
                        data={chartData}
                        theme={chartTheme}
                        >
                        <VictoryAxis dependentAxis label="Time (mins)"/>
                        <VictoryAxis label="Date" />
                        {/* <VictoryLabel
                            x={25}
                            y={25}
                            text="Practice Time this Month"
                            style={{color: "white"}}
                        /> */}
                        <VictoryBar
                            data={chartData}
                            // x="x"
                            // y="y"
                            style={{data: {stroke: "gray",fill: "#5F7CA6", width: 8}}}
                        />
                        </VictoryChart>
                    </View>: 
                    <View>

                    </View>

                    }
                </View>
                {
                    thisMonthsSessions?
                    thisMonthsSessions.map((data, index) => 
                    <View key={index}>  
                            <TouchableOpacity
                                    onPress={() => {navigation.navigate(('EditPracticePage'), {data : data})}}
                            >                  
                            <View style={styles.sessions}>
                                    <Text style={{fontSize: 25, color: 'white'}}>Practice Session {makeDateLookNice(data.date)} <TouchableOpacity onPress={() => {deleteFromArray(data.date)}} ><Ionicons name="trash-sharp" size={24} color="white" /></TouchableOpacity></Text>
                                    <Text style={{color: "white"}}>{data.practiceTime} mins</Text>
                               
                            </View>
                            </TouchableOpacity>
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
        backgroundColor: "#15243b",
        // backgroundColor: "#5F7CA6",
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
        // borderWidth: 2,
        // margin: 10,
        borderRadius: 15,
        width: 400,
        height: 280,
        justifyContent: "center",
        backgroundColor: "#15243b",
        alignSelf:"center"
    },
    statBubble: {
        backgroundColor: "#15243b",
        flex: 0.5,
        margin: 10,
        padding: 5,
        borderRadius: 15
    },
    statBubbleTop: {
        flexDirection: "row",
        alignItems :"center",
    },
    statBubbleHeader: {
        fontSize: 21,
    },
    statTextColor: {
        color: "white"
    },
    chartTitle: {
        fontSize: 20,
        marginTop: 5,
        marginBottom: 0,
        marginLeft: 20
    }
});
