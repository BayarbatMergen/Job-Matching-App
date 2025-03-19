import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../config/apiConfig";
import * as SecureStore from "expo-secure-store";

export default function ChatListScreen({ navigation }) {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChatRooms = async () => {
    try {
      console.log("📡 채팅방 목록 요청 중...");

      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("인증 오류", "로그인이 필요합니다.");
        navigation.replace("Login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/chats/rooms`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);

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

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const startAdminChat = async () => {
    const adminId = "1WUKTfOuaXVuiHmhitOJVGZzAhO2"; // 관리자 UID
    const userId = await SecureStore.getItemAsync("userId");
    if (!userId) return Alert.alert("로그인이 필요합니다.");

    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(`${API_BASE_URL}/chats/admin-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participantId: adminId }),
      });

      const result = await response.json();
      if (response.ok) {
        navigation.navigate("ChatScreen", {
          roomId: result.roomId,
          roomName: "관리자와의 채팅",
        });
      } else {
        Alert.alert("오류", result.message || "관리자 채팅방 생성 실패");
      }
    } catch (error) {
      console.error("❌ 관리자 채팅방 오류:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <TouchableOpacity style={styles.adminChatButton} onPress={startAdminChat}>
        <Ionicons name="person-circle-outline" size={24} color="#fff" />
        <Text style={styles.adminChatText}>관리자에게 문의</Text>
      </TouchableOpacity>

      {chatRooms.length === 0 ? (
        <Text style={styles.noChatText}>참여할 채팅방이 없습니다.</Text>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomItem}
              onPress={() =>
                navigation.navigate("ChatScreen", {
                  roomId: item.id,
                  roomName: item.name || "채팅방",
                })
              }
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#007AFF" />
              <Text style={styles.roomName}>{item.name || "채팅방"}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchChatRooms}
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
  adminChatButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  adminChatText: { color: "#fff", marginLeft: 8, fontSize: 16, fontWeight: "bold" },
});
