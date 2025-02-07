import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
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

function HomeStack({ navigation }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerStyle: { backgroundColor: '#ffffff' } }}>
      <Stack.Screen 
        name="JobList" 
        component={JobListScreen} 
        options={{
          headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold' }}>모집 공고</Text>,
          headerTitleAlign: 'center',
          headerRight: () => (
            <View style={{ flexDirection: 'row', paddingRight: 15 }}>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Ionicons name="search-outline" size={24} style={{ marginRight: 15 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => console.log('알림 버튼 클릭')}>
                <Ionicons name="notifications-outline" size={24} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen 
        name="JobDetail" 
        component={JobDetailScreen} 
        options={{ headerTitle: '상세 정보' }} 
      />
    </Stack.Navigator>
  );
}

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
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="MyPage" component={MyPageScreen} />
    </Tab.Navigator>
  );
}
