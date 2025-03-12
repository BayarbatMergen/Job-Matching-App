import React, { useState } from "react";
import { TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native";

const ApplyButton = ({ jobId, userEmail }) => {
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://192.168.0.6:5000/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("✅ 지원 완료", "지원이 성공적으로 제출되었습니다.");
      } else {
        throw new Error(data.message || "지원 요청 실패");
      }
    } catch (error) {
      Alert.alert("❌ 지원 실패", error.message);
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
