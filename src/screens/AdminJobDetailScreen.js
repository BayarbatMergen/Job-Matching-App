import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

export default function AdminJobDetailScreen({ route, navigation }) {
  const { job, updateJob } = route.params;
  const [editedJob, setEditedJob] = useState(job);

  // 📌 입력값 변경 시 업데이트
  const handleChange = (field, value) => {
    setEditedJob((prev) => ({ ...prev, [field]: value }));
  };

  // 📌 숫자 입력 검증
  const handleNumberInput = (field, value) => {
    if (/^\d*$/.test(value)) {
      setEditedJob((prev) => ({ ...prev, [field]: value }));
    }
  };

  // 📌 공고 수정 저장
  const handleSave = () => {
    for (let key in editedJob) {
      if (editedJob[key] === '') {
        Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
        return;
      }
    }

    updateJob(editedJob);
    Alert.alert('수정 완료', '공고가 성공적으로 수정되었습니다.');
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>공고 수정</Text>

        <Text style={styles.label}>공고 제목</Text>
        <TextInput style={styles.input} value={editedJob.title} onChangeText={(text) => handleChange('title', text)} />

        <Text style={styles.label}>급여</Text>
        <TextInput
          style={styles.input}
          value={editedJob.wage}
          keyboardType="numeric"
          onChangeText={(text) => handleNumberInput('wage', text)}
          placeholder="숫자만 입력 가능"
        />

        <Text style={styles.label}>근무 기간</Text>
        <TextInput
          style={styles.input}
          value={editedJob.date}
          onChangeText={(text) => handleChange('date', text)}
          placeholder="YYYY-MM-DD ~ YYYY-MM-DD"
        />

        <Text style={styles.label}>근무 요일</Text>
        <TextInput style={styles.input} value={editedJob.workDays} onChangeText={(text) => handleChange('workDays', text)} />

        <Text style={styles.label}>근무 시간</Text>
        <TextInput style={styles.input} value={editedJob.workHours} onChangeText={(text) => handleChange('workHours', text)} />

        <Text style={styles.label}>모집 인원</Text>
        <TextInput
          style={styles.input}
          value={editedJob.recruitment}
          keyboardType="numeric"
          onChangeText={(text) => handleNumberInput('recruitment', text)}
          placeholder="숫자만 입력 가능"
        />

        <Text style={styles.label}>숙식 제공 여부</Text>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: editedJob.accommodation ? '#4CAF50' : '#FF3B30' }]}
          onPress={() => handleChange('accommodation', !editedJob.accommodation)}
        >
          <Text style={styles.toggleText}>{editedJob.accommodation ? '숙식 제공 O' : '숙식 제공 X'}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>근무 지역</Text>
        <TextInput style={styles.input} value={editedJob.location} onChangeText={(text) => handleChange('location', text)} />

        <Text style={styles.label}>상세 요강</Text>
        <TextInput
          style={styles.textArea}
          value={editedJob.description}
          onChangeText={(text) => handleChange('description', text)}
          placeholder="업무 내용, 요구사항 등 입력"
          multiline
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>저장</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginTop: 5,
    height: 80,
    backgroundColor: '#fff',
  },
  toggleButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 5,
    alignItems: 'center',
  },
  toggleText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
