import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { testAsyncStorage } from './src/services/authService'; // ✅ testAsyncStorage 가져오기

// ✅ 기본 인증 화면
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// ✅ 사용자 및 관리자 네비게이션
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AdminBottomTabNavigator from './src/navigation/AdminBottomTabNavigator';

// ✅ 관리자 기능
import UserManagementScreen from './src/screens/UserManagementScreen';
import AdminPasswordChangeScreen from './src/screens/AdminPasswordChangeScreen';
import NoticeWriteScreen from './src/screens/NoticeWriteScreen';
import CustomerInquiryScreen from './src/screens/CustomerInquiryScreen';

// ✅ 사용자 기능
import BankInfoScreen from './src/screens/BankInfoScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import NoticeScreen from './src/screens/NoticeScreen';
import CustomerSupportScreen from './src/screens/CustomerSupportScreen';

// ✅ 채팅 기능 추가
import ChatListScreen from './src/screens/ChatListScreen';
import ChatScreen from './src/screens/ChatScreen';

// ✅ 📆 **일정 관련 네비게이션 추가**
import ScheduleNavigator from './src/navigation/ScheduleNavigator';  // ✅ 일정 네비게이션 추가!

const Stack = createNativeStackNavigator();

export default function App() {
  // 🔥 앱 실행 시 AsyncStorage 테스트 실행
  useEffect(() => {
    testAsyncStorage();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* ✅ 로그인 & 회원가입 */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* ✅ 사용자 & 관리자 네비게이션 */}
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="AdminMain" component={AdminBottomTabNavigator} />

        {/* ✅ 관리자 기능 */}
        <Stack.Screen name="UserManagementScreen" component={UserManagementScreen} options={{ headerShown: true, title: '사용자 관리' }} />
        <Stack.Screen name="AdminPasswordChangeScreen" component={AdminPasswordChangeScreen} options={{ headerShown: true, title: '비밀번호 변경' }} />
        <Stack.Screen name="NoticeWriteScreen" component={NoticeWriteScreen} options={{ headerShown: true, title: '공지사항 작성' }} />
        <Stack.Screen name="CustomerInquiryScreen" component={CustomerInquiryScreen} options={{ headerShown: true, title: '고객 문의 관리' }} />

        {/* ✅ 사용자 기능 */}
        <Stack.Screen name="BankInfo" component={BankInfoScreen} options={{ headerShown: true, title: '계좌 정보 변경' }} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: '비밀번호 변경' }} />
        <Stack.Screen name="Notice" component={NoticeScreen} options={{ headerShown: true, title: '공지사항' }} />
        <Stack.Screen name="CustomerSupport" component={CustomerSupportScreen} options={{ headerShown: true, title: '고객센터 문의' }} />

        {/* ✅ 채팅 기능 */}
        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: true, title: '채팅방 목록' }} />
        <Stack.Screen 
          name="ChatScreen" 
          component={ChatScreen} 
          options={({ route }) => ({ 
            headerShown: true, 
            title: route.params?.roomName || '단톡방' 
          })}
        />

        {/* ✅ 일정 관련 네비게이션 */}
        <Stack.Screen name="Schedule" component={ScheduleNavigator} options={{ headerShown: true, title: '일정 관리' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}