const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

//  지원 승인 API
router.post('/applications/:applicationId/approve', async (req, res) => {
  try {
    const { applicationId } = req.params;

    // 1. 지원 내역 조회
    const applicationRef = db.collection('applications').doc(applicationId);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      return res.status(404).json({ message: ' 지원 내역을 찾을 수 없습니다.' });
    }

    const applicationData = applicationDoc.data();
    const { userId, userEmail, jobId, wage } = applicationData;

    // 2. 공고 정보 조회
    const jobRef = db.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      return res.status(404).json({ message: ' 공고 정보를 찾을 수 없습니다.' });
    }

    const jobData = jobDoc.data();
    const { title, location, startDate, endDate } = jobData;

    // 3. 스케줄 생성
    await db.collection('schedules').add({
      userId,
      userEmail,
      name: title?.trim() || "제목 없음",
      title,
      location,
      jobId,
      wage,
      startDate,
      endDate,
      createdAt: admin.firestore.Timestamp.now(),
    });

    // 4. 지원 상태 업데이트
    await applicationRef.update({ status: 'approved' });

    // 5. 공지 단톡방에 유저 초대
    const chatRoomSnap = await db.collection('chats')
      .where('jobId', '==', jobId)
      .limit(1)
      .get();

    if (!chatRoomSnap.empty) {
      const chatRoomDoc = chatRoomSnap.docs[0];

      await chatRoomDoc.ref.update({
        participants: admin.firestore.FieldValue.arrayUnion(userId),
      });

      console.log(` 사용자 ${userId} 공지 단톡방에 초대 완료`);
    } else {
      console.warn(` jobId: ${jobId} 에 해당하는 채팅방이 존재하지 않습니다.`);
    }

    // 6.  사용자에게 알림 전송
    await db
      .collection('notifications')
      .doc(userId)
      .collection('userNotifications')
      .add({
        title: '공고 승인 완료',
        message: `"${title}" 공고에 대한 지원이 승인되었습니다.`,
        read: false,
        createdAt: admin.firestore.Timestamp.now(),
      });

    console.log(`📣 사용자 ${userId}에게 공고 승인 알림 전송 완료`);

    return res.status(200).json({ message: ' 지원 승인 및 알림 전송 완료' });

  } catch (error) {
    console.error(' 지원 승인 오류:', error);
    return res.status(500).json({ message: ' 서버 오류 발생' });
  }
});

module.exports = router;
