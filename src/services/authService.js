import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebaseConfig"; // ✅ 올바른 경로로 수정

// 📌 이메일 로그인
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("로그인 에러:", error.message);
    throw error;
  }
};

// 📌 회원가입
export const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("회원가입 에러:", error.message);
    throw error;
  }
};

// 📌 로그아웃
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("로그아웃 성공");
  } catch (error) {
    console.error("로그아웃 에러:", error.message);
  }
};

// 📌 Firebase 인증 상태 감지
export const authStateListener = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
