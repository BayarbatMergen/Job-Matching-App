const cloudinary = require('cloudinary').v2;
require('dotenv').config();

//  환경 변수 검증
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error(" Cloudinary 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.");
  process.exit(1); // 🚨 환경 변수가 없으면 서버 실행 중단
}

//  Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(" Cloudinary 설정 완료:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "OK" : " MISSING API KEY",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "OK" : " MISSING API SECRET",
});

module.exports = cloudinary;