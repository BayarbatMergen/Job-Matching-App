import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function MyPageScreen() {
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // 🔹 로그아웃 처리
  const handleLogout = () => {
    setLogoutModalVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],  // ✅ 로그인 화면으로 이동 (뒤로 가기 방지)
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* 📌 프로필 영역 */}
      <View style={styles.profileContainer}>
        <Image 
          source={require('../../assets/images/thechingu1.png')} // ✅ 프로필 이미지
          style={styles.profileImage} 
        />
        <Text style={styles.userName}>홍길동</Text>
        <Text style={styles.userEmail}>user@example.com</Text>
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

  // 🔹 프로필 영역 스타일
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 2, 
    borderColor: '#fff', 
    marginBottom: 10 
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  userEmail: { fontSize: 16, color: '#E0E0E0' },

  // 🔹 메뉴 스타일
  section: { 
    backgroundColor: '#fff', 
    marginTop: 15, 
    borderRadius: 12, 
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuText: { 
    fontSize: 17, 
    marginLeft: 15, 
    color: '#333', 
    flex: 1, 
    fontWeight: '500' 
  },

  // 🔴 로그아웃 버튼
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 30,
    marginHorizontal: 20
  },
  logoutText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

  // 🚀 로그아웃 모달 스타일
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContainer: { 
    width: '80%', 
    padding: 20, 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    alignItems: 'center',
    elevation: 5 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  modalText: { fontSize: 16, color: '#666', marginVertical: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },

  cancelButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#E0E0E0', marginRight: 10 },
  cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  confirmButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#FF3B30' },
  confirmButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
