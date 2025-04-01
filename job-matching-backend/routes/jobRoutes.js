const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebaseAdmin');
const nodemailer = require('nodemailer');
require('dotenv').config();

//  Nodemailer 설정 (이메일 알림 전송)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

//  구인 공고 등록 API (startDate, endDate 포함 & 특정 유저 알림 전송)
router.post('/add', async (req, res) => {
  try {
    const {
      title, wage, startDate, endDate, workDays, workHours, industry,
      employmentType, accommodation, maleRecruitment, femaleRecruitment,
      location, description, notifyUsers // 👈 notifyUsers는 visibleTo 대상
    } = req.body;

    if (!title || !wage || !startDate || !endDate || !workDays || !employmentType || !location) {
      return res.status(400).json({ message: '모든 필수 항목을 입력해주세요.' });
    }

    // ✅ visibleTo 정리: 문자열 따옴표 제거 + 배열 강제 형 변환
    const visibleTo = notifyUsers === "all"
      ? "all"
      : Array.isArray(notifyUsers)
        ? notifyUsers.map(uid => String(uid).replace(/"/g, '').trim())
        : [];

    const jobRef = db.collection('jobs').doc();
    await jobRef.set({
      title,
      wage,
      startDate,
      endDate,
      workDays: Array.isArray(workDays) ? workDays : [],
      workHours,
      industry,
      employmentType,
      accommodation,
      maleRecruitment,
      femaleRecruitment,
      location,
      description,
      visibleTo, // 👈 여기에 필터된 값 저장
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    console.log(`✅ 공고 등록 성공! [${jobRef.id}] — 알림 처리 시작`);

    // 🔔 알림 전송 처리
    if (notifyUsers === "all") {
      await db.collection('globalNotifications').add({
        title: "새 공고 등록",
        message: `"${title}" 공고가 새로 등록되었습니다.`,
        createdAt: admin.firestore.Timestamp.now(),
      });
      console.log("📣 글로벌 알림 전송 완료");
    } else if (Array.isArray(notifyUsers)) {
      for (const userId of visibleTo) {
        await db.collection('notifications').doc(userId).collection('userNotifications').add({
          title: "새 공고 등록",
          message: `"${title}" 공고가 새로 등록되었습니다.`,
          read: false,
          createdAt: admin.firestore.Timestamp.now(),
        });
      }
      console.log(`📣 ${visibleTo.length}명의 사용자에게 개별 알림 전송 완료`);
    }

    // 💬 공고 전용 단톡방 생성
    const chatRoomRef = db.collection('chats').doc();
    const participants =
  notifyUsers === "all"
    ? []  // or maybe [adminId] if you want the admin to join
    : Array.isArray(visibleTo)
    ? visibleTo
    : [];
    console.log("🔥 채팅방 생성 준비 중...");
    await chatRoomRef.set({
      name: `알바생 단톡방 (${title})`,
      participants,
      jobId: jobRef.id,
      createdAt: admin.firestore.Timestamp.now(),
      roomType: 'notice',
      type: 'group',
    });
    console.log(`💬 공고 단톡방 생성 완료! [roomId: ${chatRoomRef.id}]`);

    res.status(201).json({ message: '공고 등록 및 알림 전송 완료', jobId: jobRef.id });
  } catch (error) {
    console.error('❌ 공고 등록 또는 알림 전송 오류:', error.stack);
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

//  2️⃣ 구인 공고 목록 조회 API
router.get('/list', async (req, res) => {
  try {
    const userId = req.query.userId;  // 쿼리로 사용자 ID 받기
    const jobSnap = await db.collection('jobs').orderBy('createdAt', 'desc').get();
    const jobs = jobSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(job => job.visibleTo === 'all' || (Array.isArray(job.visibleTo) && job.visibleTo.includes(userId)));

    res.status(200).json(jobs);
  } catch (error) {
    console.error(' 구인 공고 조회 오류:', error);
    res.status(500).json({ message: ' 서버 오류', error: error.message });
  }
});

//  3️⃣ 특정 구인 공고 상세 조회 API
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      return res.status(404).json({ message: ' 공고를 찾을 수 없습니다.' });
    }

    res.status(200).json({ id: jobSnap.id, ...jobSnap.data() });
  } catch (error) {
    console.error(' 구인 공고 상세 조회 오류:', error);
    res.status(500).json({ message: ' 서버 오류', error: error.message });
  }
});

//  4️⃣ 구인 공고 수정 API
router.put('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const updateData = req.body;

    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      return res.status(404).json({ message: ' 공고를 찾을 수 없습니다.' });
    }

    await jobRef.update({
      ...updateData,
      updatedAt: new Date(),
    });

    res.status(200).json({ message: ' 구인 공고 수정 완료!' });
  } catch (error) {
    console.error(' 구인 공고 수정 오류:', error);
    res.status(500).json({ message: ' 서버 오류', error: error.message });
  }
});

