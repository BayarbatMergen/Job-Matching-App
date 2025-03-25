import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';

// 📌 관리자 화면 Import
import AdminJobListScreen from '../screens/AdminJobListScreen';
import AdminJobDetailScreen from '../screens/AdminJobDetailScreen';
import AdminJobFormScreen from '../screens/AdminJobFormScreen';
import AdminScheduleScreen from '../screens/AdminScheduleScreen';
import AdminChatListScreen from '../screens/AdminChatListScreen';
import AdminChatScreen from '../screens/AdminChatScreen';
import AdminMyPageScreen from '../screens/AdminMyPageScreen';
import ApprovalScreen from '../screens/ApprovalScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import UserDetailScreen from '../screens/UserDetailScreen';
import NoticeWriteScreen from '../screens/NoticeWriteScreen';
import AdminPasswordChangeScreen from '../screens/AdminPasswordChangeScreen';
import CustomerInquiryScreen from '../screens/CustomerInquiryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 📌 모집 공고 관리 스택
function AdminHomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen
        name="AdminJobList"
        component={AdminJobListScreen}
        options={({ navigation }) => ({
          headerTitle: '모집 공고',
          headerRight: () => (
            <View style={{ flexDirection: 'row', paddingRight: 15 }}>
              <TouchableOpacity onPress={() => navigation.navigate('AdminJobForm')}>
                <Ionicons name="add-circle-outline" size={26} color="white" />
              </TouchableOpacity>
            </View>
          ),
        })}
      />
      <Stack.Screen name="AdminJobDetail" component={AdminJobDetailScreen} options={{ headerTitle: '공고 상세' }} />
      <Stack.Screen name="AdminJobForm" component={AdminJobFormScreen} options={{ headerTitle: '공고 등록' }} />
      <Stack.Screen name="ApprovalScreen" component={ApprovalScreen} options={{ headerTitle: '승인 대기 목록' }} />
    </Stack.Navigator>
  );
}

// 📌 일정 관리 스택
function AdminScheduleStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen name="AdminScheduleScreen" component={AdminScheduleScreen} options={{ headerTitle: '일정 관리' }} />
    </Stack.Navigator>
  );
}

// 📌 채팅 스택
function AdminChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen
        name="AdminChatList"
        component={AdminChatListScreen}
        options={{ headerTitle: '채팅 목록' }}
      />
      <Stack.Screen
        name="AdminChatScreen"
        component={AdminChatScreen}
        options={({ route }) => ({ headerTitle: route.params?.roomName || '채팅방' })}
      />
    </Stack.Navigator>
  );
}

// 📌 마이페이지 스택 (추가 페이지 연결)
function AdminMyPageStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen name="AdminMyPageMain" component={AdminMyPageScreen} options={{ headerTitle: '마이페이지' }} />
      <Stack.Screen name="UserManagementScreen" component={UserManagementScreen} options={{ headerTitle: '전체 사용자 관리' }} />
      <Stack.Screen name="UserDetailScreen" component={UserDetailScreen} options={{ headerTitle: '사용자 상세 정보' }} />
      <Stack.Screen name="NoticeWriteScreen" component={NoticeWriteScreen} options={{ headerTitle: '공지사항 작성' }} />
      <Stack.Screen name="CustomerInquiryScreen" component={CustomerInquiryScreen} options={{ headerTitle: '고객센터 문의 확인' }} />
      <Stack.Screen name="AdminPasswordChangeScreen" component={AdminPasswordChangeScreen} options={{ headerTitle: '비밀번호 변경' }} />
    </Stack.Navigator>
  );
}

// 📌 바텀 탭 네비게이터
export default function AdminBottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: { backgroundColor: '#f8f8f8', height: 60, paddingBottom: 10 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'AdminHome') iconName = 'briefcase-outline';
          else if (route.name === 'AdminSchedule') iconName = 'calendar-outline';
          else if (route.name === 'AdminChat') iconName = 'chatbubble-outline';
          else if (route.name === 'AdminMyPage') iconName = 'person-outline';
          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="AdminHome" component={AdminHomeStack} />
      <Tab.Screen name="AdminSchedule" component={AdminScheduleStack} />
      {/* ✅ 수정된 `AdminChatStack` 반영 */}
      <Tab.Screen name="AdminChat" component={AdminChatStack} />
      <Tab.Screen name="AdminMyPage" component={AdminMyPageStack} />
    </Tab.Navigator>
  );
}
