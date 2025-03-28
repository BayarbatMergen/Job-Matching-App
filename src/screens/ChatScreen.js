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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../config/apiConfig";
import * as SecureStore from "expo-secure-store";

export default function ChatScreen({ route }) {
  const { roomId, roomName, roomType } = route.params;
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantNames, setParticipantNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    const loadUserId = async () => {
      const userId = await SecureStore.getItemAsync("userId");
      setCurrentUserId(userId);
    };

    const fetchMessagesAndParticipants = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) return;

        const [msgRes, roomRes] = await Promise.all([
          fetch(`${API_BASE_URL}/chats/rooms/${roomId}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/chats/rooms`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const msgData = await msgRes.json();
        setMessages(msgData);

        const roomList = await roomRes.json();
        const currentRoom = roomList.find((room) => room.id === roomId);
        setParticipants(currentRoom?.participants || []);
      } catch (error) {
        console.error("❌ 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserId();
    fetchMessagesAndParticipants();
  }, [roomId]);

  const sendMessage = async () => {
    if (roomType === "notice" || messageText.trim() === "") return;

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

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.topBar}>
        <Text style={styles.roomTitle}>{roomName}</Text>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Ionicons name="people-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

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
              item.system && styles.systemMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
            {!item.system && (
              <Text style={styles.timestamp}>
                {item.createdAt && item.createdAt._seconds
                  ? new Date(item.createdAt._seconds * 1000).toLocaleTimeString()
                  : ""}
              </Text>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />

      {roomType === "notice" ? (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>관리자만 메시지를 보낼 수 있습니다.</Text>
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

      {/* 👥 참여자 모달 */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>참여자 목록</Text>
            {participants.map((id, idx) => (
              <Text key={idx} style={styles.participantText}>
                👤 {id}
              </Text>
            ))}
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roomTitle: { fontSize: 18, fontWeight: "bold" },
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
  systemMessage: {
    alignSelf: "center",
    backgroundColor: "#e0e0e0",
    marginTop: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  participantText: { fontSize: 16, marginVertical: 5 },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
});
