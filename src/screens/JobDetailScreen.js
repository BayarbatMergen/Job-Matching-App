import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function JobDetailScreen({ route, navigation }) {
  const { job } = route.params;

  // ✅ 지원하기 버튼 클릭 시 실행
  const handleApply = async () => {
    try {
      const response = await fetch('http://YOUR_BACKEND_API_URL/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, userId: 'testUserId' }), // ✅ 실제 유저 ID를 적용해야 함
      });

      if (response.ok) {
        Alert.alert('지원 완료', `${job.title}에 대한 지원 요청이 전송되었습니다.`);
        console.log(`✅ [지원 완료] ${job.title} - ${job.wage}, 근무 기간: ${job.date}`);
        navigation.navigate('JobList'); // ✅ 지원 후 공고 목록으로 이동
      } else {
        Alert.alert('지원 실패', '지원 요청을 전송하는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('❌ 지원 요청 오류:', error);
      Alert.alert('오류 발생', '서버와의 연결이 원활하지 않습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.detailTitle}>{job.title}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.detailSubTitle}>📌 근무 조건</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>급여:</Text> {job.wage}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>근무 기간:</Text> {job.date}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>근무 요일:</Text> {job.workingDays}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>근무 시간:</Text> {job.workingHours}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>업직종:</Text> {job.industry}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>고용형태:</Text> {job.employmentType}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>숙식 여부:</Text> {job.accommodation}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>모집 인원:</Text> {job.recruitment}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>근무 지역:</Text> {job.location}</Text>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.detailSubTitle}>상세 요강</Text>
          <Text style={styles.descriptionText}>{job.description || '상세 정보 없음'}</Text>
        </View>

        {/* ✅ 지원하기 버튼 */}
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>지원하기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingVertical: 20 },
  container: { flex: 1, padding: 25, backgroundColor: '#fff' },
  detailTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#222' },
  infoBox: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20
  },
  descriptionBox: {
    backgroundColor: '#FAFAFA',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  detailSubTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#444' },
  detailText: { fontSize: 18, color: '#333', marginBottom: 12 },
  bold: { fontWeight: 'bold', color: '#000' },
  descriptionText: { fontSize: 16, color: '#444', lineHeight: 24 },
  applyButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
    marginBottom: 40
  },
  applyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});

