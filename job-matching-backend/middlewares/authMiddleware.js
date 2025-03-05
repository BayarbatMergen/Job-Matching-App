const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const admin = require('firebase-admin');

// ✅ 통합된 인증 미들웨어 (Firebase & JWT)
const authenticateToken = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("❌ [인증 실패] Authorization 헤더가 없습니다.");
        return res.status(401).json({ message: "❌ 인증 토큰이 없습니다." });
      }
  
      // ✅ "Bearer " 제거 후 토큰 추출
      const token = authHeader.split(" ")[1];
      console.log("🔎 [인증 시도] 받은 토큰:", token);
  
      let decodedToken;
  
      try {
        // ✅ 1️⃣ Firebase ID 토큰 검증 (Firebase 인증 사용)
        decodedToken = await admin.auth().verifyIdToken(token);
        console.log("✅ [Firebase 인증 성공] 사용자 정보:", decodedToken);
      } catch (firebaseError) {
        console.warn("⚠️ Firebase ID 토큰 검증 실패. JWT로 재검증 시도...");
        try {
          // ✅ 2️⃣ JWT 토큰 검증 (백엔드 자체 발급 토큰)
          decodedToken = jwt.verify(token, SECRET_KEY);
          console.log("✅ [JWT 인증 성공] 사용자 정보:", decodedToken);
        } catch (jwtError) {
          console.error("❌ [JWT 검증 실패]:", jwtError.message);
          return res.status(403).json({ message: "❌ 유효하지 않은 토큰입니다." });
        }
      }
  
      if (!decodedToken || !decodedToken.email) {
        return res.status(401).json({ message: "❌ 유효하지 않은 인증 정보입니다." });
      }
  
      // ✅ 사용자 정보를 요청 객체(req)에 추가
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("❌ 인증 오류:", error.message);
      return res.status(403).json({ message: "❌ 인증 실패: " + error.message });
    }
  };
  
const authMiddleware = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "❌ 인증 토큰이 없습니다." });
      }
  
      const token = authHeader.split(" ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
  
      if (!decodedToken) {
        return res.status(401).json({ message: "❌ 유효하지 않은 토큰입니다." });
      }
  
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("❌ 인증 오류:", error);
      return res.status(403).json({ message: "❌ 인증 실패: " + error.message });
    }
  };


module.exports = authenticateToken;
