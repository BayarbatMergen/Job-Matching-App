import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ 관리자용 단톡방 목록 (더미 데이터)
const adminChatRooms = [
  { id: '1', name: '관리자 단톡방 (A지점)' },
  { id: '2', name: '관리자 단톡방 (B지점)' },
  { id: '3', name: '전체 관리자 공지방' },
];

export default function AdminChatListScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeContainer}>

      {/* 🔹 단톡방 리스트 */}
      <FlatList
        data={adminChatRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.roomItem}
            onPress={() => navigation.navigate('AdminChatScreen', { roomName: item.name })}
          >
            <Ionicons name="chatbox-ellipses-outline" size={24} color="#007AFF" />
            <Text style={styles.roomName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#007AFF' },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  roomName: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#333' },
});
