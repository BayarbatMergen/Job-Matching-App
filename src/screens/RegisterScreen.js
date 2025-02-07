import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const RegisterScreen = ({ navigation }) => {
  const [userType, setUserType] = useState(null); // 'personal' (개인) | 'business' (기업)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idImage, setIdImage] = useState(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [modalVisible, setModalVisible] = useState(true); // 회원가입 유형 선택 모달

  const handleRegister = async () => {
    console.log('회원가입:', {
      userType, email, password, idImage, name, gender, phone, bank, accountNumber
    });
    navigation.navigate('JobList');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* 회원가입 유형 선택 모달 */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>가입 유형 선택</Text>
              <TouchableOpacity style={styles.modalButton} onPress={() => { setUserType('personal'); setModalVisible(false); }}>
                <Text style={styles.modalButtonText}>개인 회원</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => { setUserType('business'); setModalVisible(false); }}>
                <Text style={styles.modalButtonText}>기업 회원</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 로고 */}
        <Image source={require('../../assets/images/thechingu.png')} style={styles.logo} />
        <Text style={styles.title}>회원가입</Text>

        {userType === 'personal' && (
          <>
            <TextInput style={styles.input} placeholder="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="비밀번호" secureTextEntry value={password} onChangeText={setPassword} />
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>신분증 업로드</Text>
            </TouchableOpacity>
            <TextInput style={styles.input} placeholder="한글 이름" value={name} onChangeText={setName} />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>성별:</Text>
              <Picker selectedValue={gender} onValueChange={(value) => setGender(value)} style={styles.picker}>
                <Picker.Item label="남" value="male" />
                <Picker.Item label="여" value="female" />
              </Picker>
            </View>

            <TextInput style={styles.input} placeholder="전화번호" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="은행명" value={bank} onChangeText={setBank} />
            <TextInput style={styles.input} placeholder="계좌번호" value={accountNumber} onChangeText={setAccountNumber} keyboardType="numeric" />

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>회원가입</Text>
            </TouchableOpacity>
          </>
        )}

        {userType === 'business' && (
          <>
            <Text style={styles.businessPlaceholder}>기업 회원 가입 양식은 추후 추가됩니다.</Text>
          </>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>로그인으로 이동</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  logo: { width: 180, height: 180, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  pickerContainer: { width: '100%', marginBottom: 12 },
  label: { fontSize: 16, marginBottom: 5, fontWeight: '500' },
  picker: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 12, fontSize: 16 },
  uploadButton: { backgroundColor: '#ddd', width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginBottom: 12 },
  uploadButtonText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  registerButton: { backgroundColor: '#007AFF', width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 10 },
  registerButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginText: { color: '#007AFF', fontSize: 16, marginTop: 15, fontWeight: '500' },
  businessPlaceholder: { fontSize: 16, fontWeight: '500', color: '#777', marginTop: 10 },

  // 회원가입 선택 모달
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  modalButton: { width: '100%', padding: 12, backgroundColor: '#007AFF', marginBottom: 10, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default RegisterScreen;
