import * as SecureStore from "expo-secure-store";
import API_BASE_URL from "../config/apiConfig";
import { fetchUserData } from "./authService";

export const fetchUserSchedules = async () => {
  try {
    console.log(" [fetchUserSchedules] 실행됨!");

    const token = await SecureStore.getItemAsync("token");
    let userId = await SecureStore.getItemAsync("userId");

    if (!userId) {
      console.warn(" userId 없음 → fetchUserData() 호출하여 저장 시도...");
      userId = await fetchUserData();
      if (userId) {
        await SecureStore.setItemAsync("userId", userId);
      }
    }

    if (!token || !userId) {
      console.warn(" 토큰 또는 userId 없음 → 일정 요청 중단");
      return [];
    }

    const requestUrl = `${API_BASE_URL}/schedules/user/${userId}`;
    console.log(` Firestore에서 일정 가져오는 중... 요청 URL: ${requestUrl}`);

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      console.warn(" 가져올 일정이 없습니다.");
      return [];
    }

    if (!response.ok) {
      throw new Error(` API 요청 실패: ${response.status}`);
    }

    const schedules = await response.json();
    console.log(" 일정 데이터 가져오기 성공:", schedules);
    return schedules;
  } catch (error) {
    console.error(" [fetchUserSchedules] 일정 불러오기 오류:", error.message);
    return [];
  }
};
