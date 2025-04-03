const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase'); // Firestore 가져오기
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cloudinary = require('../config/cloudinary'); //  Cloudinary 가져오기
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } = require('firebase/auth');
const { verifyToken } = require('../middlewares/authMiddleware');
require('dotenv').config();
const { validateToken } = require("../controllers/authController");

const admin = require('firebase-admin'); //  Firebase Admin SDK 가져오기
const auth = admin.auth(); //  Firebase Admin SDK에서 `auth()` 호출

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

//  Multer 설정 (메모리 저장)
const upload = multer({ storage: multer.memoryStorage() });

//  Cloudinary 이미지 업로드 함수
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "job-matching-app", resource_type: "image" },
      (error, result) => {
        if (error) {
          console.error(" Cloudinary 업로드 실패:", error);
          return reject(error);
        }
        
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



//  Firebase Authentication 사용 가능 여부 확인


//  회원가입 API (Firebase Authentication + Firestore)
router.post('/register', upload.single('idImage'), async (req, res) => {
  try {
    
    let { email, password, name, phone, gender, bank, accountNumber, role } = req.body;

    if (!email || !password || !name || !phone || !gender) {
      return res.status(400).json({ message: ' 모든 필드를 입력하세요.' });
    }

    email = email.toLowerCase().trim();
    role = role === 'admin' ? 'admin' : 'user';

    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone) {
      return res.status(400).json({ message: " 올바른 전화번호 형식이 아닙니다." });
    }

    //  Firebase Authentication에 사용자 생성
    const userRecord = await admin.auth().createUser({
      email,
      password, // Firebase Auth 내부에서 안전하게 암호화됨
      displayName: name,
      phoneNumber: formattedPhone,
    });

    let imageUrl = 'https://your-default-profile-url.com';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    //  Firestore에 저장 (password는 절대 저장 X)
    const userData = {
      userId: userRecord.uid,
      name,
      email,
      phone: formattedPhone,
      gender,
      bank: bank || "은행 미선택",
      accountNumber: accountNumber || "0000-0000-0000",
      role,
      idImage: imageUrl,
      createdAt: new Date(),
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    res.status(201).json({ message: " 회원가입 성공!", userId: userRecord.uid });
  } catch (error) {
    console.error(" 회원가입 중 오류 발생:", error);
    res.status(500).json({ message: error.message || ' 서버 오류' });
  }
});

//  로그인 API 수정 (Firebase Custom Token 사용)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력하세요.' });
    }

    // 👉 Firebase Auth 인증 시도
    const firebaseAuth = require('firebase/auth');
    const firebaseApp = require('../config/firebaseClient'); // 클라이언트 Firebase 인스턴스 import
    const auth = firebaseAuth.getAuth(firebaseApp);

    try {
      const userCredential = await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      

      // Firestore에서 해당 유저 정보 가져오기
      const userDoc = await admin.firestore().collection('users').doc(firebaseUser.uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: '사용자 정보를 찾을 수 없습니다.' });
      }

      const user = userDoc.data();

      // JWT 발급
      const token = jwt.sign(
        {
          userId: firebaseUser.uid,
          email: firebaseUser.email,
          role: user.role || 'user',
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Firebase Custom Token 생성 (필요하면)
      const customToken = await admin.auth().createCustomToken(firebaseUser.uid);

      res.json({
        message: ' 로그인 성공!',
        token,
        firebaseToken: customToken,
        user: {
          userId: firebaseUser.uid,
          email: firebaseUser.email,
          name: user.name,
          role: user.role || 'user',
        },
      });

    } catch (error) {
      console.error(' Firebase 로그인 실패:', error);
      return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

  } catch (error) {
    console.error(' 로그인 처리 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});


router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    

    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.warn(" Firestore에 사용자 없음: userId =", userId);
      return res.status(404).json({ message: " 사용자를 찾을 수 없습니다." });
    }

    const userData = userSnap.data();
    delete userData.password; // 비밀번호 제거 (이미 필요 없음)

    
    res.status(200).json(userData);
  } catch (error) {
    console.error(" /me 조회 오류:", error);
    res.status(500).json({ message: " 서버 오류" });
  }
});

