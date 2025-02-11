import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function NoticeWriteScreen() {
  const [notice, setNotice] = useState('');

  const handlePostNotice = () => {
    if (!notice.trim()) {
      alert('공지사항 내용을 입력하세요.');
      return;
    }
    alert('공지사항이 등록되었습니다.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>공지사항 작성</Text>
      <TextInput
        style={styles.textArea}
        placeholder="공지 내용을 입력하세요..."
        multiline
        value={notice}
        onChangeText={setNotice}
      />
      <TouchableOpacity style={styles.button} onPress={handlePostNotice}>
        <Text style={styles.buttonText}>등록하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  textArea: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
