import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';

export default function MyInquiriesScreen() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const userEmail = await SecureStore.getItemAsync('userEmail');
        if (!userEmail) return;

        const q = query(
          collection(db, 'customerInquiries'),
          where('email', '==', userEmail),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setInquiries(data);
      } catch (error) {
        console.error('❌ 내 문의 내역 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 문의 내역</Text>
      <FlatList
        data={inquiries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.inquiryBox}>
            <Text style={styles.message}>{item.message}</Text>
            {item.reply ? (
              <View style={styles.replyBox}>
                <Text style={styles.replyLabel}>답변:</Text>
                <Text style={styles.replyContent}>{item.reply}</Text>
              </View>
            ) : (
              <Text style={styles.pending}>답변 대기 중...</Text>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>문의 내역이 없습니다.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inquiryBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  message: { fontSize: 16, color: '#333', marginBottom: 10 },
  replyBox: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  replyLabel: { fontWeight: 'bold', color: '#007AFF', marginBottom: 5 },
  replyContent: { fontSize: 15, color: '#333' },
  pending: { color: '#999', fontStyle: 'italic' },
});
