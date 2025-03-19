const express = require("express");
const router = express.Router();
const { addMessageToChat, getChatMessages, getChatRooms, createOrGetAdminChatRoom } = require("../controllers/chatController");
const { verifyToken } = require("../middlewares/authMiddleware");

console.log("📌 addMessageToChat 존재 여부:", typeof addMessageToChat);
console.log("📌 getChatMessages 존재 여부:", typeof getChatMessages);
console.log("📌 getChatRooms 존재 여부:", typeof getChatRooms);

// ✅ 채팅방 목록 가져오기
router.get("/rooms", verifyToken, getChatRooms);

// ✅ 특정 채팅방의 모든 메시지 가져오기 (추가)
router.get("/rooms/:roomId/messages", verifyToken, getChatMessages);

// ✅ 특정 채팅방에 메시지 추가
router.post("/rooms/:roomId/messages", verifyToken, addMessageToChat);
// 관리자 채팅방 생성 또는 가져오기
router.post("/admin-room", verifyToken, createOrGetAdminChatRoom);

console.log("✅ chatRoutes.js 로드 완료");

module.exports = router;
