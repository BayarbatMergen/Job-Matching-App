const { db } = require("../config/firebase");

// ✅ 채팅방 목록 가져오기 함수 추가
const getChatRooms = async (req, res) => {
  try {
    const chatRoomsSnapshot = await db.collection("chats").get();

    if (chatRoomsSnapshot.empty) {
      return res.status(404).json({ message: "채팅방이 없습니다." });
    }

    const chatRooms = chatRoomsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(chatRooms);
  } catch (error) {
    console.error("❌ 채팅방 목록 불러오기 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
};

// ✅ 채팅 메시지 추가 함수
const addMessageToChat = async (req, res) => {
  try {
    const { chatRoomId, text } = req.body;
    const senderId = req.user.userId;

    if (!chatRoomId || !text) {
      return res.status(400).json({ message: "⚠️ chatRoomId와 text가 필요합니다." });
    }

    const messageRef = db.collection("chats").doc(chatRoomId).collection("messages").doc();
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

// ✅ 특정 채팅방의 모든 메시지 가져오기
const getChatMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const messagesSnapshot = await db
      .collection("chats")
      .doc(chatRoomId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ 채팅 메시지 불러오기 오류:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
};

// ✅ module.exports에 `getChatRooms` 추가
module.exports = { getChatRooms, addMessageToChat, getChatMessages };
