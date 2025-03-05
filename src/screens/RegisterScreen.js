import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(''); // ⚠️ 비밀번호 오류 메시지
  const [name, setName] = useState('');
  const [gender, setGender] = useState(null); // ✅ 성별 추가
  const [phone, setPhone] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [idImage, setIdImage] = useState(null);

  // 🔥 비밀번호 유효성 검사 (특수문자 포함 여부)
  const isPasswordValid = (password) => /^(?=.*[!@#$%^&*()]).{6,}$/.test(password);

  // ✅ 성별 선택 함수
  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
  };

  // ✅ 사진 업로드 (갤러리에서 선택)
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('갤러리 접근 권한이 필요합니다.');
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
    } catch (error) {
      console.error("❌ 이미지 선택 오류:", error);
    }
  };

  // ✅ 회원가입 요청
  const handleRegister = async () => {
    console.log("🔥 회원가입 요청 시작...");

    if (!email || !password || !confirmPassword || !name || !phone || !gender || !bank || !accountNumber) {
      Alert.alert('입력 오류', '⚠️ 모든 필드를 입력하세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("비밀번호 불일치", "⚠️ 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!isPasswordValid(password)) {
      Alert.alert("비밀번호 오류", "⚠️ 비밀번호는 최소 6자 이상이며, 특수문자를 포함해야 합니다.");
      return;
    }

    let formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("gender", gender); // ✅ 성별 추가
    formData.append("bank", bank);
    formData.append("accountNumber", accountNumber);

    if (idImage) {
      formData.append("idImage", {
        uri: idImage,
        type: "image/jpeg",
        name: "idImage.jpg",
      });
    }

    console.log("📤 회원가입 요청 데이터:", formData);

    try {
      const response = await fetch("http://192.168.0.6:5000/api/auth/register", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = await response.json();
      Alert.alert("회원가입 완료", "✅ 로그인 해주세요!");
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("회원가입 실패", error.message || "서버 오류");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* 로고 */}
        <Image source={require('../../assets/images/thechingu.png')} style={styles.logo} />
        <Text style={styles.title}>회원가입</Text>

        <TextInput style={styles.input} placeholder="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" />

        {/* ✅ 비밀번호 입력 */}
        <TextInput
          style={styles.input}
          placeholder="비밀번호 (6자 이상, 특수문자 포함)"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError(isPasswordValid(text) ? "" : "⚠️ 특수문자를 포함해야 합니다.");
          }}
        />

        {/* ⚠️ 비밀번호 검증 메시지 */}
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <TextInput style={styles.input} placeholder="비밀번호 확인" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        <TextInput style={styles.input} placeholder="이름" value={name} onChangeText={setName} />

        {/* ✅ 성별 선택 */}
        <View style={styles.genderContainer}>
          <Text style={styles.label}>성별 선택:</Text>
          <View style={styles.genderButtons}>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'male' && styles.selectedGender]}
              onPress={() => handleGenderSelect('male')}
            >
              <Text style={[styles.genderButtonText, gender === 'male' && styles.selectedGenderText]}>남</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'female' && styles.selectedGender]}
              onPress={() => handleGenderSelect('female')}
            >
              <Text style={[styles.genderButtonText, gender === 'female' && styles.selectedGenderText]}>여</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput style={styles.input} placeholder="전화번호" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="은행명" value={bank} onChangeText={setBank} />
        <TextInput style={styles.input} placeholder="계좌번호" value={accountNumber} onChangeText={setAccountNumber} keyboardType="numeric" />

        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadButtonText}>신분증 사진 업로드</Text>
        </TouchableOpacity>
        {idImage && <Image source={{ uri: idImage }} style={styles.profileImage} />}

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>회원가입</Text>
        </TouchableOpacity>

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
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 12, fontSize: 16 },
  genderContainer: { width: '100%', marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 5 },
  genderButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  genderButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#007AFF', alignItems: 'center', marginHorizontal: 5 },
  selectedGender: { backgroundColor: '#007AFF' },
  uploadButton: { backgroundColor: '#007AFF', width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 10 },
  genderButtonText: { fontSize: 16, fontWeight: 'bold' },
  selectedGenderText: { color: '#fff' },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
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
