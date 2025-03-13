import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import * as SecureStore from 'expo-secure-store';
import { fetchUserData } from '../services/authService';
import { fetchUserSchedules } from "../services/scheduleService"; // ✅ 불러오기
import API_BASE_URL from "../config/apiConfig";

// 📆 한국어 캘린더 설정
LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'kr';

export default function ScheduleScreen({ navigation }) {
  const [scheduleData, setScheduleData] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [totalWage, setTotalWage] = useState(0);
  const [allTotalWage, setAllTotalWage] = useState(0);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ 사용자 데이터 초기화
  useEffect(() => {
    const initializeUser = async () => {
      try {
        console.log("🚀 [useEffect] 사용자 데이터 확인 시작");

        const token = await SecureStore.getItemAsync("token");
        console.log("🔹 저장된 토큰 (스케줄 페이지):", token);

        if (!token) {
          console.warn("🚨 저장된 토큰 없음 → 로그인 화면으로 이동");
          Alert.alert("로그인 필요", "로그인이 필요합니다.");
          navigation.replace("Login");
          return;
        }

        const storedUserId = await fetchUserData();
        if (!storedUserId) {
          throw new Error("로그인 필요");
        }

        console.log("✅ [useEffect] 최종 userId 확인:", storedUserId);
        setUserId(storedUserId);
      } catch (error) {
        console.error("❌ [useEffect] 오류:", error.message);
        Alert.alert("오류", "인증이 필요합니다. 로그인하세요.", [
          { text: "확인", onPress: () => navigation.navigate("Login") },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [navigation]);

  // ✅ `userId` 변경될 때 일정 불러오기
  useEffect(() => {
    if (userId) {
      fetchSchedules(userId);
    }
  }, [userId]);

  // ✅ Firestore에서 일정 불러오기
  const fetchSchedules = async (uid) => {
    if (!uid) {
      console.warn("⚠️ userId가 null이므로 일정 데이터를 가져올 수 없음");
      return;
    }

    try {
      console.log("📌 Firestore에서 일정 가져오는 중...", uid);
      const schedulesArray = await fetchUserSchedules(uid);

      if (!schedulesArray || schedulesArray.length === 0) {
        console.warn("⚠️ Firestore에서 불러온 일정이 없습니다.");
        setScheduleData({});
        setAllTotalWage(0); // 🔹 총 급여를 초기화
        return;
      }

      const formattedSchedules = {};
      let totalWageSum = 0;
      schedulesArray.forEach((schedule) => {
        if (!schedule.date) return;
        if (!formattedSchedules[schedule.date]) {
          formattedSchedules[schedule.date] = [];
        }
        formattedSchedules[schedule.date].push(schedule);
        totalWageSum += schedule.wage;
      });

      setScheduleData(formattedSchedules);
      setAllTotalWage(totalWageSum);

      const updatedMarkedDates = {};
      Object.keys(formattedSchedules).forEach((date) => {
        updatedMarkedDates[date] = {
          customStyles: {
            container: { backgroundColor: "#FFD700", borderRadius: 5 },
            text: { color: "#000", fontWeight: "bold" },
          },
        };
      });
      setMarkedDates(updatedMarkedDates);
    } catch (error) {
      console.error("❌ 일정 데이터 로딩 오류:", error);
    }
  };

  // 📌 날짜 클릭 시 일정 표시
  const handleDayPress = (day) => {
    const formattedDate = day.dateString;

    setMarkedDates({
      [formattedDate]: {
        selected: true,
        selectedColor: '#007AFF',
      },
    });

    const schedules = scheduleData[formattedDate] || [];
    setSelectedDate(formattedDate);
    setSelectedSchedules(schedules);

    // 📌 선택한 날짜의 총 급여 계산
    const total = schedules.reduce((sum, schedule) => sum + schedule.wage, 0);
    setTotalWage(total);
  };

  const formatWage = (wage) => {
    return wage ? parseInt(wage, 10).toLocaleString() : "0";
  };
  
  
  // 📌 **정산 요청 버튼 클릭 시 관리자에게 요청 전달**
  const handleSettlementRequest = async () => {
    if (allTotalWage === 0) {
      Alert.alert("정산 요청 실패", "정산할 일정이 없습니다.");
      return;
    }
  
    try {
      console.log("📌 정산 요청 전송 중...");
  
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("인증 오류", "로그인이 필요합니다.");
        return;
      }
  
      // 🔥 totalWage를 숫자로 변환 후 천 단위 콤마 적용
      const totalWage = Number(allTotalWage);
      console.log(`📌 [정산 요청] 총 급여: ${totalWage.toLocaleString()}원`);
  
      const response = await fetch(`${API_BASE_URL}/schedules/request-settlement`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ totalWage }), // ✅ 숫자로 변환된 totalWage 전송
      });
  
      const result = await response.json();
  
      if (response.ok) {
        Alert.alert("정산 요청 완료", `총 급여 ${totalWage.toLocaleString()}원 정산 요청을 보냈습니다.`);
        console.log(`📌 [정산 요청] 총 급여: ${totalWage.toLocaleString()}원`);
      } else {
        console.error("❌ 정산 요청 실패:", result.message);
        Alert.alert("정산 요청 실패", result.message || "서버 오류");
      }
    } catch (error) {
      console.error("❌ 정산 요청 중 오류 발생:", error);
      Alert.alert("정산 요청 실패", "서버 오류 발생");
    }
  };
  
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        {/* 📆 캘린더 */}
        <Calendar
          monthFormat={'yyyy MM'}
          onDayPress={handleDayPress}
          markingType={'custom'}
          markedDates={{
            ...markedDates,
            ...Object.keys(scheduleData).reduce((acc, date) => {
              acc[date] = {
                customStyles: {
                  container: { backgroundColor: '#FFD700', borderRadius: 5 },
                  text: { color: '#000', fontWeight: 'bold' },
                },
              };
              return acc;
            }, {}),
          }}
          theme={{
            todayTextColor: '#FF5733',
            arrowColor: '#007AFF',
            textDayFontSize: 20,
            textMonthFontSize: 22,
            textDayHeaderFontSize: 16,
          }}
          style={styles.calendar}
        />

        {/* 📌 선택한 날짜 일정 표시 */}
        <View style={styles.selectedScheduleContainer}>
          <Text style={styles.selectedDateText}>{selectedDate ? `${selectedDate}` : '날짜를 선택하세요'}</Text>
          <ScrollView style={styles.scheduleList} contentContainerStyle={{ flexGrow: 1 }}>
            {selectedSchedules.length > 0 ? (
              selectedSchedules.map((schedule, index) => (
                <View key={index} style={styles.scheduleDetail}>
                  <View style={styles.scheduleRow}>
                    <Text style={styles.scheduleLabel}>일정:</Text>
                    <Text style={styles.scheduleDetailText}>{schedule.name}</Text>
                  </View>
                  <View style={styles.scheduleRow}>
                    <Text style={styles.scheduleLabel}>급여:</Text>
                    <Text style={styles.scheduleDetailWage}>{schedule.wage.toLocaleString()}원</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noScheduleText}>해당 날짜에 일정이 없습니다.</Text>
            )}
          </ScrollView>
        </View>

        {/* 📌 전체 일정 총 급여 */}
        <View style={styles.allTotalWageContainer}>
      <Text style={styles.allTotalWageText}>
        총 급여 합산: {formatWage(allTotalWage)}원</Text>
        </View>

        {/* 📌 정산 요청 버튼 */}
        <TouchableOpacity style={styles.settlementButton} onPress={handleSettlementRequest}>
          <Text style={styles.settlementButtonText}>정산 요청</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // 📆 캘린더 스타일
  calendar: { borderRadius: 10, backgroundColor: '#F8F8F8', paddingBottom: 10, elevation: 3, flexShrink: 1 },

  // 📌 선택한 날짜 일정 표시 박스
  selectedScheduleContainer: {
    flex: 1,
    marginTop: 20,
    padding: 20,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    elevation: 5,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  selectedDateText: { fontSize: 18, fontWeight: 'bold', textAlign: 'left', marginBottom: 10, color: '#333' },

  scheduleList: { flex: 1 },
  scheduleDetail: { backgroundColor: '#FFFFFF', padding: 15, marginBottom: 8, borderRadius: 10, borderWidth: 1, borderColor: '#FFB000', elevation: 3 },

  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  scheduleLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  scheduleDetailText: { fontSize: 16, fontWeight: '500', color: '#007AFF' },
  scheduleDetailWage: { fontSize: 16, fontWeight: '500', color: '#FF5733' },

  noScheduleText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#AAA' },

  totalWageContainer: { marginTop: 20, padding: 12, backgroundColor: '#F0F0F0', borderRadius: 10, marginHorizontal: 20, alignItems: 'center', borderWidth: 1, borderColor: '#CCC' },
  totalWageText: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  allTotalWageContainer: { marginTop: 10, padding: 12, backgroundColor: '#FFD700', borderRadius: 10, marginHorizontal: 20, alignItems: 'center' },
  allTotalWageText: { fontSize: 20, fontWeight: 'bold', color: '#333' },

  settlementButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 20, marginHorizontal: 20 },
  settlementButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});