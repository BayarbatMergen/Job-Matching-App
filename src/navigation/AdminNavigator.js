import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import AdminJobListScreen from '../screens/AdminJobListScreen';
import AdminJobDetailScreen from '../screens/AdminJobDetailScreen';
import AdminScheduleScreen from '../screens/AdminScheduleScreen';
import AdminChatScreen from '../screens/AdminChatScreen'; // ✅ 관리자 채팅 화면 추가
import ApprovalScreen from '../screens/ApprovalScreen'; // ✅ 경로에 맞게 import 추가

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
      <Stack.Screen name="AdminJobList" component={AdminJobListScreen} />
      <Stack.Screen name="AdminJobDetail" component={AdminJobDetailScreen} />
      <Stack.Screen name="AdminSchedule" component={AdminScheduleScreen} />
      <Stack.Screen name="AdminChat" component={AdminChatScreen} /> {/* ✅ 네비게이터에 추가 */}
      <Stack.Screen name="ApprovalScreen" component={ApprovalScreen} /> 
    </Stack.Navigator>
  );
}
