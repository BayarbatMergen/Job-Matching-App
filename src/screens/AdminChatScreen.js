import React, { useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 관리자 채팅 더미 데이터
const dummyMessages = [
  { id: 'msg-1', text: '📢 이번 주 근무 일정이 변경되었습니다.', createdAt: '2024-02-10 10:00' },
  { id: 'msg-2', text: '⏰ 내일 출근 시간은 9시입니다.', createdAt: '2024-02-11 14:30' },
  { id: 'msg-3', text: '💰 급여 정산은 15일에 진행됩니다.', createdAt: '2024-02-12 16:45' },
];

export default function AdminChatScreen() {
  const [messages, setMessages] = useState(dummyMessages);
  const [newMessage, setNewMessage] = useState('');

  // 📌 **연속 실행 방지를 위한 useRef 사용**
  const isSending = useRef(false);

  // 📌 **메시지 전송 함수**
  const sendMessage = () => {
    if (isSending.current || newMessage.trim() === '') return; // 🔥 중복 실행 방지
    isSending.current = true;

    const newMsg = {
      id: `msg-${Date.now()}`, // 유니크 ID 생성
      text: newMessage,
      createdAt: new Date().toLocaleString(),
    };

    console.log('📢 메시지 전송:', newMsg); // ✅ 디버깅용 로그 추가

    setMessages((prevMessages) => [...prevMessages, newMsg]); // ✅ 새로운 배열 반환 (밑으로 추가)

    setNewMessage(''); // 입력 필드 초기화

    setTimeout(() => {
      isSending.current = false; // 🔥 일정 시간 후 isSending 해제
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 📜 채팅 메시지 리스트 (위에서부터 아래로 쌓임) */}
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
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }} // ✅ 위에서부터 쌓이게 변경
        showsVerticalScrollIndicator={false}
      />

      {/* 🔻 하단 채팅 입력 바 (관리자용) */}
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },

  // 📜 메시지 스타일
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // 왼쪽 정렬
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
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
});
