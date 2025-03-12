import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';  // ✅ 유지
import { fetchUserData, logout } from "../services/authService";

const API_BASE_URL = 'http://192.168.0.6:5000';


export default function MyPageScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      console.log("🚀 MyPageScreen useEffect 실행됨!");

      const userId = await fetchUserData();
      if (!userId) {
        console.warn("🚨 사용자 데이터 없음 → 로그인 화면 이동");
        Alert.alert("인증 오류", "로그인이 필요합니다.", [
          { text: "확인", onPress: () => navigation.replace("Login") },
        ]);
        return;
      }
      try {
        const response = await fetch(`http://192.168.0.6:5000/api/auth/user/${userId}`);
        if (!response.ok) throw new Error("서버 오류");

        const userInfo = await response.json();
        console.log("✅ [서버에서 가져온 사용자 데이터]:", userInfo);

        setUserData(userInfo);
      } catch (error) {
        console.error("❌ 사용자 정보 가져오기 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [navigation]);

  // ✅ 사용자 정보 불러오기
  const fetchUserInfo = async (token) => {
    try {
      console.log("🚀 API 요청 시작...");
      console.log("🔹 저장된 토큰 (마이페이지):", token);

      if (!token) {
        console.warn("🚨 저장된 토큰 없음 → 로그인 화면 이동");
        Alert.alert("로그인 필요", "로그인이 필요합니다.");
        navigation.replace("Login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("🔹 서버 응답 상태 코드:", response.status);

      if (!response.ok) {
        console.error("❌ 서버 응답 오류:", response.status, response.statusText);
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ [서버 응답 데이터]:", data);

      setUserData(data);
    } catch (error) {
      console.error("❌ 사용자 정보 가져오기 오류:", error);
      Alert.alert("오류", error.message || "사용자 정보를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 로그아웃 처리
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken"); // ✅ 토큰 삭제
      await AsyncStorage.removeItem("userEmail"); // ✅ 사용자 이메일 삭제
      setLogoutModalVisible(false);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 📌 프로필 영역 */}
      <View style={styles.profileContainer}>
        <Image 
          source={{ uri: userData?.idImage || 'https://your-default-profile-url.com' }} 
          style={styles.profileImage} 
        />
        <Text style={styles.userName}>{userData?.name || "이름 없음"}</Text>
        <Text style={styles.userEmail}>{userData?.email || "이메일 없음"}</Text>
      </View>

      {/* 🔹 설정 메뉴 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('BankInfo')}>
          <Ionicons name="card-outline" size={26} color="#007AFF" />
          <Text style={styles.menuText}>계좌 정보 변경</Text>
          <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePassword')}>
          <Ionicons name="key-outline" size={26} color="#007AFF" />
          <Text style={styles.menuText}>비밀번호 변경</Text>
          <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
        </TouchableOpacity>
      </View>

      {/* 📢 공지사항 & 고객센터 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notice')}>
          <Ionicons name="megaphone-outline" size={26} color="#007AFF" />
          <Text style={styles.menuText}>공지사항</Text>
          <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('CustomerSupport')}>
          <Ionicons name="help-circle-outline" size={26} color="#007AFF" />
          <Text style={styles.menuText}>고객센터 문의</Text>
          <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
        </TouchableOpacity>
      </View>

      {/* 🔴 로그아웃 버튼 */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => setLogoutModalVisible(true)}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      {/* 🚀 로그아웃 모달 */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons name="log-out-outline" size={40} color="#FF3B30" />
            <Text style={styles.modalTitle}>로그아웃 하시겠습니까?</Text>
            <Text style={styles.modalText}>현재 계정에서 로그아웃합니다.</Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleLogout}>
                <Text style={styles.confirmButtonText}>로그아웃</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  profileContainer: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImage: { 
    width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#fff', marginBottom: 10 
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  userEmail: { fontSize: 16, color: '#E0E0E0' },

  section: { backgroundColor: '#fff', marginTop: 15, borderRadius: 12, paddingVertical: 5, elevation: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  menuText: { fontSize: 17, marginLeft: 15, color: '#333', flex: 1, fontWeight: '500' },

  logoutButton: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 30, marginHorizontal: 20 },
  logoutText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: '80%', padding: 20, backgroundColor: '#fff', borderRadius: 15, alignItems: 'center', elevation: 5 },
});

