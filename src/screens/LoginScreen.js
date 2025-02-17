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
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ AsyncStorage 추가
import { loginWithBackend, loginWithFirebase, resetPassword } from "../services/authService"; // ✅ 로그인 & 비밀번호 찾기 API
import Constants from "expo-constants"; // ✅ 환경 변수에서 백엔드 사용 여부 가져오기

// ✅ 환경 변수에서 백엔드 인증 사용 여부 확인
const useBackendAuth = Constants.expoConfig?.extra?.useBackendAuth ?? true;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ 로그인된 사용자 이메일 불러오기 (디버깅용)
  useEffect(() => {
    const checkStoredEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        if (storedEmail) {
          console.log("✅ 저장된 사용자 이메일:", storedEmail);
        } else {
          console.warn("⚠️ 저장된 사용자 이메일 없음");
        }
      } catch (error) {
        console.error("❌ AsyncStorage에서 이메일 불러오기 오류:", error);
      }
    };

    checkStoredEmail();
  }, []);

  // ✅ 로그인 처리 함수
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력하세요.");
      return;
    }

    setLoading(true); // 로그인 진행 중
    try {
      let user;
      if (useBackendAuth) {
        const role = email.includes("admin") ? "admin" : "user"; // ✅ 관리자 여부 자동 판별
        const response = await loginWithBackend(email, password, role);
        user = response.user;
      } else {
        user = await loginWithFirebase(email, password);
      }

      // ✅ 로그인 성공 후 이메일을 AsyncStorage에 저장
      await AsyncStorage.setItem('userEmail', user.email);
      console.log("✅ 로그인 후 저장된 이메일:", user.email);

      Alert.alert("로그인 성공", `${user.name || user.email}님 환영합니다!`);

      // ✅ 관리자 여부 확인 후 페이지 이동
      if (user.role === "admin") {
        navigation.replace("AdminMain");
      } else {
        navigation.replace("Main");
      }
    } catch (error) {
      console.error("❌ 로그인 실패:", error);
      Alert.alert("로그인 실패", error.message || "서버 오류");
    } finally {
      setLoading(false); // 로그인 종료
    }
  };

  // ✅ 비밀번호 재설정 요청 함수
  const handleResetPassword = async () => {
    if (!resetEmail) {
      Alert.alert("입력 오류", "⚠️ 이메일을 입력하세요.");
      return;
    }

    try {
      const message = await resetPassword(resetEmail);
      Alert.alert("✅ 이메일 전송 완료", message);
      setIsResetMode(false); // 비밀번호 찾기 모드 종료
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

            {/* 이메일 입력 */}
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* 비밀번호 입력 */}
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading} // 중복 클릭 방지
            >
              <Text style={styles.loginButtonText}>
                {loading ? "로그인 중..." : "로그인"}
              </Text>
            </TouchableOpacity>

            {/* 회원가입 / 비밀번호 찾기 */}
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
