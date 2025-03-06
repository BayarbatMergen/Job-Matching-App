import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
export const loginWithBackend = async (email, password) => { 
  try {
    // ✅ Firebase 로그인 수행
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!user) throw new Error("❌ Firebase 로그인 실패: 사용자 정보를 가져올 수 없음.");
    
    // ✅ Firebase ID 토큰 가져오기
    const idToken = await user.getIdToken(); // 🔥 ID 토큰 가져오기 (중요)
    console.log("🔥 [Firebase ID 토큰]:", idToken);

    // ✅ 백엔드에 로그인 요청 (ID 토큰 포함)
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}` // ✅ Firebase ID 토큰 전달
      }
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "백엔드 로그인 실패");

    console.log("✅ 백엔드 로그인 성공:", result);

    // ✅ AsyncStorage에 토큰 저장
    await AsyncStorage.setItem("token", idToken); // ✅ Firebase ID 토큰 저장
    await AsyncStorage.setItem("userRole", result.user.role);

    return result;
  } catch (error) {
    console.error("❌ 백엔드 로그인 요청 실패:", error);

    // 🔹 오류 메시지 출력 추가 (비밀번호 오류일 경우)
    if (error.code === "auth/invalid-credential") {
      throw new Error("⚠️ 이메일 또는 비밀번호가 잘못되었습니다. 다시 시도해주세요.");
    }

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

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
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
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
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

// ✅ 로그아웃 (Firebase + AsyncStorage 토큰 삭제)
export const logout = async () => {
  try {
    await signOut(auth);
    await AsyncStorage.removeItem("token"); // ✅ 토큰 삭제
    await AsyncStorage.removeItem("userRole"); // ✅ 역할 정보 삭제
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

// ✅ 사용자 데이터 가져오기 (수정 완료)
export const fetchUserData = async () => {
  try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
          console.warn("⚠️ fetchUserData 실행 불가: 저장된 토큰이 없습니다.");
          return null;
      }

      console.log("🚀 API 요청 시작...");
      console.log("🔹 저장된 토큰:", token);

      const response = await fetch("http://192.168.0.6:5000/api/auth/me", {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
          },
      });

      if (!response.ok) {
          throw new Error(`❌ 서버 오류: ${response.status}`);
      }

      const userData = await response.json();
      console.log("✅ 불러온 사용자 데이터:", userData);
      
      return userData;
      
  } catch (error) {
      console.error("❌ 사용자 정보 가져오기 오류:", error);
      return null;
  }
};