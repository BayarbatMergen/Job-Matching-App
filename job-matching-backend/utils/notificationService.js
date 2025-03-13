const { db } = require("../config/firebase");

// ✅ 관리자에게 정산 요청 알림 전송
exports.sendAdminNotification = async (userId, amount) => {
  try {
    console.log(`🚀 [관리자 알림] 정산 요청 - userId: ${userId}, 금액: ${amount}`);

    // ✅ Firestore에서 관리자 계정 조회
    const adminRef = db.collection("users").where("role", "==", "admin");
    const adminSnap = await adminRef.get();

    if (adminSnap.empty) {
      console.warn("⚠️ 관리자 계정을 찾을 수 없음.");
      return;
    }

    // ✅ 모든 관리자에게 알림 전송
    adminSnap.forEach(async (doc) => {
      const adminData = doc.data();
      const adminEmail = adminData.email;

      console.log(`📩 [알림 전송] 관리자: ${adminEmail}`);

      // ✅ Firestore에 알림 저장
      await db.collection("notifications").add({
        recipientEmail: adminEmail,
        message: `💰 사용자 ${userId}가 ${amount}원 정산 요청을 보냈습니다.`,
        status: "unread",
        createdAt: new Date(),
      });
    });

    console.log("✅ 관리자 알림 전송 완료!");
  } catch (error) {
    console.error("❌ 관리자 알림 전송 오류:", error);
  }
};
