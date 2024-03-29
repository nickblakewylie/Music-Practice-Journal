import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PracticeSessions } from "../PracticeSessions";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
} from "victory-native";
import useTheme from "../myThemes/useTheme";
import useThemedStyles from "../myThemes/useThemedStyles";

const Stack = createNativeStackNavigator();
const Home = () => {
  const theme = useTheme();
  const style = useThemedStyles(styles);
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackVisible: false,
        headerStyle: { backgroundColor: theme.colors.ACCENT },
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainPage}
        options={{ headerShown: false }}
      ></Stack.Screen>
    </Stack.Navigator>
  );
};
const MainPage = ({ navigation, route }) => {
  const theme = useTheme();
  const style = useThemedStyles(styles);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const shortMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
  const [timePracticed, setTimePracticed] = useState(null);
  const { practiceSessions, setPracticeSessions } =
    useContext(PracticeSessions);
  const [currentMonth, setCurrentMonth] = useState(
    months[new Date().getMonth()]
  );
  const [averageQuality, setAverageQuality] = useState(null);
  const [thisMonthsSessions, setThisMonthsSessions] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [weekMonthYear, setWeekMonthYear] = useState(0);
  const [updated, setUpdated] = useState(0);
  const slideIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(
    new Animated.Value(Dimensions.get("window").width / 2)
  ).current;
  const wave1 = useRef(
    new Animated.Value(Dimensions.get("window").width / 2)
  ).current;
  const wave2 = useRef(
    new Animated.Value(Dimensions.get("window").width / 2)
  ).current;
  const wave3 = useRef(
    new Animated.Value(Dimensions.get("window").width / 2)
  ).current;
  const wave4 = useRef(
    new Animated.Value(Dimensions.get("window").width / 2)
  ).current;

  function makeDateLookNice(date) {
    var myDate = new Date(date);
    const nicelookingDate =
      months[myDate.getMonth()] +
      " " +
      myDate.getDate() +
      ", " +
      myDate.getFullYear();
    return nicelookingDate;
  }
  async function deletePracticeSession(date) {
    const tempArray = (practiceSessions) =>
      practiceSessions.filter((el) => el.date !== date);
    setPracticeSessions(tempArray);
  }
  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  Date.prototype.subtractDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() - days);
    return date;
  };
  function getDayNumbersPastWeek() {
    var date = new Date();
    return [
      date.subtractDays(6),
      date.subtractDays(5),
      date.subtractDays(4),
      date.subtractDays(3),
      date.subtractDays(2),
      date.subtractDays(1),
      date,
    ];
  }
  function checkIfDateInWeekArray(currentDay, weekDays) {
    const tempD = new Date(currentDay);
    for (var i = 0; i < weekDays.length; i++) {
      var weekDay = new Date(weekDays[i]);
      if (
        tempD.getDate() == weekDay.getDate() &&
        tempD.getFullYear() == weekDay.getFullYear() &&
        tempD.getMonth() == weekDay.getMonth()
      ) {
        // console.log("this is true")
        return true;
      }
    }
  }
  function getThisMonthsPracticeSessions() {
    if (
      currentMonth != null &&
      practiceSessions != null &&
      practiceSessions.length > 0
    ) {
      // show Week bit tricky will work on it later
      var weekDays = getDayNumbersPastWeek();
      if (weekMonthYear == 0) {
        var week = practiceSessions.filter(
          (el) => checkIfDateInWeekArray(el.date, weekDays) == true
        );
        sortPracticeSessionsByDate(week);
        // setThisMonthsSessions(week)
      } else if (weekMonthYear == 1) {
        // show Month
        var t = practiceSessions.filter(
          (el) =>
            months[new Date(el.date).getMonth()] == currentMonth &&
            new Date(el.date).getFullYear() == new Date().getFullYear()
        );
        sortPracticeSessionsByDate(t);
        setThisMonthsSessions(t);
      }
      // show Year
      else {
        var temp = practiceSessions.filter(
          (el) => new Date(el.date).getFullYear() == new Date().getFullYear()
        );
        sortPracticeSessionsByDate(temp);
      }
    } else {
      setThisMonthsSessions(null);
    }
    setUpdated(Math.random() * 1000);
  }
  async function updatePracticeSessionStorage() {
    await AsyncStorage.setItem(
      "practiceSessions",
      JSON.stringify(practiceSessions)
    );
  }
  function getTimePracticed() {
    if (practiceSessions == null) {
      return;
    } else if (currentMonth != null) {
      var timePracticed = 0;
      var quality = 0;
      var amountOfSession = 0;
      if (thisMonthsSessions != null) {
        for (var i = 0; i < thisMonthsSessions.length; i++) {
          // var pDate = months[new Date(practiceSessions[i].date).getMonth()]
          // if(pDate == currentMonth){
          if (Number(thisMonthsSessions[i].practiceTime) != null) {
            timePracticed += Number(thisMonthsSessions[i].practiceTime);
          }
          if (Number(thisMonthsSessions[i].quality) != null) {
            amountOfSession++;
            quality += Number(thisMonthsSessions[i].quality);
          }
          // }
        }
      }
      setTimePracticed(timePracticed / 60);
      if (amountOfSession > 0) {
        setAverageQuality(quality / amountOfSession);
      } else {
        setAverageQuality(0);
      }
    }
  }
  function getYYYYMMDDdate() {
    var myDate = new Date();
    const niceDate =
      myDate.getFullYear() +
      "-" +
      myDate.getMonth() +
      1 +
      "-" +
      myDate.getDate();
    return niceDate;
  }
  // useEffect(() =>{
  //     updatePracticeSessionStorage()
  //     getThisMonthsPracticeSessions()
  //     console.log("called")
  // }, [updated != null])
  function onStartAnimations() {
    Animated.parallel([
      Animated.timing(slideIn, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.stagger(200, [
        Animated.timing(wave1, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(wave2, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(wave3, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(wave4, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }
  function slideUpAnimation() {
    Animated.timing(slideUp, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }
  function sortPracticeSessionsByDate(sessions) {
    var newA = sessions;
    newA.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
    setThisMonthsSessions(newA);
  }

  useEffect(() => {
    updatePracticeSessionStorage();
    getThisMonthsPracticeSessions();
  }, [JSON.stringify(practiceSessions)]);
  useEffect(() => {
    // getTimePracticed()
    getThisMonthsPracticeSessions();
  }, [currentMonth]);
  useEffect(() => {
    getTimePracticed();
    calculateChartData();
  }, [thisMonthsSessions]);
  useEffect(() => {
    // getTimePracticed()
    getThisMonthsPracticeSessions();
  }, [weekMonthYear]);
  useEffect(() => {
    // console.log("loaded")
    getThisMonthsPracticeSessions();
    onStartAnimations();
  }, []);

  function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }
  function dateIsTheSame(dateString, day, month, year) {
    var tempDate = new Date(dateString);
    if (tempDate.getDate() != day) {
      return false;
    } else if (tempDate.getMonth() != month) {
      return false;
    } else if (tempDate.getFullYear() != year) {
      return false;
    }
    return true;
  }
  // gets day integer and month and year integers and checks to see if the practice session exists
  function findPracticeSessionForDay(day, month, year) {
    if (thisMonthsSessions != null) {
      var obj = thisMonthsSessions.filter(
        (o) => dateIsTheSame(o.date, day, month, year) == true
      );
      if (obj != null) {
        if (obj.length > 0) {
          var pTime = 0;
          for (var i = 0; i < obj.length; i++) {
            if (Number(obj[i].practiceTime) != null) {
              pTime += Number(obj[i].practiceTime);
            }
          }
          return pTime;
        }
      }
    }
    return 0;
  }
  function findPracticeTimeForMonth(month, year) {
    const theDaysInMonth = getDaysInMonth(month, year);
    var sum = 0;
    for (var i = 1; i <= theDaysInMonth; i++) {
      const tempPT = findPracticeSessionForDay(i, month, year);
      sum += tempPT;
    }
    return sum;
  }
  function getDayOfPractice(date) {
    var tempD = new Date(date);
    return tempD.getDate();
  }
  function calculateChartData() {
    const theDay = new Date().getDate();
    const year = new Date().getFullYear();
    const daysInMonth = getDaysInMonth(months.indexOf(currentMonth), year);
    const theCurrentDate = new Date();
    var tempData = [];
    if (practiceSessions != null && thisMonthsSessions != null) {
      // week selected
      if (weekMonthYear == 0) {
        tempData.push({
          x: weekday[theCurrentDate.subtractDays(6).getDay()],
          y: findPracticeSessionForDay(
            theCurrentDate.subtractDays(6).getDate(),
            theCurrentDate.subtractDays(6).getMonth(),
            theCurrentDate.subtractDays(6).getFullYear()
          ),
          label: findPracticeSessionForDay(
            theCurrentDate.subtractDays(6).getDate(),
            theCurrentDate.subtractDays(6).getMonth(),
            theCurrentDate.subtractDays(6).getFullYear()
          ).toString(),
        });
        tempData.push({
          x: weekday[theCurrentDate.subtractDays(5).getDay()],
          y: findPracticeSessionForDay(
            theCurrentDate.subtractDays(5).getDate(),
            theCurrentDate.subtractDays(5).getMonth(),
            theCurrentDate.subtractDays(5).getFullYear()
          ),
          label: findPracticeSessionForDay(
            theCurrentDate.subtractDays(5).getDate(),
            theCurrentDate.subtractDays(5).getMonth(),
            theCurrentDate.subtractDays(5).getFullYear()
          ).toString(),
        });
        tempData.push({
          x: weekday[theCurrentDate.subtractDays(4).getDay()],
          y: findPracticeSessionForDay(
            theCurrentDate.subtractDays(4).getDate(),
            theCurrentDate.subtractDays(4).getMonth(),
            theCurrentDate.subtractDays(4).getFullYear()
          ),
          label: findPracticeSessionForDay(
            theCurrentDate.subtractDays(4).getDate(),
            theCurrentDate.subtractDays(4).getMonth(),
            theCurrentDate.subtractDays(4).getFullYear()
          ).toString(),
        });
        tempData.push({
          x: weekday[theCurrentDate.subtractDays(3).getDay()],
          y: findPracticeSessionForDay(
            theCurrentDate.subtractDays(3).getDate(),
            theCurrentDate.subtractDays(3).getMonth(),
            theCurrentDate.subtractDays(3).getFullYear()
          ),
          label: findPracticeSessionForDay(
            theCurrentDate.subtractDays(3).getDate(),
            theCurrentDate.subtractDays(3).getMonth(),
            theCurrentDate.subtractDays(3).getFullYear()
          ).toString(),
        });
        tempData.push({
          x: weekday[theCurrentDate.subtractDays(2).getDay()],
          y: findPracticeSessionForDay(
            theCurrentDate.subtractDays(2).getDate(),
            theCurrentDate.subtractDays(2).getMonth(),
            theCurrentDate.subtractDays(2).getFullYear()
          ),
          label: findPracticeSessionForDay(
            theCurrentDate.subtractDays(2).getDate(),
            theCurrentDate.subtractDays(2).getMonth(),
            theCurrentDate.subtractDays(2).getFullYear()
          ).toString(),
        });
        tempData.push({
          x: weekday[theCurrentDate.subtractDays(1).getDay()],
          y: findPracticeSessionForDay(
            theCurrentDate.subtractDays(1).getDate(),
            theCurrentDate.subtractDays(1).getMonth(),
            theCurrentDate.subtractDays(1).getFullYear()
          ),
          label: findPracticeSessionForDay(
            theCurrentDate.subtractDays(1).getDate(),
            theCurrentDate.subtractDays(1).getMonth(),
            theCurrentDate.subtractDays(1).getFullYear()
          ).toString(),
        });
        tempData.push({
          x: weekday[theCurrentDate.getDay()],
          y: findPracticeSessionForDay(
            theCurrentDate.getDate(),
            theCurrentDate.getMonth(),
            theCurrentDate.getFullYear()
          ),
          label: findPracticeSessionForDay(
            theCurrentDate.getDate(),
            theCurrentDate.getMonth(),
            theCurrentDate.getFullYear()
          ).toString(),
        });
        var notEmpty = 0;
        for (var p = 0; p < tempData.length; p++) {
          if (tempData[p].y != 0) {
            notEmpty++;
            break;
          }
        }
        if (notEmpty == 0) {
          tempData = null;
        }
      } else if (weekMonthYear == 1) {
        for (var i = 1; i < daysInMonth; i++) {
          const y = findPracticeSessionForDay(
            i,
            months.indexOf(currentMonth),
            year
          );
          // console.log(y)
          tempData.push({ x: i, y: y, label: y.toString() });
        }
        //     // year
      } else if (weekMonthYear == 2) {
        for (var monthCount = 0; monthCount < 12; monthCount++) {
          var newMonthS = monthCount.toString();
          if (monthCount < 10) {
            newMonthS = "0" + monthCount;
          }
          // const dateS =
          var dateString = year.toString() + "-" + newMonthS + "-01";
          const dateS = new Date(year.toString() + "-" + newMonthS + "-01");
          // console.log(dateS)
          tempData.push({
            x: shortMonths[monthCount],
            y:
              Math.round(
                (findPracticeTimeForMonth(monthCount, year) / 60 +
                  Number.EPSILON) *
                  100
              ) / 100,
            label: (
              Math.round(
                (findPracticeTimeForMonth(monthCount, year) / 60 +
                  Number.EPSILON) *
                  100
              ) / 100
            ).toString(),
          });
        }
      }
      setChartData(tempData);
    }
  }
  const chartTheme = {
    axis: {
      style: {
        tickLabels: {
          fill: theme.colors.TEXT,
          padding: 14,
        },
        axisLabel: {
          fill: theme.colors.TEXT,
          padding: 37,
        },
        grid: {
          stroke: "transparent",
          fill: theme.colors.TEXT,
        },
        axis: {
          stroke: "transparent",
        },
      },
    },
  };
  // if(practiceSessions != null){
  return (
    <Animated.ScrollView
      style={{ backgroundColor: theme.colors.BACKGROUND }}
      contentContainerStyle={{ paddingBottom: 80 }}
      automaticallyAdjustContentInsets={false}
    >
      {/* <View style={{width:"100%",alignItems:"center", top: 0}}>
                    <AdMobBanner
                    bannerSize="banner"
                    adUnitID={process.env.GOOGLE_ADS_IDENTIFER}
                    onDidFailToReceiveAdWithError={(e) => console.log(e)}
                    />

                </View> */}
      <Animated.View>
        <Animated.View
          style={{
            width: "90%",
            flexDirection: "row",
            alignSelf: "center",
            opacity: slideIn,
            transform: [{ translateY: wave1 }],
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setWeekMonthYear(0);
            }}
            style={[
              style.statBubble,
              weekMonthYear == 0 ? style.acticeColor : "",
              { marginRight: 5 },
            ]}
          >
            <Text
              style={[
                weekMonthYear == 0
                  ? { color: theme.colors.TEXT_SECONDARY }
                  : style.statTextColor,
                style.statFont,
              ]}
            >
              Last Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setWeekMonthYear(1);
            }}
            style={[
              style.statBubble,
              weekMonthYear == 1 ? style.acticeColor : "",
              { marginRight: 5 },
            ]}
          >
            <Text
              style={[
                weekMonthYear == 1
                  ? { color: theme.colors.TEXT_SECONDARY }
                  : style.statTextColor,
                style.statFont,
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setWeekMonthYear(2);
            }}
            style={[
              style.statBubble,
              weekMonthYear == 2 ? style.acticeColor : "",
            ]}
          >
            <Text
              style={[
                weekMonthYear == 2
                  ? { color: theme.colors.TEXT_SECONDARY }
                  : style.statTextColor,
                style.statFont,
              ]}
            >
              This Year
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={{
            width: "90%",
            alignSelf: "center",
            flexDirection: "row",
            marginTop: 0,
            alignItems: "center",
            marginBottom: 5,
            opacity: slideIn,
            transform: [{ translateY: wave2 }],
          }}
        >
          <View style={[style.statBubble, { marginRight: 5 }]}>
            <View style={style.statBubbleTop}>
              <Ionicons
                name="time"
                size={theme.typography.size.L}
                color="white"
              />
              <Text style={[style.statBubbleHeader, style.statTextColor]}>
                Time Practiced
              </Text>
            </View>
            <View>
              <Text
                style={[
                  { fontSize: theme.typography.size.SM, marginLeft: 5 },
                  style.statTextColor,
                ]}
              >
                {Math.round((timePracticed + Number.EPSILON) * 100) / 100} hrs
              </Text>
            </View>
          </View>
          <View style={[style.statBubble, { marginLeft: 5 }]}>
            <View style={style.statBubbleTop}>
              <Ionicons
                name="checkmark"
                size={theme.typography.size.L}
                color="green"
              />
              <Text style={[style.statBubbleHeader, style.statTextColor]}>
                Average Quality
              </Text>
            </View>
            <View>
              <Text
                style={[
                  { fontSize: theme.typography.size.SM, marginLeft: 5 },
                  style.statTextColor,
                ]}
              >
                {Math.round((averageQuality + Number.EPSILON) * 100) / 100}
              </Text>
            </View>
          </View>
        </Animated.View>
        <Animated.View
          style={{ opacity: slideIn, transform: [{ translateY: wave3 }] }}
        >
          <View
            style={{
              width: "90%",
              backgroundColor: theme.colors.SECONDARY,
              borderRadius: 10,
              borderWidth: 2,
              padding: 10,
              alignSelf: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              {chartData != null &&
              chartData.length > 0 &&
              thisMonthsSessions != null ? (
                <View
                  style={{
                    alignItems: "center",
                    width: "100%",
                    flexDirection: "column",
                  }}
                >
                  <View style={{ width: "100%", alignItems: "center" }}>
                    <Text
                      style={[
                        style.chartTitle,
                        style.statTextColor,
                        { textAlign: "left" },
                      ]}
                    >
                      My Practice Sessions
                    </Text>
                  </View>
                  <View
                    style={{
                      alignSelf: "center",
                      width: "100%",
                      alignItems: "right",
                      alignContent: "center",
                    }}
                  >
                    <VictoryChart
                      width={Dimensions.get("window").width * 0.85}
                      height={Dimensions.get("window").height / 3.7}
                      // data={chartData}
                      theme={chartTheme}
                    >
                      <VictoryAxis
                        dependentAxis={true}
                        label={
                          weekMonthYear != 2 ? "Time (mins)" : "Time (hrs)"
                        }
                      />
                      {weekMonthYear == 1 ? (
                        <VictoryAxis label={currentMonth} />
                      ) : (
                        <VictoryAxis />
                      )}
                      <VictoryBar
                        data={chartData}
                        style={{
                          data: { stroke: theme.colors.TEXT, fill: "#5F7CA6" },
                          labels: {
                            fontSize: theme.typography.size.SM,
                            fill: "black",
                          },
                        }}
                        // labels={datum => datum.toString()}
                        labelComponent={
                          <VictoryTooltip
                            renderInPortal={false}
                            style={{
                              fontSize: theme.typography.size.SM,
                              padding: 3,
                            }}
                          />
                        }
                        // animate={{
                        //     duration: 200,
                        //     onLoad: {duration: 2000}
                        // }}
                        // style={{
                        //     data: {fill: "tomato", width: 20}
                        //   }}
                      />
                    </VictoryChart>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    width: Dimensions.get("window").width * 0.85,
                    height: Dimensions.get("window").height / 3.7,
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: theme.typography.size.SM * 8,
                      height: theme.typography.size.SM * 8,
                      alignSelf: "center",
                      backgroundColor: theme.colors.TEXT_SECONDARY,
                      borderRadius: 1000000,
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        transform: [{ rotate: "45deg" }],
                        width: "100%",
                        borderBottomWidth: theme.typography.size.XXXS,
                        borderColor: theme.colors.THIRD,
                      }}
                    ></View>
                    <Text
                      style={[
                        style.statText,
                        style.practiceSessionHeaderText,
                        {
                          position: "absolute",
                          textAlign: "center",
                          alignSelf: "center",
                        },
                      ]}
                    >
                      No Data
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          {thisMonthsSessions != null ? (
            <View style={style.practiceSessionHeader}>
              <Text style={[style.statText, style.practiceSessionHeaderText]}>
                Practice Session
              </Text>
            </View>
          ) : (
            <View></View>
          )}
        </Animated.View>
        <Animated.View
          style={{ opacity: slideIn, transform: [{ translateY: wave4 }] }}
        >
          {thisMonthsSessions ? (
            thisMonthsSessions.map((data, index) => (
              <View key={index}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("EditPracticePage", { data: data });
                  }}
                >
                  <View style={style.sessions}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.typography.size.SM,
                          color: theme.colors.TEXT,
                          flex: 0.8,
                          alignSelf: "center",
                          paddingLeft: 10,
                        }}
                      >
                        {makeDateLookNice(data.date)}
                      </Text>
                      <View
                        style={{
                          alignItems: "center",
                          flex: 0.2,
                          backgroundColor: "white",
                          alignContent: "center",
                          justifyContent: "center",
                          borderTopRightRadius: 9,
                          borderBottomRightRadius: 9,
                          borderWidth: 1,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.TEXT_SECONDARY,
                            fontSize: theme.typography.size.SM,
                            textAlign: "center",
                            fontWeight: "600",
                          }}
                        >
                          {data.practiceTime}
                        </Text>
                        <Text
                          style={{
                            color: theme.colors.TEXT_SECONDARY,
                            fontSize: theme.typography.size.SM,
                            textAlign: "center",
                            fontWeight: "600",
                          }}
                        >
                          {" "}
                          mins
                        </Text>
                      </View>
                    </View>
                    {/* <Text style={{color: "white", fontSize: 15}}>{data.practiceTime} mins</Text> */}
                  </View>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View></View>
          )}
        </Animated.View>
      </Animated.View>
    </Animated.ScrollView>
  );
};

export default Home;

const styles = (theme) =>
  StyleSheet.create({
    video: {
      width: Dimensions.get("window").width,
      height: 400,
    },
    dateHeader: {
      // fontSize: 25,
      fontSize: theme.typography.size.M,
    },
    pSessionContainer: {
      backgroundColor: "white",
      borderWidth: 2,
    },
    sessions: {
      backgroundColor: theme.colors.SECONDARY,
      // borderWidth: 1,
      // margin: 10,
      width: "90%",
      alignSelf: "center",
      marginTop: 10,
      marginBottom: 10,
      // padding: 5,
      borderRadius: 10,
      borderWidth: 2,
      // height: 60
    },
    statsContainer: {
      flex: 1,
      marginLeft: 15,
    },
    statText: {
      color: theme.colors.TEXT,
      // fontSize: 20,
      fontSize: theme.typography.size.M,
    },
    myChart: {
      padding: 5,
      // borderWidth: 2,
      // margin: 10,
      borderRadius: 10,
      margin: 10,
      width: 400,
      height: 250,
      justifyContent: "center",
      backgroundColor: theme.colors.SECONDARY,
      alignSelf: "center",
    },
    statBubble: {
      backgroundColor: theme.colors.SECONDARY,
      flex: 0.5,
      marginBottom: 10,
      marginTop: 10,
      padding: 10,
      borderRadius: 10,
      borderWidth: 2,
      // shadowColor:theme.colors.TEXT,
      // shadowOffset: {
      //     width: 2,
      //     height: 2
      // },
      // shadowOpacity: 0.5,
      // shadowRadius: 0.8
    },
    statBubbleTop: {
      flexDirection: "row",
      alignItems: "center",
    },
    acticeColor: {
      backgroundColor: "white",
    },
    statBubbleHeader: {
      // fontSize: 21
      fontSize: theme.typography.size.SM,
    },
    statTextColor: {
      color: theme.colors.TEXT,
    },
    chartTitle: {
      // fontSize: 20,
      fontSize: theme.typography.size.SM,
      marginTop: 0,
      marginBottom: -25,
    },
    statFont: {
      fontSize: theme.typography.size.SM - 1,
      textAlign: "center",
    },
    practiceSessionHeader: {
      // margin: 10,
      width: "90%",
      alignSelf: "center",
      marginTop: 5,
      marginBottom: 5,
    },
    practiceSessionHeaderText: {
      fontSize: theme.typography.size.M,
    },
  });
