import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AdminBottomTabNavigator from './src/navigation/AdminBottomTabNavigator'; // 관리자 네비게이션 추가

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="AdminMain" component={AdminBottomTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
