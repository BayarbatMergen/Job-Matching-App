import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';

// 📆 한국어 캘린더 설정
LocaleConfig.locales['kr'] = {
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'kr';

export default function AdminScheduleScreen() {
  const navigation = useNavigation();
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allSchedules, setAllSchedules] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'jobs'));
        const jobs = querySnapshot.docs.map(doc => doc.data());

        const marks = {};
        const scheduleMap = {};

        jobs.forEach(job => {
          if (job.startDate && job.endDate) {
            const start = new Date(job.startDate);
            const end = new Date(job.endDate);

            for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
              const dateString = d.toISOString().split('T')[0];
              marks[dateString] = {
                customStyles: {
                  container: { backgroundColor: '#4CAF50', borderRadius: 5 },
                  text: { color: '#fff', fontWeight: 'bold' }
                }
              };

              if (!scheduleMap[dateString]) {
                scheduleMap[dateString] = [];
              }
              scheduleMap[dateString].push({
                title: job.title,
                wage: job.wage,
                location: job.location,
              });
            }
          }
        });

        setAllSchedules(scheduleMap);
        setMarkedDates(marks);
      } catch (error) {
        console.error(' 스케줄 불러오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDayPress = (day) => {
    const selected = day.dateString;
    setSelectedDate(selected);
    setSelectedSchedules(allSchedules[selected] || []);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>일정 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Calendar
          monthFormat={'yyyy MM'}
          onDayPress={handleDayPress}
          markingType={'custom'}
          markedDates={markedDates}
          theme={{
            todayTextColor: '#FF5733',
            arrowColor: '#007AFF',
            textDayFontSize: 20,
            textMonthFontSize: 22,
            textDayHeaderFontSize: 16,
          }}
          style={styles.calendar}
        />

        <View style={styles.selectedScheduleContainer}>
          <Text style={styles.selectedDateText}>
            {selectedDate ? `${selectedDate} 일정` : '날짜를 선택하세요'}
          </Text>
          <ScrollView style={styles.scheduleList}>
            {selectedSchedules.length > 0 ? (
              selectedSchedules.map((schedule, index) => (
                <View key={index} style={styles.scheduleDetail}>
                  <Text style={styles.scheduleDetailText}>{schedule.title}</Text>
                  <Text>급여: {Number(schedule.wage).toLocaleString()}원</Text>
                  <Text>위치: {schedule.location}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noScheduleText}>해당 날짜에 일정이 없습니다.</Text>
            )}
          </ScrollView>
        </View>

        {/*  여기 추가: 승인 관리로 이동 버튼 */}
        <TouchableOpacity
          style={styles.approvalButton}
          onPress={() => navigation.navigate("SettlementApprovalScreen")}
        >
          <Text style={styles.approvalButtonText}>정산 승인 관리</Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ApprovedApplicationsScreen')}
      >
        <Text style={styles.buttonText}>승인 내역 보기</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  calendar: { borderRadius: 10, backgroundColor: '#F8F8F8', paddingBottom: 10, elevation: 3 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
    color: '#333',
  },
  scheduleList: { flex: 1 },
  scheduleDetail: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    elevation: 3,
  },
  scheduleDetailText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  noScheduleText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#AAA',
  },
  approvalButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  approvalButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  button: {
    backgroundColor: '#007AFF',  // 초록색 계열로 승인 내역 보기 버튼 구분
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    //marginVertical: 1,
    marginHorizontal: 20,
    elevation: 4,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold', 
    letterSpacing: 0.5, 
  },
  

  
});
