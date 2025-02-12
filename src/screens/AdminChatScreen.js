import React, { useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminChatScreen({ route }) {
  const roomName = route.params?.roomName || '관리자 채팅방';
  const [messages, setMessages] = useState([
    { id: 'msg-1', text: '이번 주 근무 일정이 변경되었습니다.', createdAt: '2024-02-10 10:00' },
    { id: 'msg-2', text: '내일 출근 시간은 9시입니다.', createdAt: '2024-02-11 14:30' },
    { id: 'msg-3', text: '급여 정산은 15일에 진행됩니다.', createdAt: '2024-02-12 16:45' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const isSending = useRef(false);

  const sendMessage = () => {
    if (isSending.current || newMessage.trim() === '') return;
    isSending.current = true;

    const newMsg = {
      id: `msg-${Date.now()}`,
      text: newMessage,
      createdAt: new Date().toLocaleString(),
    };

    setMessages((prevMessages) => [...prevMessages, newMsg]);
    setNewMessage('');

    setTimeout(() => {
      isSending.current = false;
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
      </View>

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
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
        showsVerticalScrollIndicator={false}
      />

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
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    marginVertical: 5,
  },
  messageBubble: {
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
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
