import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
const jwtDecode = require('jwt-decode'); // 변경

const ApplyButton = ({ job, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("userId");
        const storedToken = await SecureStore.getItemAsync("token");

        console.log(" [ApplyButton] storedUserId:", storedUserId);
        console.log(" [ApplyButton] storedToken:", storedToken);

        if (!storedUserId || !storedToken) {
          console.warn(" 저장된 데이터가 불완전함:", { storedUserId, storedToken });
          navigation.navigate("Login");
          return;
        }

        const decodedToken = jwtDecode(storedToken);
        console.log(" [ApplyButton] decodedToken:", decodedToken);
        const email = decodedToken.email;

        setUserId(storedUserId);
        setToken(storedToken);
        setUserEmail(email);
      } catch (error) {
        console.error(" fetchUserData 오류:", error);
        navigation.navigate("Login");
      }
    };

    fetchUserData();
  }, [navigation]);

  const handleApply = async () => {
    if (!userId || !token || !userEmail) {
      Alert.alert(" 인증 오류", "로그인이 필요합니다.", [
        { text: "확인", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    setLoading(true);
    try {
      const requestBody = { jobId: job.id, userEmail };
      console.log(" [handleApply] 전송 데이터:", JSON.stringify(requestBody));

      const response = await fetch("http://192.168.0.5:5000/api/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log(" [handleApply] 서버 응답:", data);

      if (response.ok) {
        Alert.alert(" 지원 완료", `${job.title}에 대한 지원 요청이 전송되었습니다.`);
        navigation.navigate("JobList");
      } else {
        throw new Error(data.message || "지원 요청 실패");
      }
    } catch (error) {
      console.error(" 지원 요청 오류:", error.message);
      Alert.alert(" 오류 발생", error.message);
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