// ✅ Firebase Admin SDK만 사용하는 Node.js 백엔드 전용 설정
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
require('dotenv').config();

// ✅ 서비스 계정 로드 (로컬 환경에서만 사용)
let serviceAccount;
try {
  const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.warn('⚠️ 서비스 계정 JSON 파일이 없어서 환경변수를 통한 인증으로 대체합니다.');
}

// ✅ Firebase Admin SDK 초기화
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: serviceAccount
        ? admin.credential.cert(serviceAccount)
        : admin.credential.applicationDefault(),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'jobmatchingapp-383da.appspot.com',
    });
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error.message);
    process.exit(1);
  }
}

// ✅ Firestore, Storage, Auth 초기화
const db = getFirestore();
const storage = getStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET || 'jobmatchingapp-383da.appspot.com');
const adminAuth = admin.auth();

// ✅ 스케줄 컬렉션 접근자
const schedulesCollection = db.collection('schedules');

module.exports = {
  admin,
  db,
  storage,
  adminAuth,
  schedulesCollection,
};
