import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

//  한국어 캘린더 설정
LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'kr';

export default function ScheduleScreen() {
  const navigation = useNavigation();
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [hourInput, setHourInput] = useState('');
  const [wageInput, setWageInput] = useState('');
  const [scheduleData, setScheduleData] = useState({});

  // 📌 일정 추가 함수
  const addSchedule = () => {
    if (!selectedStartDate || !selectedEndDate || !hourInput || !wageInput) return;

    let currentDate = new Date(selectedStartDate);
    const endDate = new Date(selectedEndDate);

    let newSchedules = { ...scheduleData };
    while (currentDate <= endDate) {
      const formattedDate = currentDate.toISOString().split('T')[0];

      newSchedules[formattedDate] = newSchedules[formattedDate]
        ? [...newSchedules[formattedDate], { hours: hourInput, wage: wageInput }]
        : [{ hours: hourInput, wage: wageInput }];

      currentDate.setDate(currentDate.getDate() + 1);
    }

    setScheduleData(newSchedules);
    setHourInput('');
    setWageInput('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/*  돌아가기 버튼 */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.header}>일정 확인</Text>
      </View>

      {/* 캘린더 */}
      <Calendar
        onDayPress={(day) => {
          if (!selectedStartDate) {
            setSelectedStartDate(day.dateString);
          } else if (!selectedEndDate) {
            setSelectedEndDate(day.dateString);
          } else {
            setSelectedStartDate(day.dateString);
            setSelectedEndDate('');
          }
        }}
        markedDates={{
          ...Object.keys(scheduleData).reduce((acc, date) => {
            acc[date] = {
              selected: true,
              customStyles: {
                container: { backgroundColor: '#FFD580', borderRadius: 8 }, // ✨ 더 밝은 색상으로 변경
                text: { color: '#333', fontWeight: 'bold' },
              },
            };
            return acc;
          }, {}),
          [selectedStartDate]: { selected: true, selectedColor: '#007AFF' },
          [selectedEndDate]: { selected: true, selectedColor: '#007AFF' },
        }}
        markingType={'custom'}
        theme={{
          selectedDayBackgroundColor: '#007AFF',
          todayTextColor: '#FF5733',
          arrowColor: '#007AFF',
          textDayFontSize: 18,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 16,
        }}
        style={styles.calendar}
      />

      {/* 📌 일정 추가 버튼 */}
      {selectedStartDate && selectedEndDate && (
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ 일정 추가</Text>
        </TouchableOpacity>
      )}

       {/* 📌 선택한 일정 표시 */}
      <ScrollView style={styles.selectedDateBox}>
        <Text style={styles.selectedDateText}>
          📅 {selectedStartDate} ~ {selectedEndDate || '날짜를 선택하세요'}
        </Text>
        {(scheduleData[selectedStartDate] || []).map((item, index) => (
          <View key={index} style={styles.scheduleItem}>
            <Text style={styles.scheduleText}>⏳ {item.hours}시간</Text>
            <Text style={styles.scheduleText}>💰 {item.wage} 원</Text>
          </View>
        ))}
      </ScrollView>

      {/* 📌 일정 추가 모달 */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>일정 추가</Text>
            
            <View style={styles.inputRow}>
              <Ionicons name="time-outline" size={24} color="#007AFF" />
              <TextInput
                style={styles.input}
                placeholder="근무 시간 (예: 한화리조트)"
                keyboardType="numeric"
                value={hourInput}
                onChangeText={setHourInput}
              />
            </View>

            <View style={styles.inputRow}>
              <Ionicons name="cash-outline" size={24} color="#007AFF" />
              <TextInput
                style={styles.input}
                placeholder="급여 (예: 100'000)"
                keyboardType="numeric"
                value={wageInput}
                onChangeText={setWageInput}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={addSchedule}>
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backButton: { marginRight: 15 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  calendar: { borderRadius: 10, paddingBottom: 10, backgroundColor: '#F8F8F8', elevation: 3 },
   selectedDateBox: { marginTop: 15, padding: 10, backgroundColor: '#E3F2FD', borderRadius: 8 },
   selectedDateText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    scheduleItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  scheduleText: { fontSize: 16, color: '#333' },
  addButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', padding: 25, backgroundColor: 'white', borderRadius: 15, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 10, marginBottom: 12, width: '100%' },
  input: { flex: 1, height: 50, fontSize: 16, paddingLeft: 10 },
  saveButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', width: '100%' },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cancelText: { fontSize: 16, color: 'red', marginTop: 10 },
});
