import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserData } from '../services/authService';  // ✅ 수정된 fetchUserData 가져오기

const AppNavigator = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        console.log("🚀 useEffect 실행됨! fetchUserData() 호출 예정");

        const fetchAndSetUser = async () => {
            const userData = await fetchUserData();
            if (userData) {
                setUser(userData); // ✅ 사용자 상태 업데이트
            } else {
                console.warn("⚠️ 사용자 데이터를 가져올 수 없습니다.");
            }
        };

        fetchAndSetUser();
    }, []);

    return (
        <NavigationContainer>
            {user ? <MainNavigator /> : <AuthNavigator />}  
            {/* ✅ 로그인 여부에 따라 화면 전환 */}
        </NavigationContainer>
    );
};

export default AppNavigator;
