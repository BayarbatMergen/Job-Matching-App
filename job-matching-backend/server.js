require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const admin = require("firebase-admin");

// ✅ Firebase 초기화
const serviceAccount = require("./config/firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "jobmatchingapp-383da.firebasestorage.app",
});

const db = admin.firestore();
const app = express(); // ✅ Express 앱 초기화

// ✅ 미들웨어 설정
app.use(cors()); // ✅ CORS 설정 (모든 출처 허용)
app.use(express.json()); // ✅ JSON 요청 처리
app.use(express.urlencoded({ extended: true })); // ✅ URL 인코딩된 데이터 처리

// ✅ SMTP 설정
console.log("✅ SMTP 설정 확인");
console.log("✅ SMTP_USER:", process.env.SMTP_USER);
console.log("✅ ADMIN_EMAIL:", process.env.ADMIN_EMAIL || "❌ 없음");

// ✅ Nodemailer SMTP 설정
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
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
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobSeekerRoutes = require('./routes/jobSeekerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes'); // ✅ 일정 API 경로 수정

// ✅ API 엔드포인트 설정
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/jobseekers', jobSeekerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schedules', scheduleRoutes); // ✅ `/api/schedules` 오타 수정

// ✅ 구직자 지원 API
app.post('/api/jobs/apply', async (req, res) => {
  const { jobId, userEmail } = req.body;

  if (!jobId || !userEmail) {
    return res.status(400).json({ message: '⚠️ 필수 정보를 입력하세요.' });
  }

  try {
    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      return res.status(404).json({ message: '❌ 해당 공고를 찾을 수 없습니다.' });
    }

    const jobData = jobSnap.data();

    // ✅ Firestore에 지원 내역 저장
    await db.collection('applications').add({
      jobId,
      userEmail,
      appliedAt: new Date(),
      status: '지원 완료',
    });

    // ✅ 관리자 이메일 전송
    if (process.env.ADMIN_EMAIL) {
      const mailOptions = {
        from: `"Job Matching Support" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: '새로운 구직 지원 알림',
        text: `📢 새로운 구직 지원 요청이 있습니다.\n\n📌 지원자: ${userEmail}\n📌 지원한 공고: ${jobData.title}`,
      };

      await transporter.sendMail(mailOptions);
      console.log("📧 관리자에게 지원 알림 이메일을 보냈습니다.");
    } else {
      console.warn("⚠️ 관리자 이메일이 설정되지 않아 이메일을 보낼 수 없습니다.");
    }

    res.status(200).json({ message: '✅ 지원 요청이 완료되었습니다.' });
  } catch (error) {
    console.error('❌ 지원 요청 오류:', error.message);
    res.status(500).json({ message: '❌ 서버 오류 발생' });
  }
});

// ✅ 특정 공고 지원자 목록 조회 API
app.get('/api/jobs/applications/:jobId', async (req, res) => {
  const { jobId } = req.params;

  try {
    const applicationSnap = await db.collection('applications')
      .where('jobId', '==', jobId)
      .orderBy('appliedAt', 'desc')
      .get();

    if (applicationSnap.empty) {
      return res.status(404).json({ message: '해당 공고에 대한 지원자가 없습니다.' });
    }

    const applications = applicationSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(applications);
  } catch (error) {
    console.error('🔥 지원자 목록 조회 오류:', error);
    res.status(500).json({ message: '❌ 서버 오류 발생', error: error.message });
  }
});

// ✅ 서버 상태 확인 엔드포인트
app.get('/', (req, res) => {
  res.send('✅ Job Matching Backend 서버가 실행 중입니다!');
});

// ✅ 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  await testSMTP();
});
