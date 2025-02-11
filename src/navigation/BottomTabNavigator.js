import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

// ✅ 사용자용 화면 import (관리자용과 혼동 금지!)
import JobListScreen from '../screens/JobListScreen'; // 일반 사용자용
import JobDetailScreen from '../screens/JobDetailScreen'; // ✅ 추가 (이전에는 없었음)
import ScheduleScreen from '../screens/ScheduleScreen';
import ChatScreen from '../screens/ChatScreen';
import MyPageScreen from '../screens/MyPageScreen';
import SearchScreen from '../screens/SearchScreen'; // ✅ 검색 화면 추가
import NotificationScreen from '../screens/NotificationScreen'; // ✅ 알림 화면 추가

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 📌 모집 공고 (홈) 네비게이터
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      {/* ✅ JobListScreen */}
      <Stack.Screen
        name="JobList"
        component={JobListScreen}
        options={{
          headerTitle: '모집 공고', // ✅ JSX 대신 문자열 사용
        }}
      />
      {/* ✅ JobDetailScreen - 추가됨 (공고 상세 화면 이동 가능) */}
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{
          headerTitle: '공고 상세',
        }}
      />
      {/* ✅ 검색 및 알림 화면 */}
      <Stack.Screen name="Search" component={SearchScreen} options={{ headerTitle: '검색' }} />
      <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerTitle: '알림' }} />
    </Stack.Navigator>
  );
}

// 📌 일정 확인 네비게이터
function ScheduleNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="ScheduleScreen"
        component={ScheduleScreen}
        options={{ headerTitle: '일정 확인' }}
      />
    </Stack.Navigator>
  );
}

// 📌 채팅 네비게이터
function ChatNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerTitle: '단톡방' }} />
    </Stack.Navigator>
  );
}

// 📌 마이페이지 네비게이터
function MyPageNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="MyPageScreen" component={MyPageScreen} options={{ headerTitle: '마이페이지' }} />
    </Stack.Navigator>
  );
}

// 📌 바텀 탭 네비게이션 (사용자용)
export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: { backgroundColor: '#f8f8f8', height: 60, paddingBottom: 10 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Schedule') iconName = 'calendar-outline';
          else if (route.name === 'Chat') iconName = 'chatbubble-outline';
          else if (route.name === 'MyPage') iconName = 'person-outline';
          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Schedule" component={ScheduleNavigator} />
      <Tab.Screen name="Chat" component={ChatNavigator} />
      <Tab.Screen name="MyPage" component={MyPageNavigator} />
    </Tab.Navigator>
  );
}
