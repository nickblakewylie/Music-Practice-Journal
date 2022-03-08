import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Text, View, Button, Platform, StyleSheet, ScrollView, Dimensions, TouchableOpacity, TextInput, Modal, TouchableWithoutFeedback , Alert} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import useTheme from '../myThemes/useTheme';
import useThemedStyles from '../myThemes/useThemedStyles';
import MyProgressBar from '../components/MyProgressBar';
import { PracticeSessions } from '../PracticeSessions';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Progress from 'react-native-progress';
import { useFocusEffect } from '@react-navigation/native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function GoalScreen() {
    const {practiceSessions, setPracticeSessions} = useContext(PracticeSessions)
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();
    const [mode, setMode] = useState('time');
    const [show, setShow] = useState(false);
    const [scheduleTime, setScheduleTime] = useState(new Date());
    const theme = useTheme();
    const style = useThemedStyles(styles);
    const [active, setActive] = useState(0);
    const scrollRef = useRef();
    const [dailyGoalTemp, setDailyGoalTemp] = useState(null)
    const [dailyGoal, setDailyGoal] = useState(null)
    const [weeklyGoalTemp, setWeeklyGoalTemp] = useState(null)
    const [weeklyGoal, setWeeklyGoal] = useState(null)
    const [monthlyGoalTemp, setMonthlyGoalTemp] = useState(null)
    const [monthlyGoal, setMonthlyGoal] = useState(null)
    const [dailyProgressPercent,setDailyProgressPercent] = useState(0)
    const [weeklyProgressPercent, setWeeklyProgressPercent] = useState(0)
    const [monthlyProgressPercent, setMonthlyProgressPercent] = useState(0)
    const [weeklyPracticeMins, setWeeklyPracticeMins] = useState(0)
    const [todaysPracticeMins, setTodaysPracticeMins] = useState(0)
    const [monthlyPracticeMins, setMonthlyPracticeMins] = useState(0)

    const [dailyModal, setDailyModal] = useState(false);
    const [weeklyModal, setWeeklyModal] = useState(false);
    const [monthlyModal, setMonthlyModal] = useState(false)
    const [notificationModal, setNotificationModal] = useState(false)
    // useEffect(() => {
    //     registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    
    //     notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    //       setNotification(notification);
    //     });
    
    //     responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    //       console.log(response);
    //     });
    
    //     return () => {
    //       Notifications.removeNotificationSubscription(notificationListener.current);
    //       Notifications.removeNotificationSubscription(responseListener.current);
    //     };
    //   }, []);  
      const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setScheduleTime(currentDate);
      };
    
      const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
      };
    
      const showTimepicker = () => {
        showMode('time');
      };
      function changeGoal(page){

        scrollRef.current?.scrollTo({
            y : 0,
            x: Dimensions.get('window').width * page,
            animated: false
        });
      }
    const handleScroll = (event) => {
        const positionX = event.nativeEvent.contentOffset.x;
        const positionY = event.nativeEvent.contentOffset.y;
    };
    function getDayNumbersPastWeek(){
      var date = new Date()
      return [date.subtractDays(6),date.subtractDays(5),date.subtractDays(4),date.subtractDays(3),date.subtractDays(2),date.subtractDays(1), date]
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
    function checkifDateIsSame(date1, date2){
      if(date1.getDate() == date2.getDate() &&  date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear()){
        return true
      }else{
        return false
      }
    }
    function checkIfDatesAreSameMonth(date1, date2){
      if(date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear()){
        return true
      }else{
        return false
      }
    }
    function getThisMonthsPracticeMins(){
      if(practiceSessions != null){
        var todaysDate = new Date()
        var thisMonthsSession = practiceSessions.filter(d => checkIfDatesAreSameMonth(new Date(d.date), todaysDate) == true)
        var thisMonthsMins = 0 
        for(var p = 0; p < thisMonthsSession.length; p ++){
          if(thisMonthsSession[p].practiceTime != null && Number(thisMonthsSession[p].practiceTime) != null){
            thisMonthsMins += Number(thisMonthsSession[p].practiceTime)
          }
        }
        setMonthlyPracticeMins(thisMonthsMins)
      }
    }
    function getTodaysPracticeMins(){
      if(practiceSessions != null){
        var todaysDate = new Date();
        var sessionsToday = practiceSessions.filter(d => checkifDateIsSame(new Date(d.date), todaysDate) == true)
        var todaysMins = 0
        for(var j = 0; j < sessionsToday.length; j ++){
          if(sessionsToday[j].practiceTime != null && Number(sessionsToday[j].practiceTime) != null){
            todaysMins += Number(sessionsToday[j].practiceTime)
          }
        }
        setTodaysPracticeMins(todaysMins)
      }
    }
    function getThisWeeksPracticeMins(){
      if(practiceSessions != null){
        var weekDays = getDayNumbersPastWeek()
        var week  = practiceSessions.filter(el => checkIfDateInWeekArray(el.date, weekDays) == true)
        var practiceMins = 0
        for(var i = 0; i < week.length; i ++){
          if(week[i] != null && Number(week[i].practiceTime) != null){
            practiceMins += Number(week[i].practiceTime)
          }
        }
        setWeeklyPracticeMins(practiceMins)
      }
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
 const storeData = async(key,value) => {
    try{
      await AsyncStorage.setItem(key, value)
    }catch(e){
    }
  }
  const getGoals = async() => {
    try{
      const value = await AsyncStorage.getItem('dailyGoal')
      const weeklyG = await AsyncStorage.getItem('weeklyGoal')
      const monthlyG = await AsyncStorage.getItem('monthlyGoal')
      if(value !== null){
        // console.log("Daily Goals value")
        // console.log(value)
        setDailyGoal(value)
        setDailyGoalTemp(value);
        // console.log("daily goal set to " + Number(value))
      }
      if(weeklyG !== null){
        setWeeklyGoal(weeklyG)
        setWeeklyGoalTemp(weeklyG)
      }
      if(monthlyG !== null){
        setMonthlyGoal(monthlyG)
        setMonthlyGoalTemp(monthlyG)
      }
    }catch(e){
    }
  }

  function checkInputsAreCorrect(whichGoal){
    if(whichGoal == 'daily'){
      if(dailyGoal != null && dailyGoal.length > 0 &&  Number(dailyGoal) != 0){
          if( Number.isInteger(Number(dailyGoal)) ){
              return true
          }else{
            Alert.alert("Error", "Enter a number greater than 0", [{
                text : "OK"
            }]) 
            return false
          }
      }else{
          Alert.alert("Error", "Enter a number greater 0", [{
              text : "OK"
          }])
          return false
      }}else if(whichGoal == 'weekly'){
        if(weeklyGoal != null && weeklyGoal.length > 0 &&  Number(weeklyGoal) != 0){
          if( Number.isInteger(Number(weeklyGoal)) ){
              return true
          }else{
            Alert.alert("Error", "Enter a number greater than 0", [{
                text : "OK"
            }]) 
            return false
          }
      }else{
          Alert.alert("Error", "Enter a number greater 0", [{
              text : "OK"
          }])
          return false
        }
      }else if(whichGoal =='monthly'){
        if(monthlyGoal != null && monthlyGoal.length > 0 &&  Number(monthlyGoal) != 0){
          if( Number.isInteger(Number(monthlyGoal)) ){
              return true
          }else{
            Alert.alert("Error", "Enter a number greater than 0", [{
                text : "OK"
            }]) 
            return false
          }
      }else{
          Alert.alert("Error", "Enter a number greater 0", [{
              text : "OK"
          }])
          return false
        }
      }

  }
  async function storeDailyGoals(){
    if(checkInputsAreCorrect('daily') == true){
      setDailyModal(false)
      setDailyGoalTemp(dailyGoal)
      await storeData("dailyGoal", dailyGoal)
    }
  }
  async function storeWeeklyGoals(){
    if(checkInputsAreCorrect('weekly') == true){
      setWeeklyModal(false)
      setWeeklyGoalTemp(weeklyGoal)
      await storeData("weeklyGoal", weeklyGoal)
    }
  }
  async function storeMonthlyGoals(){
    if(checkInputsAreCorrect('monthly') == true){
      setMonthlyModal(false)
      setMonthlyGoalTemp(monthlyGoal)
      await storeData("monthlyGoal", monthlyGoal)
      
    }
  }
  function calculateWeeklyProgressPercent(){
    if(weeklyGoalTemp == 0 || weeklyGoalTemp == null){
      setWeeklyProgressPercent(0)
    }
    else{
      setWeeklyProgressPercent(Math.round(weeklyPracticeMins/(Number(weeklyGoalTemp) * 60) * 10)/ 10)
    }
  }
  function calculateMonthlyProgressPercent(){
    if(monthlyGoalTemp == 0 || monthlyGoalTemp == null){
      setWeeklyProgressPercent(0)
    }
    else{
      setMonthlyProgressPercent(Math.round(monthlyPracticeMins/(Number(monthlyGoalTemp) * 60)* 10) / 10)
    }
  }
  function calculateDailyProgressPercent(){
    if(dailyGoalTemp == 0 || dailyGoalTemp == null){
      setDailyProgressPercent(0)
    }
    else{
      setDailyProgressPercent(Math.round(todaysPracticeMins/Number(dailyGoalTemp) * 10) / 10)
    }
  }
  async function schedulePushNotification() {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "It's time to play some music!",
          body: "",
        },
        trigger: { hour: scheduleTime.getHours(), minute: scheduleTime.getMinutes(), repeats: true}
      });
      setNotificationModal(false)
    }
  
  async function registerForPushNotificationsAsync() {
      let token;
      if (Constants.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert('Failed to get push token for push notification!');
          return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } else {
        alert('Must use physical device for Push Notifications');
      }
    
      if (Platform.OS === 'andriod') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    
      return token;
    }
    useEffect(() => {
      getThisWeeksPracticeMins()
      getTodaysPracticeMins()
      getThisMonthsPracticeMins()
  }, [JSON.stringify(practiceSessions)])
    useEffect(() => {
      getGoals()
      getThisWeeksPracticeMins()
      getTodaysPracticeMins()
      getThisMonthsPracticeMins()
    }, [])
    useEffect(() => {
      calculateWeeklyProgressPercent()
      calculateMonthlyProgressPercent()
      calculateDailyProgressPercent()
    }, [weeklyPracticeMins, todaysPracticeMins, monthlyPracticeMins, dailyGoalTemp, monthlyGoalTemp, weeklyGoalTemp])
    return (
        <View style={style.container}>
                <View style={style.titleContainer}>
                        <TouchableOpacity 
                        style={[style.titleBlock, {backgroundColor : active == 0? theme.colors.SECONDARY: "white", borderWidth: 1, borderColor: theme.colors.ACCENT},{borderTopLeftRadius: 14, borderBottomLeftRadius: 14}]}
                        onPress={() => {setActive(0); changeGoal(0)}}>
                            <Text style={[style.myTitle, {color: active == 0 ? theme.colors.TEXT: theme.colors.TEXT_SECONDARY}]}>Daily</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[style.titleBlock, {backgroundColor :active == 1? theme.colors.SECONDARY: "white", borderWidth: 1, borderColor: theme.colors.ACCENT}]}
                          onPress={() => {setActive(1); changeGoal(1)}}>
                            <Text style={[style.myTitle, {color: active == 1 ? theme.colors.TEXT: theme.colors.TEXT_SECONDARY}]}>Weekly</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[style.titleBlock, {backgroundColor :active == 2? theme.colors.SECONDARY: "white", borderWidth: 1, borderColor: theme.colors.ACCENT}, {borderTopRightRadius: 14, borderBottomRightRadius: 14}]} 
                          onPress={() => {setActive(2); changeGoal(2)}}>
                            <Text style={[style.myTitle, {color: active == 2 ? theme.colors.TEXT: theme.colors.TEXT_SECONDARY}]} >Monthly</Text>
                        </TouchableOpacity>
              </View>
            <ScrollView ref={scrollRef} horizontal={true} decelerationRate={0} snapToAlignment={"center"} snapToInterval={Dimensions.get('window').width} onScroll={event => { 
              // scroll animation ended
              const xA  = event.nativeEvent.contentOffset.x;
              // console.log("window width ");
              // console.log(xA);
              if(xA < Dimensions.get('window').width / 1.3){
                setActive(0);
              }else if(xA >= Dimensions.get('window').width / 1.3 && xA < Dimensions.get('window').width *2 / 1.3){
                setActive(1);
              }
              else if(xA >= Dimensions.get('window').width * 2 / 1.3){
                setActive(2);
              }
              }}
              scrollEventThrottle={200}
              > 
                <View style={{width: Dimensions.get('window').width - 100, marginHorizontal: 50}}>
                    <View
                    style={{
                        flex: 1,
                        alignItems: 'center'
                    }}>
                        {/* <View style={{justifyContent: "center", alignItems:"center", alignContent: "center"}} > */}
                          <View  style={{display:"flex", alignItems: "center", flex: 1}}>
                            <View style={{flex: 0.2}}>
                              <Text style={style.goalHeaderText} >Daily Goal {dailyGoalTemp ? dailyGoalTemp + " mins" :  "mins"}</Text>
                            </View>
                            <View style={{flexDirection:"row", flex: 0.4, justifyContent:"center", alignItems:"center"}}>
                              <View style={{width: Dimensions.get('window').width / 2, justifyContent:"center"}}>
                                <Progress.Circle progress={dailyProgressPercent} formatText={() => todaysPracticeMins + " mins"} showsText={true} size={Dimensions.get('window').width / 2}  borderWidth={3} borderColor={theme.colors.ACCENT} color={theme.colors.TEXT} thickness={15}/>
                              </View>
                            </View>
                            <View style={{flex: 0.2, justifyContent:"flex-end"}}>
                              <TouchableOpacity onPress={() => setDailyModal(true)} style={style.chooseGoalButton}>
                                <Text style={style.buttonText}>Chose Your Practice Goal</Text>
                              </TouchableOpacity>
                            </View>
                              <View style={{flex: 0.2, justifyContent:"flex-start"}} >
                                <Modal
                                  animationType="slide"
                                  transparent={true}
                                  visible={dailyModal}
                                  onRequestClose={() =>
                                    setDailyModal(false)
                                  }>
                                  <TouchableOpacity
                                    activeOpacity={1} 
                                    onPressOut={() => {setDailyModal(false)}}
                                    style={style.modalContainer}
                                  >
                                      <View >
                                        <View style={style.modalInnerContainer}>
                                          <TouchableOpacity onPress={() => setDailyModal(false)} style={{width: "100%", alignItems:"flex-end"}}>
                                            <Text style={{color: theme.colors.BACKGROUND, fontSize: 20}}>X</Text>
                                          </TouchableOpacity>
                                          <TextInput 
                                            placeholder="Enter Minutes Practice Goal"
                                            placeholderTextColor="gray"
                                            keyboardType="number-pad"
                                            style={style.practiceTimeInput}
                                            onChangeText={setDailyGoal}
                                            value={dailyGoal ? dailyGoal.toString() : dailyGoal}
                                            maxLength={3}
                                          />
                                          <Button
                                          title="Set Goal"
                                          style={{width: 200}}
                                          onPress={() => storeDailyGoals()} />
                                          </View>
                                      </View>
                                    </TouchableOpacity>
                                  </Modal>
                                  <Modal 
                                    animationType="slide"
                                    transparent={true}
                                    visible={notificationModal}
                                    onRequestClose={() =>
                                      setNotificationModal(false)
                                    }  
                                  >
                                  <TouchableOpacity
                                    activeOpacity={1} 
                                    onPressOut={() => {setNotificationModal(false)}}
                                    style={style.modalContainer}
                                  >
                                  <View style={style.modalInnerContainer}>
                                      <TouchableOpacity onPress={() => setNotificationModal(false)} style={{width: "100%", alignItems:"flex-end"}}>
                                          <Text style={{color: theme.colors.BACKGROUND, fontSize: 20}}>X</Text>
                                        </TouchableOpacity>
                                      <DateTimePicker
                                      testID="dateTimePicker"
                                      value={scheduleTime}
                                      mode={mode}
                                      is24Hour={true}
                                      display="inline"
                                      onChange={onChange}
                                      themeVariant="light"
                                      // style={{width: 80, height: 100, display: "flex"}}
                                      />
                                      <TouchableOpacity onPress={() =>schedulePushNotification()} style={{backgroundColor: theme.colors.ACCENT, borderRadius:15, padding: 10}} >
                                        <Text style={style.buttonText}>Schedule Notification</Text>
                                      </TouchableOpacity>
                                  </View>
                                  </TouchableOpacity>
                                  </Modal>
                                  {/* <Button 
                                  title="Schedule Practice Time"
                                  onPress={() =>setNotificationModal(true)}
                                  /> */}
                            </View>
                            </View>
                        </View>
                </View>
                <View style={{width: Dimensions.get('window').width - 100 ,marginHorizontal: 50}}>
                  <View style={{display:"flex", alignItems: "center", flex: 1}}>
                        <View style={{flex:0.2}}>
                            <Text style={style.goalHeaderText} >Weekly Goal {weeklyGoalTemp ? weeklyGoalTemp + " hrs" : "not set" } </Text>   
                        </View>
                        <View style={{flexDirection:"row", flex: 0.4, justifyContent:"center"}}>
                              <View style={{width: Dimensions.get('window').width / 2, justifyContent:"center"}}>
                                <Progress.Circle progress={weeklyProgressPercent} formatText={() => Math.round((weeklyPracticeMins / 60) * 100) / 100+ " hrs"} showsText={true} size={Dimensions.get('window').width / 2}  borderWidth={3} borderColor={theme.colors.ACCENT} color={theme.colors.TEXT} thickness={15}/>
                              </View>
                            </View>
                        <View style={{flex:0.2, justifyContent:"flex-end"}}>
                              <TouchableOpacity onPress={() => setWeeklyModal(true)} style={style.chooseGoalButton}>
                                <Text style={style.buttonText}>Chose Your Practice Goal</Text>
                              </TouchableOpacity>
                            </View>
                              <View >
                                <Modal
                                  animationType="slide"
                                  transparent={true}
                                  visible={weeklyModal}
                                  onRequestClose={() =>
                                    setWeeklyModal(false)
                                  }>
                                  <TouchableOpacity
                                    activeOpacity={1} 
                                    onPressOut={() => {setWeeklyModal(false)}}
                                    style={style.modalContainer}
                                  >
                                      <View >
                                        <View style={style.modalInnerContainer}>
                                          <TouchableOpacity onPress={() => setWeeklyModal(false)} style={{width: "100%", alignItems:"flex-end"}}>
                                            <Text style={{color: theme.colors.BACKGROUND, fontSize: 20}}>X</Text>
                                          </TouchableOpacity>
                                          <TextInput 
                                            placeholder="Hrs"
                                            placeholderTextColor="gray"
                                            keyboardType="number-pad"
                                            style={style.practiceTimeInput}
                                            onChangeText={setWeeklyGoal}
                                            value={weeklyGoal ? weeklyGoal.toString() : weeklyGoal}
                                            maxLength={2}
                                          />
                                          <Button
                                          title="Set Goal"
                                          style={{width: 200}}
                                          onPress={() => storeWeeklyGoals()} />
                                          </View>
                                      </View>
                                    </TouchableOpacity>
                                  </Modal>
                            </View>
                            <View style={{flex:0.2}}>

                            </View>
                  </View>
                </View>
                <View style={{width: Dimensions.get('window').width - 100 , marginHorizontal: 50}}>
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center'
                    }}>
                        <View style={{flex: 0.2}}>
                            <Text style={style.goalHeaderText} >Monthly Goal {monthlyGoalTemp ? monthlyGoalTemp + " hrs" :  " not set"}</Text>
                        </View>
                        <View style={{flexDirection:"row", flex: 0.4}}>
                              <View style={{width: Dimensions.get('window').width / 2, justifyContent:"center"}}>
                                <Progress.Circle progress={monthlyProgressPercent} formatText={() => Math.round((monthlyPracticeMins / 60) * 100)/ 100 + " hrs"} showsText={true} size={Dimensions.get('window').width / 2}  borderWidth={3} borderColor={theme.colors.ACCENT} color={theme.colors.TEXT} thickness={15}/>
                              </View>
                          </View>
                        <View style={{flex: 0.2, justifyContent:"flex-end"}}>
                              <TouchableOpacity onPress={() => setMonthlyModal(true)} style={style.chooseGoalButton}>
                                <Text style={style.buttonText} >Chose Your Practice Goal</Text>
                              </TouchableOpacity>
                            </View>
                              <View >
                                <Modal
                                  animationType="slide"
                                  transparent={true}
                                  visible={monthlyModal}
                                  onRequestClose={() =>
                                    setMonthlyModal(false)
                                  }>
                                  <TouchableOpacity
                                    activeOpacity={1} 
                                    onPressOut={() => {setMonthlyModal(false)}}
                                    style={style.modalContainer}
                                  >
                                      <View >
                                        <View style={style.modalInnerContainer}>
                                          <TouchableOpacity onPress={() => setMonthlyModal(false)} style={{width: "100%", alignItems:"flex-end"}}>
                                            <Text style={{color: theme.colors.BACKGROUND, fontSize: 20}}>X</Text>
                                          </TouchableOpacity>
                                          <TextInput 
                                            placeholder="Hrs"
                                            placeholderTextColor="gray"
                                            keyboardType="number-pad"
                                            style={style.practiceTimeInput}
                                            onChangeText={setMonthlyGoal}
                                            value={monthlyGoal ? monthlyGoal.toString() : monthlyGoal}
                                            maxLength={2}
                                          />
                                          <Button
                                          title="Set Goal"
                                          style={{width: 200, backgroundColor: theme.colors.ACCENT}}
                                          onPress={() => storeMonthlyGoals()} />
                                          </View>
                                      </View>
                                    </TouchableOpacity>
                                  </Modal>
                            </View>
                            <View style={{flex:0.2}}>
                            </View>
                      </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default GoalScreen


