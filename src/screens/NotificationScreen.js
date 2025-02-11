import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 샘플 알림 데이터
const initialNotifications = [
  { id: '1', message: '📢 새로운 공고가 등록되었습니다!', time: '1시간 전', read: false },
  { id: '2', message: '💰 정산 요청이 완료되었습니다.', time: '2시간 전', read: true },
  { id: '3', message: '⚠️ 관리자 공지가 도착했습니다.', time: '5시간 전', read: false },
  { id: '4', message: '🎉 채용이 확정되었습니다! 자세한 내용을 확인하세요.', time: '1일 전', read: true },
];

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '알림',
    });
  }, [navigation]);

  // ✅ 알림 읽기 처리
  const markAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <View style={styles.container}>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationCard, !item.read && styles.unreadNotification]}
              onPress={() => markAsRead(item.id)}
            >
              <Ionicons
                name={item.read ? 'checkmark-done-outline' : 'notifications'}
                size={24}
                color={item.read ? '#999' : '#007AFF'}
                style={styles.icon}
              />
              <View style={styles.textContainer}>
                <Text style={[styles.message, !item.read && styles.unreadText]}>{item.message}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
  container: { flex: 1, backgroundColor: '#f8f8f8', paddingHorizontal: 15, paddingTop: 10 },

  // 📌 알림 카드 디자인
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  unreadNotification: { backgroundColor: '#E6F0FF' }, // 📌 읽지 않은 알림 배경색 강조
  icon: { marginRight: 12 },
  textContainer: { flex: 1 },
  message: { fontSize: 16, color: '#333' },
  unreadText: { fontWeight: 'bold', color: '#007AFF' }, // 📌 읽지 않은 메시지 강조
  time: { fontSize: 12, color: '#666', marginTop: 5 },

  // 📌 빈 알림 화면 디자인
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#999', marginTop: 10 },

  // 📌 FlatList 내용 스타일
  listContent: { paddingBottom: 20 },
});

