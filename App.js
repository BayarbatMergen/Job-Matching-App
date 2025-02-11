import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AdminBottomTabNavigator from './src/navigation/AdminBottomTabNavigator';

// 🔹 사용자 & 관리자 추가 기능
import UserManagementScreen from './src/screens/UserManagementScreen';
import AdminPasswordChangeScreen from './src/screens/AdminPasswordChangeScreen';
import NoticeWriteScreen from './src/screens/NoticeWriteScreen';
import CustomerInquiryScreen from './src/screens/CustomerInquiryScreen';

// 🔹 추가된 기능
import BankInfoScreen from './src/screens/BankInfoScreen'; // 계좌 정보 변경
import ChangePasswordScreen from './src/screens/ChangePasswordScreen'; // 비밀번호 변경
import NoticeScreen from './src/screens/NoticeScreen'; // 공지사항
import CustomerSupportScreen from './src/screens/CustomerSupportScreen'; // 고객센터 문의

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* ✅ 기본 인증 화면 */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* ✅ 일반 사용자 네비게이션 */}
        <Stack.Screen name="Main" component={BottomTabNavigator} />

        {/* ✅ 관리자 네비게이션 */}
        <Stack.Screen name="AdminMain" component={AdminBottomTabNavigator} />

        {/* ✅ 관리자 기능 추가 */}
        <Stack.Screen 
          name="UserManagementScreen" 
          component={UserManagementScreen} 
          options={{ headerShown: true, title: '사용자 관리' }}
        />
        <Stack.Screen 
          name="AdminPasswordChangeScreen" 
          component={AdminPasswordChangeScreen} 
          options={{ headerShown: true, title: '비밀번호 변경' }}
        />
        <Stack.Screen 
          name="NoticeWriteScreen" 
          component={NoticeWriteScreen} 
          options={{ headerShown: true, title: '공지사항 작성' }}
        />
        <Stack.Screen 
          name="CustomerInquiryScreen" 
          component={CustomerInquiryScreen} 
          options={{ headerShown: true, title: '고객 문의 관리' }}
        />

        {/* ✅ 추가된 기능 네비게이션 */}
        <Stack.Screen 
          name="BankInfo" 
          component={BankInfoScreen} 
          options={{ headerShown: true, title: '계좌 정보 변경' }} 
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen} 
          options={{ headerShown: true, title: '비밀번호 변경' }} 
        />
        <Stack.Screen 
          name="Notice" 
          component={NoticeScreen} 
          options={{ headerShown: true, title: '공지사항' }} 
        />
        <Stack.Screen 
          name="CustomerSupport" 
          component={CustomerSupportScreen} 
          options={{ headerShown: true, title: '고객센터 문의' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
