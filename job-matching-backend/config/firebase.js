const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const firebase = require('firebase/app'); // ✅ 일반 Firebase SDK 추가
const { getAuth } = require('firebase/auth'); // ✅ Firebase Auth 가져오기
const path = require('path');
require('dotenv').config();

// 🔍 Firebase 환경 변수 확인 (디버깅 시 사용 가능)
console.log("🔍 Firebase API Key:", process.env.FIREBASE_API_KEY);
console.log("🔍 Firebase Project ID:", process.env.FIREBASE_PROJECT_ID);
console.log("🔍 Firebase Storage Bucket:", process.env.FIREBASE_STORAGE_BUCKET);

// ✅ Firebase 서비스 계정 JSON 파일 로드
let serviceAccount;
try {
  const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
  serviceAccount = require(serviceAccountPath);
  console.log('✅ Firebase 서비스 계정 JSON 로드 성공');
} catch (error) {
  console.warn('⚠️ Firebase 서비스 계정 JSON 파일을 찾을 수 없습니다. 환경변수를 사용합니다.');
}

// ✅ Firebase Admin SDK 초기화 (백엔드 관리용)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: serviceAccount 
        ? admin.credential.cert(serviceAccount) 
        : admin.credential.applicationDefault(), // ✅ 환경변수 기반 초기화
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "jobmatchingapp-383da.appspot.com",
    });

    console.log('🔥 Firebase Admin SDK 초기화 완료');
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error.message);
    process.exit(1); // 🚨 Firebase가 없으면 서버 실행 중단
  }
} else {
  console.log('✅ Firebase Admin SDK가 이미 초기화됨');
}

// ✅ Firebase Client SDK 초기화 (앱 내 기능용)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

if (!firebase.getApps().length) {
  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase Client SDK 초기화 완료");
}

// ✅ Firestore & Storage 초기화
const db = getFirestore(); // 🔹 Firestore 인스턴스
const storage = getStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET || "jobmatchingapp-383da.appspot.com");
const adminAuth = admin.auth(); // 🔹 Admin SDK 기반 인증
const clientAuth = getAuth(); // 🔹 Client SDK 기반 인증 (앱 내 로그인)

// 🔹 **스케줄 컬렉션 추가** (스케줄 관련 Firestore 컬렉션 가져오기)
const schedulesCollection = db.collection('schedules');

// ✅ Firestore & Storage 연결 확인
if (!db) {
  console.error("❌ Firestore 초기화 실패!");
  process.exit(1);
}

if (!storage) {
  console.error("❌ Firebase Storage 초기화 실패!");
  process.exit(1);
}

console.log('✅ Firestore & Storage 초기화 완료');

module.exports = { db, storage, adminAuth, clientAuth, schedulesCollection };