//  사용자 정보 조회 API 추가
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    

    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.warn(" 해당 사용자를 찾을 수 없음:", userId);
      return res.status(404).json({ message: " 사용자 정보를 찾을 수 없습니다." });
    }

    const userData = userSnap.data();
    delete userData.password; // 비밀번호 제거

    
    res.status(200).json(userData);
  } catch (error) {
    console.error(" 사용자 정보 조회 오류:", error);
    res.status(500).json({ message: " 서버 오류 발생" });
  }
});

//  사용자 정보 수정 API
router.put('/update', verifyToken, upload.single('idImage'), async (req, res) => {
  try {
    const { name, phone, gender } = req.body;
    const userId = req.user.userId;

    let updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = formatPhoneNumber(phone);
    if (gender) updateData.gender = gender;

    if (req.file) updateData.idImage = await uploadToCloudinary(req.file.buffer);

    await db.collection('users').doc(userId).update(updateData);
    res.status(200).json({ message: " 사용자 정보 수정 성공!", updatedUser: updateData });
  } catch (error) {
    console.error(" 사용자 정보 수정 중 오류:", error);
    res.status(500).json({ message: " 서버 오류 발생" });
  }
});

// 비밀번호 변경 API
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: " 새 비밀번호를 입력하세요." });
    }

    const userId = req.user.userId;
    await admin.auth().updateUser(userId, { password: newPassword });

    res.status(200).json({ message: " 비밀번호 변경 성공!" });
  } catch (error) {
    console.error(" 비밀번호 변경 오류:", error);
    res.status(500).json({ message: " 서버 오류 발생" });
  }
});

/*  채팅 메시지 추가 API (서버를 통해 Firestore에 추가)
router.post("/add-message", verifyToken, async (req, res) => {
  try {
    const { chatRoomId, text } = req.body;
    const senderId = req.user.userId;

    if (!chatRoomId || !text) {
      return res.status(400).json({ message: " chatRoomId와 text가 필요합니다." });
    }

    const messageRef = db.collection("chats").doc(chatRoomId).collection("messages").doc();
    const newMessage = { text, senderId, createdAt: new Date() };
    await messageRef.set(newMessage);

    res.status(200).json({ message: " 메시지 추가 성공", data: newMessage });
  } catch (error) {
    console.error(" 메시지 추가 오류:", error);
    res.status(500).json({ message: " 서버 오류" });
  }
});
*/

//  토큰 검증 API
router.post("/validate-token", (req, res) => {
  const token = req.body.token;
  if (!token) return res.status(400).json({ message: "토큰이 제공되지 않았습니다." });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "토큰이 유효하지 않습니다." });
    res.status(200).json({ valid: true, user: decoded });
  });
});


router.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: " 사용자를 찾을 수 없습니다." });
    }

    const userData = userSnap.data();
    delete userData.password; //  비밀번호 제외

    res.status(200).json(userData);
  } catch (error) {
    console.error(" 사용자 정보 조회 오류:", error);
    res.status(500).json({ message: " 서버 오류 발생" });
  }
});

// 비밀번호 변경 API (보안 강화)
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: " 현재 비밀번호와 새 비밀번호를 입력하세요." });
    }

    const userId = req.user.userId;

    // Firestore에서 유저 정보 가져오기
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ message: " 사용자를 찾을 수 없습니다." });
    }

    const userData = userSnap.data();

    // 🔎 현재 비밀번호 검증
    const isMatch = await bcrypt.compare(currentPassword, userData.password);
    if (!isMatch) {
      return res.status(401).json({ message: " 현재 비밀번호가 올바르지 않습니다." });
    }

    //  비밀번호 변경 진행
    await admin.auth().updateUser(userId, { password: newPassword });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRef.update({ password: hashedPassword });

    res.status(200).json({ message: " 비밀번호 변경 완료!" });
  } catch (error) {
    console.error(" 비밀번호 변경 오류:", error);
    res.status(500).json({ message: " 비밀번호 변경 중 오류 발생" });
  }
});




module.exports = router;