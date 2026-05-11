import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Appearance,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

/* DEFAULT AVATARS */
const defaultAvatars = [
  require("../assets/default-avatars/avatar1.png"),
  require("../assets/default-avatars/avatar2.png"),
  require("../assets/default-avatars/avatar3.png"),
  require("../assets/default-avatars/avatar.png"),
];

export default function SettingsScreen() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [currency, setCurrency] = useState("₹");
  const [darkMode, setDarkMode] = useState(
    Appearance.getColorScheme() === "dark"
  );

  /* Listen to system theme */
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setDarkMode(colorScheme === "dark");
    });
    return () => sub.remove();
  }, []);

  /* Load saved data */
  useEffect(() => {
    (async () => {
      const n = await AsyncStorage.getItem("userName");
      const a = await AsyncStorage.getItem("avatar");
      const c = await AsyncStorage.getItem("currency");
      if (n) setName(n);
      if (a) setAvatar(a);
      if (c) setCurrency(c);
    })();
  }, []);

  /* Save profile */
  const saveProfile = async () => {
    await AsyncStorage.setItem("userName", name);
    if (avatar) await AsyncStorage.setItem("avatar", avatar);
    await AsyncStorage.setItem("currency", currency);
    alert("Profile updated successfully");
  };

  /* Pick from gallery */
  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) setAvatar(res.assets[0].uri);
  };

  /* Avatar source */
  const avatarSource = avatar
    ? { uri: avatar }
    : defaultAvatars[0];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#121212" : "#f4f6fb" },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* HEADER */}
        <Text
          style={[
            styles.title,
            { color: darkMode ? "#fff" : "#000" },
          ]}
        >
          Settings
        </Text>

        {/* PROFILE CARD */}
        <View
          style={[
            styles.card,
            { backgroundColor: darkMode ? "#1e1e1e" : "#fff" },
          ]}
        >
          <View style={styles.avatarWrapper}>
            <Image source={avatarSource} style={styles.avatar} />
            <TouchableOpacity
              style={styles.editIcon}
              onPress={pickFromGallery}
            >
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {name ? (
            <Text
              style={[
                styles.profileName,
                { color: darkMode ? "#fff" : "#000" },
              ]}
            >
              {name}
            </Text>
          ) : null}

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#888"
            style={[
              styles.input,
              {
                backgroundColor: darkMode ? "#2a2a2a" : "#f2f2f2",
                color: darkMode ? "#fff" : "#000",
              },
            ]}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
            <Text style={styles.saveText}>Save Profile</Text>
          </TouchableOpacity>
        </View>

        {/* PREFERENCES */}
        <View
          style={[
            styles.card,
            { backgroundColor: darkMode ? "#1e1e1e" : "#fff" },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: darkMode ? "#fff" : "#000" },
            ]}
          >
            Preferences
          </Text>

          <Text style={styles.label}>Currency</Text>
          <View
            style={[
              styles.pickerBox,
              { backgroundColor: darkMode ? "#2a2a2a" : "#f2f2f2" },
            ]}
          >
            <Picker
              selectedValue={currency}
              onValueChange={setCurrency}
              style={{ color: darkMode ? "#fff" : "#000" }}
            >
              <Picker.Item label="₹ Indian Rupee" value="₹" />
            </Picker>
          </View>
        </View>

        {/* DEVELOPER */}
        <View
          style={[
            styles.card,
            styles.center,
            { backgroundColor: darkMode ? "#1e1e1e" : "#fff" },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: darkMode ? "#fff" : "#000" },
            ]}
          >
            Developer
          </Text>

          <Text style={styles.devName}>Pratyansh Singh</Text>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL("mailto:pratyansh345@gmail.com")
            }
          >
            <Text style={styles.mail}>Send Feedback</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Budget Tracker v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 15 },

  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    elevation: 4,
  },

  avatarWrapper: { alignSelf: "center", marginBottom: 10 },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007bff",
    padding: 6,
    borderRadius: 20,
  },

  profileName: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },

  input: {
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },

  saveBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  label: { fontSize: 14, marginBottom: 5, color: "#888" },

  pickerBox: { borderRadius: 10 },

  center: { alignItems: "center" },
  devName: { fontSize: 16, fontWeight: "600", marginTop: 5 },
  mail: {
    color: "#4c9cff",
    marginTop: 6,
    textDecorationLine: "underline",
  },
  version: { marginTop: 8, color: "#999", fontSize: 12 },
});
