import "dotenv/config";

export default {
  expo: {
    name: "job-matching-app",
    slug: "job-matching-app",
    version: "1.0.0",
    entryPoint: "index.js",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.anonymous.jobmatchingapp",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      useBackendAuth: true, // ✅ 백엔드 로그인 사용 (필수)
      firebaseApiKey: process.env.FIREBASE_API_KEY || "AIzaSyAMGE19uGk-A62cRMTWrf164o2XNTTevLI",
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || "jobmatchingapp-383da.firebaseapp.com",
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "jobmatchingapp-383da",
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || "jobmatchingapp-383da.appspot.com",
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "937100963582",
      firebaseAppId: process.env.FIREBASE_APP_ID || "1:937100963582:web:a722b7f770cb3d3db73faf",
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-85K46L7DNP"
    }
  }
};
