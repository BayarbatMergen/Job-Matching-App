import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import API_BASE_URL from '../config/apiConfig';

export default function ApprovalScreen() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/applications/pending`);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('❌ 지원 요청 가져오기 오류:', error);
      Alert.alert('오류', '지원 요청을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        Alert.alert('승인 완료', '지원 요청을 승인했습니다.');
        fetchApplications();
      } else {
        throw new Error('승인 실패');
      }
    } catch (error) {
      console.error('❌ 승인 오류:', error);
      Alert.alert('오류', '승인 중 문제가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>승인 대기 목록 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.jobTitle}</Text>
            <Text>지원자: {item.userEmail}</Text>
            <Text>지원일: {item.appliedAt?.split('T')[0]}</Text>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleApprove(item.id)}
            >
              <Ionicons name="checkmark-done-outline" size={20} color="white" />
              <Text style={styles.approveButtonText}> 승인하기</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  approveButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  approveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 5 },
});
