require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const { admin, db, storage } = require("./config/firebaseAdmin");
const { verifyToken } = require("./middlewares/authMiddleware");
const applicationRoutes = require('./routes/applicationRoutes');

const ADMIN_UID = process.env.ADMIN_UID;
const app = express();

// ✅ 미들웨어
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 환경 변수 확인
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error("❌ [오류] SMTP 환경 변수가 설정되지 않았습니다.");
  process.exit(1);
}

// ✅ SMTP 설정
console.log("✅ SMTP 설정 확인");
console.log("✅ SMTP_USER:", process.env.SMTP_USER);
console.log("✅ ADMIN_EMAIL:", process.env.ADMIN_EMAIL || "❌ 없음");
console.log("✅ ADMIN_UID:", process.env.ADMIN_UID || "❌ 없음");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function testSMTP() {
  try {
    await transporter.verify();
    console.log("✅ SMTP 서버 연결 성공!");
  } catch (error) {
    console.error("❌ SMTP 서버 연결 실패:", error.message);
  }
}

// ✅ 라우터 가져오기
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const jobSeekerRoutes = require("./routes/jobSeekerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const chatRoutes = require("./routes/chatRoutes");

// ✅ 라우터 연결
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/jobseekers", jobSeekerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/chats", chatRoutes);
app.use('/api', applicationRoutes);

app.get("/", (req, res) => {
  res.send("✅ Job Matching Backend 서버가 실행 중입니다!");
});

// ✅ 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  await testSMTP();
});
