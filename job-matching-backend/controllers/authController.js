const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");

// ✅ 현재 로그인한 사용자 정보 반환
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ `user_id` → `userId`로 수정
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

// ✅ 토큰 유효성 검사
const validateToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <토큰>" 형식에서 토큰 추출

    if (!token) {
      return res.status(401).json({ valid: false, message: "❌ 토큰이 제공되지 않았습니다." });
    }

    // ✅ JWT 토큰 검증
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
      role: decoded.role || "user", // ✅ role도 함께 반환 (기본값 user)
    });

  } catch (error) {
    console.error("❌ [validateToken] 오류 발생:", error);
    return res.status(500).json({ valid: false, message: "❌ 서버 오류 발생" });
  }
};

// ✅ 올바른 내보내기 방식 유지
module.exports = { getUserProfile, validateToken };