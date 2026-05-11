import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import your screens
import HomeScreen from "../screens/HomeScreen";
import EditExpenseScreen from "../screens/EditExpenseScreen";
import StatsScreen from "../screens/StatsScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: "#1f2b37ff" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Expenses" }}
        />
        <Stack.Screen
          name="EditExpense"
          component={EditExpenseScreen}
          options={({ route }) => ({
            title: route.params?.expense ? "Edit Expense" : "Add Expense",
          })}
        />
        <Stack.Screen
          name="Stats"
          component={StatsScreen}
          options={{ title: "Statistics" }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Settings" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
