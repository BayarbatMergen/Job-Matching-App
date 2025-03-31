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
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../config/apiConfig";
import * as SecureStore from "expo-secure-store";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function AdminChatScreen({ route }) {
  const { roomId, roomName, roomType } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [participantNames, setParticipantNames] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const flatListRef = useRef();

  useEffect(() => {
    const loadUserId = async () => {
      const userId = await SecureStore.getItemAsync("userId");
      setCurrentUserId(userId);
    };
    loadUserId();

    const fetchMessagesAndParticipants = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) return;
    
        const [msgRes, roomRes] = await Promise.all([
          fetch(`${API_BASE_URL}/chats/rooms/${roomId}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/admin/chats/all-rooms`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
    
        const msgData = await msgRes.json();
        setMessages(msgData);
    
        const roomList = await roomRes.json();
        const currentRoom = roomList.find((room) => room.id === roomId);
        const participantIds = currentRoom?.participants || [];
        console.log("✅ 현재 roomId:", roomId);
        console.log("✅ 가져온 채팅방 목록:", roomList.map(r => r.id));
        console.log("✅ 일치하는 채팅방:", currentRoom);
        console.log("✅ 참여자 ID 목록:", participantIds);

        const namePromises = participantIds.map(async (uid) => {
          try {
            const res = await fetch(`${API_BASE_URL}/chats/users/${uid}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
              console.warn(`⚠️ ${uid} 사용자 정보 응답 실패: ${res.status}`);
              return { name: "알 수 없음" };
            }
            const data = await res.json();
            return data;
          } catch (err) {
            console.error(`❌ ${uid} 사용자 정보 가져오기 실패:`, err);
            return { name: "알 수 없음" };
          }
        });
    
        const users = await Promise.all(namePromises);
        console.log("✅ 참여자 이름 응답 확인:", users);
        setParticipantNames(users.map((user) => user.name || "알 수 없음"));
      } catch (error) {
        console.error("❌ 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessagesAndParticipants();
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

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(drawerAnim, {
      toValue: SCREEN_WIDTH * 0.3,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setDrawerVisible(false));
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
      <View style={styles.topBar}>
        <Text style={styles.roomTitle}>{roomName}</Text>
        <TouchableOpacity onPress={openDrawer}>
          <Ionicons name="people-outline" size={24} color="#fff" />
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
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>
              {item.createdAt && item.createdAt._seconds
                ? new Date(item.createdAt._seconds * 1000)
                    .toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                : ""}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {/* 채팅 입력창 */}
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

      {/* ✅ 오른쪽에서 슬라이드로 나오는 참여자 목록 drawer */}
      {drawerVisible && (
        <Animated.View
          style={[
            styles.drawerContainer,
            { left: drawerAnim },
          ]}
        >
          <Text style={styles.drawerTitle}>👥 참여자 목록</Text>
          {participantNames.map((name, idx) => (
            <Text key={idx} style={styles.participantItem}>
              • {name}
            </Text>
          ))}
          <TouchableOpacity style={styles.drawerCloseButton} onPress={closeDrawer}>
            <Text style={{ color: "#007AFF", fontWeight: "bold" }}>닫기</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#007AFF",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
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
  timestamp: {
    fontSize: 12,
    color: "#777",
    marginTop: 5,
    textAlign: "right",
  },
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
  drawerContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.7,
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 1,
    borderColor: "#ccc",
    padding: 20,
    zIndex: 100,
  },
  drawerTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  participantItem: { fontSize: 16, marginVertical: 6 },
  drawerCloseButton: {
    marginTop: 20,
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#e1e1e1",
    borderRadius: 8,
  },
});
