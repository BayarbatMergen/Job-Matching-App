import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ AsyncStorage 추가

export default function JobDetailScreen({ route, navigation }) {
  const { job } = route.params ?? {}; // ✅ 유저 이메일이 없을 경우 기본값 처리
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(null); // ✅ 로그인된 사용자 이메일 상태 추가

  // ✅ 로그인된 사용자 이메일 불러오기
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (email) {
          setUserEmail(email);
          console.log("✅ 불러온 사용자 이메일:", email);
        } else {
          console.warn("⚠️ 저장된 사용자 이메일 없음");
        }
      } catch (error) {
        console.error("❌ 이메일 불러오기 오류:", error);
      }
    };
  
    fetchUserEmail();
  }, []);
  

  // ✅ job 데이터 확인
  useEffect(() => {
    console.log("📌 [Job Data]:", job);
  }, [job]);

  // ✅ 지원하기 버튼 클릭 시 실행
  const handleApply = async () => {
    console.log("📌 지원 요청 데이터:", { jobId: job?.id, userEmail });

    if (!job?.id || !userEmail) {
      console.error("❌ 필수 정보 누락: jobId 또는 userEmail이 없습니다.");
      Alert.alert("❌ 오류 발생", "로그인이 필요합니다.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://10.0.2.2:5000/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('✅ 지원 완료', `${job.title}에 대한 지원 요청이 전송되었습니다.`);
        navigation.navigate('JobList');
      } else {
        throw new Error(data.message || '지원 요청 실패');
      }
    } catch (error) {
      console.error('❌ 지원 요청 오류:', error);
      Alert.alert('❌ 오류 발생', '서버와의 연결이 원활하지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.detailTitle}>{job.title}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.detailSubTitle}>📌 근무 조건</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>급여:</Text> {job.wage || "미정"}</Text>

          {/* ✅ 근무 기간을 "공고 등록일"로 대체 */}
          <Text style={styles.detailText}>
            <Text style={styles.bold}>공고 등록일:</Text> {job.createdAt ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : "미정"}
          </Text>

          {/* ✅ 근무 요일을 올바르게 표시 (배열 -> 문자열) */}
          <Text style={styles.detailText}>
            <Text style={styles.bold}>근무 요일:</Text> {Array.isArray(job.workdays) ? job.workdays.join(", ") : job.workdays || "미정"}
          </Text>

          <Text style={styles.detailText}><Text style={styles.bold}>근무 시간:</Text> {job.workingHours || "미정"}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>업직종:</Text> {job.industry || "미정"}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>고용형태:</Text> {job.employmentType || "미정"}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>숙식 여부:</Text> {job.accommodation || "미정"}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>모집 인원:</Text> {job.recruitment || "미정"}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>근무 지역:</Text> {job.location || "미정"}</Text>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.detailSubTitle}>상세 요강</Text>
          <Text style={styles.descriptionText}>{job.description || '상세 정보 없음'}</Text>
        </View>

        {/* ✅ 지원하기 버튼 */}
        <TouchableOpacity style={styles.applyButton} onPress={handleApply} disabled={loading || !userEmail}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.applyButtonText}>{userEmail ? "지원하기" : "로그인이 필요합니다."}</Text>
          )}
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
