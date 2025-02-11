import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AdminBottomTabNavigator from './src/navigation/AdminBottomTabNavigator'; // 관리자 네비게이션 추가
import BankInfoScreen from './src/screens/BankInfoScreen'; // 계좌 정보 변경
import ChangePasswordScreen from './src/screens/ChangePasswordScreen'; // 비밀번호 변경
import NoticeScreen from './src/screens/NoticeScreen'; // 공지사항
import CustomerSupportScreen from './src/screens/CustomerSupportScreen'; // 고객센터 문의

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* ✅ 로그인 및 회원가입 */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* ✅ 일반 사용자 & 관리자 네비게이션 */}
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="AdminMain" component={AdminBottomTabNavigator} />

        {/* ✅ 추가된 기능 네비게이션 */}
        <Stack.Screen name="BankInfo" component={BankInfoScreen} options={{ headerShown: true, title: '계좌 정보 변경' }} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: '비밀번호 변경' }} />
        <Stack.Screen name="Notice" component={NoticeScreen} options={{ headerShown: true, title: '공지사항' }} />
        <Stack.Screen name="CustomerSupport" component={CustomerSupportScreen} options={{ headerShown: true, title: '고객센터 문의' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
