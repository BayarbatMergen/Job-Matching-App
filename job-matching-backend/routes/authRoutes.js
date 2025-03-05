const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase'); // Firestore 가져오기
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cloudinary = require('../config/cloudinary'); // ✅ Cloudinary 가져오기
const authenticateToken = require('../middlewares/authMiddleware'); // 🔥 이 줄 추가
const authMiddleware = require('../middlewares/authMiddleware');

require('dotenv').config();

console.log("📌 현재 SMTP 설정 확인:", process.env.SMTP_USER, process.env.SMTP_PASS ? "✅ 비밀번호 설정됨" : "❌ 비밀번호 없음");

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// 📌 Nodemailer SMTP 설정
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ✅ SMTP 연결 테스트
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP 서버 연결 실패:", error.message);
  } else {
    console.log("✅ SMTP 서버 연결 성공!");
  }
});

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

// ✅ 회원가입 API (관리자 및 사용자 구분)
router.post('/register', upload.single('idImage'), async (req, res) => {
  try {
    console.log("🔥 [회원가입 요청 데이터]:", req.body);

    let { email, password, name, phone, gender, bank, accountNumber, role } = req.body;

    if (!email || !password || !name || !phone || !gender) {
      return res.status(400).json({ message: '⚠️ 모든 필드를 입력하세요.' });
    }

    email = email.toLowerCase().trim();

    if (role !== 'admin' && role !== 'user') {
      role = 'user';
    }

    const collection = role === 'admin' ? 'admins' : 'users';

    await db.runTransaction(async (transaction) => {
      const userRef = db.collection(collection).doc(email);
      const userSnap = await transaction.get(userRef);

      if (userSnap.exists) {
        throw new Error('⚠️ 이미 존재하는 이메일입니다.');
      }

      if (!/^(?=.*[!@#$%^&*()]).{6,}$/.test(password)) {
        throw new Error('⚠️ 비밀번호는 최소 6자 이상이며, 특수문자를 포함해야 합니다.');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

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

      const newUser = {
        userId: email,
        name,
        email,
        phone,
        gender,
        bank: bank || "은행 미선택",
        accountNumber: accountNumber || "0000-0000-0000",
        password: hashedPassword,
        role,
        idImage: imageUrl,
        createdAt: new Date(),
      };

      transaction.set(userRef, newUser);
      console.log("✅ Firestore에 저장된 사용자:", newUser);
    });

    res.status(201).json({ 
      message: `✅ ${role === 'admin' ? '관리자' : '사용자'} 회원가입 성공!`, 
      userId: email 
    });

  } catch (error) {
    console.error("❌ 회원가입 중 서버 오류 발생:", error.message);
    res.status(500).json({ message: error.message || '❌ 서버 오류' });
  }
});

// ✅ 로그인 API (role 포함하여 토큰 생성)
router.post('/login', async (req, res) => {
  try {
    console.log("🔥 [로그인 요청 데이터]:", req.body);

    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '⚠️ 이메일과 비밀번호를 입력하세요.' });
    }

    email = email.toLowerCase().trim();

    // 🔥 관리자 또는 일반 유저 확인
    const adminRef = db.collection('admins').doc(email);
    const userRef = db.collection('users').doc(email);

    const adminSnap = await adminRef.get();
    const userSnap = await userRef.get();

    let userData = null;
    let role = '';

    if (adminSnap.exists) {
      userData = adminSnap.data();
      role = 'admin';
    } else if (userSnap.exists) {
      userData = userSnap.data();
      role = 'user';
    } else {
      return res.status(400).json({ message: '⚠️ 이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({ message: '⚠️ 이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // ✅ 관리자 역할을 포함한 JWT 토큰 생성 (Firestore 보안 규칙에서 사용 가능)
    const token = jwt.sign(
      { userId: userData.userId, email, role }, // 🔥 `role` 포함
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: `✅ 로그인 성공!`,
      user: { userId: userData.userId, email: userData.email, name: userData.name, role },
      token,
    });

  } catch (error) {
    console.error("❌ 서버 오류:", error);
    res.status(500).json({ message: '❌ 서버 오류' });
  }
});


// ✅ 비밀번호 재설정 요청
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "⚠️ 이메일을 입력하세요." });
  }

  try {
    const resetToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: "30m" });
    const resetLink = `http://your-app.com/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "비밀번호 재설정 요청",
      text: `비밀번호를 재설정하려면 아래 링크를 클릭하세요: ${resetLink}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "✅ 비밀번호 재설정 이메일이 발송되었습니다!" });

  } catch (error) {
    console.error("❌ 이메일 전송 오류:", error);
    res.status(500).json({ message: "❌ 이메일 전송 실패" });
  }
});

// ✅ 사용자 정보 조회 API
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email; // JWT에서 email 가져오기

    const userRef = db.collection('users').doc(userEmail);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "❌ 사용자를 찾을 수 없습니다." });
    }

    const userData = userSnap.data();
    delete userData.password; // 🔥 비밀번호 제거

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
    const userId = req.user.email; // 🔥 JWT에서 사용자 이메일 가져오기

    if (!name && !phone && !gender && !req.file) {
      return res.status(400).json({ message: "⚠️ 변경할 정보를 입력하세요." });
    }

    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "❌ 사용자를 찾을 수 없습니다." });
    }

    let updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;

    if (req.file) {
      console.log("📤 Cloudinary로 ID 이미지 업로드 중...");
      updateData.idImage = await uploadToCloudinary(req.file.buffer);
    }

    await userRef.update(updateData);
    console.log("✅ 사용자 정보 수정 완료:", updateData);

    res.status(200).json({ message: "✅ 사용자 정보 수정 성공!", updatedUser: updateData });
  } catch (error) {
    console.error("❌ 사용자 정보 수정 중 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
});

// ✅ 비밀번호 변경 API (PUT /auth/change-password)
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userEmail = req.user.email; // ✅ JWT에서 사용자 이메일 가져오기

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "⚠️ 현재 비밀번호와 새 비밀번호를 입력하세요." });
    }

    if (!/^(?=.*[!@#$%^&*()]).{6,}$/.test(newPassword)) {
      return res.status(400).json({ message: "⚠️ 새 비밀번호는 최소 6자 이상이며, 특수문자를 포함해야 합니다." });
    }

    // 🔎 Firestore에서 사용자 데이터 가져오기
    const userRef = db.collection('users').doc(userEmail);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "❌ 사용자를 찾을 수 없습니다." });
    }

    const userData = userSnap.data();

    // ✅ 현재 비밀번호 검증
    const isMatch = await bcrypt.compare(currentPassword, userData.password);
    if (!isMatch) {
      return res.status(400).json({ message: "❌ 현재 비밀번호가 일치하지 않습니다." });
    }

    // 🔐 새 비밀번호 해싱 후 저장
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRef.update({ password: hashedPassword });

    res.status(200).json({ message: "✅ 비밀번호가 성공적으로 변경되었습니다!" });
  } catch (error) {
    console.error("❌ 비밀번호 변경 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생", error: error.message });
  }
});

// ✅ **라우트 마지막에 추가**
console.log("✅ authRoutes.js 로드 완료");
module.exports = router;
