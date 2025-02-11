import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Text } from 'react-native';

// 📌 관리자 화면 Import
import AdminJobListScreen from '../screens/AdminJobListScreen';
import AdminJobDetailScreen from '../screens/AdminJobDetailScreen';
import AdminJobFormScreen from '../screens/AdminJobFormScreen';
import AdminScheduleScreen from '../screens/AdminScheduleScreen';
import AdminChatScreen from '../screens/AdminChatScreen';
import AdminMyPageScreen from '../screens/AdminMyPageScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 📌 모집 공고 (홈) 네비게이터 (헤더 추가)
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
    </Stack.Navigator>
  );
}

// 📌 일정 확인 네비게이터 (헤더 추가)
function AdminScheduleStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen name="AdminScheduleScreen" component={AdminScheduleScreen} options={{ headerTitle: '일정 확인' }} />
    </Stack.Navigator>
  );
}

// 📌 단톡방 네비게이터 (헤더 추가)
function AdminChatStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen name="AdminChatScreen" component={AdminChatScreen} options={{ headerTitle: '단톡방' }} />
    </Stack.Navigator>
  );
}

// 📌 마이페이지 네비게이터 (헤더 추가)
function AdminMyPageStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen name="AdminMyPageScreen" component={AdminMyPageScreen} options={{ headerTitle: '마이페이지' }} />
    </Stack.Navigator>
  );
}

// 📌 바텀 탭 네비게이션 (관리자)
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
      <Tab.Screen name="AdminChat" component={AdminChatStack} />
      <Tab.Screen name="AdminMyPage" component={AdminMyPageStack} />
    </Tab.Navigator>
  );
}
