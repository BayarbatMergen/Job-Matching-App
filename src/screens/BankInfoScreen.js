import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function BankInfoScreen() {
  // ✅ 기존 계좌 정보 (초기값)
  const [existingBankInfo, setExistingBankInfo] = useState({ bankName: '', accountNumber: '' });

  // ✅ 새 계좌 정보 (입력값)
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');

  // 📌 기존 계좌 정보를 불러오는 useEffect
  useEffect(() => {
    // 📝 예제: 기존 계좌 정보 (Firebase 또는 API에서 가져오는 부분 대체 가능)
    const fetchedBankInfo = {
      bankName: '국민은행',
      accountNumber: '123-4567-8910',
    };

    setExistingBankInfo(fetchedBankInfo);
  }, []);

  // 📌 새 계좌 정보 저장
  const handleSaveNewAccount = () => {
    if (!newBankName || !newAccountNumber) {
      Alert.alert('입력 오류', '새 계좌 정보를 모두 입력해주세요.');
      return;
    }

    Alert.alert('저장 완료', `새 계좌 정보가 등록되었습니다.\n은행: ${newBankName}\n계좌번호: ${newAccountNumber}`);

    // ✅ 기존 계좌 정보 업데이트
    setExistingBankInfo({ bankName: newBankName, accountNumber: newAccountNumber });

    // ✅ 입력 필드 초기화
    setNewBankName('');
    setNewAccountNumber('');
  };

  return (
    <View style={styles.container}>
      {/* ✅ 기존 계좌 정보 표시 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기존 등록된 계좌</Text>
        <View style={styles.infoBox}>
          <Text style={styles.label}>은행명</Text>
          <Text style={styles.infoText}>{existingBankInfo.bankName || '등록된 계좌 없음'}</Text>

          <Text style={styles.label}>계좌번호</Text>
          <Text style={styles.infoText}>{existingBankInfo.accountNumber || '등록된 계좌 없음'}</Text>
        </View>
      </View>

      {/* ✅ 새로운 계좌 정보 입력 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>새 계좌 등록</Text>
        <TextInput
          style={styles.input}
          value={newBankName}
          onChangeText={setNewBankName}
          placeholder="새 은행명을 입력하세요"
        />

        <TextInput
          style={styles.input}
          value={newAccountNumber}
          onChangeText={setNewAccountNumber}
          placeholder="새 계좌번호를 입력하세요"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveNewAccount}>
          <Text style={styles.saveButtonText}>새 계좌 저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  section: { marginBottom: 20, padding: 15, backgroundColor: '#F8F8F8', borderRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },

  infoBox: { padding: 10, backgroundColor: '#EAEAEA', borderRadius: 8 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  infoText: { fontSize: 16, color: '#007AFF', marginTop: 5 },

  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 12, fontSize: 16 },

  saveButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
