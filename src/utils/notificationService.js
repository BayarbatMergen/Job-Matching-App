import { db } from "../config/firebase";
import { collection, addDoc } from "firebase/firestore";

// ✅ 사용자에게 공고 승인 알림 전송
export const sendUserApplicationApprovalNotification = async (userEmail, jobTitle) => {
  try {
    console.log(`📩 사용자 승인 알림 전송 중...`);

    await addDoc(collection(db, "notifications"), {
      recipientEmail: userEmail,
      message: `✅ 당신이 지원한 '${jobTitle}' 공고가 승인되었습니다.`,
      status: "unread",
      createdAt: new Date(),
    });

    console.log("✅ 사용자에게 승인 알림 전송 완료!");
  } catch (error) {
    console.error("❌ 알림 전송 오류:", error);
  }
};
