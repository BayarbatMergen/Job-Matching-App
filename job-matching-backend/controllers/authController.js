const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");

// ✅ 로그인 함수 추가
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "이메일과 비밀번호를 입력하세요." });
    }

    // Firestore에서 사용자 찾기
    const userQuery = await admin.firestore().collection("users").where("email", "==", email).get();
    if (userQuery.empty) {
      return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data();
    const userId = userDoc.id;

    // 비밀번호 검증 (단순 비교 — 실서비스에선 암호화 확인 필요)
    if (user.password !== password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // ✅ JWT 토큰 생성
    const token = jwt.sign(
      { userId: userId, email: user.email, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Firebase Custom Token 생성
    const firebaseCustomToken = await admin.auth().createCustomToken(userId);

    res.json({
      message: "✅ 로그인 성공!",
      token, // 기존 JWT 토큰
      firebaseToken: firebaseCustomToken, // ✅ Firebase Custom Token 추가
      user: {
        userId,
        email: user.email,
        name: user.name,
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("❌ [로그인 실패]:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// ✅ 기존 함수들 유지
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: "❌ 사용자 ID가 없습니다!" });
    }

    const userRef = admin.firestore().collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "❌ 사용자 정보를 찾을 수 없습니다!" });
    }

    res.status(200).json({ user: userSnap.data() });
  } catch (error) {
    console.error("❌ [getUserProfile] 사용자 정보 조회 실패:", error);
    res.status(500).json({ message: "❌ 서버 오류 발생" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.userId;

    if (!newPassword) {
      return res.status(400).json({ message: "새 비밀번호를 입력하세요." });
    }

    await admin.auth().updateUser(userId, { password: newPassword });
    res.status(200).json({ message: "비밀번호 변경 완료!" });
  } catch (error) {
    console.error("❌ 비밀번호 변경 실패:", error);
    res.status(500).json({ message: "비밀번호 변경 실패" });
  }
};

const validateToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ valid: false, message: "❌ 토큰이 제공되지 않았습니다." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ valid: false, message: "❌ 토큰이 유효하지 않습니다." });
    }

    console.log("✅ 토큰 검증 완료:", decoded);
    return res.json({
      valid: true,
      userId: decoded.userId,
      role: decoded.role || "user",
    });
  } catch (error) {
    console.error("❌ [validateToken] 오류 발생:", error);
    return res.status(500).json({ valid: false, message: "❌ 서버 오류 발생" });
  }
};

// ✅ 내보내기
module.exports = { login, getUserProfile, validateToken, changePassword };
