require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

// ✅ SMTP 설정 확인
console.log("✅ SMTP 설정 확인");
console.log("✅ SMTP_USER:", process.env.SMTP_USER);
console.log("✅ SMTP_PASS:", process.env.SMTP_PASS ? "********" : "❌ 없음"); // 보안상 비밀번호 숨김

// ✅ Nodemailer SMTP 설정
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, 
  port: process.env.SMTP_PORT, 
  secure: false,  // TLS를 사용하려면 false
  requireTLS: true,  // ✅ TLS 강제 사용
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

const app = express();

// ✅ 미들웨어 설정
app.use(cors());
app.use(express.json()); // ✅ JSON 요청을 올바르게 처리하도록 설정
app.use(express.urlencoded({ extended: true }));

// ✅ API 라우트 등록
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobSeekerRoutes = require('./routes/jobSeekerRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/jobseekers', jobSeekerRoutes);
app.use('/api/admin', adminRoutes);

// ✅ 서버 상태 확인 엔드포인트
app.get('/', (req, res) => {
  res.send('✅ Job Matching Backend 서버가 실행 중입니다!');
});

// ✅ 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  
  // ✅ 서버 시작 후 SMTP 연결 테스트 실행
  await testSMTP();
});
