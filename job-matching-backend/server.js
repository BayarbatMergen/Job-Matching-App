require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");



// ✅ Firebase 초기화
const serviceAccount = require("./config/firebaseServiceAccount.json");
const { verifyToken } = require("./middlewares/authMiddleware"); // ✅ 인증 미들웨어 불러오기

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "jobmatchingapp-383da.firebasestorage.app",
  });
}

const db = admin.firestore();
const app = express(); // ✅ Express 앱 초기화

// ✅ 미들웨어 설정
app.use(bodyParser.json()); // For JSON request bodies
app.use(cors({ origin: "*" }));
app.use(express.json()); // ✅ JSON 요청 처리
app.use(express.urlencoded({ extended: true })); // ✅ URL 인코딩된 데이터 처리

// ✅ 환경 변수 검증 추가
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error("❌ [오류] SMTP 환경 변수가 설정되지 않았습니다.");
  process.exit(1); // 🚀 서버 실행 중단 (환경 변수 필수)
}

// ✅ SMTP 설정
console.log("✅ SMTP 설정 확인");
console.log("✅ SMTP_USER:", process.env.SMTP_USER);
console.log("✅ ADMIN_EMAIL:", process.env.ADMIN_EMAIL || "❌ 없음");

// ✅ Nodemailer SMTP 설정
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // TLS 사용
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ SMTP 연결 테스트 함수
async function testSMTP() {
  try {
    await transporter.verify();
    console.log("✅ SMTP 서버 연결 성공!");
  } catch (error) {
    console.error("❌ SMTP 서버 연결 실패:", error.message);
  }
}

// ✅ API 라우트 가져오기
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const jobSeekerRoutes = require("./routes/jobSeekerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes"); // ✅ 일정 API 추가
const chatRoutes = require("./routes/chatRoutes"); // Import chat routes

// ✅ API 엔드포인트 설정
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/jobseekers", jobSeekerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/schedules", scheduleRoutes); 
app.use("/api/chats", chatRoutes); 

// ✅ 서버 상태 확인 엔드포인트
app.get("/", (req, res) => {
  res.send("✅ Job Matching Backend 서버가 실행 중입니다!");
});

// ✅ 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  await testSMTP();
});