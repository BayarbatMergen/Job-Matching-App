import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { db } from "../config/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
const jwtDecode = require("jwt-decode");

const ApplyButton = ({ job, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [hasApplied, setHasApplied] = useState(false); // ✅ 중복 지원 여부

  // 사용자 인증 정보 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("userId");
        const storedToken = await SecureStore.getItemAsync("token");

        if (!storedUserId || !storedToken) {
          console.warn("저장된 데이터가 없음");
          navigation.navigate("Login");
          return;
        }

        const decodedToken = jwtDecode(storedToken);
        const email = decodedToken.email;

        setUserId(storedUserId);
        setToken(storedToken);
        setUserEmail(email);
      } catch (error) {
        console.error("사용자 정보 불러오기 오류:", error);
        navigation.navigate("Login");
      }
    };

    fetchUserData();
  }, [navigation]);

  // ✅ 중복 지원 여부 확인
  useEffect(() => {
    const checkAlreadyApplied = async () => {
      if (!userEmail || !job?.id) return;

      try {
        const response = await fetch(
          `http://192.168.0.5:5000/api/jobs/applied?jobId=${job.id}&userEmail=${userEmail}`
        );
        const data = await response.json();

        if (response.ok && data.alreadyApplied) {
          setHasApplied(true);
        }
      } catch (error) {
        console.error("중복 지원 확인 오류:", error);
      }
    };

    checkAlreadyApplied();
  }, [userEmail, job]);

  const handleApply = async () => {
    if (!userId || !token || !userEmail) {
      Alert.alert("인증 오류", "로그인이 필요합니다.", [
        { text: "확인", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch("http://192.168.0.5:5000/api/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId: job.id, userEmail }),
      });
  
      const data = await response.json();
      console.log("📨 서버 응답:", data);
  
      if (response.ok) {
        // ✅ 사용자 이름 조회
        const userQuery = query(
          collection(db, "users"),
          where("email", "==", userEmail)
        );
        const userSnap = await getDocs(userQuery);
        const userData = userSnap.docs[0]?.data();
        const userName = userData?.name || userEmail;
  
        // ✅ 관리자 알림 전송
        await addDoc(collection(db, "notifications"), {
          type: "application",
          status: "unread",
          createdAt: serverTimestamp(),
          recipientRole: "admin",
          jobId: job.id,
          jobTitle: job.title,
          userEmail: userEmail,
          message: `${userName} 님이 "${job.title}" 공고에 지원했습니다.`,
        });
  
        Alert.alert("지원 완료", `${job.title}에 지원 요청이 전송되었습니다.`);
        setHasApplied(true);
        navigation.navigate("JobList");
      } else {
        if (data.message === "이미 해당 공고에 지원하셨습니다.") {
          setHasApplied(true);
          Alert.alert("⚠️ 중복 지원", data.message);
        } else {
          throw new Error(data.message || "지원 요청 실패");
        }
      }
    } catch (error) {
      console.error("지원 요청 오류:", error.message);
      Alert.alert("오류 발생", error.message);
    } finally {
      setLoading(false);
    }
  };
  

  // ✅ 지원 완료 상태 UI
  if (hasApplied) {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: "gray",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
        }}
        disabled
      >
        <Text style={{ color: "#FFF", fontSize: 16 }}>
          이미 지원한 공고입니다
        </Text>
      </TouchableOpacity>
    );
  }

  // 기본 버튼
  return (
    <TouchableOpacity
      onPress={handleApply}
      style={{
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
      }}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>
          지원하기
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default ApplyButton;
