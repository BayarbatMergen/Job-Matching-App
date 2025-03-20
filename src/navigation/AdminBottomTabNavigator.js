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
import ApprovalScreen from '../screens/ApprovalScreen'; // ✅ 경로에 맞게 import 추가

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 📌 모집 공고 (홈) 네비게이터
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

// 📌 일정 확인 네비게이터
function AdminScheduleStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen 
        name="AdminScheduleScreen" // ✅ 고유한 이름으로 변경
        component={AdminScheduleScreen} 
        options={{ headerTitle: '일정 확인' }} 
      />
    </Stack.Navigator>
  );
}

// 📌 관리자 채팅 네비게이터
function AdminChatStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center'
      }}
    >
      {/* ✅ 관리자 채팅방 목록 (기본 화면) */}
      <Stack.Screen 
        name="AdminChatList" 
        component={AdminChatListScreen} 
        options={{ headerTitle: '관리자 채팅방 목록' }} 
      />

      {/* ✅ 선택한 채팅방 내부 화면 */}
      <Stack.Screen 
        name="AdminChatScreen" 
        component={AdminChatScreen} 
        options={({ route }) => ({ headerTitle: route.params?.roomName || '관리자 채팅' })} 
      />
    </Stack.Navigator>
  );
}

// 📌 마이페이지 네비게이터
function AdminMyPageStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen name="AdminMyPage" component={AdminMyPageScreen} options={{ headerTitle: '마이페이지' }} />
    </Stack.Navigator>
  );
}

// 📌 바텀 탭 네비게이션 (관리자용)
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
