import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import API_BASE_URL from "../config/apiConfig"; // ✅ 백엔드 API 경로
import { auth } from "../config/firebase"; // ✅ Firebase 인증 인스턴스

// 📌 Firebase 로그인 (기존 방식)
export const loginWithFirebase = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("🔥 Firebase 로그인 에러:", error.message);
    throw error;
  }
};

// 📌 백엔드 API 로그인 (🔥 role 추가)
export const loginWithBackend = async (email, password, role = "user") => { // 기본값을 "user"로 설정
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }), // ✅ 역할 추가
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ 백엔드 로그인 오류:", result);
      throw new Error(result.message || "백엔드 로그인 실패");
    }

    console.log("✅ 백엔드 로그인 성공:", result);
    return result;
  } catch (error) {
    console.error("❌ 백엔드 로그인 요청 실패:", error);
    throw error;
  }
};

// 📌 회원가입 (Firebase)
export const registerWithFirebase = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("🔥 Firebase 회원가입 에러:", error.message);
    throw error;
  }
};

// 📌 백엔드 API 회원가입 (role 추가)
export const registerWithBackend = async (userData) => {
  try {
    console.log("📤 [백엔드 회원가입 요청 데이터]:", JSON.stringify(userData, null, 2));

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, role: userData.role || "user" }), // ✅ 기본 role 추가
    });

    console.log("🔍 [백엔드 응답 상태]:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ 백엔드 회원가입 오류:", errorData);
      throw new Error(errorData.message || "백엔드 회원가입 실패");
    }

    const responseData = await response.json();
    console.log("✅ [백엔드 응답 데이터]:", responseData);

    return responseData;
  } catch (error) {
    console.error("❌ 백엔드 회원가입 요청 중 오류:", error);
    throw error;
  }
};

// 🔥 비밀번호 찾기 요청 (이메일 전송)
export const resetPassword = async (email) => {
  try {
    const response = await fetch("http://192.168.0.3:5000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "비밀번호 재설정 실패");

    return result.message;
  } catch (error) {
    console.error("❌ 비밀번호 찾기 오류:", error);
    throw error;
  }
};


// 📌 로그아웃
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("✅ 로그아웃 성공");
  } catch (error) {
    console.error("❌ 로그아웃 에러:", error.message);
  }
};

// 📌 Firebase 인증 상태 감지
export const authStateListener = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
