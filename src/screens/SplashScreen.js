import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';

const SplashScreen = ({ navigation }) => {
  // 애니메이션 값 설정
  const slideUp = useRef(new Animated.Value(150)).current; // 초기 위치 (150px 아래)

  useEffect(() => {
    // 애니메이션 실행 (아래에서 위로 올라오기)
    Animated.timing(slideUp, {
      toValue: 0, // 최종 위치 (중앙)
      duration: 2500, // 애니메이션 시간 (1.5초)
      useNativeDriver: true, // 성능 최적화
    }).start();

    // 2초 후 로그인 화면으로 이동
    setTimeout(() => {
      navigation.replace('Login');
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animatedContainer, { transform: [{ translateY: slideUp }] }]}>
        <Image source={require('../../assets/images/thechingu.png')} style={styles.logo} />
        <Text style={styles.text}>안녕하세요</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  animatedContainer: { alignItems: 'center' },
  logo: { width: 250, height: 250, marginBottom: 20 }, // ✅ 로고 크기 키움
  text: { fontSize: 32, fontWeight: 'bold' }, // ✅ 텍스트 크기 키움
});

export default SplashScreen;
