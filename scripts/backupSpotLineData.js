const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB 연결 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://spotline-user:v0G1clW384dxjUQo@spotline.xcbj77w.mongodb.net/?appName=spotLine';
const TARGET_DB = 'spotLine';

async function backupSpotLineData() {
  let client;
  
  try {
    console.log('🔄 MongoDB 연결 중...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(TARGET_DB);
    
    // 백업 디렉토리 생성
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `spotLine-backup-${timestamp}.json`);
    
    console.log(`📦 ${TARGET_DB} 데이터베이스 백업 중...`);
    
    // 모든 컬렉션 목록 가져오기
    const collections = await db.listCollections().toArray();
    const backup = {};
    
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`   📄 ${collectionName} 백업 중...`);
      
      const documents = await db.collection(collectionName).find({}).toArray();
      backup[collectionName] = documents;
      
      console.log(`   ✅ ${collectionName}: ${documents.length}개 문서 백업 완료`);
    }
    
    // 백업 파일 저장
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log(`\n🎉 백업 완료!`);
    console.log(`📁 백업 파일: ${backupFile}`);
    
    // 백업 요약
    console.log('\n📊 백업 요약:');
    for (const [collectionName, documents] of Object.entries(backup)) {
      console.log(`   ${collectionName}: ${documents.length}개 문서`);
    }
    
  } catch (error) {
    console.error('❌ 백업 실패:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB 연결 종료');
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  console.log('🚀 SpotLine 데이터베이스 백업 시작');
  
  backupSpotLineData()
    .then(() => {
      console.log('\n✨ 백업 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 백업 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { backupSpotLineData };