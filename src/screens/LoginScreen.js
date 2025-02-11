import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);

  // ✅ 관리자 계정 정보 (임시 설정)
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';

  // 📌 로그인 처리
  const handleLogin = () => {
    console.log('로그인 버튼 클릭됨:', email, password);
  
    if (email === adminEmail && password === adminPassword) {
      Alert.alert('관리자 로그인 성공', '관리자 모드로 이동합니다.');
      navigation.replace('AdminMain'); // ✅ 관리자 네비게이션으로 이동
    } else {
      navigation.replace('Main'); // ✅ 일반 사용자 네비게이션으로 이동 (메시지 제거)
    }
  };  

  // 📌 비밀번호 재설정 요청
  const handlePasswordReset = () => {
    if (!resetEmail) {
      Alert.alert('오류', '이메일을 입력하세요.');
      return;
    }
    Alert.alert('안내', `비밀번호 재설정 메일이 ${resetEmail}로 발송되었습니다.`);
    setIsResetMode(false); // 요청 후 로그인 화면으로 돌아가기
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.innerContainer}>
        {/* 로고 */}
        <Image source={require('../../assets/images/thechingu.png')} style={styles.logo} />

        {/* 📌 로그인 모드 */}
        {!isResetMode ? (
          <>
            <Text style={styles.title}>로그인</Text>

            {/* 이메일 입력 */}
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {/* 비밀번호 입력 */}
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* 로그인 버튼 */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>로그인</Text>
            </TouchableOpacity>

            {/* 회원가입 / 비밀번호 찾기 */}
            <View style={styles.footerContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>회원가입</Text>
              </TouchableOpacity>
              <Text style={styles.separator}> | </Text>
              <TouchableOpacity onPress={() => setIsResetMode(true)}>
                <Text style={styles.forgotPasswordText}>비밀번호 찾기</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* 📌 비밀번호 재설정 모드 */
          <>
            <Text style={styles.title}>비밀번호 찾기</Text>

            <TextInput
              style={styles.input}
              placeholder="이메일 입력"
              placeholderTextColor="#aaa"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
            />

            <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset}>
              <Text style={styles.resetButtonText}>비밀번호 재설정</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsResetMode(false)}>
              <Text style={styles.backToLoginText}>로그인으로 돌아가기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 30 },
  innerContainer: { width: '100%', alignItems: 'center', marginTop: 200 },
  logo: { width: 180, height: 180, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 12, fontSize: 16 },
  
  loginButton: { backgroundColor: '#007AFF', width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 10 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  footerContainer: { flexDirection: 'row', marginTop: 15 },
  registerText: { color: '#007AFF', fontSize: 16, fontWeight: '500' },
  forgotPasswordText: { color: '#FF5733', fontSize: 16, fontWeight: '500' },
  separator: { fontSize: 16, color: '#333', marginHorizontal: 10 },
  
  resetButton: { backgroundColor: '#FF5733', width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 10 },
  resetButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  backToLoginText: { color: '#007AFF', fontSize: 16, marginTop: 15, fontWeight: '500' },
});

export default LoginScreen;
