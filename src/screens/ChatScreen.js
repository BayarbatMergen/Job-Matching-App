import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../config/apiConfig";
import * as SecureStore from "expo-secure-store";

export default function ChatScreen({ route }) {
  const { roomId, roomName } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log(`📡 채팅 메시지 요청 중... (채팅방: ${roomId})`);
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
          console.warn("🚨 인증 토큰이 없습니다.");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/chats/rooms/${roomId}/messages`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ 채팅 메시지 불러오기 성공:", data);
        setMessages(data);
      } catch (error) {
        console.error("❌ 채팅 메시지 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [roomId]);

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
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>{new Date(item.createdAt._seconds * 1000).toLocaleTimeString()}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />

      {/* 🔻 하단 채팅 입력 바 (입력 비활성화) */}
      <View style={styles.chatInputContainer}>
        <TextInput 
          style={styles.chatInput} 
          placeholder="관리자만 메시지를 보낼 수 있습니다." 
          editable={false} // ✅ 입력 비활성화
        />
        <TouchableOpacity style={styles.disabledSendButton} disabled>
          <Ionicons name="send" size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },

  // 📜 메시지 스타일
  messageBubble: {
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '85%', // 메시지 박스 크기 조정
    alignSelf: 'flex-start', // 왼쪽 정렬
    marginLeft: 15, // ✅ 왼쪽 여백 추가
  },
  messageText: { fontSize: 16, color: '#333' },
  timestamp: { fontSize: 12, color: '#777', marginTop: 5, textAlign: 'right' },

  // 🔻 하단 채팅 입력 바
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  chatInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    paddingHorizontal: 15,
    color: '#999', // 비활성화된 상태
  },
  disabledSendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
  },
});
