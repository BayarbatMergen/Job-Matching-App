const { db } = require("../config/firebase");

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

    if (messagesSnapshot.empty) {
      console.warn("⚠️ 해당 채팅방에 메시지가 없습니다.");
      return res.status(200).json([]);
    }

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
      return res.status(400).json({ message: "⚠️ chatRoomId와 text가 필요합니다." });
    }

    const messageRef = db.collection("chats").doc(roomId).collection("messages").doc();
    const newMessage = {
      text,
      senderId,
      createdAt: new Date(),
    };

    await messageRef.set(newMessage);

    res.status(200).json({ message: "✅ 메시지 추가 성공!", data: newMessage });
  } catch (error) {
    console.error("❌ 메시지 추가 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
};

// ✅ 모든 채팅방 목록 가져오기
const getChatRooms = async (req, res) => {
  try {
    console.log("📡 채팅방 목록 요청 받음...");

    const chatRoomsSnapshot = await db.collection("chats").get();
    if (chatRoomsSnapshot.empty) {
      return res.status(200).json({ message: "채팅방이 없습니다." });
    }

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

// ✅ `module.exports` 설정
module.exports = { addMessageToChat, getChatMessages, getChatRooms };
