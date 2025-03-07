import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config/apiConfig";
import { auth } from "../config/firebase";

// ✅ Firebase 로그인
export const loginWithFirebase = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("🔥 Firebase 로그인 에러:", error.message);
    throw error;
  }
};

export const loginWithBackend = async (email, password) => {
  try {
    console.log("📤 로그인 요청 데이터:", { email, password });

    // ✅ Firebase 로그인 수행
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    if (!firebaseUser) throw new Error("❌ Firebase 로그인 실패: 사용자 정보를 가져올 수 없음.");

    // ✅ Firebase ID 토큰 가져오기
    const idToken = await firebaseUser.getIdToken();
    console.log("🔥 [Firebase ID 토큰]:", idToken);

    // ✅ 백엔드 로그인 요청 (ID 토큰 포함)
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      }
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "백엔드 로그인 실패");

    console.log("✅ 백엔드 로그인 성공:", result);

    // ✅ userId가 정상적으로 받아졌는지 확인
    const backendUser = result.user;
    console.log("🔹 [백엔드 응답] 저장할 userId:", backendUser.userId);

    if (!backendUser || !backendUser.userId) {
      throw new Error("❌ 로그인 응답에서 사용자 ID를 찾을 수 없습니다.");
    }

    // ✅ AsyncStorage 초기화 (잘못된 값 제거)
    await AsyncStorage.clear();
    console.log("🚀 AsyncStorage 초기화 완료!");

    // ✅ AsyncStorage에 저장 (🔴 추가 로그 포함)
    console.log("📝 AsyncStorage에 저장 시작...");
    await AsyncStorage.setItem("token", result.token);
    await AsyncStorage.setItem("userId", backendUser.userId);
    await AsyncStorage.setItem("userEmail", backendUser.email);
    await AsyncStorage.setItem("userRole", backendUser.role);

    // ✅ 저장 후 즉시 확인 (강제 로딩)
    await AsyncStorage.flushGetRequests();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ✅ 저장된 userId를 다시 가져와 비교
    const storedUserId = await AsyncStorage.getItem("userId");
    console.log("✅ [AsyncStorage 저장 완료] 저장된 userId:", storedUserId);

    // 🚨 검증: 저장된 값이 올바른지 체크
    if (!storedUserId || storedUserId !== backendUser.userId) {
      console.error("❌ [오류] userId가 저장되지 않았거나 불일치! 저장된 값:", storedUserId);
      await AsyncStorage.clear(); // 잘못 저장된 데이터 초기화
      throw new Error("❌ userId 저장 오류");
    }

    console.log("🎉 [성공] AsyncStorage에 userId가 올바르게 저장됨!");

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

// ✅ 백엔드 API 회원가입
export const registerWithBackend = async (userData) => {
  try {
    console.log("📤 [백엔드 회원가입 요청]:", JSON.stringify(userData, null, 2));

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
    console.error("❌ 백엔드 회원가입 오류:", error);
    throw error;
  }
};

// ✅ Firebase 비밀번호 재설정
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

// ✅ 로그아웃
export const logout = async () => {
  try {
    await signOut(auth);
    await AsyncStorage.clear(); // ✅ 로그아웃 시 모든 저장 데이터 삭제
    console.log("✅ 로그아웃 성공");
  } catch (error) {
    console.error("❌ 로그아웃 에러:", error.message);
  }
};

// ✅ Firebase 인증 상태 감지
export const authStateListener = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// ✅ 현재 로그인한 사용자 확인
export const checkAuthStatus = () => {
  console.log("🔥 현재 로그인한 사용자:", auth.currentUser);
  return auth.currentUser || null;
};

// ✅ AsyncStorage 초기화
export const resetAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log("✅ AsyncStorage 초기화 완료!");
  } catch (error) {
    console.error("❌ AsyncStorage 초기화 오류:", error);
  }
};

// ✅ 사용자 데이터 가져오기
export const fetchUserData = async () => {
  try {
    console.log("🚀 [fetchUserData] 실행됨!");

    // ✅ AsyncStorage 강제 새로고침
    await AsyncStorage.flushGetRequests();
    await new Promise(resolve => setTimeout(resolve, 500));

    const token = await AsyncStorage.getItem("token");
    let userId = await AsyncStorage.getItem("userId");

    console.log("🔍 [fetchUserData] 가져온 토큰:", token);
    console.log("🔍 [fetchUserData] 가져온 userId:", userId);

    if (!token || !userId || userId === "TEST_USER_ID_123") {
      console.warn("⚠️ fetchUserData 실행 불가: 저장된 토큰 또는 사용자 ID가 없습니다.");
      return null;
    }

    console.log("📌 API 요청 시작...");
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
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
    console.log("✅ [fetchUserData] 불러온 사용자 데이터:", userData);

    return userData;
  } catch (error) {
    console.error("❌ [fetchUserData] 사용자 정보 가져오기 오류:", error);
    return null;
  }
};

// ✅ 저장된 userId 확인
const checkStoredUserId = async () => {
  await AsyncStorage.flushGetRequests();
  await new Promise(resolve => setTimeout(resolve, 1000));

  const storedUserId = await AsyncStorage.getItem("userId");
  console.log("✅ [AsyncStorage 확인] 저장된 userId:", storedUserId);

  if (!storedUserId) {
    console.error("❌ [오류] AsyncStorage에 userId가 저장되지 않았습니다.");
  }
};

// ✅ AsyncStorage 테스트 함수 (정상적으로 내보내기)
export const testAsyncStorage = async () => {
  try {
    console.log("🚀 [AsyncStorage 테스트 시작]");

    // 🔹 현재 저장된 값 확인
    const token = await AsyncStorage.getItem("token");
    const storedUserId = await AsyncStorage.getItem("userId");
    console.log("🔍 [Before 저장] 현재 저장된 토큰:", token);
    console.log("🔍 [Before 저장] 현재 저장된 userId:", storedUserId);

    // 🔹 새로운 값 저장 테스트
    await AsyncStorage.setItem("userId", "TEST_USER_ID_123");
    await AsyncStorage.flushGetRequests();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 🔹 다시 불러오기
    const testUserId = await AsyncStorage.getItem("userId");
    console.log("✅ [After 저장] 저장된 userId:", testUserId);

    if (!testUserId) {
      console.error("❌ AsyncStorage 저장이 안 되고 있음!!");
    } else {
      console.log("🎉 AsyncStorage 정상 작동!");
    }
  } catch (error) {
    console.error("❌ AsyncStorage 테스트 중 오류 발생:", error);
  }
};
