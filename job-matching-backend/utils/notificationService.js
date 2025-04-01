const { db } = require("../config/firebase");

// 관리자에게 정산 요청 알림 전송
exports.sendAdminNotification = async (userId, amount) => {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      console.warn("사용자 정보 없음.");
      return;
    }

    const userData = userDoc.data();
    const userName = userData.name || "알 수 없음";
    const userEmail = userData.email || "이메일 없음";

    const adminSnap = await db.collection("users").where("role", "==", "admin").get();
    if (adminSnap.empty) {
      console.warn("관리자 계정 없음.");
      return;
    }

    const message = `💰 사용자 ${userName} (${userEmail})님이 ${amount.toLocaleString()}원 정산 요청을 보냈습니다.`;

    adminSnap.forEach(async (doc) => {
      const adminEmail = doc.data().email;
      await db.collection("notifications").add({
        recipientEmail: adminEmail,
        message,
        status: "unread",
        createdAt: new Date(),
      });
    });

    console.log("✅ 관리자 알림 전송 완료");
  } catch (error) {
    console.error("❌ 알림 전송 오류:", error);
  }
};
