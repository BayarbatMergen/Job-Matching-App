const { db } = require("../config/firebase");
const admin = require('firebase-admin');

// ✅ 특정 채팅방의 모든 메시지 가져오기
const getChatMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(`📡 채팅 메시지 요청 받음 (채팅방: ${roomId})`);

    if (!roomId) {
      return res.status(400).json({ message: "⚠️ 유효한 채팅방 ID가 필요합니다." });
    }

    const messagesSnapshot = await db
      .collection("chats")
      .doc(roomId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ [${roomId}] 메시지 개수: ${messages.length}`);
    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ 채팅 메시지 불러오기 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
};

// ✅ 특정 채팅방에 메시지 추가
const addMessageToChat = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text } = req.body;
    const senderId = req.user.userId;

    if (!roomId || !text) {
      return res.status(400).json({ message: "⚠️ roomId와 text가 필요합니다." });
    }

    const roomDoc = await db.collection("chats").doc(roomId).get();
    const roomData = roomDoc.data();

    // 공지방 차단 (관리자가 아니면)
    if (roomData && roomData.roomType === "notice" && senderId !== process.env.ADMIN_UID) {
      return res.status(403).json({ message: "공지방에는 관리자만 메시지를 보낼 수 있습니다." });
    }

    const createdAt = admin.firestore.Timestamp.now();
    const messageRef = db.collection("chats").doc(roomId).collection("messages").doc();
    const newMessage = {
      text,
      senderId,
      createdAt,
    };

    // ✅ Firestore에 메시지 저장
    await messageRef.set(newMessage);

    // ✅ 저장된 메시지 응답 시 id 포함해서 보내기
    return res.status(200).json({
      message: "✅ 메시지 추가 성공!",
      data: { id: messageRef.id, ...newMessage },
    });
  } catch (error) {
    console.error("❌ 메시지 추가 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
};


// ✅ 로그인한 사용자의 채팅방 목록만 가져오도록 수정
const getChatRooms = async (req, res) => {
  try {
    console.log("📡 채팅방 목록 요청 받음...");

    const { userId } = req.user;
    if (!userId) {
      return res.status(401).json({ message: "❌ 사용자 인증 필요" });
    }

    // 사용자가 속한 방 가져오기
    const participantRoomsSnapshot = await db
      .collection("chats")
      .where("participants", "array-contains", userId)
      .get();

    const participantRooms = participantRoomsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 공지방(roomType === "notice") 가져오기
    const noticeRoomsSnapshot = await db
      .collection("chats")
      .where("roomType", "==", "notice")
      .get();

    const noticeRooms = noticeRoomsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 둘 합치기 (중복 제거)
    const allRooms = [...participantRooms, ...noticeRooms.filter(
      (notice) => !participantRooms.some((room) => room.id === notice.id)
    )];

    console.log(`✅ [${userId}] 채팅방 및 공지방 포함: ${allRooms.length}`);
    res.status(200).json(allRooms);
  } catch (error) {
    console.error("❌ 채팅방 목록 불러오기 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
};

// ✅ 관리자 채팅방 생성 또는 반환 (roomType: admin)
const createOrGetAdminChatRoom = async (req, res) => {
  try {
    const { userId } = req.user;
    const adminUid = process.env.ADMIN_UID;

    if (!adminUid) {
      return res.status(500).json({ message: "❌ ADMIN_UID 환경 변수가 설정되지 않았습니다." });
    }

    // 🔍 사용자 이름 가져오기
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "❌ 사용자 정보를 찾을 수 없습니다." });
    }
    const userName = userDoc.data().name || "사용자";

    // 🧾 기존 방이 있는지 확인
    const existingRoomSnapshot = await db.collection("chats")
      .where("type", "==", "admin")
      .where("participants", "array-contains", userId)
      .get();

    if (!existingRoomSnapshot.empty) {
      const existingRoom = existingRoomSnapshot.docs[0];
      return res.status(200).json({
        roomId: existingRoom.id,
        name: existingRoom.data().name || `관리자 상담 (${userName})`,
        roomType: existingRoom.data().roomType || "admin",
      });
    }

    // 🆕 새 채팅방 생성
    const newRoom = {
      name: `관리자 상담 (${userName})`,
      participants: [userId, adminUid],
      createdAt: admin.firestore.Timestamp.now(),
      type: "admin",
      roomType: "admin",
    };

    const roomRef = await db.collection("chats").add(newRoom);
    return res.status(201).json({
      roomId: roomRef.id,
      name: newRoom.name,
      roomType: newRoom.roomType,
    });
  } catch (error) {
    console.error("❌ 관리자 채팅방 생성 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
};

// ✅ 공지방 생성 함수 (필요 시)
const createNoticeRoom = async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name) {
      return res.status(400).json({ message: "⚠️ 방 이름이 필요합니다." });
    }

    const newRoom = {
      name,
      participants,
      createdAt: admin.firestore.Timestamp.now(),
      type: 'notice',
      roomType: 'notice', // ✅ 공지방
    };

    const roomRef = await db.collection("chats").add(newRoom);
    return res.status(201).json({ roomId: roomRef.id, name, roomType: 'notice' });
  } catch (error) {
    console.error("❌ 공지방 생성 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
};

module.exports = {
  addMessageToChat,
  getChatMessages,
  getChatRooms,
  createOrGetAdminChatRoom,
  createNoticeRoom,   // ✅ 필요 시 export
};
