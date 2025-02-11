import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const dummyInquiries = [
  { id: '1', user: '김철수', message: '앱이 자꾸 튕깁니다.', reply: '' },
  { id: '2', user: '이영희', message: '결제 오류가 발생했어요.', reply: '' },
];

export default function CustomerInquiryScreen() {
  const [inquiries, setInquiries] = useState(dummyInquiries);
  const [replyText, setReplyText] = useState({}); // 각 문의에 대한 답장 입력 저장

  // 🔹 답장 입력 핸들러
  const handleReplyChange = (id, text) => {
    setReplyText((prev) => ({ ...prev, [id]: text }));
  };

  // 🔹 답장 전송 핸들러
  const handleSendReply = (id) => {
    const reply = replyText[id];
    if (!reply || reply.trim() === '') {
      Alert.alert('오류', '답장 내용을 입력하세요.');
      return;
    }

    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, reply } : inq))
    );

    Alert.alert('전송 완료', '답장이 전송되었습니다.');
    setReplyText((prev) => ({ ...prev, [id]: '' })); // 입력창 초기화
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>고객 문의 관리</Text>
      <FlatList
        data={inquiries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.inquiryBox}>
            <Text style={styles.userText}>{item.user}:</Text>
            <Text style={styles.messageText}>{item.message}</Text>

            {/* 기존 답장이 있으면 표시 */}
            {item.reply ? (
              <View style={styles.replyBox}>
                <Text style={styles.replyText}>관리자 답변:</Text>
                <Text style={styles.replyContent}>{item.reply}</Text>
              </View>
            ) : (
              <>
                {/* 답장 입력란 */}
                <TextInput
                  style={styles.input}
                  placeholder="답장을 입력하세요"
                  value={replyText[item.id] || ''}
                  onChangeText={(text) => handleReplyChange(item.id, text)}
                />
                {/* 전송 버튼 */}
                <TouchableOpacity style={styles.sendButton} onPress={() => handleSendReply(item.id)}>
                  <Text style={styles.sendButtonText}>전송</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },

  inquiryBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 3,
  },
  userText: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  messageText: { fontSize: 15, marginBottom: 10, color: '#444' },

  input: {
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },

  sendButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  replyBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  replyText: { fontWeight: 'bold', color: '#007AFF', fontSize: 15 },
  replyContent: { fontSize: 15, marginTop: 5, color: '#333' },
});
