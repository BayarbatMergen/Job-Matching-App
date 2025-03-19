import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminBottomTabNavigator from './AdminBottomTabNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import AuthNavigator from './AuthNavigator';
import SplashScreen from '../screens/SplashScreen';

const MainNavigator = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  if (!userData) {
    return <AuthNavigator />;
  }

  if (userData?.role === 'admin') {
    return <AdminBottomTabNavigator />;
  } else {
    return <BottomTabNavigator />;
  }
};

export default MainNavigator;
