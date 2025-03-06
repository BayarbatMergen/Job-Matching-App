import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithBackend, resetPasswordWithBackend } from "../services/authService";
import { fetchUserData } from "../services/authService";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ 저장된 이메일 불러오기 (디버깅용)
  useEffect(() => {
    console.log("🚀 useEffect 실행됨! fetchUserData() 호출 예정");

    const fetchWithDelay = async () => {
        let token = await AsyncStorage.getItem('authToken');

        if (!token) {
            console.warn("⚠️ 저장된 토큰이 없음! 0.5초 후 다시 시도...");
            setTimeout(async () => {
                token = await AsyncStorage.getItem('authToken');
                console.log("🔹 가져온 토큰 (재시도 후):", token);
                if (token) {
                    fetchUserData(token);
                } else {
                    console.error("❌ 최종적으로 토큰 없음. 로그인 화면 유지");
                }
            }, 500);
        } else {
            console.log("🔹 가져온 토큰:", token);
            fetchUserData(token);
        }
    };

    fetchWithDelay();
}, []);





  // ✅ 로그인 처리 함수
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("입력 오류", "⚠️ 이메일과 비밀번호를 입력하세요.");
      return;
    }
  
    try {
      const response = await fetch("http://192.168.0.6:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const result = await response.json();
      console.log("✅ 로그인 응답 데이터:", result);
  
      if (response.ok) {
        Alert.alert("로그인 성공", "✅ 환영합니다!");
  
        // ✅ 1. 토큰과 이메일 저장 후 바로 확인
        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem('userEmail', result.user.email);
        console.log("🔹 토큰과 이메일 저장 완료");
  
        // ✅ 2. 저장된 토큰 즉시 확인
        const savedToken = await AsyncStorage.getItem('authToken');
        console.log("🔹 저장된 토큰 확인:", savedToken);
  
        if (savedToken) {
          navigation.replace("Main"); // ✅ 홈 화면으로 이동
        } else {
          Alert.alert("로그인 오류", "토큰 저장 실패");
        }
      } else {
        Alert.alert("로그인 실패", result.message || "서버 오류");
      }
  
    } catch (error) {
      console.error("❌ 로그인 오류:", error);
      Alert.alert("로그인 실패", "서버 오류");
    }
  };

  // ✅ 비밀번호 재설정 요청
  const handleResetPassword = async () => {
    if (!resetEmail) {
      Alert.alert("입력 오류", "⚠️ 이메일을 입력하세요.");
      return;
    }

    try {
      const message = await resetPasswordWithBackend(resetEmail);
      Alert.alert("✅ 이메일 전송 완료", message);
      setIsResetMode(false);
    } catch (error) {
      Alert.alert("❌ 실패", error.message || "서버 오류");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* 로고 */}
        <Image
          source={require("../../assets/images/thechingu.png")}
          style={styles.logo}
        />

        {/* 📌 로그인 모드 */}
        {!isResetMode ? (
          <>
            <Text style={styles.title}>로그인</Text>

            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "로그인 중..." : "로그인"}
              </Text>
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerText}>회원가입</Text>
              </TouchableOpacity>
              <Text style={styles.separator}> | </Text>
              <TouchableOpacity onPress={() => setIsResetMode(true)}>
                <Text style={styles.forgotPasswordText}>비밀번호 찾기</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* 📌 비밀번호 재설정 모드 */
          <>
            <Text style={styles.title}>비밀번호 찾기</Text>

            <TextInput
              style={styles.input}
              placeholder="이메일 입력"
              placeholderTextColor="#aaa"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
            />

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPassword}
            >
              <Text style={styles.resetButtonText}>비밀번호 재설정 요청</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsResetMode(false)}>
              <Text style={styles.backToLoginText}>로그인으로 돌아가기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

// ✅ 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 30,
  },
  innerContainer: { width: "100%", alignItems: "center", marginTop: 200 },
  logo: { width: 180, height: 180, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#333" },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },
  loginButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  footerContainer: { flexDirection: "row", marginTop: 15 },
  registerText: { color: "#007AFF", fontSize: 16, fontWeight: "500" },
  forgotPasswordText: { color: "#FF5733", fontSize: 16, fontWeight: "500" },
  separator: { fontSize: 16, color: "#333", marginHorizontal: 10 },
  resetButton: {
    backgroundColor: "#FF5733",
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },
  resetButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  backToLoginText: {
    color: "#007AFF",
    fontSize: 16,
    marginTop: 15,
    fontWeight: "500",
  },
});

export default LoginScreen;
