const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase'); // Firestore 가져오기
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cloudinary = require('../config/cloudinary'); // ✅ Cloudinary 가져오기
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } = require('firebase/auth');
const authMiddleware = require('../middlewares/authMiddleware'); // ✅ Firebase 인증 미들웨어
require('dotenv').config();

const admin = require('firebase-admin'); // ✅ Firebase Admin SDK 가져오기
const auth = admin.auth(); // ✅ Firebase Admin SDK에서 `auth()` 호출

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// ✅ Multer 설정 (메모리 저장)
const upload = multer({ storage: multer.memoryStorage() });

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

const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  phone = phone.replace(/[^0-9]/g, ""); // 숫자만 남기기

  // 한국 번호인 경우 +82 추가
  if (phone.startsWith("010")) {
    return `+82${phone.slice(1)}`;
  }

  // 이미 국제번호 형식인 경우 그대로 반환
  if (phone.startsWith("+")) {
    return phone;
  }

  return null; // 잘못된 형식
};

console.log("📌 현재 SMTP 설정 확인:", process.env.SMTP_USER, process.env.SMTP_PASS ? "✅ 비밀번호 설정됨" : "❌ 비밀번호 없음");

// ✅ Firebase Authentication 사용 가능 여부 확인
console.log("🔥 Firebase Auth 연결 상태:", auth ? "✅ 연결됨" : "❌ 연결되지 않음");

// ✅ 회원가입 API (Firebase Authentication + Firestore)
router.post('/register', upload.single('idImage'), async (req, res) => {
  try {
    console.log("🔥 [회원가입 요청 데이터]:", req.body);
    let { email, password, name, phone, gender, bank, accountNumber, role } = req.body;

    if (!email || !password || !name || !phone || !gender) {
      return res.status(400).json({ message: '⚠️ 모든 필드를 입력하세요.' });
    }

    email = email.toLowerCase().trim();
    role = role === 'admin' ? 'admin' : 'user';

    console.log("📌 Firebase Auth 사용자 생성 시작...");

    // ✅ 전화번호 변환 (E.164 형식)
    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone) {
      return res.status(400).json({ message: "❌ 올바른 전화번호 형식이 아닙니다. (010-XXXX-XXXX)" });
    }

    console.log("📌 변환된 전화번호 (E.164 형식):", formattedPhone);

    // ✅ 전화번호 중복 체크
    try {
      const existingUser = await admin.auth().getUserByPhoneNumber(formattedPhone);
      if (existingUser) {
        console.error("❌ 전화번호 중복 오류: 해당 번호는 이미 등록되어 있습니다.");
        return res.status(400).json({ message: "❌ 해당 전화번호로 이미 가입된 계정이 있습니다." });
      }
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        console.error("❌ Firebase 전화번호 중복 체크 오류:", error);
        return res.status(500).json({ message: "❌ 서버 오류 발생 (전화번호 중복 검사 실패)" });
      }
    }

    // ✅ Firebase Auth 계정 생성
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      phoneNumber: formattedPhone, // ✅ 변환된 전화번호 사용
      disabled: false,
    });

    console.log("✅ Firebase Auth 사용자 생성 완료:", userRecord.uid);

    // ✅ 비밀번호 암호화 (Firestore 저장용)
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 기본 프로필 이미지 설정
    let imageUrl = 'https://your-default-profile-url.com'; // 기본 이미지
    if (req.file) {
      console.log("📤 Cloudinary로 이미지 업로드 중...");
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    // ✅ Firestore에 저장할 사용자 데이터
    const userData = {
      userId: userRecord.uid,
      name,
      email,
      password: hashedPassword,  // 🔥 Firestore에 암호화된 비밀번호 저장
      phone: formattedPhone,
      gender,
      bank: bank || "은행 미선택",
      accountNumber: accountNumber || "0000-0000-0000",
      role,
      idImage: imageUrl,
      createdAt: new Date(),
    };

    console.log("📌 [저장될 Firestore 사용자 데이터]:", userData);

    await db.collection('users').doc(email).set(userData, { merge: true });

    res.status(201).json({ message: "✅ 회원가입 성공!", userId: userRecord.uid });

  } catch (error) {
    console.error("❌ 회원가입 중 오류 발생:", error);
    res.status(500).json({ message: error.message || '❌ 서버 오류' });
  }
});

// 🔥 로그인 API 수정 (서버)
router.post('/login', async (req, res) => {
  try {
    console.log("🔥 [로그인 요청 데이터]:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "⚠️ 이메일과 비밀번호를 입력하세요." });
    }

    // ✅ Firestore에서 사용자 정보 가져오기
    const userRef = db.collection('users').doc(email);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(400).json({ message: "⚠️ 이메일 또는 비밀번호가 잘못되었습니다." });
    }

    const userData = userSnap.data();
    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
      return res.status(400).json({ message: "⚠️ 이메일 또는 비밀번호가 잘못되었습니다." });
    }

    // ✅ role 추가 (기본값 'user')
    const role = userData.role || "user"; 

    // ✅ JWT 토큰 생성 (🚨 토큰을 먼저 선언)
    const token = jwt.sign(
      { userId: userData.userId, email: userData.email, role }, 
      SECRET_KEY, 
      { expiresIn: '7d' }
    );

     // ✅ `userId`가 `undefined`인지 체크
     if (!userData.userId) {
      console.error("❌ 로그인 응답에 userId가 없습니다!");
      return res.status(500).json({ message: "❌ 로그인 응답에 userId가 없습니다!" });
    }

    console.log("✅ 로그인 성공! 반환되는 userId:", userData.userId);

    // ✅ 로그인 성공 응답 (🚀 token을 먼저 생성한 후 응답)
    res.status(200).json({
      message: "✅ 로그인 성공!",
      user: { userId: userData.userId, email: userData.email, name: userData.name, role },
      token,  // 🔥 이제 token이 초기화된 후 전달됨!
    });

  } catch (error) {
    console.error("❌ 서버 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류", error: error.message });
  }
});



// ✅ 사용자 정보 조회 API
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userRef = db.collection('users').doc(userEmail);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "❌ 사용자를 찾을 수 없습니다." });
    }

    const userData = userSnap.data();
    delete userData.password;

    res.status(200).json(userData);
  } catch (error) {
    console.error("❌ 사용자 정보 조회 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류" });
  }
});

// ✅ 사용자 정보 수정 API
router.put('/update', authMiddleware, upload.single('idImage'), async (req, res) => {
  try {
    console.log("🔥 [사용자 정보 수정 요청]:", req.body);
    const { name, phone, gender } = req.body;
    const userEmail = req.user.email;

    let updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;

    if (req.file) {
      updateData.idImage = await uploadToCloudinary(req.file.buffer);
    }

    await db.collection('users').doc(userEmail).update(updateData);
    res.status(200).json({ message: "✅ 사용자 정보 수정 성공!", updatedUser: updateData });
  } catch (error) {
    console.error("❌ 사용자 정보 수정 중 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
});

// ✅ 비밀번호 변경 API
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "⚠️ 새 비밀번호를 입력하세요." });
    }

    const user = auth.currentUser;
    if (!user) {
      return res.status(401).json({ message: "❌ 인증된 사용자가 없습니다." });
    }

    await updatePassword(user, newPassword);
    res.status(200).json({ message: "✅ 비밀번호 변경 성공!" });
  } catch (error) {
    console.error("❌ 비밀번호 변경 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
});

console.log("✅ authRoutes.js 로드 완료");
module.exports = router;
