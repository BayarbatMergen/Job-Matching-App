import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export const fetchUserSchedules = async (userId) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("❌ Firebase Auth 로그인되지 않음");
      return [];
    }

    const idToken = await currentUser.getIdToken();
    console.log("🔥 Firebase ID 토큰:", idToken);

    const q = query(collection(db, "schedules"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn("⚠️ Firestore에서 불러온 일정이 없습니다.");
      return [];
    }

    let schedules = [];
    querySnapshot.forEach(doc => {
      schedules.push({ id: doc.id, ...doc.data() });
    });

    console.log("✅ Firestore에서 불러온 일정 데이터:", schedules);
    return schedules;
  } catch (error) {
    console.error("❌ Firestore에서 일정 데이터 불러오기 오류:", error);
    return [];
  }
};
