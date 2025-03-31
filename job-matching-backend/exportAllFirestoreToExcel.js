const admin = require('firebase-admin');
const XLSX = require('xlsx');
const fs = require('fs');

// Firebase 서비스 계정 키 경로 (네가 사용하는 경로로 바꿔줘)
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportAllCollections() {
  try {
    const collections = await db.listCollections();
    for (const collection of collections) {
      const snapshot = await collection.get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, collection.id);

        const fileName = `${collection.id}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        console.log(` ${fileName} 내보내기 완료`);
      } else {
        console.log(` 컬렉션 \"${collection.id}\" 에는 데이터가 없습니다.`);
      }
    }
    console.log('🎉 모든 컬렉션 내보내기 완료!');
  } catch (error) {
    console.error(' 내보내기 중 오류 발생:', error);
  }
}

exportAllCollections();
