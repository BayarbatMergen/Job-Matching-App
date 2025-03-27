import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { sendUserApplicationApprovalNotification } from "../utils/notificationService";

export default function ApplicationApprovalScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicationRequests = async () => {
    try {
      const snapshot = await getDocs(collection(db, "applications"));
      const pendingRequests = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.status === "pending") {
          pendingRequests.push({
            id: docSnap.id,
            ...data,
          });
        }
      }

      setRequests(pendingRequests);
    } catch (error) {
      console.error("❌ 지원 요청 가져오기 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationRequests();
  }, []);

  const handleApprove = async (id, userEmail, jobTitle, jobId, userId) => {
    if (!userEmail || !jobTitle || !jobId || !userId) {
      Alert.alert("❌ 승인 불가", "필요한 정보가 누락되었습니다.");
      return;
    }

    try {
      // 1. 승인 상태 업데이트
      await updateDoc(doc(db, "applications", id), {
        status: "approved",
        approvedAt: new Date(),
      });

      // 2. 사용자에게 승인 알림 전송
      await sendUserApplicationApprovalNotification(userEmail, jobTitle);

      // 3. 해당 공고 정보 가져오기
      const jobDoc = await getDocs(collection(db, "jobs"));
      const job = jobDoc.docs.find((j) => j.id === jobId)?.data();

      if (!job) {
        console.warn("⚠️ 공고 데이터를 찾을 수 없습니다.");
      } else {
        // 4. 스케줄 생성
        await addDoc(collection(db, "schedules"), {
          userId,
          jobId,
          title: job.title,
          wage: job.wage,
          location: job.location,
          startDate: job.startDate,
          endDate: job.endDate,
          createdAt: new Date(),
        });
        console.log("✅ 스케줄 생성 완료");
      }

      Alert.alert("✅ 승인 완료", "지원 승인 및 스케줄이 등록되었습니다.");
      fetchApplicationRequests();
    } catch (error) {
      console.error("❌ 승인 처리 오류:", error);
      Alert.alert("오류", "승인 중 문제가 발생했습니다.");
    }
  };

  const handleReject = async (id) => {
    try {
      await deleteDoc(doc(db, "applications", id));
      Alert.alert("거절 완료", "지원 요청이 거절되었습니다.");
      fetchApplicationRequests();
    } catch (error) {
      console.error("❌ 거절 오류:", error);
      Alert.alert("오류", "거절 처리 중 문제가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>지원 대기 목록 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>지원 승인 대기 목록</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.userInfo}>지원자: {item.userEmail ?? "N/A"}</Text>
            <Text>공고 제목: {item.jobTitle ?? "N/A"}</Text>
            <Text>상태: {item.status}</Text>
            <Text>
              지원일:{" "}
              {item.appliedAt?.seconds
                ? new Date(item.appliedAt.seconds * 1000).toLocaleString("ko-KR", {
                    timeZone: "Asia/Seoul",
                  })
                : "날짜 없음"}
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() =>
                  handleApprove(item.id, item.userEmail, item.jobTitle, item.jobId, item.userId)
                }
              >
                <Text style={styles.buttonText}>승인하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleReject(item.id)}
              >
                <Text style={styles.buttonText}>거절하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 50 }}>
            대기 중인 요청이 없습니다.
          </Text>
        }
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
  userInfo: { fontWeight: "bold", marginBottom: 5, color: "#007AFF" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
