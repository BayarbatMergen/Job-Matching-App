import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../config/apiConfig";
import * as SecureStore from "expo-secure-store";

export default function AdminChatScreen({ route }) {
  const { roomId, roomName, roomType } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const flatListRef = useRef();

  useEffect(() => {
    const loadUserId = async () => {
      const userId = await SecureStore.getItemAsync("userId");
      setCurrentUserId(userId);
    };

    loadUserId();

    const fetchMessages = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/chats/rooms/${roomId}/messages`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        console.log("✅ 가져온 메시지:", data);
        setMessages(data);
      } catch (error) {
        console.error("❌ 채팅 메시지 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (messageText.trim() === "") return;

    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(
        `${API_BASE_URL}/chats/rooms/${roomId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: messageText }),
        }
      );

      if (response.ok) {
        setMessageText("");
        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage.data]);
      }
    } catch (error) {
      console.error("❌ 메시지 전송 실패:", error);
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
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.senderId === currentUserId
                ? styles.myMessageBubble
                : styles.otherMessageBubble,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>
              {item.createdAt && item.createdAt._seconds
                ? new Date(item.createdAt._seconds * 1000).toLocaleTimeString()
                : ""}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {/* ✅ 공지방일 때도 관리자면 입력창, 일반 유저면 안내문구 */}
      {roomType === "notice" && currentUserId !== "1WUKTfOuaXVuiHmhitOJVGZzAhO2" ? (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>
            공지방은 관리자만 메시지를 보낼 수 있습니다.
          </Text>
        </View>
      ) : (
        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="메시지를 입력하세요..."
            value={messageText}
            onChangeText={setMessageText}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  messageBubble: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "85%",
  },
  myMessageBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#A3D8FF",
    marginRight: 15,
  },
  otherMessageBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F0F0",
    marginLeft: 15,
  },
  messageText: { fontSize: 16, color: "#333" },
  timestamp: { fontSize: 12, color: "#777", marginTop: 5, textAlign: "right" },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  chatInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#F1F1F1",
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 20,
  },
  noticeBanner: {
    padding: 15,
    backgroundColor: "#f8d7da",
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  noticeText: {
    color: "#721c24",
    fontSize: 16,
    fontWeight: "bold",
  },
});
