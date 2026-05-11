import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";
import axios from "axios";
import * as Application from "expo-application";

export default function UpdateChecker() {
  const [visible, setVisible] = useState(false);
  const [apkUrl, setApkUrl] = useState("");
  const [force, setForce] = useState(false);

  useEffect(() => {
    checkUpdate();
  }, []);

  const getCurrentVersion = () => {
    return Application.nativeApplicationVersion || "1.0.0";
  };

  const checkUpdate = async () => {
    try {
      const res = await axios.get(
        "https://yourdomain.com/version.json"
      );

      const latest = res.data.latestVersion;
      const current = getCurrentVersion();

      if (latest !== current) {
        setApkUrl(res.data.apkUrl);
        setForce(res.data.forceUpdate);
        setVisible(true);
      }
    } catch (e) {
      console.log("Update check failed", e);
    }
  };

  const handleUpdate = () => {
    Linking.openURL(apkUrl);
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.text}>
            A new version of the app is available.
          </Text>

          <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
            <Text style={styles.updateText}>Update Now</Text>
          </TouchableOpacity>

          {!force && (
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.later}>Later</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  text: {
    textAlign: "center",
    marginBottom: 16,
  },
  updateBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 10,
  },
  updateText: {
    color: "#fff",
    fontWeight: "700",
  },
  later: {
    color: "#6b7280",
    marginTop: 6,
  },
});
