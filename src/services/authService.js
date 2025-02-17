import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
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

// 📌 백엔드 API 로그인
export const loginWithBackend = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("백엔드 로그인 실패");

    return await response.json();
  } catch (error) {
    console.error("❌ 백엔드 로그인 오류:", error);
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

// 📌 백엔드 API 회원가입
export const registerWithBackend = async (userData) => {
  try {
    console.log("📤 [백엔드 회원가입 요청 데이터]:", JSON.stringify(userData, null, 2));

    const response = await fetch("http://192.168.0.3:5000/api/auth/register", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData), // ✅ JSON 직렬화 시 정상 구조 유지
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
