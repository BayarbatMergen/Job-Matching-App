import { registerRootComponent } from 'expo';
import App from './App';

// ✅ 앱 초기화 전 로깅 추가 (디버깅용)
console.log("🚀 앱 초기화 시작");

// ✅ registerRootComponent를 사용하여 App 컴포넌트 등록
registerRootComponent(App);

// ✅ 앱 초기화 완료 로깅
console.log("✅ 앱 초기화 완료");