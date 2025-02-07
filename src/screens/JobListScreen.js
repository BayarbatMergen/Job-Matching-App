import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const jobListings = [
  { id: '1', title: '한화 리조트 대천 주말 알바 채용', wage: '일급 10만원', date: '11.22-11.23' },
  { id: '2', title: '편의점 야간 근무자 모집', wage: '시급 12,000원', date: '11.25-11.30' },
  { id: '3', title: '레스토랑 서빙 아르바이트', wage: '시급 11,000원', date: '12.01-12.15' },
];

export default function JobListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={jobListings}
        keyExtractor={(item) => item.id}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
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
