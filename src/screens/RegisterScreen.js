import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';

const RegisterScreen = ({ navigation, route }) => {
  const { marketingConsent = false, termsAgreedAt = '', termsVersion = '' } = route.params || {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState(null);
  const [phone, setPhone] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [idImage, setIdImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const isPasswordValid = (password) => /^(?=.*[!@#$%^&*()]).{6,}$/.test(password);
  const isKoreanOnly = (text) => /^[가-힣]*$/.test(text);
  const handleGenderSelect = (selectedGender) => setGender(selectedGender);

  const pickImage = async () => {
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
  };

  const handleRegister = async () => {
    if (!agreeTerms) {
      Alert.alert("약관 동의", "이용약관에 동의해야 회원가입이 가능합니다.");
      return;
    }

    if (!email || !password || !confirmPassword || !name || !phone || !gender || !bank || !accountNumber) {
      Alert.alert('입력 오류', '모든 필드를 입력하세요.');
      return;
    }
    if (!isKoreanOnly(name)) {
      Alert.alert("이름 오류", "이름은 한글만 입력 가능합니다.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("비밀번호 불일치", "비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!isPasswordValid(password)) {
      Alert.alert("비밀번호 오류", "비밀번호는 최소 6자 이상이며, 특수문자를 포함해야 합니다.");
      return;
    }

    setLoading(true);

    let formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("gender", gender);
    formData.append("bank", bank);
    formData.append("accountNumber", accountNumber.replace(/-/g, ''));
    formData.append("marketingConsent", false);
    formData.append("termsAgreedAt", new Date().toISOString());
    formData.append("termsVersion", "1.0");

    if (idImage) {
      formData.append("idImage", {
        uri: idImage,
        type: "image/jpeg",
        name: "idImage.jpg",
      });
    }

    try {
      const response = await fetch("http://192.168.0.5:5000/api/auth/register", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert("회원가입 완료", "로그인 해주세요!");
        navigation.replace("Login");
      } else {
        Alert.alert("회원가입 실패", result.message || "서버 오류");
      }
    } catch (error) {
      Alert.alert("회원가입 실패", error.message || "서버 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={require('../../assets/images/thechingu.png')} style={styles.logo} />
        <Text style={styles.title}>회원가입</Text>

        <TextInput style={styles.input} placeholder="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="비밀번호 (6자 이상, 특수문자 포함)" secureTextEntry value={password} onChangeText={setPassword} />
        <TextInput style={styles.input} placeholder="비밀번호 확인" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        <TextInput style={styles.input} placeholder="이름 (한글만)" value={name} onChangeText={setName} />

        <View style={styles.genderContainer}>
          <Text style={styles.label}>성별 선택:</Text>
          <View style={styles.genderButtons}>
            <TouchableOpacity style={[styles.genderButton, gender === 'male' && styles.selectedGender]} onPress={() => handleGenderSelect('male')}>
              <Text style={[styles.genderButtonText, gender === 'male' && styles.selectedGenderText]}>남</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.genderButton, gender === 'female' && styles.selectedGender]} onPress={() => handleGenderSelect('female')}>
              <Text style={[styles.genderButtonText, gender === 'female' && styles.selectedGenderText]}>여</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="전화번호 (010-XXXX-XXXX)"
          value={phone}
          keyboardType="numeric"
          onChangeText={(text) => {
            const onlyDigits = text.replace(/[^0-9]/g, '');
            let formatted = onlyDigits;
            if (onlyDigits.length <= 3) {
              formatted = onlyDigits;
            } else if (onlyDigits.length <= 7) {
              formatted = `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(3)}`;
            } else {
              formatted = `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(3, 7)}-${onlyDigits.slice(7, 11)}`;
            }
            setPhone(formatted);
          }}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>은행 선택:</Text>
          <Picker selectedValue={bank} onValueChange={(value) => setBank(value)} style={styles.picker}>
            <Picker.Item label="은행을 선택하세요" value="" />
            <Picker.Item label="국민은행" value="국민은행" />
            <Picker.Item label="신한은행" value="신한은행" />
            <Picker.Item label="하나은행" value="하나은행" />
            <Picker.Item label="우리은행" value="우리은행" />
            <Picker.Item label="카카오뱅크" value="카카오뱅크" />
            <Picker.Item label="농협은행" value="농협은행" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="계좌번호 (숫자만)"
          value={accountNumber}
          keyboardType="numeric"
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, '');
            const formatted = digits.replace(/(\d{3})(\d{3,4})(\d{4,7})/, "$1-$2-$3");
            setAccountNumber(formatted);
          }}
        />

        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadButtonText}>신분증 사진 업로드</Text>
        </TouchableOpacity>
        {idImage && <Image source={{ uri: idImage }} style={styles.profileImage} />}

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.registerButtonText}>회원가입</Text>}
        </TouchableOpacity>

        <View style={styles.checkboxContainer}>
          <Checkbox value={agreeTerms} onValueChange={setAgreeTerms} color={agreeTerms ? '#007AFF' : undefined} />
          <Text style={styles.checkboxLabel}>
            [필수]{' '}
            <Text onPress={() => navigation.navigate("ConsentScreen")} style={styles.linkText}>
              이용약관 및 개인정보 수집 동의
            </Text>
          </Text>
        </View>

        {!agreeTerms && (
          <Text style={styles.noticeText}>※ 이용약관에 동의해야 회원가입이 가능합니다.</Text>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>이미 계정이 있나요? 로그인</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 15,
  },
  genderContainer: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: '#444',
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedGender: {
    backgroundColor: '#007AFF',
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  selectedGenderText: {
    color: '#fff',
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 12,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 12,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: '#007AFF',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 12,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    width: '100%',
    paddingLeft: 2,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flexWrap: 'wrap',
    flex: 1,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  noticeText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  loginText: {
    marginTop: 20,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default RegisterScreen;
