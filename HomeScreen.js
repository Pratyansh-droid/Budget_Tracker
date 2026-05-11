import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  Image,
  TextInput,
  KeyboardAvoidingView,
  useColorScheme,
  Keyboard,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

/* ================= CATEGORIES ================= */
const CATEGORIES = {
  Food: { icon: "fast-food", color: "#22c55e" },
  Travel: { icon: "airplane", color: "#3b82f6" },
  Shopping: { icon: "cart", color: "#f97316" },
  Bills: { icon: "receipt", color: "#ef4444" },
  Salary: { icon: "briefcase", color: "#16a34a" },
  Freelance: { icon: "laptop", color: "#6366f1" },
  Other: { icon: "ellipsis-horizontal", color: "#9ca3af" },
};

export default function HomeScreen({ navigation }) {
  const isDark = useColorScheme() === "dark";

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

  const [barOpen, setBarOpen] = useState(false);
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [lastIncomeCategory, setLastIncomeCategory] = useState("Salary");
  const [lastExpenseCategory, setLastExpenseCategory] = useState("Food");

  const [userName, setUserName] = useState("User");
  const [currency, setCurrency] = useState("₹");
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", e => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
   

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setUserName((await AsyncStorage.getItem("userName")) || "User");
        setCurrency((await AsyncStorage.getItem("currency")) || "₹");
        const storedAvatar = await AsyncStorage.getItem("avatar");
        setAvatar(storedAvatar ? storedAvatar : null);
        loadData();
      })();
    }, [])
  );

  const loadData = async () => {
    setExpenses(JSON.parse(await AsyncStorage.getItem("expenses")) || []);
    setIncomes(JSON.parse(await AsyncStorage.getItem("incomes")) || []);
  };

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const saveItem = async () => {
    if (!amount) return Alert.alert("Error", "Enter amount");

    const finalCategory =
      category === "Other" && customCategory ? customCategory : category;

    const now = new Date();
    const item = {
      id: editingId || Date.now(),
      title,
      amount: Number(amount),
      category: finalCategory,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    };

    const key = type === "income" ? "incomes" : "expenses";
    const list = type === "income" ? incomes : expenses;

    const updatedList = editingId
      ? list.map(i => (i.id === editingId ? item : i))
      : [item, ...list];

    await AsyncStorage.setItem(key, JSON.stringify(updatedList));
    type === "income" ? setIncomes(updatedList) : setExpenses(updatedList);

    setAmount("");
    setTitle("");
    setCustomCategory("");
    setEditingId(null);
    setBarOpen(false);
    Keyboard.dismiss();
  };

  const deleteItem = async (id, t) => {
    const key = t === "income" ? "incomes" : "expenses";
    const list = t === "income" ? incomes : expenses;
    const filtered = list.filter(i => i.id !== id);
    await AsyncStorage.setItem(key, JSON.stringify(filtered));
    t === "income" ? setIncomes(filtered) : setExpenses(filtered);
  };

  const renderItem = (item, t) => {
    const isIncome = t === "income";
    const cat = CATEGORIES[item.category] || CATEGORIES.Other;

    const handleEdit = () => {
      setBarOpen(true);
      setType(t);
      setTitle(item.title);
      setAmount(item.amount.toString());
      setCategory(
        Object.keys(CATEGORIES).includes(item.category)
          ? item.category
          : "Other"
      );
      setCustomCategory(
        Object.keys(CATEGORIES).includes(item.category)
          ? ""
          : item.category
      );
      setEditingId(item.id);
    };

    return (
      <Swipeable
        renderRightActions={() => (
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={[styles.deleteBox, { backgroundColor: "#2563eb" }]}
              onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBox}
              onPress={() => deleteItem(item.id, t)}
            >
              <Ionicons name="trash" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      >
        <View
          style={[
            styles.row,
            isIncome ? styles.incomeRow : styles.expenseRow,
            isDark && styles.rowDark,
          ]}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.catIcon, { backgroundColor: cat.color }]}>
              <Ionicons name={cat.icon} size={18} color="#fff" />
            </View>
            <View>
              <Text style={[styles.title, isDark && styles.textDark]}>
                {item.title || item.category}
              </Text>
              <Text style={styles.categoryLabel}>{item.category}</Text>
              <Text style={styles.categoryLabel}>
                {item.date} {item.time}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.amount,
              isIncome ? styles.incomeText : styles.expenseText,
            ]}
          >
            {isIncome ? "+" : "-"} {currency} {item.amount}
          </Text>
        </View>
      </Swipeable>
    );
  };

  const incomeCategories = ["Salary", "Freelance", "Other"];
  const expenseCategories = ["Food", "Travel", "Shopping", "Bills", "Other"];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        <FlatList
          contentContainerStyle={{ paddingBottom: 220 }}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <Image
                  source={
                    avatar
                      ? { uri: avatar }
                      : require("../assets/default-avatars/avatar1.png")
                  }
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.welcome}>Welcome</Text>
                  <Text style={styles.name}>{userName}</Text>
                </View>
              </View>

              <View style={styles.summary}>
                <View style={styles.summaryCard}>
                  <Text style={styles.incomeText}>Income</Text>
                  <Text style={styles.incomeText}>
                    {currency} {totalIncome}
                  </Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.expenseText}>Expense</Text>
                  <Text style={styles.expenseText}>
                    {currency} {totalExpense}
                  </Text>
                </View>
              </View>

              <View style={styles.balance}>
                <Text style={styles.balanceText}>Balance</Text>
                <Text style={styles.balanceAmount}>
                  {currency} {balance}
                </Text>
              </View>

              <Text style={styles.section}>Incomes</Text>
            </>
          }
          data={incomes}
          renderItem={({ item }) => renderItem(item, "income")}
          keyExtractor={i => i.id.toString()}
          ListFooterComponent={
            <>
              <Text style={styles.section}>Expenses</Text>
              {expenses.map(e => (
                <View key={e.id}>{renderItem(e, "expense")}</View>
              ))}
            </>
          }
        />

        {/* ===== BOTTOM ADD BAR (FIXED) ===== */}
        <View
         style={[
          styles.bottomBarWrapper,
          keyboardHeight > 0 && { bottom: keyboardHeight - 350},
         ]}
         >
          {barOpen && (
            <ScrollView keyboardShouldPersistTaps="handled">
              <View
                style={[
                  styles.addBar,
                  type === "income" ? styles.addIncome : styles.addExpense,
                ]}
              >
                <View style={styles.switch}>
                  <TouchableOpacity onPress={() => setType("income")}>
                    <Text
                      style={type === "income" && styles.activeIncome}
                    >
                      Income
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setType("expense")}>
                    <Text
                      style={type === "expense" && styles.activeExpense}
                    >
                      Expense
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Title"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Amount"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  style={styles.input}
                />

                {category === "Other" ? (
                  <TextInput
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    style={styles.input}
                  />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.catRow}>
                      {(type === "income"
                        ? incomeCategories
                        : expenseCategories
                      ).map(key => (
                        <TouchableOpacity
                          key={key}
                          onPress={() => setCategory(key)}
                          style={[
                            styles.catPick,
                            category === key && styles.catActive,
                          ]}
                        >
                          <Ionicons
                            name={CATEGORIES[key].icon}
                            size={18}
                            color={CATEGORIES[key].color}
                          />
                          <Text style={styles.catText}>{key}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={saveItem}
                >
                  <Text style={styles.saveText}>
                    {editingId ? "Update" : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>

        {!barOpen && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              setType("income");
              setBarOpen(true);
            }}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  containerDark: { backgroundColor: "#020617" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#2563eb",
    gap: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  welcome: { color: "#c7d2fe" },
  name: { color: "#fff", fontSize: 18, fontWeight: "700" },

  summary: { flexDirection: "row", padding: 16, gap: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
  },

  balance: {
    marginHorizontal: 16,
    padding: 18,
    backgroundColor: "#2563eb",
    borderRadius: 18,
  },
  balanceText: { color: "#c7d2fe" },
  balanceAmount: { color: "#fff", fontSize: 22, fontWeight: "700" },

  section: { fontSize: 18, fontWeight: "700", margin: 16 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  rowDark: { backgroundColor: "#0f172a" },

  incomeRow: { borderLeftWidth: 5, borderLeftColor: "#16a34a" },
  expenseRow: { borderLeftWidth: 5, borderLeftColor: "#dc2626" },

  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },

  catIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  title: { fontSize: 15, fontWeight: "600" },
  categoryLabel: { fontSize: 12, color: "#6b7280" },
  textDark: { color: "#e5e7eb" },

  amount: { fontWeight: "700" },
  incomeText: { color: "#16a34a" },
  expenseText: { color: "#dc2626" },

  bottomBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },

  addBar: {
    padding: 16,
    backgroundColor: "#e5e7eb",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  addIncome: { borderTopColor: "#16a34a", borderTopWidth: 4 },
  addExpense: { borderTopColor: "#dc2626", borderTopWidth: 4 },

  switch: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  activeIncome: { color: "#16a34a", fontWeight: "700" },
  activeExpense: { color: "#dc2626", fontWeight: "700" },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  catRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  catPick: {
    alignItems: "center",
    width: 80,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  catActive: { borderWidth: 2, borderColor: "#2563eb" },
  catText: { fontSize: 11 },

  saveBtn: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },

  deleteBox: {
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    borderRadius: 16,
    marginVertical: 8,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#2563eb",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
