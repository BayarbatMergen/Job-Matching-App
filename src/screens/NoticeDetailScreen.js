import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function NoticeDetailScreen({ route }) {
  const { noticeId } = route.params;
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticeDetail = async () => {
      try {
        const docRef = doc(db, 'notices', noticeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNotice(docSnap.data());
        } else {
          console.warn('공지사항을 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('공지사항 상세 가져오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNoticeDetail();
  }, [noticeId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!notice) {
    return (
      <View style={styles.center}>
        <Text>공지사항을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{notice.title}</Text>
      <Text style={styles.date}>{notice.date}</Text>
      <Text style={styles.content}>{notice.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  date: { fontSize: 14, color: 'gray', marginBottom: 20 },
  content: { fontSize: 16, lineHeight: 24 },
});
