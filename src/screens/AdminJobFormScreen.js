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
import { db } from "../config/firebase"; // ✅ Firestore 가져오기
import { collection, addDoc } from "firebase/firestore";

export default function AdminJobFormScreen({ navigation }) {
  const [form, setForm] = useState({
    title: "",
    wage: "",
    workPeriod: "",
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

  // 🔹 숫자 입력 검증
  const handleNumberInput = (key, value) => {
    if (/^\d*$/.test(value)) {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  // 🔹 Firebase Firestore에 공고 등록
  const handleSubmit = async () => {
    for (let key in form) {
      if (form[key] === "") {
        Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
        return;
      }
    }

    try {
      const docRef = await addDoc(collection(db, "jobs"), {
        ...form,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("등록 완료", "공고가 성공적으로 등록되었습니다.");
      console.log("✅ 공고 등록 성공:", docRef.id);
      navigation.goBack();
    } catch (error) {
      console.error("❌ 공고 등록 오류:", error);
      Alert.alert("등록 실패", "공고 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>공고 등록</Text>

      <Text style={styles.label}>제목</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={(text) => setForm({ ...form, title: text })}
        placeholder="공고 제목 입력"
      />

      <Text style={styles.label}>급여</Text>
      <TextInput
        style={styles.input}
        value={form.wage}
        keyboardType="numeric"
        onChangeText={(text) => handleNumberInput("wage", text)}
        placeholder="급여 입력 (숫자만)"
      />

      <Text style={styles.label}>근무 기간</Text>
      <TextInput
        style={styles.input}
        value={form.workPeriod}
        onChangeText={(text) => setForm({ ...form, workPeriod: text })}
        placeholder="YYYY-MM-DD ~ YYYY-MM-DD"
      />

      <Text style={styles.label}>근무 요일</Text>
      <TextInput
        style={styles.input}
        value={form.workDays}
        onChangeText={(text) => setForm({ ...form, workDays: text })}
        placeholder="예: 월, 수, 금"
      />

      <Text style={styles.label}>근무 시간</Text>
      <TextInput
        style={styles.input}
        value={form.workHours}
        onChangeText={(text) => setForm({ ...form, workHours: text })}
        placeholder="예: 09:00 - 18:00"
      />

      <Text style={styles.label}>업직종</Text>
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
        onValueChange={(value) => setForm({ ...form, employmentType: value })}
        style={styles.picker}
      >
        <Picker.Item label="선택하세요" value="" />
        <Picker.Item label="정규직" value="정규직" />
        <Picker.Item label="계약직" value="계약직" />
        <Picker.Item label="장기" value="장기" />
        <Picker.Item label="아르바이트" value="아르바이트" />
        <Picker.Item label="기타" value="기타" />
      </Picker>

      <Text style={styles.label}>숙식 제공 여부</Text>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setForm({ ...form, accommodation: !form.accommodation })}
      >
        <Text>{form.accommodation ? "숙식 제공 O" : "숙식 제공 X"}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>모집 인원</Text>
      <View style={styles.recruitmentContainer}>
        <View style={styles.recruitmentBox}>
          <Text style={styles.recruitmentLabel}>남성 모집 인원</Text>
          <TextInput
            style={styles.input}
            value={form.maleRecruitment}
            keyboardType="numeric"
            onChangeText={(text) => handleNumberInput("maleRecruitment", text)}
            placeholder="남성 모집 인원 (숫자만)"
          />
        </View>
        <View style={styles.recruitmentBox}>
          <Text style={styles.recruitmentLabel}>여성 모집 인원</Text>
          <TextInput
            style={styles.input}
            value={form.femaleRecruitment}
            keyboardType="numeric"
            onChangeText={(text) => handleNumberInput("femaleRecruitment", text)}
            placeholder="여성 모집 인원 (숫자만)"
          />
        </View>
      </View>

      <Text style={styles.label}>근무 지역</Text>
      <TextInput
        style={styles.input}
        value={form.location}
        onChangeText={(text) => setForm({ ...form, location: text })}
        placeholder="근무 지역 입력"
      />

      <Text style={styles.label}>상세 요강</Text>
      <TextInput
        style={styles.textArea}
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
        placeholder="상세 요강 입력"
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>공고 등록</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginTop: 5 },
  picker: { marginTop: 5, borderColor: "#ccc", borderWidth: 1 },
  toggleButton: { padding: 10, borderWidth: 1, borderRadius: 8, marginTop: 5, alignItems: "center" },
  recruitmentContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  recruitmentBox: { flex: 1, marginHorizontal: 5 },
  textArea: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginTop: 5, height: 80 },
  submitButton: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  submitButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
