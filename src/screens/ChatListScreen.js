import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ 단톡방 목록 (더미 데이터)
const chatRooms = [
  { id: '1', name: '알바생 단톡방 (A지점)' },
  { id: '2', name: '알바생 단톡방 (B지점)' },
];

export default function ChatListScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeContainer}>

      {/* 🔹 단톡방 리스트 */}
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.roomItem}
            onPress={() => navigation.navigate('ChatScreen', { roomName: item.name })}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#007AFF" />
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
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  roomName: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#333' },
});
