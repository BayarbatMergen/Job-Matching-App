import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, 
  StyleSheet, SafeAreaView, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminJobListScreen({ navigation }) {
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ 로그인한 사용자의 관리자 여부 확인
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        console.log("📌 저장된 userRole:", role); // 디버깅용
        setIsAdmin(role === 'admin'); // ✅ 불러온 role이 "admin"이면 true
      } catch (error) {
        console.error("❌ 관리자 확인 오류:", error);
      }
    };

    checkAdminStatus();
  }, []);

  // 📌 Firestore에서 공고 목록 가져오기
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

  // ❌ 공고 삭제 함수
  const deleteJob = async (jobId) => {
    if (!isAdmin) {
      Alert.alert('권한 오류', '관리자만 공고를 삭제할 수 있습니다.');
      return;
    }
  
    Alert.alert('삭제 확인', '정말로 이 공고를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        onPress: async () => {
          try {
            console.log("🚀 관리자 이메일 확인:", request.auth.token.email);
            await deleteDoc(doc(db, 'jobs', jobId));
            setJobListings((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
            Alert.alert('삭제 완료', '공고가 삭제되었습니다.');
          } catch (error) {
            console.error("❌ 공고 삭제 오류:", error);
            Alert.alert('오류 발생', '공고 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>공고 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          data={jobListings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <TouchableOpacity
                style={styles.jobContent}
                onPress={() =>
                  navigation.navigate('AdminJobDetail', {
                    job: item,
                    updateJob: (updatedJob) => {
                      setJobListings((prevJobs) =>
                        prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
                      );
                    },
                  })
                }
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                  <Text style={styles.wage}>{item.wage}</Text>
                </View>
              </TouchableOpacity>

              {/* ❌ 삭제 버튼 (관리자만 활성화) */}
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => deleteJob(item.id)}
                disabled={!isAdmin} // ✅ 관리자만 삭제 가능
              >
                <Ionicons name="trash-outline" size={24} color={isAdmin ? "red" : "gray"} />
              </TouchableOpacity>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />

        {/* 📌 하단 공고 등록 버튼 */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AdminJobForm')}
        >
          <Ionicons name="add-circle-outline" size={28} color="white" />
          <Text style={styles.addButtonText}> 공고 등록</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  jobCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8F8F8', 
    padding: 15, 
    marginBottom: 15, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#ccc' 
  },
  jobContent: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  date: { fontSize: 14, color: '#555', marginBottom: 5 },
  wage: { fontSize: 16, color: 'red', marginBottom: 5 },
  deleteButton: { padding: 8, borderRadius: 5, alignItems: 'center' },
  addButton: { 
    position: 'absolute', 
    bottom: 20, 
    alignSelf: 'center', 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#007AFF', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 30 
  },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});
