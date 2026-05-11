import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import AddExpenseScreen from "../screens/AddExpenseScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />

      <Stack.Screen 
        name="AddExpense" 
        component={AddExpenseScreen}
        options={{ title: "Add Expense" }}
      />
    </Stack.Navigator>
  );
}
