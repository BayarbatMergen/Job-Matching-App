import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store"; // AsyncStorage 대신 SecureStore 사용

const ApplyButton = ({ job, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("userId");
        const storedToken = await SecureStore.getItemAsync("token");

        console.log("📌 [fetchUserData] storedUserId:", storedUserId);
        console.log("📌 [fetchUserData] storedToken:", storedToken);

        setUserId(storedUserId);
        setToken(storedToken);

        if (!storedUserId || !storedToken) {
          console.warn("⚠️ 저장된 데이터가 불완전함:", { storedUserId, storedToken });
        }
      } catch (error) {
        console.error("❌ fetchUserData 오류:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleApply = async () => {
    setLoading(true);
    try {
      if (!token) {
        const retryToken = await SecureStore.getItemAsync("token");
        console.log("📌 [handleApply] 재시도 토큰:", retryToken);
        if (!retryToken) {
          console.error("❌ 지원 요청 실패: 저장된 토큰 없음");
          Alert.alert("❌ 인증 오류", "로그인이 필요합니다.", [
            { text: "확인", onPress: () => navigation.navigate("Login") },
          ]);
          return;
        }
        setToken(retryToken);
      }

      const response = await fetch("http://192.168.0.6:5000/api/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId: job.id, userId }),
      });

      const data = await response.json();
      console.log("📌 [handleApply] 서버 응답:", data);

      if (response.ok) {
        Alert.alert("✅ 지원 완료", `${job.title}에 대한 지원 요청이 전송되었습니다.`);
        navigation.navigate("JobList");
      } else {
        throw new Error(data.message || "지원 요청 실패");
      }
    } catch (error) {
      console.error("❌ 지원 요청 오류:", error);
      Alert.alert("❌ 오류 발생", "서버와의 연결이 원활하지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

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