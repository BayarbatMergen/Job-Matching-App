const express = require("express");
const router = express.Router();
const {
  addMessageToChat,
  getChatMessages,
  getChatRooms,
  createOrGetAdminChatRoom,
  createNoticeRoom,
  addUserToChatRoom,
  getChatParticipants,
  getUserNameById,
  markMessageAsRead,
  getUnreadChatRooms,
  getUnreadStatus
} = require("../controllers/chatController");
const { verifyToken } = require("../middlewares/authMiddleware");

//  채팅방 목록 가져오기
router.get("/rooms", verifyToken, getChatRooms);

//  특정 채팅방의 모든 메시지 가져오기
router.get("/rooms/:roomId/messages", verifyToken, getChatMessages);

//  특정 채팅방에 메시지 추가
router.post("/rooms/:roomId/messages", verifyToken, addMessageToChat);

//  관리자 채팅방 생성 또는 반환
router.post("/admin-room", verifyToken, createOrGetAdminChatRoom);

//  공지방 생성 (옵션)
router.post("/notice-room", verifyToken, createNoticeRoom);

//  채팅방에 유저 추가 + 입장 메시지 자동 생성
router.post("/rooms/:roomId/add-user", verifyToken, addUserToChatRoom);

//  채팅방 참가자 목록 조회
router.get("/rooms/:roomId/participants", verifyToken, getChatParticipants);

//  사용자 이름 조회
router.get("/users/:uid", verifyToken, getUserNameById);

router.post('/rooms/:roomId/messages/:messageId/read', markMessageAsRead);

router.get("/unread-status", verifyToken, getUnreadStatus);


console.log(" chatRoutes.js 로드 완료");

module.exports = router;

