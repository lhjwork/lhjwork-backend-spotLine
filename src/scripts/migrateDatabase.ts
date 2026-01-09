import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// 소스와 타겟 데이터베이스 연결 설정
const sourceUri = "mongodb+srv://spotline-user:v0G1clW384dxjUQo@spotline.xcbj77w.mongodb.net/test";
const targetUri = "mongodb+srv://spotline-user:v0G1clW384dxjUQo@spotline.xcbj77w.mongodb.net/spotLine";

async function migrateDatabase() {
  try {
    console.log("🚀 데이터베이스 마이그레이션을 시작합니다...");

    // 소스 데이터베이스 연결
    const sourceConnection = await mongoose.createConnection(sourceUri);
    console.log("✅ 소스 데이터베이스(test) 연결 성공");

    // 타겟 데이터베이스 연결
    const targetConnection = await mongoose.createConnection(targetUri);
    console.log("✅ 타겟 데이터베이스(spotLine) 연결 성공");

    // 소스 데이터베이스의 모든 컬렉션 목록 가져오기
    const collections = await sourceConnection.db!.listCollections().toArray();
    console.log(`📋 발견된 컬렉션: ${collections.map((c) => c.name).join(", ")}`);

    // 각 컬렉션별로 데이터 복사
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`\n📦 ${collectionName} 컬렉션 복사 중...`);

      // 소스 컬렉션에서 모든 데이터 가져오기
      const sourceCollection = sourceConnection.db!.collection(collectionName);
      const documents = await sourceCollection.find({}).toArray();

      console.log(`   📊 ${documents.length}개 문서 발견`);

      if (documents.length > 0) {
        // 타겟 컬렉션에 데이터 삽입
        const targetCollection = targetConnection.db!.collection(collectionName);

        // 기존 데이터가 있다면 삭제 (선택사항)
        await targetCollection.deleteMany({});

        // 새 데이터 삽입
        await targetCollection.insertMany(documents);
        console.log(`   ✅ ${collectionName} 복사 완료 (${documents.length}개 문서)`);
      } else {
        console.log(`   ⚠️  ${collectionName}은 비어있습니다`);
      }
    }

    console.log("\n🎉 모든 데이터 마이그레이션이 완료되었습니다!");

    // 연결 종료
    await sourceConnection.close();
    await targetConnection.close();
  } catch (error) {
    console.error("❌ 마이그레이션 중 오류 발생:", error);
  }
}

// 스크립트 실행
migrateDatabase();
