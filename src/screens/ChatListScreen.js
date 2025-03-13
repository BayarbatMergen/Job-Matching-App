import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../config/apiConfig";
import * as SecureStore from "expo-secure-store";

export default function ChatListScreen({ navigation }) {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetch("http://192.168.0.6:5000/api/chats/rooms");
        const data = await response.json();
        setChatRooms(data);  // ✅ 상태 업데이트
      } catch (error) {
        console.error("❌ 채팅방 목록 가져오기 실패:", error);
      }
    };
  
    fetchChatRooms();
  }, []);
  

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.roomItem}
            onPress={() => navigation.navigate("ChatScreen", { roomId: item.id, roomName: item.name })}
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
  safeContainer: { flex: 1, backgroundColor: "#fff", padding: 20 },
  roomItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  roomName: { fontSize: 18, fontWeight: "bold", marginLeft: 10, color: "#333" },
});
