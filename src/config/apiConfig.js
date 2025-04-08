import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
console.log("API_BASE_URL:", API_BASE_URL); // 디버깅용 로그
export default API_BASE_URL;