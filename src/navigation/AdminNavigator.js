import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import AdminJobListScreen from '../screens/AdminJobListScreen';
import AdminJobDetailScreen from '../screens/AdminJobDetailScreen';
import AdminScheduleScreen from '../screens/AdminScheduleScreen';
import AdminChatScreen from '../screens/AdminChatScreen';
import ApprovalScreen from '../screens/ApprovalScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import UserDetailScreen from '../screens/UserDetailScreen';
import NoticeWriteScreen from '../screens/NoticeWriteScreen';
import CustomerInquiryScreen from '../screens/CustomerInquiryScreen';
import AdminPasswordChangeScreen from '../screens/AdminPasswordChangeScreen';

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
      <Stack.Screen name="AdminJobList" component={AdminJobListScreen} />
      <Stack.Screen name="AdminJobDetail" component={AdminJobDetailScreen} />
      <Stack.Screen name="AdminSchedule" component={AdminScheduleScreen} />
      <Stack.Screen name="AdminChat" component={AdminChatScreen} />
      <Stack.Screen name="ApprovalScreen" component={ApprovalScreen} />
      <Stack.Screen name="UserManagementScreen" component={UserManagementScreen} />
      <Stack.Screen name="UserDetailScreen" component={UserDetailScreen} />
      <Stack.Screen name="NoticeWriteScreen" component={NoticeWriteScreen} />
      <Stack.Screen name="CustomerInquiryScreen" component={CustomerInquiryScreen} />
      <Stack.Screen name="AdminPasswordChangeScreen" component={AdminPasswordChangeScreen} />
    </Stack.Navigator>
  );
}
