import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ScrollView,
  TouchableOpacity,
  Button,
  Pressable,
  Modal,
  Dimensions,
  TextInput,
  Alert,
  ActionSheetIOS,
} from "react-native";
import useTheme from "../myThemes/useTheme";
import useThemedStyles from "../myThemes/useThemedStyles";
import { Ionicons } from "@expo/vector-icons";
import SetListItem from "../components/SetListItem";
import { SetLists } from "../SetLists";
import { PracticeSessions } from "../PracticeSessions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UpdatePState } from "../UpdatePState";
function SetListScreen({ navigation }) {
  const theme = useTheme();
  const style = useThemedStyles(styles);
  const [addSetListModal, setAddSetListModal] = useState(false);
  const [changeDifficultyModal, setChangeDifficultyModal] = useState(false);
  const [changedDifficulty, setChangedDifficulty] = useState(null);
  const [songName, setSongName] = useState(null);
  const [songDifficulty, setSongDifficulty] = useState(null);
  const { setLists, setMySetLists } = useContext(SetLists);
  const { practiceSessions, setPracticeSessions } =
    useContext(PracticeSessions);
  const { updatePState, setUpdatePState } = useContext(UpdatePState);

  const [timesCalled, setTimesCalled] = useState(0);
  const [newSetList, setNewSetList] = useState(null);

  const [currentSong, setCurrentSong] = useState(null);
  function checkIfSongIsAlreadyAdded(newSongName) {
    if (setLists != null) {
      for (var i = 0; i < setLists.length; i++) {
        if (
          setLists[i].songName != null &&
          setLists[i].songName === newSongName
        ) {
          return true;
        }
      }
    }
    return false;
  }
  async function addSong() {
    if (songName != null && songDifficulty != null && songName.length > 0) {
      if (Number(songDifficulty) > 0 && Number(songDifficulty) < 11) {
        if (checkIfSongIsAlreadyAdded(songName) == false) {
          var tempT = setLists;
          if (setLists != null && setLists.length > 0) {
            tempT.push({
              songName: songName,
              songDifficulty: songDifficulty,
              pTime: 0,
            });
          } else {
            tempT = [
              { songName: songName, songDifficulty: songDifficulty, pTime: 0 },
            ];
          }
          setMySetLists(tempT);
          setAddSetListModal(false);
          setSongName(null);
          setSongDifficulty(null);
        } else {
          Alert.alert("Song is already added", "", [
            {
              text: "OK",
            },
          ]);
        }
      } else {
        Alert.alert("Enter a difficulty 1 - 10", "", [
          {
            text: "OK",
          },
        ]);
      }
    } else {
      Alert.alert("Song Name and Song Difficulty Required", "", [
        {
          text: "OK",
        },
      ]);
    }
  }
  function deleteSong(sName) {
    if (setLists != null && setLists.length > 1) {
      var tempS = (setLists) => setLists.filter((el) => el.songName !== sName);
      setNewSetList(tempS);
      setMySetLists(tempS);
    } else {
      setNewSetList(null);
      setMySetLists(null);
    }
  }
  async function changeSongDifficulty() {
    if (
      changedDifficulty != null &&
      Number(changedDifficulty) > 0 &&
      Number(changedDifficulty) < 11
    ) {
      var tempSetList = setLists;
      for (var i = 0; i < tempSetList.length; i++) {
        if (tempSetList[i].songName == currentSong) {
          tempSetList[i].songDifficulty = changedDifficulty;
        }
      }
      setMySetLists(tempSetList);
      setChangeDifficultyModal(false);
      setChangedDifficulty(null);
    } else {
      Alert.alert("Enter Difficulty 1 - 10", "", [
        {
          text: "OK",
        },
      ]);
    }
  }
  async function storeCurrentSetList() {
    if (setLists != null) {
      const jsonValue = JSON.stringify(setLists);
      await AsyncStorage.setItem("setLists", jsonValue);
    }
  }
  const editOrDelete = (songName) =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Change Difficulty", "Delete"],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
        userInterfaceStyle: "light",
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
        } else if (buttonIndex === 2) {
          deleteSong(songName);
        } else if (buttonIndex === 1) {
          setChangeDifficultyModal(true);
          setCurrentSong(songName);
        }
      }
    );
  function calculateThePracticeTimes() {
    var newSetList = setLists;
    if (setLists != null && practiceSessions != null) {
      for (var i = 0; i < newSetList.length; i++) {
        let newA = practiceSessions.filter(
          (o) => o.practiceSong == newSetList[i].songName
        );
        var time = 0;
        if (newA != null && newA.length > 0) {
          for (var p = 0; p < newA.length; p++) {
            if (
              newA[p].practiceTime != null &&
              Number(newA[p].practiceTime) != null
            ) {
              time += Number(newA[p].practiceTime);
            }
          }
        }
        newSetList[i].pTime = time;
      }
      setTimesCalled(timesCalled + 1);
      setMySetLists(newSetList);
      setNewSetList(newSetList);
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      await storeCurrentSetList();
      calculateThePracticeTimes();
    };

    fetchData();
  }, [JSON.stringify(setLists)]);

  useEffect(() => {
    calculateThePracticeTimes();
  }, [JSON.stringify(practiceSessions)]);
  return (
    <View style={style.container}>
      {/* <View style={{width:"100%",alignItems:"center", top: 0}}>
                <AdMobBanner
                    bannerSize="banner"
                    adUnitID={process.env.GOOGLE_ADS_IDENTIFER}
                    onDidFailToReceiveAdWithError={(e) => console.log(e)}
                    servePersonalizedAds={false}
                />
            </View> */}
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={style.myHeader}>
          <Text style={[style.setListText, { color: theme.colors.TEXT }]}>
            Your Songs
          </Text>
        </View>
        {setLists ? (
          setLists.map((data) => (
            <TouchableOpacity
              onPress={() => editOrDelete(data.songName)}
              key={data.songName}
            >
              <SetListItem
                name={data.songName}
                difficulty={data.songDifficulty}
                pTime={data.pTime}
              />
            </TouchableOpacity>
          ))
        ) : (
          <View></View>
        )}
        <Modal
          visible={changeDifficultyModal}
          animationType="slide"
          onRequestClose={() => {
            setChangeDifficultyModal(false);
          }}
          transparent={true}
        >
          <View style={style.addSetListModalStyle}>
            <View
              style={[
                style.changeDifficultyModalStyle,
                { flexDirection: "column", justifyContent: "center" },
              ]}
            >
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <View style={{ flex: 0.6, alignItems: "flex-start" }}>
                  {/* <Text style={style.createSetListTitle}>New Song</Text> */}
                </View>
                <View style={{ flex: 0.4, alignItems: "flex-end" }}>
                  <TouchableOpacity
                    onPress={() => setChangeDifficultyModal(false)}
                    style={{
                      justifyContent: "center",
                      backgroundColor: theme.colors.ACCENT,
                      padding: 10,
                      borderTopRightRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.size.M,
                        color: theme.colors.TEXT,
                      }}
                    >
                      X
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "column",
                  alignSelf: "center",
                  justifyContent: "center",
                  width: "90%",
                  marginTop: 20,
                  marginBottom: 20,
                }}
              >
                <TextInput
                  value={changedDifficulty}
                  onChangeText={setChangedDifficulty}
                  style={style.songInput}
                  maxLength={2}
                  keyboardType="number-pad"
                  placeholder="Difficulty 1 - 10"
                  placeholderTextColor="gray"
                />
              </View>
              <View style={{ justifyContent: "flex-end" }}>
                <View style={style.songButton}>
                  <TouchableOpacity onPress={() => changeSongDifficulty()}>
                    <Text style={style.songButtonText}>
                      Change the Difficulty
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={addSetListModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setAddSetListModal(false);
          }}
        >
          <View style={style.addSetListModalStyle}>
            <View
              style={[
                style.setListModalContainer,
                { flexDirection: "column", justifyContent: "space-around" },
              ]}
            >
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <View style={{ flex: 0.6, alignItems: "flex-start" }}>
                  {/* <Text style={style.createSetListTitle}>New Song</Text> */}
                </View>
                <View style={{ flex: 0.4, alignItems: "flex-end" }}>
                  <TouchableOpacity
                    onPress={() => setAddSetListModal(false)}
                    style={{
                      justifyContent: "center",
                      backgroundColor: theme.colors.ACCENT,
                      padding: 10,
                      borderTopRightRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.size.M,
                        color: theme.colors.TEXT,
                      }}
                    >
                      X
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flexDirection: "column" }}>
                <View
                  style={{
                    flexDirection: "column",
                    width: "90%",
                    alignSelf: "center",
                    margin: 15,
                  }}
                >
                  <View style={{ width: "100%" }}>
                    <Text style={style.songInputText}>Song Name</Text>
                  </View>
                  <View style={{ width: "100%" }}>
                    <TextInput
                      onChangeText={setSongName}
                      value={songName}
                      style={style.songInput}
                      maxLength={30}
                      placeholder="Song Title"
                      placeholderTextColor="gray"
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    width: "90%",
                    alignSelf: "center",
                    margin: 15,
                  }}
                >
                  <View>
                    <Text style={style.songInputText}>Song Difficulty</Text>
                  </View>
                  <View>
                    <TextInput
                      onChangeText={setSongDifficulty}
                      style={style.songInput}
                      value={songDifficulty}
                      maxLength={2}
                      placeholder="Difficulty 1 - 10"
                      placeholderTextColor="gray"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
                <View>
                  <TouchableOpacity
                    style={style.songButton}
                    onPress={() => addSong()}
                  >
                    <Text style={style.songButtonText}>Add Song</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <Pressable
        style={style.addNewSetList}
        onPress={() => {
          setAddSetListModal(true);
        }}
      >
        <View style={{ flex: 0.8 }}>
          <Text
            style={[style.setListText, { color: theme.colors.TEXT_SECONDARY }]}
          >
            Add a Song To Practice
          </Text>
        </View>
        <View
          style={{
            flex: 0.2,
            alignItems: "flex-end",
            marginRight: 5,
            justifyContent: "center",
          }}
        >
          <Ionicons name="add" size={30} color={theme.colors.TEXT_SECONDARY} />
        </View>
      </Pressable>
    </View>
  );
}

