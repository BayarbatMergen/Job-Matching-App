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


// ✅ 모든 채팅방 목록 가져오기 (roomType 포함 반환)
const getChatRooms = async (req, res) => {
  try {
    console.log("📡 채팅방 목록 요청 받음...");

    const chatRoomsSnapshot = await db.collection("chats").get();
    const chatRooms = chatRoomsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ 채팅방 개수: ${chatRooms.length}`);
    res.status(200).json(chatRooms);
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

    // 이미 존재하는지 확인
    const existingRoomSnapshot = await db.collection("chats")
      .where("type", "==", "admin")
      .where("participants", "array-contains", userId)
      .get();

    if (!existingRoomSnapshot.empty) {
      const existingRoom = existingRoomSnapshot.docs[0];
      return res.status(200).json({ 
        roomId: existingRoom.id, 
        name: '관리자 상담', 
        roomType: existingRoom.data().roomType || 'admin' 
      });
    }

    // 신규 생성
    const newRoom = {
      name: '관리자 상담',
      participants: [userId, adminUid],
      createdAt: admin.firestore.Timestamp.now(),
      type: 'admin',
      roomType: 'admin',   // ✅ roomType 필드 추가
    };

    const roomRef = await db.collection("chats").add(newRoom);
    return res.status(201).json({ roomId: roomRef.id, name: '관리자 상담', roomType: 'admin' });
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
