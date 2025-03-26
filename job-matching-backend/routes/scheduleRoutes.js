const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware"); 
const scheduleController = require("../controllers/scheduleController"); 
const { sendAdminNotification } = require("../utils/notificationService"); 

console.log("📌 getUserSchedules 존재 여부:", typeof scheduleController.getUserSchedules);

router.get("/", verifyToken, scheduleController.getAllSchedules);
router.get("/user/:userId", verifyToken, scheduleController.getUserSchedules);
router.get("/id/:scheduleId", verifyToken, scheduleController.getScheduleById);
router.post("/request-settlement", verifyToken, scheduleController.requestSettlement);
router.post("/approve-settlement", scheduleController.approveSettlement);

module.exports = router;
