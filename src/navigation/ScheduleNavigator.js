import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScheduleScreen from '../screens/ScheduleScreen';
import { Text } from 'react-native';

const Stack = createStackNavigator();

export default function ScheduleNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerStyle: { backgroundColor: '#ffffff' } }}>
      <Stack.Screen 
        name="ScheduleScreen" 
        component={ScheduleScreen} 
        options={{
          headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold' }}>일정 확인</Text>,
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}