export default SetListScreen;

const styles = (theme) =>
  StyleSheet.create({
    createSetListTitle: {
      color: theme.colors.TEXT,
      fontSize: theme.typography.size.SM,
      padding: 6,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.BACKGROUND,
    },
    myHeader: {
      width: "100%",
      padding: 6,
      alignSelf: "center",
    },
    setListContainer: {
      width: "90%",
      backgroundColor: theme.colors.ACCENT,
      borderRadius: 10,
      alignSelf: "center",
      marginBottom: 20,
      flexDirection: "row",
      borderWidth: 2,
    },
    item: {
      padding: 10,
      fontSize: theme.typography.size.M,
      height: 44,
      width: "100%",
      backgroundColor: theme.colors.SECONDARY,
      borderWidth: 2,
      color: theme.colors.TEXT,
    },
    addNewSetList: {
      position: "absolute",
      width: "90%",
      backgroundColor: theme.colors.ACCENT,
      bottom: Dimensions.get("window").height / 10,
      padding: 6,
      borderRadius: 10,
      alignSelf: "center",
      flexDirection: "row",
      flex: 1,
    },
    setListText: {
      color: theme.colors.SECONDARY,
      fontSize: theme.typography.size.SM,
      margin: 10,
      padding: 6,
      fontWeight: "bold",
    },
    addSetListModalStyle: {
      position: "absolute",
      width: "100%",
      justifyContent: "center",
      zIndex: 1000,
      alignItems: "center",
      height: "100%",
    },
    setListModalContainer: {
      backgroundColor: theme.colors.SECONDARY,
      width: Dimensions.get("window").width / 1.3,
      // height: Dimensions.get('window').height / 2.75,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.TEXT,
      zIndex: 10000,
      shadowRadius: 2,
      elevation: 5,
      shadowColor: "black",
      shadowOpacity: 0.8,
      shadowOffset: {
        height: 1,
        width: 0,
      },
    },
    changeDifficultyModalStyle: {
      backgroundColor: theme.colors.SECONDARY,
      width: Dimensions.get("window").width / 1.3,
      // height: Dimensions.get('window').height / 4,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.TEXT,
      zIndex: 10000,
      shadowRadius: 2,
      elevation: 5,
      shadowColor: "black",
      shadowOpacity: 0.8,
      shadowOffset: {
        height: 1,
        width: 0,
      },
    },
    songInput: {
      backgroundColor: theme.colors.TEXT,
      color: theme.colors.TEXT_SECONDARY,
      width: "100%",
      // height: 40,
      fontSize: theme.typography.size.SM,
      alignSelf: "center",
      borderRadius: 10,
      padding: 10,
      // margin: 20
    },
    songInputText: {
      marginBottom: 5,
      fontSize: theme.typography.size.SM,
      color: theme.colors.TEXT,
    },
    songButton: {
      bottom: 0,
      padding: 15,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      width: "100%",
      // position:"absolute",
      backgroundColor: theme.colors.ACCENT,
    },
    songButtonText: {
      fontSize: theme.typography.size.M,
      color: theme.colors.TEXT_SECONDARY,
      fontWeight: "bold",
      textShadowOffset: {
        width: -1,
        height: 1,
      },
      textShadowColor: theme.colors.TEXT,
      textShadowRadius: 0.5,
    },
  });
