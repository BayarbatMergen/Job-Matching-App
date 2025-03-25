import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

export default function AdminMyPageScreen() {
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const loadAdminData = async () => {
      const storedEmail = await SecureStore.getItemAsync('userEmail');
      const storedName = await SecureStore.getItemAsync('userName'); // 관리자로 로그인 시 저장해놓은 이름
      setAdminEmail(storedEmail || 'admin@example.com');
      setAdminName(storedName || '관리자');
    };
    loadAdminData();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("userId");
    await SecureStore.deleteItemAsync("userEmail");
    await SecureStore.deleteItemAsync("userName");
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* 📌 프로필 영역 */}
      <View style={styles.profileContainer}>
        <Image 
          source={require('../../assets/images/thechingu1.png')}  
          style={styles.profileImage} 
        />
        <Text style={styles.userName}>{adminName}</Text>
        <Text style={styles.userEmail}>{adminEmail}</Text>
      </View>

      {/* 🔹 관리자 메뉴 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('UserManagementScreen')}>
          <Ionicons name="people-outline" size={26} color="#FF9500" />
          <Text style={styles.menuText}>전체 사용자 관리</Text>
          <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AdminPasswordChangeScreen')}>
          <Ionicons name="key-outline" size={26} color="#FF9500" />
          <Text style={styles.menuText}>비밀번호 변경</Text>
          <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('NoticeWriteScreen')}>
          <Ionicons name="megaphone-outline" size={26} color="#FF3B30" />
          <Text style={styles.menuText}>공지사항 작성</Text>
          <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('CustomerInquiryScreen')}>
          <Ionicons name="help-circle-outline" size={26} color="#FF3B30" />
          <Text style={styles.menuText}>고객센터 문의 확인</Text>
          <Ionicons name="chevron-forward" size={22} color="#A0A0A0" />
        </TouchableOpacity>
      </View>

      {/* 🔴 로그아웃 버튼 */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => setLogoutModalVisible(true)}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      {/* 로그아웃 모달 */}
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

  profileContainer: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#FF9500',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImage: { 
    width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#fff', marginBottom: 10 
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  userEmail: { fontSize: 16, color: '#F0F0F0' },

  section: { 
    backgroundColor: '#fff', 
    marginTop: 15, 
    borderRadius: 12, 
    paddingVertical: 5, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 3, 
    elevation: 2 
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

  logoutButton: { 
    backgroundColor: '#FF3B30', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginVertical: 30, 
    marginHorizontal: 20 
  },
  logoutText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.4)' 
  },
  modalContainer: { 
    width: '80%', 
    padding: 20, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    alignItems: 'center', 
    elevation: 10 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginTop: 15, 
    color: '#333', 
    textAlign: 'center' 
  },
  modalText: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginVertical: 10 
  },
  buttonRow: { 
    flexDirection: 'row', 
    marginTop: 20, 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  cancelButton: { 
    flex: 1, 
    backgroundColor: '#ddd', 
    paddingVertical: 12, 
    borderRadius: 10, 
    marginRight: 10, 
    alignItems: 'center' 
  },
  cancelButtonText: { 
    color: '#333', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  confirmButton: { 
    flex: 1, 
    backgroundColor: '#FF3B30', 
    paddingVertical: 12, 
    borderRadius: 10, 
    marginLeft: 10, 
    alignItems: 'center' 
  },
  confirmButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});
