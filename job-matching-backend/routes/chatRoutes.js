const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const chatController = require("../controllers/chatController"); // ✅ chatController 올바르게 가져오기

const router = express.Router();

// ✅ 디버깅 로그 추가
console.log("📌 addMessageToChat 존재 여부:", typeof chatController.addMessageToChat);
console.log("📌 getChatMessages 존재 여부:", typeof chatController.getChatMessages);
console.log("📌 getChatRooms 존재 여부:", typeof chatController.getChatRooms);

// ✅ 채팅방 목록 가져오기 API (GET /api/chats/rooms)
router.get("/rooms", verifyToken, chatController.getChatRooms);

// ✅ 특정 채팅방의 메시지 가져오기 API (GET /api/chats/:chatRoomId/messages)
router.get("/:chatRoomId/messages", verifyToken, chatController.getChatMessages);

// ✅ 채팅 메시지 추가 API (POST /api/chats/add-message)
router.post("/add-message", verifyToken, chatController.addMessageToChat);

module.exports = router;
