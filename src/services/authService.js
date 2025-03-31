import {
  signInWithCustomToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import * as SecureStore from 'expo-secure-store';
import API_BASE_URL from "../config/apiConfig";
import { auth } from "../config/firebase";
import jwt_decode from "jwt-decode";

//  로그인 후 토큰, userId, email, password 저장
//  로그인 후 데이터 저장 함수
export const saveUserData = async (token, userId, email, password, role, name) => {
  try {
    console.log("🛠 saveUserData() 호출됨! 넘겨받은 role 파라미터:", role);
    console.log("🛠 saveUserData() 호출됨! 넘겨받은 name 파라미터:", name);

    await SecureStore.setItemAsync("token", String(token));
    await SecureStore.setItemAsync("userId", String(userId));
    await SecureStore.setItemAsync("userEmail", String(email));
    await SecureStore.setItemAsync("userPassword", String(password));
    await SecureStore.setItemAsync("userRole", String(role));
    await SecureStore.setItemAsync("userName", String(name)); //  이름도 문자열로 저장!

    // 확인용 로그
    const storedRole = await SecureStore.getItemAsync("userRole");
    const storedName = await SecureStore.getItemAsync("userName");
    console.log(" SecureStore 저장된 userRole:", storedRole);
    console.log(" SecureStore 저장된 userName:", storedName);
  } catch (error) {
    console.error(" saveUserData 저장 오류:", error);
  }
};

//  백엔드 로그인 및 Firebase 세션 동기화
export const loginWithBackend = async (email, password) => {
  try {
    console.log(" 백엔드 로그인 요청:", email);

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("백엔드 로그인 실패");

    const result = await response.json();
    console.log(" 백엔드 응답 전체:", JSON.stringify(result, null, 2));

    //  여기서 반드시 분리해서 콘솔로 확인!
    const userName = result.user?.name;
    console.log(" 가져온 userName 값:", userName);

    // Firebase 커스텀 토큰 로그인
    await signInWithCustomToken(auth, result.firebaseToken);

    //  saveUserData에 name 명시적으로 전달
    await saveUserData(
      result.token,
      result.user.userId,
      result.user.email,
      password,
      result.user.role,
      userName //  여기!
    );

    return result;
  } catch (error) {
    console.error(" loginWithBackend 오류:", error.message);
    throw error;
  }
};


export const fetchUserData = async () => {
  try {
    console.log(" [fetchUserData] 실행 중...");
    const token = await SecureStore.getItemAsync("token");
    const userId = await SecureStore.getItemAsync("userId");
    const email = await SecureStore.getItemAsync("userEmail");
    const role = await SecureStore.getItemAsync("userRole");
    const name = await SecureStore.getItemAsync("userName"); //  이름까지 불러오기!

    if (!userId || !role) {
      console.warn(" 저장된 userId 또는 role 없음, 로그인 필요");
      return null;
    }

    console.log(" 가져온 사용자 데이터:", { token, userId, email, role, name });
    return { token, userId, email, role, name }; //  name 포함해서 반환
  } catch (error) {
    console.error(" fetchUserData 오류:", error);
    return null;
  }
};


//  Firebase 회원가입
export const registerWithFirebase = async (email, password) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(" Firebase 회원가입 오류:", error.message);
    throw error;
  }
};

//  백엔드 회원가입 API
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
    console.error(" 백엔드 회원가입 오류:", error.message);
    throw error;
  }
};

//  비밀번호 재설정
export const resetPasswordWithFirebase = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log(" 비밀번호 재설정 이메일 전송 완료:", email);
  } catch (error) {
    console.error(" 비밀번호 재설정 오류:", error.message);
    throw error;
  }
};

//  로그아웃
export const logout = async () => {
  try {
    await signOut(auth);
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("userId");
    await SecureStore.deleteItemAsync("userEmail");
    await SecureStore.deleteItemAsync("userPassword");
    await SecureStore.deleteItemAsync("userRole");
    console.log(" 로그아웃 및 SecureStore 초기화 완료");
  } catch (error) {
    console.error(" 로그아웃 오류:", error.message);
  }
};

//  Firebase 인증 상태 리스너
export const authStateListener = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

/*  Firebase 자동 로그인 함수 (앱 실행 시 호출)
export const firebaseAutoLogin = async () => {
  try {
    const storedEmail = await SecureStore.getItemAsync('userEmail');
    const storedPassword = await SecureStore.getItemAsync('userPassword');

    console.log(' 저장된 이메일:', storedEmail);
    console.log(' 저장된 비밀번호:', storedPassword);

    if (storedEmail && storedPassword) {
      await signInWithEmailAndPassword(auth, storedEmail, storedPassword);
      console.log(" Firebase 자동 로그인 성공");
    } else {
      console.warn(" 자동 로그인 실패: 저장된 이메일 또는 비밀번호 없음");
    }
  } catch (error) {
    console.error(" Firebase 자동 로그인 오류:", error);
  }
};
*/


//  디버깅용 SecureStore 값 확인
export const testAsyncStorage = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");
    const userId = await SecureStore.getItemAsync("userId");
    const userEmail = await SecureStore.getItemAsync("userEmail");

    console.log(" 저장된 토큰:", token);
    console.log(" 저장된 userId:", userId);
    console.log(" 저장된 userEmail:", userEmail);
  } catch (error) {
    console.error(" SecureStore 테스트 오류:", error.message);
  }
};