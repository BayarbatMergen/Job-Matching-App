import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// ✅ 사용자용 화면 import
import JobListScreen from '../screens/JobListScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import MyPageScreen from '../screens/MyPageScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import NotificationScreen from '../screens/NotificationScreen'; // ✅ 알림 화면 추가
import ScheduleNavigator from './ScheduleNavigator';  // ✅ 중복 선언 제거 후 유지

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 📌 모집 공고 (홈) 네비게이터
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen name="JobList" component={JobListScreen} options={{ headerTitle: '모집 공고' }} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ headerTitle: '공고 상세' }} />
      <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerTitle: '알림' }} />
    </Stack.Navigator>
  );
}


// 📌 채팅 네비게이터 (채팅 목록 → 개별 채팅방)
function ChatNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerTitle: '채팅방 목록' }} />
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatScreen} 
        options={({ route }) => ({ headerTitle: route.params?.roomName || '채팅방' })} 
      />
    </Stack.Navigator>
  );
}

// 📌 마이페이지 네비게이터
function MyPageNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen name="MyPageScreen" component={MyPageScreen} options={{ headerTitle: '마이페이지' }} />
    </Stack.Navigator>
  );
}

// 📌 공통 Stack Navigator 스타일 설정
const defaultScreenOptions = {
  headerStyle: { backgroundColor: '#007AFF' },
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  
};

// 📌 바텀 탭 네비게이션 (사용자용)
export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: { backgroundColor: '#f8f8f8', height: 60, paddingBottom: 10 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home-outline',
            Schedule: 'calendar-outline',
            Chat: 'chatbubble-outline',
            MyPage: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={28} color={color} />;
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
