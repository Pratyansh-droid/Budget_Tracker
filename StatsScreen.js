import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PieChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";

export default function StatsScreen() {
  const scheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(scheme === "dark");

  const [pieData, setPieData] = useState([]);
  const [dailyExpense, setDailyExpense] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    setDarkMode(scheme === "dark");
  }, [scheme]);

  const loadStats = async () => {
    const savedExpenses = await AsyncStorage.getItem("expenses");
    const savedIncomes = await AsyncStorage.getItem("incomes");

    const expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
    const incomes = savedIncomes ? JSON.parse(savedIncomes) : [];

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let dailyExp = 0;
    let monthlyExp = 0;
    let totalInc = 0;
    let totalExp = 0;
    const categoryBreak = {};

    expenses.forEach((item) => {
      const dateParts = item.date.split("/");
      const itemDate = new Date(
        +dateParts[2],
        +dateParts[1] - 1,
        +dateParts[0]
      ); // dd/mm/yyyy -> Date
      const itemDay = itemDate.getDate();
      const itemMonth = itemDate.getMonth();
      const itemYear = itemDate.getFullYear();

      if (itemDay === currentDay && itemMonth === currentMonth && itemYear === currentYear)
        dailyExp += parseFloat(item.amount);

      if (itemMonth === currentMonth && itemYear === currentYear)
        monthlyExp += parseFloat(item.amount);

      totalExp += parseFloat(item.amount);

      if (!categoryBreak[item.category]) categoryBreak[item.category] = 0;
      categoryBreak[item.category] += parseFloat(item.amount);
    });

    incomes.forEach((item) => {
      totalInc += parseFloat(item.amount);
      if (!categoryBreak[item.category]) categoryBreak[item.category] = 0;
      categoryBreak[item.category] += parseFloat(item.amount);
    });

    setDailyExpense(dailyExp);
    setMonthlyExpense(monthlyExp);
    setTotalIncome(totalInc);
    setTotalExpense(totalExp);

    const chartData = Object.keys(categoryBreak).map((key, index) => ({
      name: key,
      amount: categoryBreak[key],
      color: COLORS[index % COLORS.length],
      legendFontColor: darkMode ? "#fff" : "#792a2a",
      legendFontSize: 14,
    }));

    setPieData(chartData);

    const categoryArr = Object.keys(categoryBreak).map((key) => ({
      category: key,
      total: categoryBreak[key],
    }));
    setCategoryList(categoryArr);
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [darkMode])
  );

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.darkBackground]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, darkMode && styles.darkText]}>📊 Statistics</Text>

        <View style={styles.cardBox}>
          <View style={[styles.card, darkMode && styles.cardDark]}>
            <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Daily Expense</Text>
            <Text style={[styles.cardValue, darkMode && styles.darkText]}>₹ {dailyExpense}</Text>
          </View>

          <View style={[styles.card, darkMode && styles.cardDark]}>
            <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Monthly Expense</Text>
            <Text style={[styles.cardValue, darkMode && styles.darkText]}>₹ {monthlyExpense}</Text>
          </View>
        </View>

        <View style={styles.cardBox}>
          <View style={[styles.cardGreen, darkMode && styles.cardDarkGreen]}>
            <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Total Income</Text>
            <Text style={[styles.cardValue, darkMode && styles.darkText]}>₹ {totalIncome}</Text>
          </View>

          <View style={[styles.cardRed, darkMode && styles.cardDarkRed]}>
            <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Total Expense</Text>
            <Text style={[styles.cardValue, darkMode && styles.darkText]}>₹ {totalExpense}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Category Pie Chart</Text>

        {pieData.length === 0 ? (
          <Text style={[styles.noData, darkMode && styles.darkText]}>No data to display</Text>
        ) : (
          <PieChart
            data={pieData}
            width={Dimensions.get("window").width - 30}
            height={260}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            chartConfig={{
              backgroundColor: darkMode ? "#121212" : "#fff",
              backgroundGradientFrom: darkMode ? "#121212" : "#fff",
              backgroundGradientTo: darkMode ? "#121212" : "#fff",
              color: () => (darkMode ? "#fff" : "#000"),
              decimalPlaces: 0,
            }}
          />
        )}

        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Category Breakdown</Text>

        {categoryList.map((item, index) => (
          <View
            key={index}
            style={[styles.breakItem, darkMode && { backgroundColor: "#1e1e1e" }]}
          >
            <Text style={[styles.breakCategory, darkMode && styles.darkText]}>{item.category}</Text>
            <Text style={[styles.breakAmount, darkMode && styles.darkText]}>₹ {item.total}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const COLORS = ["#FF6B6B","#4D96FF","#FFD93D","#6BCB77","#845EC2","#FF9671","#FFC75F","#0081CF"];

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  darkBackground: { backgroundColor: "#121212" },
  container: { padding: 15, paddingBottom: 30 },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 25, marginBottom: 10 },
  noData: { textAlign: "center", color: "#888", marginVertical: 20 },
  cardBox: { flexDirection: "row", justifyContent: "space-between" },
  card: { width: "48%", backgroundColor: "#E3E7FF", padding: 15, borderRadius: 10 },
  cardGreen: { width: "48%", backgroundColor: "#D1F7C4", padding: 15, borderRadius: 10 },
  cardRed: { width: "48%", backgroundColor: "#FFD1D1", padding: 15, borderRadius: 10 },
  cardDark: { backgroundColor: "#1e1e1e" },
  cardDarkGreen: { backgroundColor: "#2e2e2e" },
  cardDarkRed: { backgroundColor: "#2e1e1e" },
  cardTitle: { fontSize: 14, color: "#333" },
  cardValue: { fontSize: 20, fontWeight: "bold", marginTop: 5 },
  breakItem: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#F3F3F3", padding: 12, marginVertical: 5, borderRadius: 8 },
  breakCategory: { fontSize: 16, fontWeight: "600" },
  breakAmount: { fontSize: 16, fontWeight: "600" },
  darkText: { color: "#fff" },
});
