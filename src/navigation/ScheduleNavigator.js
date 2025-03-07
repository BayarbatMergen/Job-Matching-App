import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScheduleScreen from '../screens/ScheduleScreen';
import { Text } from 'react-native';

const Stack = createStackNavigator();

// ✅ 헤더 타이틀 컴포넌트 분리 (가독성 증가)
const HeaderTitle = () => (
  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>일정 확인</Text>
);

export default function ScheduleNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#ffffff', elevation: 0 }, // ✅ 안드로이드에서 그림자 제거
        headerTitleAlign: 'center', // ✅ 모든 화면에 중앙 정렬 적용
      }}
    >
      <Stack.Screen 
        name="ScheduleScreen" 
        component={ScheduleScreen} 
        options={{ headerTitle: () => <HeaderTitle /> }} // ✅ 헤더 타이틀 컴포넌트 사용
      />
    </Stack.Navigator>
  );
}