//  5️⃣ 구인 공고 삭제 API
router.delete('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      return res.status(404).json({ message: ' 공고를 찾을 수 없습니다.' });
    }

    await jobRef.delete();
    res.status(200).json({ message: ' 구인 공고 삭제 완료!' });
  } catch (error) {
    console.error(' 구인 공고 삭제 오류:', error);
    res.status(500).json({ message: ' 서버 오류', error: error.message });
  }
});

//  6️⃣ 지원 요청 API (구직자가 "지원하기" 클릭 시 실행)
router.post('/apply', async (req, res) => {
  const { jobId, userEmail } = req.body;
  console.log(" [POST /api/jobs/apply] 요청 수신:", req.body);

  if (!jobId || !userEmail) {
    return res.status(400).json({ message: ' 필수 정보를 입력하세요.' });
  }

  try {
    // 🔒 중복 지원 확인
    const duplicateCheck = await db.collection('applications')
      .where('jobId', '==', jobId)
      .where('userEmail', '==', userEmail)
      .get();

    if (!duplicateCheck.empty) {
      return res.status(400).json({ message: '이미 해당 공고에 지원하셨습니다.' });
    }

    // 공고 가져오기
    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await jobRef.get();
    if (!jobSnap.exists) {
      return res.status(404).json({ message: ' 해당 공고를 찾을 수 없습니다.' });
    }
    const jobData = jobSnap.data();

    // 사용자 정보 가져오기
    const userQuery = await db.collection('users').where('email', '==', userEmail).get();
    if (userQuery.empty) {
      return res.status(404).json({ message: ' 해당 이메일의 사용자를 찾을 수 없습니다.' });
    }
    const userDoc = userQuery.docs[0];
    const userId = userDoc.id;

    // workDate 계산
    let workDate;
    if (jobData.startDate) {
      workDate = jobData.startDate;
    } else {
      const appliedDate = new Date();
      workDate = appliedDate.toISOString().split('T')[0];
    }

    // 지원 내역 저장
    await db.collection('applications').add({
      userId,
      userEmail,
      jobId,
      jobTitle: jobData.title,
      wage: jobData.wage,
      startDate: jobData.startDate,
      endDate: jobData.endDate,
      appliedAt: admin.firestore.Timestamp.now(),
      status: 'pending'
    });

    // 이메일 알림
    const mailOptions = {
      from: `"Job Matching Support" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '새로운 구직 지원 알림',
      text: `지원자: ${userEmail} 가 ${jobData.title} 공고에 지원했습니다.`
    };
    await transporter.sendMail(mailOptions);

    console.log(" 지원 요청 및 저장 완료!");
    res.status(200).json({ message: ' 지원 요청이 완료되었습니다.' });

  } catch (error) {
    console.error(' 지원 요청 처리 중 오류:', error.message);
    res.status(500).json({ message: ' 서버 오류 발생', error: error.message });
  }
});

//  7️⃣ 관리자 지원자 목록 조회 API
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
    console.error(' 지원자 목록 조회 오류:', error);
    res.status(500).json({ message: ' 서버 오류 발생', error: error.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    let { userId } = req.params;
    console.log(` 사용자 일정 요청 userId: ${userId}`);

    if (!userId || userId === "UNKNOWN_USER") {
      console.warn(" userId가 없음 → fetchUserData() 실행!");
      userId = await fetchUserData();
    }

    if (!userId) {
      console.error(" userId를 가져올 수 없습니다. Firestore 요청 중단!");
      return res.status(400).json({ message: " 유효한 userId가 필요합니다." });
    }

    const schedulesRef = db.collection("schedules");
    const querySnapshot = await schedulesRef.where("userId", "==", userId).get();

    if (querySnapshot.empty) {
      return res.status(404).json({ message: " 해당 사용자의 일정이 없습니다." });
    }

    const schedules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(schedules);
  } catch (error) {
    console.error(" 사용자 일정 조회 오류:", error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
});


router.get("/id/:scheduleId", async (req, res) => {
  try {
    const { scheduleId } = req.params;
    console.log(` 개별 일정 요청 scheduleId: ${scheduleId}`);

    const scheduleRef = db.collection("schedules").doc(scheduleId);
    const scheduleDoc = await scheduleRef.get();

    if (!scheduleDoc.exists) {
      return res.status(404).json({ message: " 해당 일정이 존재하지 않습니다." });
    }

    return res.status(200).json({ id: scheduleDoc.id, ...scheduleDoc.data() });
  } catch (error) {
    console.error(" Firestore에서 일정 상세 조회 오류:", error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
});

router.get('/applied', async (req, res) => {
  const { jobId, userEmail } = req.query;

  try {
    const snapshot = await db.collection('applications')
      .where('jobId', '==', jobId)
      .where('userEmail', '==', userEmail)
      .get();

    if (!snapshot.empty) {
      return res.status(200).json({ alreadyApplied: true });
    }

    return res.status(200).json({ alreadyApplied: false });
  } catch (error) {
    console.error("중복 지원 확인 오류:", error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