const styles = theme => StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#1F3659",
        alignItems: 'center',
        justifyContent: 'center',
        color: "#CF5C36",
      },
    myTitle : {
        color: theme.colors.TEXT_SECONDARY,
        fontSize: theme.typography.size.SM,
        textAlign: "center",
    },
    titleContainer :{
        flexDirection: "row",
        width: "90%",
        alignContent: "flex-end",
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: "white",
        borderRadius: 15
    },
    titleBlock : {
        width: "33.333%",
        padding: 10
    },
    modalContainer: {
      justifyContent: "center", 
      alignItems: "center", 
      flex: 1,
      zIndex: 100
    },
    modalInnerContainer: {
      width: 275, 
      backgroundColor: "white", 
      alignContent:"center", 
      padding: 20,
      borderRadius: 15
    },
    practiceTimeInput: {
      fontSize: theme.typography.size.SM,
    },
    chooseGoalButton: {
      width: 200,
      backgroundColor: theme.colors.ACCENT,
      borderRadius: 15,
      padding: 10
    },
    buttonText: {
      color: theme.colors.TEXT_SECONDARY,
      textAlign:"center",
      // fontSize:16 
      fontSize: theme.typography.size.S
    },
    goalHeaderText: {
      fontSize: theme.typography.size.M,
      color: theme.colors.TEXT
    }
})