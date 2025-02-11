import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

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
  const [scheduleData, setScheduleData] = useState({
    '2025-02-22': [
      { name: '한화 대천', wage: 100000 },
      { name: '롯데월드', wage: 120000 },
    ],
    '2025-02-25': [{ name: '서울랜드', wage: 95000 }],
    '2025-02-28': [{ name: '에버랜드', wage: 150000 }],
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [totalWage, setTotalWage] = useState(0);
  const [allTotalWage, setAllTotalWage] = useState(0);

  // 📌 **모든 일정의 총 급여 계산**
  useEffect(() => {
    let sum = 0;
    Object.values(scheduleData).forEach((schedules) => {
      schedules.forEach((schedule) => {
        sum += schedule.wage;
      });
    });
    setAllTotalWage(sum);
  }, [scheduleData]);

  // 📌 **날짜 클릭 시 일정 표시 및 선택한 날짜 강조**
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

  // 📌 **정산 요청 버튼 클릭 시 관리자에게 요청 전달**
  const handleSettlementRequest = () => {
    if (!selectedDate || selectedSchedules.length === 0) {
      Alert.alert('정산 요청 실패', '정산할 일정을 선택해주세요.');
      return;
    }

    // 관리자에게 정산 요청 전달
    Alert.alert('정산 요청 완료', `관리자에게 ${selectedDate} 일정 정산 요청을 보냈습니다.`);

    // ✅ 관리자에게 데이터 전달
    navigation.navigate('AdminChat', { 
      settlementRequest: { date: selectedDate, schedules: selectedSchedules }
    });
  };

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

        {/* 📌 해당 날짜 총 급여 */}
        <View style={styles.totalWageContainer}>
          <Text style={styles.totalWageText}>해당 날짜 총 급여: {totalWage.toLocaleString()}원</Text>
        </View>

        {/* 📌 전체 일정 총 급여 */}
        <View style={styles.allTotalWageContainer}>
          <Text style={styles.allTotalWageText}>총 급여 합산: {allTotalWage.toLocaleString()}원</Text>
        </View>

        {/* 📌 정산 요청 버튼 (가장 아래 배치) */}
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
