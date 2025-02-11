import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const dummyUsers = [
  { id: '1', name: '김철수', email: 'kim@example.com', role: '사용자' },
  { id: '2', name: '이영희', email: 'lee@example.com', role: '사용자' },
  { id: '3', name: '박지수', email: 'park@example.com', role: '관리자' },
];

export default function UserManagementScreen() {
  const [users, setUsers] = useState(dummyUsers);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>총 사용자 관리</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => console.log(`${item.name} 정보 관리`)}>
            <Text style={styles.userName}>{item.name} ({item.role})</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#666' },
});
