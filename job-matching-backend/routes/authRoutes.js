const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase'); // Firestore 가져오기
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cloudinary = require('../config/cloudinary'); // ✅ Cloudinary 가져오기
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } = require('firebase/auth');
const { verifyToken } = require('../middlewares/authMiddleware');
require('dotenv').config();
const { validateToken } = require("../controllers/authController");

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
    const userQuery = await db.collection('users').where('email', '==', email).get();
    
    if (userQuery.empty) {
      return res.status(400).json({ message: "⚠️ 이메일 또는 비밀번호가 잘못되었습니다." });
    }

    const userDoc = userQuery.docs[0]; 
    const userData = userDoc.data();
    const userId = userDoc.id;  // ✅ Firestore 문서 ID 사용

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
      return res.status(400).json({ message: "⚠️ 이메일 또는 비밀번호가 잘못되었습니다." });
    }

    // ✅ role 추가 (기본값 'user')
    const role = userData.role || "user";

    // ✅ JWT 토큰 생성
    const token = jwt.sign(
      { userId: userData.userId, email: userData.email, role },  // ✅ userId를 UID로 변경
      SECRET_KEY, 
      { expiresIn: '7d' }
    );
    console.log("✅ 로그인 성공! 반환되는 userId:", userId);

    res.status(200).json({
      message: "✅ 로그인 성공!",
      user: { userId, email: userData.email, name: userData.name, role },
      token,
    });

  } catch (error) {
    console.error("❌ 서버 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류", error: error.message });
  }
});


router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;  // ✅ userId 사용하도록 변경
    const userRef = db.collection('users').doc(userId); // 🔹 userId로 조회
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "❌ 사용자를 찾을 수 없습니다." });
    }

    const userData = userSnap.data();
    delete userData.password; // 🔹 비밀번호는 응답에서 제외

    res.status(200).json(userData);
  } catch (error) {
    console.error("❌ 사용자 정보 조회 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류" });
  }
});


// ✅ 사용자 정보 수정 API
router.put('/update', verifyToken, upload.single('idImage'), async (req, res) => {
  try {
    console.log("🔥 [사용자 정보 수정 요청]:", req.body);
    const { name, phone, gender } = req.body;
    const userId = req.user.userId;

    let updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;

    if (req.file) {
      updateData.idImage = await uploadToCloudinary(req.file.buffer);
    }

    await db.collection('users').doc(userId).update(updateData);
    res.status(200).json({ message: "✅ 사용자 정보 수정 성공!", updatedUser: updateData });
  } catch (error) {
    console.error("❌ 사용자 정보 수정 중 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
});


router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "⚠️ 새 비밀번호를 입력하세요." });
    }

    const userId = req.user.userId;
    
    // ✅ Firebase Auth 비밀번호 변경
    await admin.auth().updateUser(userId, { password: newPassword });

    // ✅ Firestore 데이터도 업데이트
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection('users').doc(userId).update({ password: hashedPassword });

    res.status(200).json({ message: "✅ 비밀번호 변경 성공!" });
  } catch (error) {
    console.error("❌ 비밀번호 변경 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
});


// ✅ 토큰 검증 API
router.post("/validate-token", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(400).json({ message: "토큰이 제공되지 않았습니다." });
  }
  // 토큰 검증 로직
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "토큰이 유효하지 않습니다." });
    }
    res.status(200).json({ valid: true, user: decoded });
  });
});

console.log("✅ authRoutes.js 로드 완료");

module.exports = router;