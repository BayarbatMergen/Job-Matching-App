const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
console.log("✅ .env 환경 변수 로딩 완료");

const app = express();

// ✅ Middleware
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Cloudinary env check
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("❌ Cloudinary 환경 변수 누락!");
} else {
  console.log("✅ Cloudinary 설정 완료:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: "OK",
    api_secret: "OK",
  });
}

// ✅ 라우터
const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const jobSeekerRoutes = require("./routes/jobSeekerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/jobseekers", jobSeekerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api", applicationRoutes);

app.get("/api/ping", (req, res) => {
  res.send("✅ pong from Firebase Functions!");
});

app.get("/", (req, res) => {
  res.send("📱 Firebase Functions에서 실행 중: Job Matching Backend");
});

// ✅ export ONLY, DO NOT listen here
module.exports = app;
