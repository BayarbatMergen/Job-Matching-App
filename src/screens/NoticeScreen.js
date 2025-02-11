import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const notices = [
  { id: '1', title: '📢 신규 기능 업데이트', date: '2025-02-10' },
  { id: '2', title: '⏰ 서버 점검 안내', date: '2025-02-12' },
  { id: '3', title: '⚠️ 보안 업데이트', date: '2025-02-15' },
];

export default function NoticeScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={notices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.noticeItem}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  noticeItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  date: { fontSize: 14, color: 'gray' },
});
