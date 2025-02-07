import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import JobListScreen from '../screens/JobListScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ChatScreen from '../screens/ChatScreen';
import MyPageScreen from '../screens/MyPageScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationScreen from '../screens/NotificationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 📌 모집 공고 (홈) 네비게이터
function HomeStack({ navigation }) {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true, 
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff'
      }}
    >
      <Stack.Screen 
        name="JobList" 
        component={JobListScreen} 
        options={{
          headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>모집 공고</Text>,
          headerTitleAlign: 'center',
          headerRight: () => (
            <View style={{ flexDirection: 'row', paddingRight: 15 }}>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Ionicons name="search-outline" size={26} color="white" style={{ marginRight: 15 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
                <Ionicons name="notifications-outline" size={26} color="white" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ headerTitle: '상세 정보' }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ headerTitle: '검색' }} />
    </Stack.Navigator>
  );
}

// 📌 일정 확인 네비게이터
function ScheduleNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true, 
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff'
      }}
    >
      <Stack.Screen 
        name="ScheduleScreen" 
        component={ScheduleScreen} 
        options={{
          headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>일정 확인</Text>,
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}

// 📌 단톡방 네비게이터
function ChatNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true, 
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff'
      }}
    >
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatScreen} 
        options={{
          headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>단톡방</Text>,
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}

// 📌 마이페이지 네비게이터
function MyPageNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true, 
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff'
      }}
    >
      <Stack.Screen 
        name="MyPageScreen" 
        component={MyPageScreen} 
        options={{
          headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>마이페이지</Text>,
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}

// 📌 바텀 탭 네비게이션
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
