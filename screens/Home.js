import React, { useState, useEffect, useRef, useContext} from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Button, Platform} from 'react-native';
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
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    const weekday = ["Sun","Mon","Tue","Wed","Thur","Fri","Sat"];
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
    function getDayNumbersPastWeek(){
        var date = new Date()
        // if(d > 7){
        //     return [d, d-1, d-2, d - 3, d -4, d-5, d-6]
        // }else{
        //     const pastMonth = months.indexOf(currentMonth) - 1
        //     if (pastMonth  == 11){
        //         pastMonth = 0
        //     }
        //     const daysInPastMonth = getDaysInMonth(pastMonth, new Date().getFullYear())
        //     const difference = d - 6;
        //     var newArray = []
        //     for(var i = daysInPastMonth + difference; i <= daysInPastMonth ; i++){
        //         newArray.push({day : i, month : pastMonth})
        //     }
        //     for(var j = 1; j <= d;j ++){
        //         newArray.push({day:j, month: pastMonth + 1})
        //     }
        //     return newArray
        // }
        // var result = new Da
        return [date.subtractDays(6),date.subtractDays(5),date.subtractDays(4),date.subtractDays(3),date.subtractDays(2),date.subtractDays(1), date]
    }
    function checkIfDateInWeekArray(currentDay, weekDays){
        const tempD = new Date(currentDay)
        for(var i = 0; i < weekDays.length; i ++){
            var weekDay = new Date(weekDays[i])
            if(tempD.getDate() == weekDay.getDate() && tempD.getFullYear() ==  weekDay.getFullYear() &&  tempD.getMonth() == weekDay.getMonth()){
                // console.log("this is true")
                return true
            }
        }
    }
    function getThisMonthsPracticeSessions(){
        if(currentMonth != null && practiceSessions != null && practiceSessions.length > 0 ){
            // show Week bit tricky will work on it later
            var weekDays = getDayNumbersPastWeek()
            if(weekMonthYear == 0){
                console.log(weekDays)
                var week  = practiceSessions.filter(el => checkIfDateInWeekArray(el.date, weekDays) == true)
                setThisMonthsSessions(week)
            }
            else if(weekMonthYear == 1){
                // show Month
                var t = practiceSessions.filter(el => (months[new Date(el.date).getMonth()] == currentMonth && new Date(el.date).getFullYear() == new Date().getFullYear()))
                setThisMonthsSessions(t)
            }
            // show Year
            else{
                var temp = practiceSessions.filter(el => new Date(el.date).getFullYear() == new Date().getFullYear())
                setThisMonthsSessions(temp)
            }
        }
        else{
            // console.log("practice Sessions deleted")
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
            if(thisMonthsSessions != null){
                for(var i = 0; i < thisMonthsSessions.length; i ++){
                    // var pDate = months[new Date(practiceSessions[i].date).getMonth()]
                    // if(pDate == currentMonth){
                        if(Number(thisMonthsSessions[i].practiceTime) != null){
                            timePracticed += Number(thisMonthsSessions[i].practiceTime)
                        }
                        if(Number(thisMonthsSessions[i].quality) != null){
                            amountOfSession ++;
                            quality += Number(thisMonthsSessions[i].quality)
                        }
                    // }
                }
            }
            // console.log("time practiced changed")
            // console.log(timePracticed)
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
        // getTimePracticed()
        getThisMonthsPracticeSessions()
    }, [practiceSessions])
    useEffect(() => {
        // getTimePracticed()
        getThisMonthsPracticeSessions()
    }, [currentMonth])
    useEffect(() => {
        getTimePracticed()
        calculateChartData()
    }, [thisMonthsSessions])
    useEffect(() => {
        // getTimePracticed()
        getThisMonthsPracticeSessions()
    }, [weekMonthYear])
    useEffect(() => {
        // console.log("loaded")
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
        const theCurrentDate = new Date()
        var tempData = []
        if(practiceSessions != null && thisMonthsSessions != null){
            // week selected
            if(weekMonthYear == 0){
                tempData.push({x : weekday[theCurrentDate.subtractDays(6).getDay()], y: findPracticeSessionForDay(theCurrentDate.subtractDays(6).getDate(),theCurrentDate.subtractDays(6).getMonth(), theCurrentDate.subtractDays(6).getFullYear())})
                tempData.push({x : weekday[theCurrentDate.subtractDays(5).getDay()],y: findPracticeSessionForDay(theCurrentDate.subtractDays(5).getDate(),theCurrentDate.subtractDays(5).getMonth(), theCurrentDate.subtractDays(5).getFullYear())})
                tempData.push({x : weekday[theCurrentDate.subtractDays(4).getDay()],y: findPracticeSessionForDay(theCurrentDate.subtractDays(4).getDate(),theCurrentDate.subtractDays(4).getMonth(), theCurrentDate.subtractDays(4).getFullYear()) })
                tempData.push({x : weekday[theCurrentDate.subtractDays(3).getDay()], y: findPracticeSessionForDay(theCurrentDate.subtractDays(3).getDate(),theCurrentDate.subtractDays(3).getMonth(), theCurrentDate.subtractDays(3).getFullYear())})
                tempData.push({x : weekday[theCurrentDate.subtractDays(2).getDay()], y: findPracticeSessionForDay(theCurrentDate.subtractDays(2).getDate(),theCurrentDate.subtractDays(2).getMonth(), theCurrentDate.subtractDays(2).getFullYear())})
                tempData.push({x : weekday[theCurrentDate.subtractDays(1).getDay()], y: findPracticeSessionForDay(theCurrentDate.subtractDays(1).getDate(),theCurrentDate.subtractDays(1).getMonth(), theCurrentDate.subtractDays(1).getFullYear())})
                tempData.push({x : weekday[theCurrentDate.getDay()],y: findPracticeSessionForDay(theCurrentDate.getDate(),theCurrentDate.getMonth(), theCurrentDate.getFullYear())})
            }else if(weekMonthYear == 1){
                for(var i = 1; i < daysInMonth; i++){
                    const y = findPracticeSessionForDay(i,months.indexOf(currentMonth), year)
                    // console.log(y)
                    tempData.push({x: i , y : y})
                }
            //     // year
            }else if(weekMonthYear == 2){
                for(var monthCount = 0; monthCount < 12; monthCount ++){
                    var newMonthS = monthCount.toString()
                    if( monthCount < 10){
                        newMonthS= "0" + monthCount
                    }
                    // const dateS = 
                    var dateString = year.toString() + "-" + newMonthS + "-01"
                    const dateS = new Date(year.toString() + "-" + newMonthS + "-01")
                    // console.log(dateS)
                    tempData.push({x : shortMonths[monthCount], y: findPracticeTimeForMonth(monthCount, year)})
                }
            }
            setChartData(tempData)
        }
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
                    padding: 10,
                },
                axisLabel: {
                    fill: "white",
                    padding: 36
                },
                grid: {
                    stroke: "transparent",
                    fill:"white"
                },
                axis : {
                    stroke: "transparent"
                }
            }
        }
        
    }
    if(practiceSessions != null){
        return(
            <ScrollView style={{backgroundColor: "#1F3659", marginBottom: 80}} automaticallyAdjustContentInsets={false}>
                <View style={{flex: 1, flexDirection: "row", margin: 5, marginBottom: 0}}>
                        <View style={[styles.statBubble, weekMonthYear == 0? styles.acticeColor : ""]}>
                            <TouchableOpacity 
                                onPress={() => {setWeekMonthYear(0)}}
                            >
                                <View style={[styles.statBubbleTop]}>
                                    <Text style={[weekMonthYear == 0 ? {color: "black"} : styles.statTextColor,  styles.statFont]}>Last Week</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.statBubble, weekMonthYear == 1? styles.acticeColor : ""]}>
                            <TouchableOpacity
                                onPress={() => {setWeekMonthYear(1)}}
                            >
                                <Text style={[weekMonthYear == 1? {color: "black"} : styles.statTextColor, styles.statFont, ]}>This Month</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.statBubble, weekMonthYear == 2? styles.acticeColor : ""]}>
                            <TouchableOpacity
                            onPress={() => {setWeekMonthYear(2)}}
                            >
                                <Text style={[weekMonthYear == 2? {color: "black"} : styles.statTextColor, styles.statFont]}>This Year</Text>
                            </TouchableOpacity>
                        </View>
                </View>
                <View style={{flex: 1, flexDirection: "row", margin: 5, marginTop: 0}}>
                    <View style={styles.statBubble}>
                            <View style={styles.statBubbleTop}>
                                <Ionicons name="time" size={30} color="white"  /><Text style={[styles.statBubbleHeader, styles.statTextColor]}>Time Practiced</Text>
                            </View>
                            <View>
                                <Text style={[{fontSize: 18, marginLeft:5}, styles.statTextColor]}>{Math.round((timePracticed + Number.EPSILON) * 100) / 100} hrs</Text>
                            </View>
                    </View>
                    <View style={styles.statBubble}>
                        <View style={styles.statBubbleTop}>
                            <Ionicons name="checkmark" size={30} color="green" /><Text style={[styles.statBubbleHeader, styles.statTextColor]}>Average Quality</Text>
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
                        // data={chartData}
                        theme={chartTheme}
                        >
                        <VictoryAxis dependentAxis={true} label="Time (mins)"/>
                        { weekMonthYear == 1?
                        <VictoryAxis label={currentMonth}  /> : <VictoryAxis /> 
                        }
                        <VictoryBar
                            data={chartData}
                            style={{data: {stroke: "gray",fill: "#5F7CA6", width: 10}}}
                            // labels={datum => datum.toString()}
                            // labelComponent={<VictoryLabel y={250} verticalAnchor={"start"} />}
                        />
                        </VictoryChart>
                    </View>: 
                    <View>

                    </View>

                    }
                </View>
                <View style={styles.practiceSessionHeader}> 
                    <Text style={[styles.statText, styles.practiceSessionHeaderText]}>Practice Session</Text>
                </View>
                {
                    thisMonthsSessions?
                    thisMonthsSessions.map((data, index) => 
                    <View key={index}>  
                            <TouchableOpacity
                                    onPress={() => {navigation.navigate(('EditPracticePage'), {data : data})}}
                            >                  
                            <View style={styles.sessions}>
                                    <View style={{flex: 1, flexDirection: "row"}}>
                                        <Text style={{fontSize: 25, color: 'white', flex: 0.5}}>{makeDateLookNice(data.date)}</Text>
                                        <View style={{alignItems: "flex-end", flex: 0.5}}>
                                            <TouchableOpacity onPress={() => {deleteFromArray(data.date)}} ><Ionicons name="trash-sharp" size={24} color="white" /></TouchableOpacity>
                                        </View>
                                    </View>
                                    <Text style={{color: "white", fontSize: 15}}>{data.practiceTime} mins</Text>
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
        padding: 6,
        borderRadius: 15
    },
    statBubbleTop: {
        flexDirection: "row",
        alignItems :"center",
    },
    acticeColor: {
        backgroundColor: "white"
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
    },
    statFont: {
        fontSize : 18
    },
    practiceSessionHeader:{
        margin: 10,
        padding: 5
    },
    practiceSessionHeaderText: {
        fontSize: 25
    }
});
