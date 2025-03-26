import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { collection, getDocs, doc, updateDoc, getDoc, query, where, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../config/firebase";

export default function SettlementApprovalScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSettlementRequests = async () => {
    try {
      const snapshot = await getDocs(collection(db, "settlements"));
      const pendingRequests = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.status === "pending") {
          // 사용자 정보 가져오기
          const userDoc = await getDoc(doc(db, "users", data.userId));
          const userData = userDoc.exists() ? userDoc.data() : { name: "알 수 없음" };

          pendingRequests.push({
            id: docSnap.id,
            userId: data.userId,
            userName: userData.name,
            totalWage: data.totalWage,
            requestedAt: data.requestedAt,
          });
        }
      }

      setRequests(pendingRequests);
    } catch (error) {
      console.error("❌ 정산 요청 가져오기 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlementRequests();
  }, []);

  const handleApprove = async (id, userId) => {
    try {
      // 상태 변경
      await updateDoc(doc(db, "settlements", id), { status: "approved" });

      // ✅ 해당 사용자의 schedules 데이터 삭제
      const scheduleQuery = query(collection(db, "schedules"), where("userId", "==", userId));
      const scheduleSnapshot = await getDocs(scheduleQuery);
      const batch = writeBatch(db);

      scheduleSnapshot.forEach((scheduleDoc) => {
        batch.delete(scheduleDoc.ref);
      });
      await batch.commit();

      Alert.alert("승인 완료", "정산 요청이 승인되었고, 스케줄 데이터가 삭제되었습니다.");
      fetchSettlementRequests();
    } catch (error) {
      console.error("❌ 승인 처리 또는 스케줄 삭제 오류:", error);
      Alert.alert("오류", "승인 처리 중 문제가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>승인 대기 목록 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>정산 승인 요청 목록</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text>요청 금액: {Number(item.totalWage).toLocaleString()}원</Text>
            <Text>요청 날짜: {new Date(item.requestedAt.seconds * 1000).toLocaleDateString()}</Text>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleApprove(item.id, item.userId)}
            >
              <Text style={styles.buttonText}>승인</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 50 }}>대기 중인 요청이 없습니다.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  userName: { fontWeight: "bold", marginBottom: 5, color: "#007AFF" },
  approveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
