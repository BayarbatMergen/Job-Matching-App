import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function JobDetailScreen({ route, navigation }) {
  const { job } = route.params;

  // ✅ 지원하기 버튼 클릭 시 실행
  const handleApply = () => {
    Alert.alert(
      "지원 완료",
      `${job.title}에 대한 지원 요청이 전송되었습니다.`,
      [
        { text: "확인", onPress: () => navigation.navigate('JobList') } // ✅ 지원 후 공고 목록으로 이동
      ]
    );
    console.log(`✅ [지원 완료] ${job.title} - ${job.wage}, 근무 기간: ${job.date}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.detailTitle}>{job.title}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.detailSubTitle}>📌 근무 조건</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>💰 급여:</Text> {job.wage}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>📅 근무 기간:</Text> {job.date}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>🗓 근무 요일:</Text> 금-토</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>⏰ 근무 시간:</Text> 9:00-18:00</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>🏢 업직종:</Text> 정비</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>📑 고용형태:</Text> 단기</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>🏠 숙식 여부:</Text> 숙소 있음</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>👥 모집 인원:</Text> 5명 (남성 3, 여성 2)</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>📍 근무 지역:</Text> 서울 강남구</Text>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.detailSubTitle}>📄 상세 요강</Text>
          <Text style={styles.descriptionText}>
            - 고객 응대 및 서비스 지원{'\n'}
            - 근무시간 엄수 및 청결 유지{'\n'}
            - 동료들과 협력하여 원활한 운영 지원
          </Text>
        </View>

        {/* ✅ 지원하기 버튼 */}
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>✅ 지원하기</Text>
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
