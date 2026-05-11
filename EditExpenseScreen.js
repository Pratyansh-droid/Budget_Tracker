import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState([
    { id: '1', title: 'Milk', amount: 50 },
    { id: '2', title: 'Vegetables', amount: 120 },
    { id: '3', title: 'Snacks', amount: 60 },
  ]);

  // DELETE FUNCTION
  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  // EDIT FUNCTION
  const editExpense = (item) => {
    console.log('Edit item:', item);
    // HERE YOU WILL OPEN YOUR EDIT SCREEN OR MODAL
  };

  const renderItem = ({ item }) => {

    const handleDelete = () => deleteExpense(item.id);
    const handleEdit = () => editExpense(item);

    const renderLeftActions = () => (
      <View style={{
        backgroundColor: 'orange',
        justifyContent: 'center',
        padding: 20
      }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Edit</Text>
      </View>
    );

    const renderRightActions = () => (
      <View style={{
        backgroundColor: 'red',
        justifyContent: 'center',
        padding: 20
      }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
      </View>
    );

    return (
      <Swipeable
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableLeftOpen={handleEdit}
        onSwipeableRightOpen={handleDelete}
      >
        <View style={{
          backgroundColor: '#f2f2f2',
          padding: 16,
          marginVertical: 8,
          borderRadius: 8
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.title}</Text>
          <Text style={{ fontSize: 16 }}>₹{item.amount}</Text>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
}
