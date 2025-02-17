const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase'); // Firestore 가져오기
const cloudinary = require('../config/cloudinary'); // ✅ Cloudinary 가져오기
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// ✅ Multer 설정 (메모리 저장)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ 기본 프로필 이미지 URL
const DEFAULT_IMAGE_URL = "https://res.cloudinary.com/demo/image/upload/v1680000000/default-profile.png";

// ✅ Cloudinary 이미지 업로드 함수
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "job-matching-app", resource_type: "image" },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary 업로드 실패:", error);
          return reject(error);
        }
        console.log("✅ Cloudinary 업로드 성공:", result.secure_url);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// ✅ 회원가입 API (Cloudinary만 사용)
router.post('/register', upload.single('idImage'), async (req, res) => {
  try {
    console.log("🔥 [회원가입 요청 데이터]:", req.body);

    let { email, password, name, phone, gender, bank, accountNumber } = req.body;

    // ✅ 필수 값 검증
    if (!email || !password || !name || !phone || !gender) {
      return res.status(400).json({ message: '⚠️ 모든 필드를 입력하세요.' });
    }

    email = email.toLowerCase().trim(); // ✅ 이메일 소문자로 변환 (중복 방지)

    // ✅ Firestore에서 이메일 중복 확인
    const userRef = db.collection('users').doc(email);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      return res.status(400).json({ message: '⚠️ 이미 존재하는 이메일입니다.' });
    }

    // ✅ 비밀번호 유효성 검사 (6자 이상 + 특수문자 포함)
    if (!/^(?=.*[!@#$%^&*()]).{6,}$/.test(password)) {
      return res.status(400).json({ message: '⚠️ 비밀번호는 최소 6자 이상이며, 특수문자를 포함해야 합니다.' });
    }

    // ✅ 이름 한글만 허용
    if (!/^[가-힣]+$/.test(name)) {
      return res.status(400).json({ message: '⚠️ 이름은 한글만 입력 가능합니다.' });
    }

    // ✅ 은행명 & 계좌번호 기본값 설정 (미입력 시 자동 추천)
    const bankList = ['국민은행', '신한은행', '우리은행', '하나은행', '농협은행'];
    if (!bank) bank = bankList[Math.floor(Math.random() * bankList.length)];
    if (!accountNumber) accountNumber = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // ✅ 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Cloudinary 이미지 업로드
    let imageUrl = DEFAULT_IMAGE_URL;
    if (req.file) {
      try {
        console.log("📤 Cloudinary로 이미지 업로드 중...");
        imageUrl = await uploadToCloudinary(req.file.buffer);
      } catch (error) {
        console.error("❌ Cloudinary 업로드 실패:", error.message);
      }
    }

    console.log("🚀 최종 이미지 URL:", imageUrl);

    // ✅ Firestore에 저장
    await userRef.set({
      userId: email,
      name,
      email,
      phone,
      gender,
      bank,
      accountNumber,
      password: hashedPassword,
      idImage: imageUrl, // ✅ Cloudinary 이미지 URL 저장
      createdAt: new Date(),
    });

    res.status(201).json({ message: '✅ 회원가입 성공!', userId: email, idImage: imageUrl });

  } catch (error) {
    console.error("❌ 회원가입 중 서버 오류 발생:", error.message);
    res.status(500).json({ message: '❌ 서버 오류', error: error.message });
  }
});

// ✅ 로그인 API
router.post('/login', async (req, res) => {
  try {
    console.log("🔥 [로그인 요청 데이터]:", req.body);

    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '⚠️ 이메일과 비밀번호를 입력하세요.' });
    }

    email = email.toLowerCase().trim(); // ✅ 이메일 소문자로 변환

    // ✅ Firestore에서 이메일로 사용자 찾기
    const userRef = db.collection('users').doc(email);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.warn("⚠️ 존재하지 않는 이메일:", email);
      return res.status(400).json({ message: '⚠️ 이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const userData = userSnap.data();
    console.log("🔍 찾은 사용자:", userData);

    // ✅ 비밀번호 비교 (암호화된 값과 비교)
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      console.warn("❌ 비밀번호 불일치", email);
      return res.status(400).json({ message: '⚠️ 이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // ✅ JWT 토큰 생성
    const token = jwt.sign(
      { userId: userData.userId, email },
      SECRET_KEY,
      { expiresIn: '7d' } // ✅ 7일 동안 토큰 유지
    );

    console.log("✅ 로그인 성공!", userData.userId);
    res.status(200).json({
      message: '✅ 로그인 성공!',
      user: { 
        userId: userData.userId, 
        email: userData.email, 
        name: userData.name, 
        idImage: userData.idImage || DEFAULT_IMAGE_URL
      },
      token,
    });

  } catch (error) {
    console.error("❌ 로그인 중 서버 오류 발생:", error.message);
    res.status(500).json({ message: '❌ 서버 오류', error: error.message });
  }
});

module.exports = router;
