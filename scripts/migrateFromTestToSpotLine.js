const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB 연결 URI (환경변수에서 가져오기)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://spotline-user:v0G1clW384dxjUQo@spotline.xcbj77w.mongodb.net/?appName=spotLine';

// 데이터베이스 이름
const SOURCE_DB = 'test';
const TARGET_DB = 'spotLine';

// 마이그레이션할 컬렉션 목록 (이미지에서 확인된 컬렉션들)
const COLLECTIONS_TO_MIGRATE = [
  'admins',
  'analytics', 
  'demorecommendations',
  'demostores',
  'experienceconfigs',
  'qrcodes',
  'recommendations',
  'stores'
];

async function migrateData() {
  let client;
  
  try {
    console.log('🔄 MongoDB 연결 중...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const sourceDb = client.db(SOURCE_DB);
    const targetDb = client.db(TARGET_DB);
    
    console.log(`✅ 연결 성공: ${SOURCE_DB} → ${TARGET_DB}`);
    
    // 각 컬렉션별로 데이터 마이그레이션
    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      try {
        console.log(`\n📦 ${collectionName} 컬렉션 마이그레이션 시작...`);
        
        const sourceCollection = sourceDb.collection(collectionName);
        const targetCollection = targetDb.collection(collectionName);
        
        // 소스 컬렉션의 모든 문서 가져오기
        const documents = await sourceCollection.find({}).toArray();
        
        if (documents.length === 0) {
          console.log(`⚠️  ${collectionName}: 마이그레이션할 데이터가 없습니다.`);
          continue;
        }
        
        // 타겟 컬렉션에 기존 데이터가 있는지 확인
        const existingCount = await targetCollection.countDocuments();
        
        if (existingCount > 0) {
          console.log(`⚠️  ${collectionName}: 타겟에 ${existingCount}개의 기존 데이터가 있습니다.`);
          console.log(`   기존 데이터를 삭제하고 새로 삽입합니다...`);
          
          // 기존 데이터 삭제
          await targetCollection.deleteMany({});
          console.log(`🗑️  ${collectionName}: 기존 데이터 삭제 완료`);
        }
        
        // 새 데이터 삽입
        const result = await targetCollection.insertMany(documents);
        console.log(`✅ ${collectionName}: ${result.insertedCount}개 문서 마이그레이션 완료`);
        
      } catch (error) {
        console.error(`❌ ${collectionName} 마이그레이션 실패:`, error.message);
      }
    }
    
    console.log('\n🎉 모든 데이터 마이그레이션이 완료되었습니다!');
    
    // 마이그레이션 결과 요약
    console.log('\n📊 마이그레이션 결과 요약:');
    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      try {
        const targetCollection = targetDb.collection(collectionName);
        const count = await targetCollection.countDocuments();
        console.log(`   ${collectionName}: ${count}개 문서`);
      } catch (error) {
        console.log(`   ${collectionName}: 확인 실패`);
      }
    }
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB 연결 종료');
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  console.log('🚀 Test → SpotLine 데이터 마이그레이션 시작');
  console.log(`📍 소스: ${SOURCE_DB}`);
  console.log(`📍 타겟: ${TARGET_DB}`);
  console.log(`📋 마이그레이션할 컬렉션: ${COLLECTIONS_TO_MIGRATE.join(', ')}`);
  
  migrateData()
    .then(() => {
      console.log('\n✨ 마이그레이션 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 마이그레이션 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { migrateData };