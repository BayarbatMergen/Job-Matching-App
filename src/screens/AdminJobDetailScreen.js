import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function AdminJobDetailScreen({ route, navigation }) {
  const { job, updateJob } = route.params; // 🔥 updateJob을 함께 받아오기
  const [editedJob, setEditedJob] = useState(job);

  // 📌 입력값 변경 시 업데이트
  const handleChange = (field, value) => {
    setEditedJob((prev) => ({ ...prev, [field]: value }));
  };

  // 📌 저장 버튼 클릭 시 데이터 업데이트 후 리스트 화면으로 이동
  const handleSave = () => {
    updateJob(editedJob); // 🔥 부모(AdminJobListScreen)에서 상태 업데이트
    navigation.goBack(); // 🔥 이전 화면으로 돌아가기
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>공고 수정</Text>

        <Text style={styles.label}>공고 제목</Text>
        <TextInput style={styles.input} value={editedJob.title} onChangeText={(text) => handleChange('title', text)} />

        <Text style={styles.label}>급여</Text>
        <TextInput style={styles.input} value={editedJob.wage} onChangeText={(text) => handleChange('wage', text)} />

        <Text style={styles.label}>근무 기간</Text>
        <TextInput style={styles.input} value={editedJob.date} onChangeText={(text) => handleChange('date', text)} />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
