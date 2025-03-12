import * as SecureStore from 'expo-secure-store';
import API_BASE_URL from "../config/apiConfig";

// 🔹 공통 API 요청 함수 (중복 최소화 & 오류 처리)
const apiRequest = async (endpoint, method = "GET", body = null) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      console.warn("⚠️ 인증 토큰 없음 → 로그인 필요");
      return [];
    }

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (response.status === 401) {
      console.warn("❌ 인증 실패 → 로그아웃 후 재로그인 필요");
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("userId");
      return [];
    }

    if (!response.ok) {
      console.error(`🔥 API 요청 실패 (${response.status}): ${endpoint}`);
      return [];
    }

    const data = await response.json();
    return data || []; // null 또는 undefined 방지
  } catch (error) {
    console.error(`🔥 API 요청 오류 (${endpoint}):`, error.message);
    return [];
  }
};

// ✅ 특정 날짜의 일정 가져오기
export const fetchSchedulesByDate = async (selectedDate) => {
  try {
    const userId = await SecureStore.getItemAsync("userId");
    if (!userId) {
      console.warn("⚠️ [fetchSchedulesByDate] userId 없음 → 로그인 필요");
      return [];
    }

    console.log(`📌 [fetchSchedulesByDate] ${selectedDate}의 일정 가져오는 중...`);
    const result = await apiRequest(`/api/schedules/user/${userId}`);
    return result || []; // 빈 배열 반환
  } catch (error) {
    console.error("❌ [fetchSchedulesByDate] 일정 불러오기 오류:", error.message);
    return [];
  }
};