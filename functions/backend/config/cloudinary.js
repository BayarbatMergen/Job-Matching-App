const cloudinary = require("cloudinary").v2;
const functions = require("firebase-functions");

// 🔧 Cloudinary 설정 가져오기: Firebase Functions 환경변수 우선
let cloudinaryConfig = {};

try {
  const config = functions.config();
  cloudinaryConfig = {
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
  };
} catch (e) {
  // ✅ 로컬 개발 시 fallback to .env
  console.warn("⚠️ Firebase Functions 환경변수를 불러오지 못했습니다. .env를 사용합니다.");
  require("dotenv").config();
  cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };
}

// 🔍 검증
if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.error("❌ Cloudinary 환경 변수가 누락되었습니다. Firebase 환경변수 또는 .env를 확인하세요.");
  process.exit(1);
}

// ✅ Cloudinary 설정 적용
cloudinary.config(cloudinaryConfig);

console.log("✅ Cloudinary 설정 완료:", {
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: cloudinaryConfig.api_key ? "OK" : "MISSING",
  api_secret: cloudinaryConfig.api_secret ? "OK" : "MISSING",
});

module.exports = cloudinary;
