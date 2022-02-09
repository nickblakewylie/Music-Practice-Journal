import * as React from 'react';
import { Text, View, StyleSheet, ImageBackground, Image, TouchableOpacity, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {PracticeSessions} from './PracticeSessions';
import AddPractice from './screens/AddPractice';
import Home from './screens/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './components/Header';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import PracticeSession from './components/PracticeSession';
// function HomeScreen() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Home page</Text>
//     </View>
//   );
// }
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
        }

        // You can return any component that you like here!
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#1F3659',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { position: 'absolute' },
      tabBarBackground: () => (
        <View style={styles.absoluteFill} />
      ),
      headerStyle:{backgroundColor: "#E8DCB8"}
    })}
  >
    <Tab.Screen name="Add Practice" options={{headerTitle: () => <Header name="Music Tracker" />}}  component={AddPractice} />
    <Tab.Screen name="Home" component={Home} options={{
      headerTitle: () => <Header name="Home" /> 
    }} />
    <Tab.Screen name="Set List" options={{headerTitle: () => <Header name="Set List" />}}  component={SetList} />
  </Tab.Navigator>
  )

}
const RootStack = createNativeStackNavigator();
export default function App() {
  const [practiceSessions, setPracticeSessions] = React.useState(null);
  const providerValue = React.useMemo(() => ({practiceSessions, setPracticeSessions}), [practiceSessions, setPracticeSessions]);
  const getData = async() => {
    console.log("Screen loaded")
    var getPracticeSession = await AsyncStorage.getItem('practiceSessions');
    getPracticeSession = getPracticeSession != null ? JSON.parse(getPracticeSession) : null
    setPracticeSessions(getPracticeSession)
    console.log(getPracticeSession)
}
  React.useEffect( () => {
    getData()
  }, [])
  return (
    <NavigationContainer>
      <PracticeSessions.Provider value={providerValue}>
        <RootStack.Navigator>
          <RootStack.Screen name="HomePage" component={HomeTabs} options={{headerShown: false}}/>
          <RootStack.Screen name="EditPracticePage" component={PracticeSession} options={({navigation}) => ({
                    // headerTitle: () => <Header name="Edit Practice" withBack="true"/> ,
                    // headerTitleAlign:"center",
                    // headerTitleVisible: false,
                    // headerBackVisible:false,
                    // headerBackTitleVisible:false,
                    // headerLeft: () => (
                    //     <TouchableOpacity
                    //         onPress={() => navigation.navigate('Main')}
                    //         style={{position: "absolute"}}
                    //     >
                    //         <Ionicons name="arrow-back" size={24} color="black" />
                    //     </TouchableOpacity>
                    // ),
                    // headerRight: () => (
                    //   <TouchableOpacity 
                    //       >
                    //       <Ionicons name="pencil" size={24} color="black" />
                    //   </TouchableOpacity>
                    // ),
                    // headerStyle:{backgroundColor: "#E8DCB8"}
                    headerShown: false
                })}
                />
        </RootStack.Navigator>
      </PracticeSessions.Provider>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteFill : {
    backgroundColor: "#E8DCB8",
    width : "100%",
    height: 100
  }
});