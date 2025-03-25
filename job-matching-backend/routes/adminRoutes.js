const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middlewares/authMiddleware');
const adminOnlyMiddleware = require('../middlewares/adminOnlyMiddleware');

// ✅ 관리자 로그인 API (users 컬렉션 사용)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userQuery = await db.collection('users').where('email', '==', email).where('role', '==', 'admin').get();

    if (userQuery.empty) {
      return res.status(400).json({ message: '관리자 계정을 찾을 수 없습니다.' });
    }

    const adminData = userQuery.docs[0].data();
    const isMatch = await bcrypt.compare(password, adminData.password);

    if (!isMatch) {
      return res.status(400).json({ message: '비밀번호가 잘못되었습니다.' });
    }

    const token = jwt.sign(
      { userId: adminData.userId, email: adminData.email, role: adminData.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: '✅ 관리자 로그인 성공!',
      admin: { email: adminData.email, name: adminData.name },
      token
    });
  } catch (error) {
    console.error("❌ 관리자 로그인 오류:", error);
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});


// ✅ 모든 구직자 조회 API
router.get('/jobseekers', async (req, res) => {
  try {
    const jobseekersSnapshot = await db.collection('jobseekers').get();
    const jobseekers = jobseekersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(jobseekers);
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// ✅ 특정 구직자 삭제 API
router.delete('/jobseekers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('jobseekers').doc(id).delete();

    res.status(200).json({ message: `구직자 ${id} 삭제 완료!` });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// ✅ 모든 구인 공고 조회 API
router.get('/jobs', async (req, res) => {
  try {
    const jobsSnapshot = await db.collection('jobs').get();
    const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// ✅ 특정 구인 공고 삭제 API
router.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('jobs').doc(id).delete();

    res.status(200).json({ message: `구인 공고 ${id} 삭제 완료!` });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    console.log("📌 [관리자 알림 조회] 요청 수신");

    const notificationsSnap = await db.collection('notifications').orderBy('timestamp', 'desc').get();
    const notifications = notificationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log("✅ 관리자 알림 조회 성공:", notifications);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ 관리자 알림 조회 중 오류 발생:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
});

// ✅ 모든 사용자(글로벌) 알림 생성 API
router.post('/global-notifications', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: '알림 메시지를 입력해주세요.' });
    }

    const newNotification = {
      message,
      createdAt: new Date(),
    };

    const docRef = await db.collection('globalNotifications').add(newNotification);

    res.status(201).json({
      message: '✅ 글로벌 알림이 추가되었습니다!',
      docId: docRef.id,
      data: newNotification,
    });
  } catch (error) {
    console.error('❌ 글로벌 알림 추가 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// ✅ 특정 사용자에게 알림 전송 API
router.post('/user-notifications', verifyToken, async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: 'userId와 message를 입력해주세요.' });
    }

    const newNotification = {
      message,
      createdAt: new Date(),
      read: false,
    };

    await db.collection('notifications').doc(userId).collection('userNotifications').add(newNotification);

    res.status(201).json({
      message: `✅ ${userId} 에게 알림이 전송되었습니다.`,
      data: newNotification,
    });
  } catch (error) {
    console.error('❌ 사용자 알림 전송 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

router.post('/applications/:applicationId/approve', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const applicationRef = db.collection('applications').doc(applicationId);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      return res.status(404).json({ message: '지원 내역을 찾을 수 없습니다.' });
    }

    const applicationData = applicationDoc.data();

    // 공고 정보 가져오기 (startDate, endDate 포함)
    const jobRef = db.collection('jobs').doc(applicationData.jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      return res.status(404).json({ message: '공고 정보를 찾을 수 없습니다.' });
    }

    const jobData = jobDoc.data();

    await db.collection('schedules').add({
      userId: applicationData.userId,
      userEmail: applicationData.userEmail,
      name: applicationData.jobTitle,
      wage: applicationData.wage,
      startDate: jobData.startDate,   // ✅ 시작일 저장
      endDate: jobData.endDate,       // ✅ 종료일 저장
    });

    await applicationRef.update({ status: 'approved' });

    res.status(200).json({ message: '승인 및 스케줄 반영 완료' });
  } catch (err) {
    console.error('승인 처리 오류:', err);
    res.status(500).json({ message: '❌ 서버 오류 발생', error: err.message });
  }
});

// ✅ 승인 대기 중인 지원 내역 가져오기
router.get('/applications/pending', async (req, res) => {
  try {
    const pendingAppsSnapshot = await db.collection('applications')
      .where('status', '==', 'pending')
      .get();

    const pendingApplications = pendingAppsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(pendingApplications);
  } catch (err) {
    console.error('❌ 승인 대기 지원 내역 가져오기 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});


// ✅ 모든 채팅방 목록 가져오기 (관리자용)
router.get('/chats/all-rooms', async (req, res) => {
  try {
    console.log("📡 (관리자) 채팅방 목록 요청 받음...");

    const chatRoomsSnapshot = await db.collection("chats").get();
    const chatRooms = chatRoomsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ (관리자) 채팅방 개수: ${chatRooms.length}`);
    res.status(200).json(chatRooms);
  } catch (error) {
    console.error("❌ (관리자) 채팅방 목록 불러오기 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
});



module.exports = router;
