import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function AdminJobFormScreen({ navigation, route }) {
  const jobToEdit = route.params?.job;
  const addJob = route.params?.addJob; // ✅ 새 공고 추가 함수 받아오기

  // 🔥 공고 입력 필드 상태
  const [title, setTitle] = useState(jobToEdit ? jobToEdit.title : '');
  const [wage, setWage] = useState(jobToEdit ? jobToEdit.wage : '');
  const [date, setDate] = useState(jobToEdit ? jobToEdit.date : '');

  // 📌 공고 저장 처리 함수
  const handleSave = () => {
    const newJob = {
      id: jobToEdit ? jobToEdit.id : Date.now().toString(), // 새로운 ID 생성
      title,
      wage,
      date,
    };

    if (jobToEdit) {
      console.log('📝 공고 수정:', newJob);
    } else {
      console.log('📌 새 공고 등록:', newJob);
      addJob(newJob); // ✅ 새로운 공고 추가
    }

    navigation.goBack(); // 🔥 `goBack()`으로 AdminJobListScreen으로 이동
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{jobToEdit ? '공고 수정' : '공고 등록'}</Text>
      <TextInput style={styles.input} placeholder="공고 제목" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="급여 (예: 시급 12,000원)" value={wage} onChangeText={setWage} />
      <TextInput style={styles.input} placeholder="근무 기간 (예: 11.22-11.23)" value={date} onChangeText={setDate} />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{jobToEdit ? '수정 완료' : '등록 완료'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 },
  saveButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
