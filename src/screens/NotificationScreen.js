import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState, useCallback } from 'react';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) return;

      // 개인 알림 가져오기
      const personalQuery = query(
        collection(db, 'notifications', userId, 'userNotifications'),
        orderBy('createdAt', 'desc')
      );
      const unsubscribePersonal = onSnapshot(personalQuery, (snapshot) => {
        const personalNotifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          source: 'personal',
        }));
        mergeNotifications(personalNotifs);
      });

      // 글로벌 알림 가져오기
      const globalQuery = query(
        collection(db, 'globalNotifications'),
        orderBy('createdAt', 'desc')
      );
      const unsubscribeGlobal = onSnapshot(globalQuery, (snapshot) => {
        const globalNotifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          source: 'global',
        }));
        mergeNotifications(globalNotifs, true);
      });

      return () => {
        unsubscribePersonal();
        unsubscribeGlobal();
      };
    };

    const mergeNotifications = (newData, isGlobal = false) => {
      setNotifications((prev) => {
        const filtered = prev.filter((item) => item.source !== (isGlobal ? 'global' : 'personal'));
        const combined = [...newData, ...filtered];
        return combined.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      });
    };

    fetchNotifications();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    const userId = await SecureStore.getItemAsync('userId');
    if (!userId) return;
    await updateDoc(doc(db, 'notifications', userId, 'userNotifications', id), { read: true });
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        item.source === 'personal' && !item.read && styles.personalUnreadCard,
        item.source === 'personal' && item.read && styles.personalReadCard,
      ]}
      onPress={() => {
        if (item.source === 'personal' && !item.read) {
          markAsRead(item.id);
        }
      }}
    >
      <Ionicons
        name={item.source === 'personal' && !item.read ? 'notifications' : 'checkmark-done-outline'}
        size={24}
        color={
          item.source === 'personal' && !item.read
            ? '#007AFF' // 파란색
            : '#666' // 읽음 or 글로벌은 회색
        }
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.message,
            item.source === 'personal' && !item.read && styles.personalUnreadText,
            item.source === 'personal' && item.read && styles.personalReadText,
          ]}
        >
          {item.message}
        </Text>
        <Text style={styles.time}>
          {item.createdAt?.seconds
            ? new Date(item.createdAt.seconds * 1000).toLocaleString()
            : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>알림이 없습니다.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', padding: 15 },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  personalUnreadCard: { backgroundColor: '#EAF5FF' }, // 연파란색 배경
  personalReadCard: { backgroundColor: '#B3D9FF' }, // 읽음 시 하얀색
  icon: { marginRight: 12 },
  textContainer: { flex: 1 },
  message: { fontSize: 16 },
  personalUnreadText: { fontWeight: 'bold', color: '#007AFF' }, // 파란색 글자
  personalReadText: { color: '#000000' },
  time: { fontSize: 12, color: '#000000', marginTop: 5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#999', marginTop: 10 },
});
