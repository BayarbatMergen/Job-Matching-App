const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const router = express.Router();
const db = getFirestore();

// ✅ 일정 조회 API (GET /api/schedules)
router.get("/", async (req, res) => {
  try {
    const schedulesRef = db.collection("schedules");
    const snapshot = await schedulesRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "❌ 일정 데이터가 없습니다." });
    }

    let schedules = [];
    snapshot.forEach((doc) => {
      schedules.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json(schedules);
  } catch (error) {
    console.error("🔥 Firestore에서 일정 불러오기 오류:", error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
});

// ✅ 개별 일정 조회 (GET /api/schedules/:id)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const scheduleDoc = await db.collection("schedules").doc(id).get();

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
