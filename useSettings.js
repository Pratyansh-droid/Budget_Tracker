import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useSettings() {
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState("₹");

  // Load settings from AsyncStorage
  const loadSettings = async () => {
    try {
      const storedDark = await AsyncStorage.getItem("darkMode");
      const storedCurrency = await AsyncStorage.getItem("currency");

      if (storedDark !== null) setDarkMode(JSON.parse(storedDark));
      if (storedCurrency) setCurrency(storedCurrency);
    } catch (error) {
      console.log("Failed to load settings", error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = async () => {
    try {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      await AsyncStorage.setItem("darkMode", JSON.stringify(newDarkMode));
    } catch (error) {
      console.log("Failed to save dark mode", error);
    }
  };

  // Change currency
  const changeCurrency = async (newCurrency) => {
    try {
      setCurrency(newCurrency);
      await AsyncStorage.setItem("currency", newCurrency);
    } catch (error) {
      console.log("Failed to save currency", error);
    }
  };

  return {
    darkMode,
    toggleDarkMode,
    currency,
    changeCurrency,
  };
}
