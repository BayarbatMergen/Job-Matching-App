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
  const [unreadRoomIds, setUnreadRoomIds] = useState([]);
  const [userId, setUserId] = useState(null);

  const fetchUnreadStatus = async (uid) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const res = await fetch(`${API_BASE_URL}/chats/unread-status?userId=${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("읽지 않은 메시지 상태 조회 실패");

      const data = await res.json(); // { roomId1: true, roomId2: false }
      const unreadIds = Object.entries(data)
        .filter(([_, isUnread]) => isUnread)
        .map(([roomId]) => roomId);

      setUnreadRoomIds(unreadIds);
    } catch (err) {
      console.error("❌ 읽지 않은 상태 불러오기 실패:", err.message);
    }
  };

  const fetchChatRooms = async (uid) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(`${API_BASE_URL}/chats/rooms?userId=${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);
      const data = await response.json();
      setChatRooms(data);
      await fetchUnreadStatus(uid);
    } catch (error) {
      console.error("❌ 채팅방 목록 오류:", error);
      Alert.alert("오류", "채팅방 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const uid = await SecureStore.getItemAsync("userId");
      if (!uid) {
        Alert.alert("로그인 필요", "다시 로그인 해주세요.");
        navigation.replace("Login");
        return;
      }
      setUserId(uid);
      fetchChatRooms(uid);
    };
    init();
  }, []);

  const startAdminChat = async () => {
    const adminId = "1WUKTfOuaXVuiHmhitOJVGZzAhO2";
    const token = await SecureStore.getItemAsync("token");

    try {
      const response = await fetch(`${API_BASE_URL}/chats/admin-room`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId: adminId }),
      });

      const result = await response.json();
      if (response.ok) {
        navigation.navigate("ChatScreen", {
          roomId: result.roomId,
          roomName: "관리자와의 채팅",
          roomType: "inquiry",
        });
      } else {
        Alert.alert("오류", result.message || "채팅방 생성 실패");
      }
    } catch (error) {
      console.error("❌ 관리자 채팅 오류:", error);
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
        <Text style={styles.noChatText}>참여 중인 채팅방이 없습니다.</Text>
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
                  roomType: item.roomType || "inquiry",
                })
              }
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#007AFF" />
              <Text style={styles.roomName}>{item.name || "채팅방"}</Text>
              {unreadRoomIds.includes(item.id) && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={() => userId && fetchChatRooms(userId)}
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
    position: "relative",
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
  unreadDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
  },
});
