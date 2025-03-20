import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ApplyButton from '../components/ApplyButton';

export default function JobDetailScreen({ route, navigation }) {
  const { job } = route.params ?? {};
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('userId');
        if (storedUserId) {
          setUserId(storedUserId);
          console.log("✅ 불러온 사용자 ID:", storedUserId);
        }
      } catch (error) {
        console.error("❌ 사용자 ID 불러오기 오류:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    console.log("📌 [Job Data]:", job);
  }, [job]);

  if (!job) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>공고 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.detailTitle}>{job.title}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.detailSubTitle}>📌 근무 조건</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>근무 기간:</Text> {job.startDate && job.endDate ? `${job.startDate} ~ ${job.endDate}` : "미정"}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>급여:</Text> {job.wage ? `${Number(job.wage).toLocaleString()}원` : "미정"}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>근무 요일:</Text> {Array.isArray(job.workDays) ? job.workDays.join(", ") : job.workDays || "미정"}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>근무 시간:</Text> {job.workHours || "미정"}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>업직종:</Text> {job.industry || "미정"}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>고용 형태:</Text> {job.employmentType || "미정"}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>숙식 제공:</Text> {job.accommodation ? "O" : "X"}</Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>모집 인원:</Text> 남 {job.maleRecruitment || 0}명 / 여 {job.femaleRecruitment || 0}명
          </Text>
          <Text style={styles.detailText}><Text style={styles.bold}>근무 지역:</Text> {job.location || "미정"}</Text>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.detailSubTitle}>상세 요강</Text>
          <Text style={styles.descriptionText}>{job.description || '상세 정보가 등록되지 않았습니다.'}</Text>
        </View>

        <ApplyButton job={job} navigation={navigation} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingVertical: 20 },
  container: { flex: 1, padding: 25, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  detailTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#222' },
  infoBox: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  detailSubTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#444' },
  detailText: { fontSize: 16, color: '#333', marginBottom: 10 },
  bold: { fontWeight: 'bold', color: '#000' },
  descriptionBox: {
    backgroundColor: '#FAFAFA',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 30,
  },
  descriptionText: { fontSize: 15, color: '#444', lineHeight: 22 },
});
