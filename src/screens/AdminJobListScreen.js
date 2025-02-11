import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const initialJobListings = [
  { id: '1', title: '한화 리조트 대천 주말 알바 채용', wage: '일급 10만원', date: '11.22-11.23' },
  { id: '2', title: '편의점 야간 근무자 모집', wage: '시급 12,000원', date: '11.25-11.30' },
  { id: '3', title: '레스토랑 서빙 아르바이트', wage: '시급 11,000원', date: '12.01-12.15' },
  { id: '4', title: '호텔 청소 아르바이트', wage: '시급 10,500원', date: '12.10-12.20' },
  { id: '5', title: '물류 창고 아르바이트', wage: '일급 9만원', date: '12.05-12.15' },
];

export default function AdminJobListScreen({ navigation }) {
  const [jobListings, setJobListings] = useState(initialJobListings);

  // 🔥 새로운 공고 추가 함수
  const addJob = (newJob) => {
    setJobListings((prevJobs) => [...prevJobs, newJob]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 📌 공고 목록 */}
        <FlatList
          data={jobListings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.jobCard}
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
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.wage}>{item.wage}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />

        {/* 📌 하단에 고정된 공고 등록 버튼 */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AdminJobForm', { addJob })}
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
  addButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
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
});
