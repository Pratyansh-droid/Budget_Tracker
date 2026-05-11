import React, { useEffect, useState } from "react";
import { Appearance, AppState, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";

import * as Updates from "expo-updates";
import * as Notifications from "expo-notifications";

import RootNavigator from "./navigation/RootNavigator";

/* ================= NOTIFICATION HANDLER ================= */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [colorScheme, setColorScheme] = useState(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    /* ================= OTA UPDATE ================= */
    const checkUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        console.log("OTA skipped:", e.message);
      }
    };

    checkUpdates();

    /* ================= NOTIFICATIONS ================= */
    const registerNotifications = async () => {
      await Notifications.requestPermissionsAsync();

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("budget", {
          name: "Budget Alerts",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    };

    registerNotifications();

    /* ================= SYSTEM THEME LISTENER ================= */
    const appearanceSub = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    /* ================= FOREGROUND OTA CHECK ================= */
    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkUpdates();
      }
    });

    return () => {
      appearanceSub.remove();
      appStateSub.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
