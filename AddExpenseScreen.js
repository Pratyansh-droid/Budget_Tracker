import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

export default function AddExpenseScreen({ route, navigation }) {
  const editingExpense = route?.params?.expense || null;

  const [title, setTitle] = useState(editingExpense ? editingExpense.title : "");
  const [amount, setAmount] = useState(
    editingExpense ? String(editingExpense.amount) : ""
  );
  const [category, setCategory] = useState(
    editingExpense ? editingExpense.category : "Other"
  );

  const saveExpense = async () => {
    if (!title || !amount) {
      Alert.alert("Error", "Please enter title and amount");
      return;
    }

    const stored = await AsyncStorage.getItem("expenses");
    const expenses = stored ? JSON.parse(stored) : [];

    if (editingExpense) {
      const updated = expenses.map((e) =>
        e.id === editingExpense.id
          ? { ...e, title, amount, category }
          : e
      );

      await AsyncStorage.setItem("expenses", JSON.stringify(updated));
    } else {
      const newExpense = {
        id: Date.now(),
        title,
        amount,
        category
      };

      expenses.push(newExpense);
      await AsyncStorage.setItem("expenses", JSON.stringify(expenses));
    }

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholder="Enter title"
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter amount"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={category} onValueChange={setCategory}>
              <Picker.Item label="Food" value="Food" />
              <Picker.Item label="Travel" value="Travel" />
              <Picker.Item label="Shopping" value="Shopping" />
              <Picker.Item label="Bills" value="Bills" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveExpense}>
            <Text style={styles.saveText}>
              {editingExpense ? "Update Expense" : "Add Expense"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: { fontSize: 16, marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginTop: 5
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 5
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    marginTop: 30,
    alignItems: "center",
    borderRadius: 10
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});

