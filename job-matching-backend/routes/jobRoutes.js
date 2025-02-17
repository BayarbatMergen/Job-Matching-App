const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// ✅ 1️⃣ 구인 공고 등록 API
router.post('/add', async (req, res) => {
  try {
    const { title, company, location, wage, workdays, employmentType } = req.body;

    if (!title || !company || !location || !wage || !workdays || !employmentType) {
      return res.status(400).json({ message: '모든 필드를 입력하세요.' });
    }

    const jobRef = db.collection('jobs').doc();
    await jobRef.set({
      title,
      company,
      location,
      wage,
      workdays,
      employmentType,
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
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// ✅ 3️⃣ 특정 구인 공고 상세 조회 API
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      return res.status(404).json({ message: '공고를 찾을 수 없습니다.' });
    }

    res.status(200).json({ id: jobSnap.id, ...jobSnap.data() });
  } catch (error) {
    console.error('🔥 구인 공고 상세 조회 오류:', error);
    res.status(500).json({ message: '서버 오류', error: error.message });
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
      return res.status(404).json({ message: '공고를 찾을 수 없습니다.' });
    }

    await jobRef.update({
      ...updateData,
      updatedAt: new Date(),
    });

    res.status(200).json({ message: '구인 공고 수정 완료!' });
  } catch (error) {
    console.error('🔥 구인 공고 수정 오류:', error);
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// ✅ 5️⃣ 구인 공고 삭제 API
router.delete('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      return res.status(404).json({ message: '공고를 찾을 수 없습니다.' });
    }

    await jobRef.delete();
    res.status(200).json({ message: '구인 공고 삭제 완료!' });
  } catch (error) {
    console.error('🔥 구인 공고 삭제 오류:', error);
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

module.exports = router;
