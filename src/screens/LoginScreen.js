import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('로그인 버튼 클릭됨:', email, password);
    navigation.replace('Main'); // 로그인 후 공고 목록으로 이동
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.innerContainer}>
        {/* 로고 */}
        <Image source={require('../../assets/images/thechingu.png')} style={styles.logo} />

        {/* 로그인 타이틀 */}
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

        {/* 회원가입 버튼 */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 30 },
  innerContainer: { width: '100%', alignItems: 'center', marginTop: 200 }, // ✅ 모든 요소를 위로 이동
  logo: { width: 180, height: 180, marginBottom: 10 }, // ✅ 로고 크기 유지
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 12, fontSize: 16 },
  loginButton: { backgroundColor: '#007AFF', width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 10 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  registerText: { color: '#007AFF', fontSize: 16, marginTop: 15, fontWeight: '500' },
});

export default LoginScreen;
