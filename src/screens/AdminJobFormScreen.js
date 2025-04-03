import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import API_BASE_URL from "../config/apiConfig";
import userSelectionStore from "../store/userSelectionStore";
import {
  sendUserApplicationApprovalNotification,
  sendTestNotification,
} from '../utils/notificationService';

export default function AdminJobFormScreen({ navigation }) {
  const [form, setForm] = useState({
    title: "",
    wage: "",
    startDate: "",
    endDate: "",
    workDays: "",
    workHours: "",
    industry: "",
    employmentType: "",
    accommodation: false,
    maleRecruitment: "",
    femaleRecruitment: "",
    location: "",
    description: "",
  });

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sendToAll, setSendToAll] = useState(false); //  전체 알림 여부 상태 추가

  const handleNumberInput = (key, value) => {
    if (/^\d*$/.test(value)) {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = async () => {
    for (let key in form) {
      if (form[key] === "" && key !== "description") {
        Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
        return;
      }
    }
  
    if (!sendToAll && (!userSelectionStore.selectedUsers || userSelectionStore.selectedUsers.length === 0)) {
      Alert.alert("알림 대상 선택", "특정 사용자를 선택하거나 전체 알림을 선택해주세요.");
      return;
    }
  
    try {
      const jobData = {
        ...form,
        wage: Number(form.wage),
        maleRecruitment: Number(form.maleRecruitment || 0),
        femaleRecruitment: Number(form.femaleRecruitment || 0),
        workDays: form.workDays
          .split(",")
          .map((day) => day.trim())
          .filter((day) => day !== ""),
        notifyUsers: sendToAll ? "all" : userSelectionStore.selectedUsers,
      };
  
      const response = await axios.post(`${API_BASE_URL}/jobs/add`, jobData);
      console.log("✅ 공고 등록 성공:", response.data);
      Alert.alert("등록 완료", "공고가 성공적으로 등록되었습니다.");
  
      // ✅ 알림 전송
      if (sendToAll) {
        const allUsers = await getAllUsers();
        for (const user of allUsers) {
          if (user.email) {
            await sendUserApplicationApprovalNotification(user.email, form.title);
          }
        }
      } else {
        for (const user of userSelectionStore.selectedUsers) {
          if (user.email) {
            await sendUserApplicationApprovalNotification(user.email, form.title);
          }
        }
      }
  
      // ✅ 테스트 푸시 알림 (에뮬레이터용)
      sendTestNotification(`'${form.title}' 공고가 성공적으로 등록되었습니다.`);
  
      userSelectionStore.clearSelectedUsers();
      navigation.goBack();
    } catch (error) {
      console.error("❌ 공고 등록 API 오류:", error);
      if (error.response) {
        console.log("🔍 서버 응답:", error.response.data);
      }
      Alert.alert("등록 실패", "공고 등록 중 오류가 발생했습니다.");
    }
  };
  
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>공고 등록</Text>

      <Text style={styles.label}>공고 제목</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={(text) => setForm({ ...form, title: text })}
        placeholder="공고 제목 입력"
      />

      <Text style={styles.label}>급여 (숫자만)</Text>
      <TextInput
        style={styles.input}
        value={form.wage}
        keyboardType="numeric"
        onChangeText={(text) => handleNumberInput("wage", text)}
        placeholder="100000"
      />

      <Text style={styles.label}>근무 시작일 (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={form.startDate}
        onChangeText={(text) => setForm({ ...form, startDate: text })}
      />

      <Text style={styles.label}>근무 종료일 (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={form.endDate}
        onChangeText={(text) => setForm({ ...form, endDate: text })}
      />

      <Text style={styles.label}>근무 요일 (쉼표로 구분)</Text>
      <TextInput
        style={styles.input}
        value={form.workDays}
        onChangeText={(text) => setForm({ ...form, workDays: text })}
        placeholder="예: 월, 화, 금"
      />

      <Text style={styles.label}>근무 시간</Text>
      <TextInput
        style={styles.input}
        value={form.workHours}
        onChangeText={(text) => setForm({ ...form, workHours: text })}
        placeholder="예: 09:00 ~ 18:00"
      />

      <Text style={styles.label}>업종</Text>
      <Picker
        selectedValue={form.industry}
        onValueChange={(value) => setForm({ ...form, industry: value })}
        style={styles.picker}
      >
        <Picker.Item label="선택하세요" value="" />
        <Picker.Item label="요식업" value="요식업" />
        <Picker.Item label="서비스업" value="서비스업" />
        <Picker.Item label="물류/창고" value="물류/창고" />
        <Picker.Item label="정비" value="정비" />
        <Picker.Item label="기타" value="기타" />
      </Picker>

      <Text style={styles.label}>고용 형태</Text>
      <Picker
        selectedValue={form.employmentType}
        onValueChange={(value) =>
          setForm({ ...form, employmentType: value })
        }
        style={styles.picker}
      >
        <Picker.Item label="선택하세요" value="" />
        <Picker.Item label="정규직" value="정규직" />
        <Picker.Item label="계약직" value="계약직" />
        <Picker.Item label="장기" value="장기" />
        <Picker.Item label="아르바이트" value="아르바이트" />
      </Picker>

      <Text style={styles.label}>숙식 제공 여부</Text>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          { backgroundColor: form.accommodation ? "#4CAF50" : "#FF3B30" },
        ]}
        onPress={() =>
          setForm({ ...form, accommodation: !form.accommodation })
        }
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          {form.accommodation ? "숙식 제공 O" : "숙식 제공 X"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>모집 인원</Text>
      <View style={styles.recruitmentContainer}>
        <View style={styles.recruitmentBox}>
          <Text>남성</Text>
          <TextInput
            style={styles.input}
            value={form.maleRecruitment}
            keyboardType="numeric"
            onChangeText={(text) =>
              handleNumberInput("maleRecruitment", text)
            }
          />
        </View>
        <View style={styles.recruitmentBox}>
          <Text>여성</Text>
          <TextInput
            style={styles.input}
            value={form.femaleRecruitment}
            keyboardType="numeric"
            onChangeText={(text) =>
              handleNumberInput("femaleRecruitment", text)
            }
          />
        </View>
      </View>

      <Text style={styles.label}>근무 위치</Text>
      <TextInput
        style={styles.input}
        value={form.location}
        onChangeText={(text) => setForm({ ...form, location: text })}
        placeholder="근무지 입력"
      />

      <Text style={styles.label}>상세 설명</Text>
      <TextInput
        style={styles.textArea}
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
        multiline
        placeholder="업무 내용 및 추가 사항"
      />

      {/*  전체 알림 또는 특정 사용자 알림 선택 */}
      <View style={styles.alertTypeContainer}>
        <TouchableOpacity
          style={[
            styles.alertTypeButton,
            sendToAll && { backgroundColor: "#4CAF50" },
          ]}
          onPress={() => setSendToAll(true)}
        >
          <Text style={styles.alertTypeButtonText}>모든 사용자에게 알림</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={[
    styles.alertTypeButton,
    !sendToAll && { backgroundColor: "#4CAF50" },
  ]}
  onPress={() => {
    setSendToAll(false);
    navigation.navigate("UserSelectionScreen");
  }}
>
  <Text style={styles.alertTypeButtonText}>특정 사용자 선택</Text>
</TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>공고 등록</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  picker: { marginTop: 5, borderColor: "#ccc" },
  toggleButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  recruitmentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  recruitmentBox: { flex: 1, marginHorizontal: 5 },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    height: 100,
  },
  alertTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  alertTypeButton: {
    flex: 0.48,
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  alertTypeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

