import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker'; // 📌 이미지 업로드 라이브러리 추가
import { Alert } from "react-native";


const RegisterScreen = ({ navigation }) => {
  const [userType, setUserType] = useState(null); // 'personal' (개인) | 'business' (관리자)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyPassword, setCompanyPassword] = useState(''); // 관리자용 비밀번호
  const [idImage, setIdImage] = useState(null); // 📌 업로드된 이미지 저장
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [modalVisible, setModalVisible] = useState(true); // 회원가입 유형 선택 모달

  // 📌 사진 업로드 (갤러리에서 선택)
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setIdImage(result.assets[0].uri);
    }
  };

  // 📌 사진 촬영 후 업로드
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setIdImage(result.assets[0].uri);
    }
  };
  const handleRegister = async () => {
    console.log("회원가입 정보:", {
      userType, email, password, companyPassword, idImage, name, gender, phone, bank, accountNumber
    });
  
    try {
      // ✅ Firebase Auth를 사용할 경우 회원가입 로직 추가
      // await registerWithEmail(email, password); // 실제 회원가입 API 호출
  
      console.log("회원가입 성공!");
  
      // ✅ 회원가입 성공 후 알림 메시지 띄우기
      Alert.alert(
        "회원가입 완료",
        "회원가입이 완료되었습니다. 메일을 확인해주세요.",
        [
          { text: "확인", onPress: () => {
              console.log("✅ 로그인 화면으로 이동!");
              navigation.replace("Login"); // ✅ 로그인 화면으로 이동
          }}
        ]
      );
    } catch (error) {
      console.error("회원가입 실패:", error.message);
      Alert.alert("회원가입 실패", error.message);
    }
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
                <Text style={styles.modalButtonText}>관리자</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 로고 */}
        <Image source={require('../../assets/images/thechingu.png')} style={styles.logo} />
        <Text style={styles.title}>회원가입</Text>

        {/* 개인 회원가입 */}
        {userType === 'personal' && (
          <>
            <TextInput style={styles.input} placeholder="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="비밀번호" secureTextEntry value={password} onChangeText={setPassword} />
        
            {/* 📌 신분증 업로드 버튼 */}
            <View style={styles.uploadContainer}>
              {idImage ? (
                <Image source={{ uri: idImage }} style={styles.idImage} />
              ) : (
                <Text style={styles.uploadText}>신분증을 업로드하세요</Text>
              )}
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadButtonText}>갤러리에서 선택</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                <Text style={styles.uploadButtonText}>사진 촬영</Text>
              </TouchableOpacity>
            </View>

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
        {/* 관리자 회원가입 */}
{userType === 'business' && (
  <>
    <TextInput 
      style={styles.input} 
      placeholder="이메일" 
      value={email} 
      onChangeText={setEmail} 
      keyboardType="email-address" 
    />
    <TextInput 
      style={styles.input} 
      placeholder="비밀번호" 
      secureTextEntry 
      value={password} 
      onChangeText={setPassword} 
    />
    <TextInput 
      style={styles.input} 
      placeholder="회사 비밀번호" 
      secureTextEntry 
      value={companyPassword} 
      onChangeText={setCompanyPassword} 
    />

    <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
      <Text style={styles.registerButtonText}>관리자 계정 생성</Text>
    </TouchableOpacity>
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
  
  uploadContainer: { width: '100%', alignItems: 'center', marginBottom: 12 },
  uploadText: { fontSize: 16, color: '#555', marginBottom: 10 },
  idImage: { width: 200, height: 200, borderRadius: 10, marginBottom: 10 },
  uploadButton: { backgroundColor: '#007AFF', width: '100%', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 5 },
  uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  registerButton: { backgroundColor: '#007AFF', width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 10 },
  registerButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginText: { color: '#007AFF', fontSize: 16, marginTop: 15, fontWeight: '500' },
  // 📌 모달 스타일 개선
modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)', // 반투명 배경
},
modalContent: {
  width: '80%',  // 너비 조정
  padding: 25,
  backgroundColor: 'white',
  borderRadius: 15,
  alignItems: 'center',
  elevation: 5, // 그림자 효과 추가
},
modalTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  marginBottom: 15,
  color: '#333',
},
modalButton: {
  width: '90%', // 버튼 너비 증가 (100% → 90%)
  padding: 15,
  backgroundColor: '#007AFF',
  marginBottom: 12,
  borderRadius: 8,
  alignItems: 'center',
},
modalButtonText: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
},

container: { 
  flexGrow: 1, 
  alignItems: 'center',  // ✅ 전체 화면을 가운데 정렬
  justifyContent: 'center',  // ✅ 입력 폼을 중앙으로 정렬
  paddingHorizontal: 20, 
  backgroundColor: '#fff',
  paddingVertical: 20,  // ✅ 위/아래 여백 추가
},


});

export default RegisterScreen;
