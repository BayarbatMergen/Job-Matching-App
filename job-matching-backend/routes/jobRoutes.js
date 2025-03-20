const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ✅ Nodemailer 설정 (이메일 알림 전송)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ 1️⃣ 구인 공고 등록 API
router.post('/add', async (req, res) => {
  try {
    let { title, company, location, wage, workdays, employmentType, date } = req.body;

    if (!title || !company || !location || !wage || !workdays || !employmentType) {
      return res.status(400).json({ message: '모든 필드를 입력하세요.' });
    }

    // ✅ workdays가 문자열로 들어올 경우 배열로 변환
    if (typeof workdays === 'string') {
      workdays = workdays.split(',').map(day => day.trim()); // "금, 토" → ["금", "토"]
    }

    const jobRef = db.collection('jobs').doc();
    await jobRef.set({
      title,
      company,
      location,
      wage,
      workdays, // ✅ Firestore에 배열로 저장
      employmentType,
      date, // ✅ 근무 기간 필드 추가
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ message: '구인 공고 등록 성공!', jobId: jobRef.id });
  } catch (error) {
    console.error('🔥 구인 공고 등록 오류:', error);
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});


// ✅ 2️⃣ 구인 공고 목록 조회 API
router.get('/list', async (req, res) => {
  try {
    const jobSnap = await db.collection('jobs').orderBy('createdAt', 'desc').get();
    const jobs = jobSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(jobs);
  } catch (error) {
    console.error('🔥 구인 공고 조회 오류:', error);
    res.status(500).json({ message: '❌ 서버 오류', error: error.message });
  }
});

// ✅ 3️⃣ 특정 구인 공고 상세 조회 API
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      return res.status(404).json({ message: '❌ 공고를 찾을 수 없습니다.' });
    }

    res.status(200).json({ id: jobSnap.id, ...jobSnap.data() });
  } catch (error) {
    console.error('🔥 구인 공고 상세 조회 오류:', error);
    res.status(500).json({ message: '❌ 서버 오류', error: error.message });
  }
});

// ✅ 4️⃣ 구인 공고 수정 API
router.put('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const updateData = req.body;

    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      return res.status(404).json({ message: '❌ 공고를 찾을 수 없습니다.' });
    }

    await jobRef.update({
      ...updateData,
      updatedAt: new Date(),
    });

    res.status(200).json({ message: '✅ 구인 공고 수정 완료!' });
  } catch (error) {
    console.error('🔥 구인 공고 수정 오류:', error);
    res.status(500).json({ message: '❌ 서버 오류', error: error.message });
  }
});

// ✅ 5️⃣ 구인 공고 삭제 API
router.delete('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      return res.status(404).json({ message: '❌ 공고를 찾을 수 없습니다.' });
    }

    await jobRef.delete();
    res.status(200).json({ message: '✅ 구인 공고 삭제 완료!' });
  } catch (error) {
    console.error('🔥 구인 공고 삭제 오류:', error);
    res.status(500).json({ message: '❌ 서버 오류', error: error.message });
  }
});

// ✅ 6️⃣ 지원 요청 API (구직자가 "지원하기" 클릭 시 실행)
router.post('/apply', async (req, res) => {
  const { jobId, userEmail } = req.body;

  console.log("📌 [POST /api/jobs/apply] 수신 데이터:", req.body);

  if (!jobId || !userEmail) {
    console.warn("⚠️ 필수 정보 누락:", { jobId, userEmail });
    return res.status(400).json({ message: '⚠️ 필수 정보를 입력하세요.' });
  }

  try {
    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      console.warn("❌ 공고 없음:", jobId);
      return res.status(404).json({ message: '❌ 해당 공고를 찾을 수 없습니다.' });
    }

    const jobData = jobSnap.data();

    const applicationRef = db.collection('applications').doc();
    await applicationRef.set({
      jobId,
      userEmail,
      appliedAt: new Date(),
      status: '지원 완료',
    });

    const mailOptions = {
      from: `"Job Matching Support" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '새로운 구직 지원 알림',
      text: `📢 새로운 구직 지원 요청이 있습니다.\n\n📌 지원자: ${userEmail}\n📌 지원한 공고: ${jobData.title}`,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ 지원 요청 완료:", { jobId, userEmail });
    res.status(200).json({ message: '✅ 지원 요청이 완료되었습니다.' });
  } catch (error) {
    console.error('❌ 지원 요청 오류:', error.message);
    res.status(500).json({ message: '❌ 서버 오류 발생' });
  }
});

// ✅ 7️⃣ 관리자 지원자 목록 조회 API
router.get('/applications/:jobId', async (req, res) => {
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

router.get("/user/:userId", async (req, res) => {
  try {
    let { userId } = req.params;
    console.log(`📌 사용자 일정 요청 userId: ${userId}`);

    if (!userId || userId === "UNKNOWN_USER") {
      console.warn("⚠️ userId가 없음 → fetchUserData() 실행!");
      userId = await fetchUserData();
    }

    if (!userId) {
      console.error("❌ userId를 가져올 수 없습니다. Firestore 요청 중단!");
      return res.status(400).json({ message: "❌ 유효한 userId가 필요합니다." });
    }

    const schedulesRef = db.collection("schedules");
    const querySnapshot = await schedulesRef.where("userId", "==", userId).get();

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "❌ 해당 사용자의 일정이 없습니다." });
    }

    const schedules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(schedules);
  } catch (error) {
    console.error("🔥 사용자 일정 조회 오류:", error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
});


router.get("/id/:scheduleId", async (req, res) => {
  try {
    const { scheduleId } = req.params;
    console.log(`📌 개별 일정 요청 scheduleId: ${scheduleId}`);

    const scheduleRef = db.collection("schedules").doc(scheduleId);
    const scheduleDoc = await scheduleRef.get();

    if (!scheduleDoc.exists) {
      return res.status(404).json({ message: "❌ 해당 일정이 존재하지 않습니다." });
    }

    return res.status(200).json({ id: scheduleDoc.id, ...scheduleDoc.data() });
  } catch (error) {
    console.error("🔥 Firestore에서 일정 상세 조회 오류:", error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
});

module.exports = router;
