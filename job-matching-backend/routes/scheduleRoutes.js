const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware"); // ✅ 인증 미들웨어 가져오기
const scheduleController = require("../controllers/scheduleController"); // ✅ 컨트롤러에서 함수 불러오기
const { sendAdminNotification } = require("../utils/notificationService"); // ✅ 관리자 알림 함수 추가

const router = express.Router();

// ✅ 올바르게 컨트롤러 함수 가져오는지 확인
console.log("📌 getUserSchedules 존재 여부:", typeof scheduleController.getUserSchedules);

// ✅ 전체 일정 조회 API (GET /api/schedules)
router.get("/", verifyToken, scheduleController.getAllSchedules);

// ✅ 특정 유저의 일정 조회 (GET /api/schedules/user/:userId)
router.get("/user/:userId", verifyToken, scheduleController.getUserSchedules);

// ✅ 개별 일정 조회 (GET /api/schedules/id/:scheduleId)
router.get("/id/:scheduleId", verifyToken, scheduleController.getScheduleById);

// ✅ 🔥 정산 요청 API 추가 (올바른 위치!)
router.post("/request-settlement", verifyToken, scheduleController.requestSettlement);

module.exports = router;
