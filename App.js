import * as React from 'react';
import { Text, View, StyleSheet, ImageBackground, Image, TouchableOpacity, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import ThemeProvider from './myThemes/ThemeProvider';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {PracticeSessions} from './PracticeSessions';
import {SetLists} from './SetLists';
import AddPractice from './screens/AddPractice';
import Home from './screens/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './components/Header';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import PracticeSession from './components/PracticeSession';
import GoalScreen from './screens/GoalScreen';
import { Feather } from '@expo/vector-icons'; 
import { Foundation } from '@expo/vector-icons'; 
import useTheme from './myThemes/useTheme';
import useThemedStyles from './myThemes/useThemedStyles';
import SetListScreen from './screens/SetListScreen';
function SetList() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Your Set List</Text>
    </View>
  );
}
function BookShelf(){
  return (
    <View style={{ flex: 1, flexDirection: "column"}}>
      <Text>Hello</Text>
    </View>
  )
}
const Tab = createBottomTabNavigator();

function HomeTabs({route}){
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
    const theme = useTheme();
    const style = useThemedStyles(styles);
  return(
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'ios-home-sharp': 'ios-home-outline';
        } else if (route.name === 'Set List') {
          iconName = focused ?'list': 'list-outline';
        } else if (route.name === 'Add Practice'){
          iconName = focused ? 'add' : 'add-outline';
        }else if(route.name === 'Goal'){
          return <Feather name="target" size={size} color={color} />
        }

        // You can return any component that you like here!
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.BACKGROUND,
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { position: 'absolute' },
      tabBarBackground: () => (
        <View style={style.absoluteFill} />
      ),
      headerStyle:{backgroundColor: theme.colors.ACCENT}
    })}
  >
    <Tab.Screen name="Add Practice" options={{headerTitle: () => <Header name="Music Tracker" />}}  component={AddPractice} />
    <Tab.Screen name="Home" component={Home} options={{
      headerTitle: () => <Header name="Home" /> 
    }} />
    <Tab.Screen name="Goal" options={{headerTitle: () => <Header name="Goals"/>}} component={GoalScreen} />
    <Tab.Screen name="Set List" options={{headerTitle: () => <Header name="Set List" />}}  component={SetListScreen} />
  </Tab.Navigator>
  )

}
const RootStack = createNativeStackNavigator();
export default function App() {
  const [practiceSessions, setPracticeSessions] = React.useState(null);
  const [setLists, setMySetLists] = React.useState(null);
  const setListValue = React.useMemo(() => ({setLists, setMySetLists}), [setLists, setMySetLists]);
  const providerValue = React.useMemo(() => ({practiceSessions, setPracticeSessions}), [practiceSessions, setPracticeSessions]);
  const getData = async() => {
    console.log("Screen loaded")
    var getPracticeSession = await AsyncStorage.getItem('practiceSessions');
    getPracticeSession = getPracticeSession != null ? JSON.parse(getPracticeSession) : null
    var getSetLists = await AsyncStorage.getItem('setLists');
    getSetLists = getSetLists != null ? JSON.parse(getSetLists): null
    setMySetLists(getSetLists)
    setPracticeSessions(getPracticeSession)
    console.log("Get Set Lists ")
    console.log(getSetLists)
}
  React.useEffect( () => {
    getData()
  }, [])
  return (
    <NavigationContainer>
      <PracticeSessions.Provider value={providerValue}>
      <SetLists.Provider value={setListValue} >
        <ThemeProvider>
        <RootStack.Navigator>
          <RootStack.Screen name="HomePage" component={HomeTabs} options={{headerShown: false}}/>
          <RootStack.Screen name="EditPracticePage" component={PracticeSession} options={({navigation}) => ({
                    headerShown: false
                })}
                />
        </RootStack.Navigator>
        </ThemeProvider>
        </SetLists.Provider>
      </PracticeSessions.Provider>
    </NavigationContainer>
  );
}
const styles = theme => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteFill : {
    backgroundColor: theme.colors.ACCENT,
    width : "100%",
    height: 100
  }
});