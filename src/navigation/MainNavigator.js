import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import JobListScreen from '../screens/JobListScreen';
import JobDetailScreen from '../screens/JobDetailScreen'; // ✅ 추가

const Stack = createStackNavigator();

export default function UserNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="JobList" component={JobListScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} /> {/* ✅ 여기 등록 */}
    </Stack.Navigator>
  );
}
