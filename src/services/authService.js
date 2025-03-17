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

    // 토큰에서 UID 추출
    const decodedToken = jwt_decode(result.token);
    const uid = decodedToken.userId; // "0aMo45lIebQO4bomONBSu592sO53"

    await saveUserData(result.token, uid); // UID 저장

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

 // 🔹 SecureStore가 존재하는지 체크
 if (!SecureStore || !SecureStore.getItemAsync) {
  console.error("❌ SecureStore 모듈을 찾을 수 없음. 기본값 반환.");
  return null;
}
    let token = await SecureStore.getItemAsync("token");
    let userId = await SecureStore.getItemAsync("userId");

    if (!token || !userId) {
      console.warn("⚠️ 저장된 토큰 또는 userId 없음! 0.5초 후 다시 시도...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      token = await SecureStore.getItemAsync("token");
      userId = await SecureStore.getItemAsync("userId");
    }

    // 🚨 최종적으로 없으면 로그인 화면 이동하지 않고 `null` 반환
    if (!token || !userId) {
      console.warn("⚠️ 최종적으로 저장된 토큰 없음. 로그인 화면 이동 X (로그인 필요)");
      return null;
    }

    console.log("✅ 저장된 토큰 가져옴:", token);
    console.log("✅ 저장된 userId 가져옴:", userId);
    
    return userId;
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

    //console.log("✅ 저장된 토큰:", token);
    //console.log("✅ 저장된 userId:", userId);
  } catch (error) {
    console.error("❌ SecureStore 테스트 오류:", error.message);
  }
};