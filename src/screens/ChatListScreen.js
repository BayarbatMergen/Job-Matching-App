import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../config/apiConfig";
import * as SecureStore from "expo-secure-store";

export default function ChatListScreen({ navigation }) {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        console.log("📡 채팅방 목록 요청 중...");

        // ✅ 저장된 인증 토큰 가져오기
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
          console.warn("🚨 인증 토큰이 없습니다.");
          Alert.alert("인증 오류", "로그인이 필요합니다.");
          navigation.replace("Login");
          return;
        }

        // ✅ API 요청 시 Authorization 헤더 추가
        const response = await fetch(`${API_BASE_URL}/chats/rooms`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // ✅ 토큰 추가
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ 채팅방 목록 불러오기 성공:", data);
        setChatRooms(data);
      } catch (error) {
        console.error("❌ 채팅방 목록 가져오기 실패:", error);
        Alert.alert("오류", "채팅방 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {chatRooms.length === 0 ? (
        <Text style={styles.noChatText}>참여할 채팅방이 없습니다.</Text>
      ) : (
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#fff", padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noChatText: { fontSize: 18, textAlign: "center", color: "#888", marginTop: 50 },
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
