import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView } from "react-native";
import API_BASE_URL from "../config/apiConfig";
import * as SecureStore from "expo-secure-store";

export default function ChatScreen({ route }) {
  const { roomId, roomName } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const response = await fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        setMessages(result);
      } catch (error) {
        console.error("❌ 메시지 불러오기 오류:", error);
      }
    };

    fetchMessages();
  }, []);


  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 🔹 채팅방 이름 헤더 */}
      <View style={styles.header}>
        
      </View>

      {/* 🔹 채팅 메시지 리스트 */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.timestamp}>{item.createdAt}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />

      {/* 🔻 사용자는 입력할 수 없도록 비활성화된 입력 필드 */}
      <View style={styles.chatInputContainer}>
        <TextInput 
          style={styles.chatInput} 
          placeholder="관리자만 메시지를 보낼 수 있습니다." 
          editable={false}
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



  // 🔹 메시지 스타일
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
  },
  messageBubble: {
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '85%',
    alignSelf: 'flex-start',
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
    color: '#999',
  },
  disabledSendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
  },
});
