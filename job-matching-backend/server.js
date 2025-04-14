require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");

const { admin, db, storage } = require("./config/firebaseAdmin");
const { verifyToken } = require("./middlewares/authMiddleware");

// ✅ 앱 초기화
const app = express();

// ✅ 미들웨어
app.use(bodyParser.json());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ SMTP 설정
let transporter;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  console.warn("⚠️ SMTP 환경변수가 누락됨: 이메일 발송 기능이 작동하지 않을 수 있음");
}

// ✅ SMTP 테스트 함수
async function testSMTP() {
  if (!transporter) return;
  try {
    await transporter.verify();
    console.log("✅ SMTP 서버 연결 성공");
  } catch (error) {
    console.error("❌ SMTP 서버 연결 실패:", error.message);
  }
}

// ✅ 라우터 모듈
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const jobSeekerRoutes = require("./routes/jobSeekerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

// ✅ 라우터 등록
app.use("/api/auth", (req, res, next) => {
  console.log("[AUTH 요청]", req.method, req.url);
  next();
}, authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/jobseekers", jobSeekerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api", applicationRoutes);

// ✅ 기본 라우트
app.get("/", (req, res) => {
  res.send("📡 Job Matching Backend 서버가 실행 중입니다!");
});

// ✅ Firebase Functions에서는 export만 함
module.exports = app;
