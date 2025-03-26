const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config(); // 환경변수 불러오기

if (!admin.apps.length) {
  const serviceAccount = require(path.join(__dirname, './firebaseServiceAccount.json'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "jobmatchingapp-383da.appspot.com",
  });

  console.log('✅ Firebase Admin SDK 초기화 완료!');
} else {
  console.log('✅ Firebase Admin SDK 이미 초기화됨!');
}

const db = admin.firestore();
const storage = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET || "jobmatchingapp-383da.appspot.com");

module.exports = { admin, db, storage };
