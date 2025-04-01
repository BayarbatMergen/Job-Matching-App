import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { db } from '../config/firebase';
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';

// 화면 import
import JobListScreen from '../screens/JobListScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import NotificationScreen from '../screens/NotificationScreen';
import MyPageScreen from '../screens/MyPageScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import MyInquiriesScreen from '../screens/MyInquiriesScreen';
import ScheduleNavigator from './ScheduleNavigator';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const defaultScreenOptions = {
  headerStyle: { backgroundColor: '#007AFF' },
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
};

// 🔔 헤더에 알림 버튼 + 빨간 점
function HomeStack({ hasNotifications }) {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name="JobList"
        children={(props) => (
          <JobListScreen {...props} hasNotifications={hasNotifications} />
        )}
        options={({ navigation }) => ({
          headerTitle: '모집 공고',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Notification')}
              style={styles.notificationButton}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {hasNotifications && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ headerTitle: '공고 상세' }} />
      <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerTitle: '알림' }} />
    </Stack.Navigator>
  );
}

function ChatNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerTitle: '채팅방 목록' }} />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={({ route }) => ({
          headerTitle: route.params?.roomName || '채팅방',
        })}
      />
    </Stack.Navigator>
  );
}

function MyPageNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen name="MyPageScreen" component={MyPageScreen} options={{ headerTitle: '마이페이지' }} />
      <Stack.Screen name="MyInquiriesScreen" component={MyInquiriesScreen} options={{ headerTitle: '내 문의 내역' }} />
    </Stack.Navigator>
  );
}

export default function BottomTabNavigator() {
  const [hasNotifications, setHasNotifications] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // 🔔 알림용 리스너
  useEffect(() => {
    let unsubscribe;
    const setupListener = async () => {
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) return;

      const q = query(
        collection(db, `notifications/${userId}/userNotifications`),
        where('read', '==', false)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const hasUnread = snapshot.size > 0;
        console.log(`📍 알림 수신됨: ${snapshot.size}`);
        setHasNotifications(hasUnread);
      });
    };

    setupListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 💬 채팅 메시지 리스너 (unread 감지용)
  useEffect(() => {
    let unsubscribers = [];
  
    const setupMessageListeners = async () => {
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) return;
  
      const chatRoomSnap = await getDocs(
        query(collection(db, 'chats'), where('participants', 'array-contains', userId))
      );
      const roomIds = chatRoomSnap.docs.map((doc) => doc.id);
  
      if (roomIds.length === 0) return;
  
      unsubscribers = roomIds.map((roomId) => {
        const msgQuery = collection(db, `chats/${roomId}/messages`);
        return onSnapshot(msgQuery, (snapshot) => {
          let hasUnread = false;
  
          snapshot.forEach((doc) => {
            const msg = doc.data();
            if (
              msg.senderId !== userId &&
              (!msg.readBy || !msg.readBy.includes(userId))
            ) {
              hasUnread = true;
            }
          });
  
          setHasUnreadMessages(hasUnread);
        });
      });
    };
  
    setupMessageListeners();
  
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);  

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#f8f8f8',
          height: 60,
          paddingBottom: 10,
        },
        tabBarIcon: ({ color }) => {
          const icons = {
            Home: 'home-outline',
            Schedule: 'calendar-outline',
            Chat: 'chatbubble-outline',
            MyPage: 'person-outline',
          };

          return (
            <View style={{ position: 'relative' }}>
              <Ionicons name={icons[route.name]} size={28} color={color} />
              {route.name === 'Chat' && hasUnreadMessages && (
                <View style={styles.notificationDot} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home">
        {() => <HomeStack hasNotifications={hasNotifications} />}
      </Tab.Screen>
      <Tab.Screen name="Schedule" component={ScheduleNavigator} />
      <Tab.Screen name="Chat" component={ChatNavigator} />
      <Tab.Screen name="MyPage" component={MyPageNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    position: 'relative',
    marginRight: 15,
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    backgroundColor: 'red',
    borderRadius: 4,
    zIndex: 10,
  },
});
