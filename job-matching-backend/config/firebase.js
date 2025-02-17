const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
require('dotenv').config();

// ✅ Firebase 서비스 계정 JSON 파일 로드
let serviceAccount;
try {
  const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
  serviceAccount = require(serviceAccountPath);
  console.log('✅ Firebase 서비스 계정 JSON 로드 성공');
} catch (error) {
  console.warn('⚠️ Firebase 서비스 계정 JSON 파일을 찾을 수 없습니다. 환경변수를 사용합니다.');
}

// ✅ Firebase 중복 초기화 방지
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: serviceAccount
        ? admin.credential.cert(serviceAccount)
        : admin.credential.applicationDefault(), // 환경변수 기반 초기화
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "jobmatchingapp-383da.appspot.com", // ✅ Storage 버킷 설정
    });

    console.log('🔥 Firebase Admin SDK 초기화 완료');
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error.message);
    process.exit(1); // 🚨 Firebase가 없으면 서버 종료
  }
} else {
  console.log('✅ Firebase Admin SDK가 이미 초기화됨');
}

// ✅ Firestore & Storage 초기화
const db = getFirestore();
const storage = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET || "jobmatchingapp-383da.appspot.com"); // ✅ Storage 초기화

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

module.exports = { db, storage };
