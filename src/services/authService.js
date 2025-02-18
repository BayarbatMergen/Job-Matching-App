import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import API_BASE_URL from "../config/apiConfig"; // ✅ 백엔드 API 경로
import { auth } from "../config/firebase"; // ✅ Firebase 인증 인스턴스

// ✅ Firebase 로그인 (기존 방식)
export const loginWithFirebase = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("🔥 Firebase 로그인 에러:", error.message);
    throw error;
  }
};

// ✅ 백엔드 API 로그인 (🔥 role 추가)
export const loginWithBackend = async (email, password, role = "user") => { 
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
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

// ✅ Firebase 회원가입
export const registerWithFirebase = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("🔥 Firebase 회원가입 에러:", error.message);
    throw error;
  }
};

// ✅ 백엔드 API 회원가입 (role 추가)
export const registerWithBackend = async (userData) => {
  try {
    console.log("📤 [백엔드 회원가입 요청 데이터]:", JSON.stringify(userData, null, 2));

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, role: userData.role || "user" }),
    });

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

// ✅ Firebase 비밀번호 재설정 (이메일 전송)
export const resetPasswordWithFirebase = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("✅ Firebase 비밀번호 재설정 이메일 전송 완료:", email);
    return "비밀번호 재설정 이메일이 전송되었습니다.";
  } catch (error) {
    console.error("❌ Firebase 비밀번호 찾기 오류:", error);
    throw error;
  }
};

// ✅ 백엔드 비밀번호 재설정 요청 (이메일 전송)
export const resetPasswordWithBackend = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "비밀번호 재설정 실패");

    console.log("✅ 백엔드 비밀번호 재설정 이메일 전송 완료:", email);
    return result.message;
  } catch (error) {
    console.error("❌ 백엔드 비밀번호 찾기 오류:", error);
    throw error;
  }
};

// ✅ 로그아웃 (Firebase)
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("✅ 로그아웃 성공");
  } catch (error) {
    console.error("❌ 로그아웃 에러:", error.message);
  }
};

// ✅ Firebase 인증 상태 감지 (onAuthStateChanged)
export const authStateListener = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// ✅ 현재 로그인한 사용자 확인
export const checkAuthStatus = () => {
  const auth = getAuth();
  console.log("🔥 현재 로그인한 사용자:", auth.currentUser);

  if (!auth.currentUser) {
    console.warn("⚠️ 현재 로그인한 사용자가 없음!");
    return null;
  }
  return auth.currentUser;
};
