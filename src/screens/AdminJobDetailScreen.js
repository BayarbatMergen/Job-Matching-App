import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

export default function AdminJobDetailScreen({ route, navigation }) {
  const { job, updateJob } = route.params;
  const [editedJob, setEditedJob] = useState(job);

  // 📌 입력값 변경 시 업데이트
  const handleChange = (field, value) => {
    setEditedJob((prev) => ({ ...prev, [field]: value }));
  };

  // 📌 숫자 입력 검증 (급여, 모집 인원)
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.detailTitle}>공고 수정</Text>

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

        <Text style={styles.label}>숙식 제공 여부</Text>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: editedJob.accommodation ? '#4CAF50' : '#FF3B30' }]}
          onPress={() => handleChange('accommodation', !editedJob.accommodation)}
        >
          <Text style={styles.toggleText}>{editedJob.accommodation ? '숙식 제공 O' : '숙식 제공 X'}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>모집 인원</Text>
        <View style={styles.recruitmentContainer}>
          <View style={styles.recruitmentBox}>
            <Text style={styles.recruitmentLabel}>남성</Text>
            <TextInput
              style={styles.input}
              value={editedJob.maleRecruitment}
              keyboardType="numeric"
              onChangeText={(text) => handleNumberInput('maleRecruitment', text)}
              placeholder="숫자만 입력 가능"
            />
          </View>
          <View style={styles.recruitmentBox}>
            <Text style={styles.recruitmentLabel}>여성</Text>
            <TextInput
              style={styles.input}
              value={editedJob.femaleRecruitment}
              keyboardType="numeric"
              onChangeText={(text) => handleNumberInput('femaleRecruitment', text)}
              placeholder="숫자만 입력 가능"
            />
          </View>
        </View>

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
  scrollContainer: { flexGrow: 1, paddingVertical: 20 },
  container: { flex: 1, padding: 25, backgroundColor: '#fff' },
  detailTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#222' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 5 },
  recruitmentContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  recruitmentBox: { flex: 1, marginHorizontal: 5 },
  recruitmentLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  textArea: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 5, height: 80 },
  toggleButton: { padding: 10, borderWidth: 1, borderRadius: 8, marginTop: 5, alignItems: 'center' },
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
