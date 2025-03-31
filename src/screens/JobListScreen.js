import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { fetchUserData } from '../services/authService';
import API_BASE_URL from '../config/apiConfig';

export default function JobListScreen({ navigation }) {
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  const fetchJobs = async (uid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/list?userId=${uid}`);
      const data = await response.json();
      if (response.ok) {
        setJobListings(data);
      } else {
        console.error("공고 불러오기 실패:", data.message);
      }
    } catch (error) {
      console.error("공고 불러오기 오류:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const initialize = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        navigation.replace("Login");
        return;
      }
      const user = await fetchUserData();  // userId 포함 객체
      setUserId(user.userId);
      fetchJobs(user.userId);
    } catch (error) {
      console.error("🛑 사용자 정보 가져오기 실패:", error);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const onRefresh = useCallback(() => {
    if (userId) {
      setRefreshing(true);
      fetchJobs(userId);
    }
  }, [userId]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '모집 공고',
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Notification')} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={28} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>공고 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={jobListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.jobCard}
            onPress={() => navigation.navigate('JobDetail', { job: item })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.wage}>{Number(item.wage).toLocaleString()}원</Text>
            <Text style={styles.date}>
              {item.startDate && item.endDate
                ? `${item.startDate} ~ ${item.endDate}`
                : '기간 정보 없음'}
            </Text>
            <Text style={styles.location}>📍 {item.location}</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  jobCard: {
    backgroundColor: '#F8F8F8',
    padding: 18,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  wage: { fontSize: 16, color: 'red', marginBottom: 4 },
  date: { fontSize: 14, color: '#555', marginBottom: 4 },
  location: { fontSize: 14, color: '#777' },
  iconButton: { paddingRight: 15 },
});
