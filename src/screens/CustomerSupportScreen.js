import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function CustomerSupportScreen() {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message) {
      Alert.alert('입력 오류', '문의 내용을 입력해주세요.');
      return;
    }
    Alert.alert('문의 완료', '고객센터에 문의가 접수되었습니다.');
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>문의 내용</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={5}
        value={message}
        onChangeText={setMessage}
        placeholder="문의 내용을 입력하세요"
      />

      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Text style={styles.sendButtonText}>보내기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: { height: 120, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingTop: 10, fontSize: 16, textAlignVertical: 'top' },
  sendButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  sendButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
