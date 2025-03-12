import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import * as SecureStore from 'expo-secure-store';
import API_BASE_URL from "../config/apiConfig";
import { auth } from "../config/firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ 로그인 후 토큰과 userId 저장하는 함수 수정
export const saveUserData = async (token, userId) => {
  try {
    console.log("🔹 [saveUserData] 저장할 데이터 → 토큰:", token, "| userId:", userId);

    await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("userId", userId);

    const storedToken = await SecureStore.getItemAsync("token");
    const storedUserId = await SecureStore.getItemAsync("userId");

    if (!storedToken || !storedUserId) {
      throw new Error("❌ SecureStore 저장 실패! 토큰 또는 userId 없음");
    }

    console.log("✅ 저장된 토큰 확인 (저장 후):", storedToken);
    console.log("✅ 저장된 userId 확인 (저장 후):", storedUserId);
  } catch (error) {
    console.error("❌ 토큰 및 userId 저장 오류:", error);
  }
};


// ✅ 로그인 후 토큰과 userId 저장 (email이 아니라 userId 저장)
export const loginWithBackend = async (email, password) => {
  try {
    console.log("🚀 로그인 요청 시작:", email);

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("백엔드 로그인 실패");

    const result = await response.json();
    console.log("✅ 백엔드 로그인 응답:", result);

    await saveUserData(result.token, result.user.userId);

    return result;
  } catch (error) {
    console.error("❌ 로그인 오류:", error.message);
    throw error;
  }
};

// ✅ Firebase 회원가입
export const registerWithFirebase = async (email, password) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("❌ Firebase 회원가입 오류:", error.message);
    throw error;
  }
};

// ✅ 백엔드 회원가입 API
export const registerWithBackend = async (userData) => {
  try {
    console.log("📤 백엔드 회원가입 요청:", userData.email);

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "백엔드 회원가입 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ 백엔드 회원가입 오류:", error.message);
    throw error;
  }
};

// ✅ 비밀번호 재설정
export const resetPasswordWithFirebase = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("✅ 비밀번호 재설정 이메일 전송 완료:", email);
  } catch (error) {
    console.error("❌ 비밀번호 재설정 오류:", error.message);
    throw error;
  }
};

// ✅ 로그아웃 (토큰 삭제)
export const logout = async () => {
  try {
    await signOut(auth);
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("userId");
    console.log("✅ 로그아웃 완료, SecureStore 초기화됨");
  } catch (error) {
    console.error("❌ 로그아웃 오류:", error.message);
  }
};

// ✅ Firebase 인증 상태 감지
export const authStateListener = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// ✅ 로그인된 사용자 정보 가져오기
export const fetchUserData = async () => {
  try {
    console.log("🚀 [fetchUserData] 실행됨!");

    let token = await SecureStore.getItemAsync("token");
    let userId = await SecureStore.getItemAsync("userId");

    // 🔹 0.5초 대기 후 다시 시도 (최대 3번까지 재시도)
    let retryCount = 0;
    while ((!token || !userId) && retryCount < 3) {
      console.warn(`⚠️ 저장된 토큰 없음! ${retryCount + 1}번째 재시도...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      token = await SecureStore.getItemAsync("token");
      userId = await SecureStore.getItemAsync("userId");
      retryCount++;
    }

    if (!token || !userId) {
      console.warn("⚠️ 최종적으로 저장된 토큰 없음. 로그인 화면 이동 X");
      return null;
    }

    console.log("✅ 저장된 토큰 가져옴:", token);
    console.log("✅ 저장된 userId 가져옴:", userId);

  // ✅ 서버에서 사용자 정보까지 받아오도록 추가
    const response = await fetch(`${API_BASE_URL}/api/auth/user/${userId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error("❌ 서버에서 사용자 정보 가져오기 실패");
      return { userId };
    }

    const userData = await response.json();
    console.log("✅ 서버에서 가져온 사용자 데이터:", userData);
    
    return userData;
  } catch (error) {
    console.error("❌ fetchUserData 오류:", error);
    return null;
  }
};


// ✅ SecureStore 저장값 확인 (디버깅용)
export const testAsyncStorage = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");
    const userId = await SecureStore.getItemAsync("userId");

    console.log("✅ 저장된 토큰:", token);
    console.log("✅ 저장된 userId:", userId);
  } catch (error) {
    console.error("❌ SecureStore 테스트 오류:", error.message);
  }
};