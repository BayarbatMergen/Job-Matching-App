import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// 📆 한국어 캘린더 설정
LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'kr';

export default function AdminScheduleScreen() {
  const [scheduleData, setScheduleData] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [newSchedule, setNewSchedule] = useState('');

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
  };

  // 📌 **일정 추가 함수**
  const addSchedule = () => {
    if (!selectedDate || newSchedule.trim() === '') {
      alert('날짜를 선택하고 일정을 입력하세요!');
      return;
    }

    setScheduleData((prevData) => {
      const updatedSchedules = [...(prevData[selectedDate] || []), { name: newSchedule }];
      return { ...prevData, [selectedDate]: updatedSchedules };
    });

    setNewSchedule(''); // 입력 필드 초기화
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

        {/* 📌 일정 추가 입력 필드 */}
        <View style={styles.addScheduleContainer}>
          <TextInput
            style={styles.input}
            placeholder="새 일정 입력"
            value={newSchedule}
            onChangeText={setNewSchedule}
          />
          <TouchableOpacity style={styles.addButton} onPress={addSchedule}>
            <Text style={styles.addButtonText}>추가</Text>
          </TouchableOpacity>
        </View>

        {/* 📌 선택한 날짜 일정 표시 */}
        <View style={styles.selectedScheduleContainer}>
          <Text style={styles.selectedDateText}>{selectedDate ? `${selectedDate}` : '날짜를 선택하세요'}</Text>
          <ScrollView style={styles.scheduleList} contentContainerStyle={{ flexGrow: 1 }}>
            {selectedSchedules.length > 0 ? (
              selectedSchedules.map((schedule, index) => (
                <View key={index} style={styles.scheduleDetail}>
                  <Text style={styles.scheduleDetailText}> {schedule.name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noScheduleText}>해당 날짜에 일정이 없습니다.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },

  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },

  // 📆 캘린더 스타일
  calendar: { borderRadius: 10, backgroundColor: '#F8F8F8', paddingBottom: 10, elevation: 3, flexShrink: 1 },

  // 📌 일정 추가 입력 필드
  addScheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

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
    borderColor: '#FFB000',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  scheduleDetailText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },

  noScheduleText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#AAA',
  },
});
