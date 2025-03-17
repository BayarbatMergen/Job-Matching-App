import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BankInfoScreen() {
  const [existingBankInfo, setExistingBankInfo] = useState({ bank: "", accountNumber: "" });
  const [newBank, setNewBank] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // 로그인 상태 확인 및 복원
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // AsyncStorage에서 저장된 데이터 읽기
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedToken = await AsyncStorage.getItem("authToken");
        console.log("📌 AsyncStorage에서 가져온 데이터:", {
          storedUserId,
          storedToken,
        });

        // Firebase 인증 상태 리스너 설정
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {
            setAuthInitialized(true);
            if (user) {
              console.log("✅ Firebase 로그인 감지됨:", user.uid);
              setUserId(user.uid);
              await AsyncStorage.setItem("userId", user.uid);
              setLoading(false);
            } else {
              console.warn("⚠️ Firebase에서 로그인 상태 없음");
              setUserId(null);
              setLoading(false);
            }
          } catch (error) {
            console.error("❌ Firebase 상태 처리 오류:", error);
            setLoading(false);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("❌ 인증 상태 확인 오류:", error);
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Firestore에서 기존 계좌 정보 가져오기
  useEffect(() => {
    if (!authInitialized || !userId) {
      console.log("📌 userId 또는 인증 초기화 대기 중, 데이터 조회 건너뜀");
      setLoading(false);
      setExistingBankInfo({ bank: "로그인 필요", accountNumber: "로그인 필요" });
      return;
    }

    const fetchBankInfo = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("✅ Firestore에서 가져온 사용자 데이터:", data);
          setExistingBankInfo({
            bank: data.bank || "등록된 계좌 없음",
            accountNumber: data.accountNumber || "등록된 계좌 없음",
          });
        } else {
          console.warn("⚠️ Firestore에서 사용자 데이터 없음");
          setExistingBankInfo({ bank: "등록된 계좌 없음", accountNumber: "등록된 계좌 없음" });
        }
      } catch (error) {
        console.error("❌ 계좌 정보 조회 오류:", error);
        Alert.alert("오류 발생", "계좌 정보를 불러오는 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchBankInfo();
  }, [userId, authInitialized]);

  // Firestore에 새 계좌 정보 저장
  const handleSaveNewAccount = async () => {
    if (!newBank || !newAccountNumber) {
      Alert.alert("입력 오류", "은행명과 계좌번호를 모두 입력해주세요.");
      return;
    }
    if (!userId) {
      Alert.alert("오류", "로그인 상태를 확인한 후 다시 시도해주세요.");
      return;
    }

    try {
      setLoading(true);
      const userDocRef = doc(db, "users", userId);

      await updateDoc(userDocRef, {
        bank: newBank,
        accountNumber: newAccountNumber,
      });

      Alert.alert(
        "✅ 저장 완료",
        `새 계좌 정보가 등록되었습니다.\n은행: ${newBank}\n계좌번호: ${newAccountNumber}`
      );

      setExistingBankInfo({ bank: newBank, accountNumber: newAccountNumber });
      setNewBank("");
      setNewAccountNumber("");
    } catch (error) {
      console.error("❌ 계좌 정보 저장 오류:", error);
      Alert.alert("오류 발생", "계좌 정보를 저장하는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기존 등록된 계좌</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <View style={styles.infoBox}>
            <Text style={styles.label}>은행명</Text>
            <Text style={styles.infoText}>{existingBankInfo.bank}</Text>
            <Text style={styles.label}>계좌번호</Text>
            <Text style={styles.infoText}>{existingBankInfo.accountNumber}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>새 계좌 등록</Text>
        <TextInput
          style={styles.input}
          value={newBank}
          onChangeText={setNewBank}
          placeholder="새 은행명을 입력하세요"
        />
        <TextInput
          style={styles.input}
          value={newAccountNumber}
          onChangeText={setNewAccountNumber}
          placeholder="새 계좌번호를 입력하세요"
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSaveNewAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>새 계좌 저장</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  infoBox: {
    padding: 10,
    backgroundColor: "#EAEAEA",
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#007AFF",
    marginTop: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#A0C4FF",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});