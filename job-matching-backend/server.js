require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./config/firebase'); // ✅ firebase.js를 중복 호출하지 않도록 경로 확인
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobSeekerRoutes = require('./routes/jobSeekerRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ✅ 미들웨어 설정
app.use(cors());
app.use(express.json()); // ✅ JSON 요청을 올바르게 처리하도록 설정
app.use(express.urlencoded({ extended: true }));


// ✅ API 라우트 등록
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
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
