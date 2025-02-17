import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { db } from '../config/firebase'; // Firestore 가져오기
import { collection, getDocs } from 'firebase/firestore'; 

export default function JobListScreen({ navigation }) {
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Firestore에서 공고 목록 가져오기
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'jobs'));
        const jobs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobListings(jobs);
      } catch (error) {
        console.error("❌ 모집 공고 불러오기 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

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
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.jobCard}
            onPress={() => navigation.navigate('JobDetail', { job: item })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.wage}>{item.wage}</Text>
            <Text style={styles.date}>{item.date}</Text>
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
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  wage: { fontSize: 16, color: 'red', marginBottom: 5 },
  date: { fontSize: 14, textAlign: 'right', color: 'gray' },
  iconButton: { paddingRight: 15 },
});
