// ✅ firebaseAdmin.js
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const path = require("path");

// ✅ Firebase Functions 환경변수 가져오기
let storageBucket = "jobmatchingapp-383da.appspot.com";
try {
  const config = functions.config();
  if (config?.fb?.storage_bucket) {
    storageBucket = config.fb.storage_bucket;
  }
} catch (e) {
  console.log("⚠️ Firebase Functions 환경 변수 접근 실패 (로컬 개발 모드로 간주)");
}

// ✅ Firebase Admin 초기화
if (!admin.apps.length) {
  if (process.env.FUNCTIONS_EMULATOR || process.env.NODE_ENV !== "production") {
    const serviceAccount = require(path.join(__dirname, "../firebase-service-account.json"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket,
    });
  } else {
    admin.initializeApp({ storageBucket });
  }
}

const db = admin.firestore();
const storage = admin.storage().bucket(storageBucket);

module.exports = { admin, db, storage };
