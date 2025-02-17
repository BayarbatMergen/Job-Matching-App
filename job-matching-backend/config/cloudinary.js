const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'MISSING_CLOUD_NAME',
  api_key: process.env.CLOUDINARY_API_KEY || 'MISSING_API_KEY',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'MISSING_API_SECRET',
});

console.log("✅ Cloudinary 설정 완료:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "OK" : "❌ MISSING API KEY",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "❌ MISSING API SECRET",
});

module.exports = cloudinary;
