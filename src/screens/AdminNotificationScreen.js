import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

export default function AdminNotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const newData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(newData);
        setLoading(false);
      },
      error => {
        console.error('알림 불러오기 오류:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
<TouchableOpacity
  onPress={() => navigation.navigate('AdminSchedule', { screen: 'SettlementApprovalScreen' })}
  style={styles.notificationItem}
>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>
        {item.createdAt?.toDate
          ? format(item.createdAt.toDate(), 'yyyy년 M월 d일 HH:mm')
          : '날짜 없음'}
      </Text>
      {item.status === 'unread' && <Text style={styles.badge}>● 새 알림</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  notificationItem: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  message: { fontSize: 15, marginBottom: 6, color: '#333' },
  time: { fontSize: 12, color: '#888' },
  badge: {
    marginTop: 5,
    color: 'red',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
