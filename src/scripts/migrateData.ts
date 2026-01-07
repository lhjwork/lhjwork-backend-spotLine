import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const migrateData = async () => {
  try {
    console.log("🔄 데이터 마이그레이션 시작...");

    // 소스 데이터베이스 연결 (spotline)
    const sourceConnection = await mongoose.createConnection("mongodb://localhost:27017/spotline");
    console.log("✅ 소스 데이터베이스 (spotline) 연결 성공!");

    // 타겟 데이터베이스 연결 (spotline-dev)
    const targetConnection = await mongoose.createConnection("mongodb://localhost:27017/spotline-dev");
    console.log("✅ 타겟 데이터베이스 (spotline-dev) 연결 성공!");

    // 연결 확인
    if (!sourceConnection.db) {
      throw new Error("소스 데이터베이스 연결을 확인할 수 없습니다.");
    }
    if (!targetConnection.db) {
      throw new Error("타겟 데이터베이스 연결을 확인할 수 없습니다.");
    }

    // 소스 데이터베이스의 컬렉션 목록 조회
    const sourceCollections = await sourceConnection.db.listCollections().toArray();
    console.log(`📁 소스 데이터베이스 컬렉션: ${sourceCollections.map((c) => c.name).join(", ")}`);

    if (sourceCollections.length === 0) {
      console.log("❌ 소스 데이터베이스에 컬렉션이 없습니다.");
      return;
    }

    // 각 컬렉션 데이터 복사
    for (const collection of sourceCollections) {
      const collectionName = collection.name;
      console.log(`\n📋 컬렉션 '${collectionName}' 마이그레이션 중...`);

      // 소스에서 데이터 조회
      const sourceData = await sourceConnection.db.collection(collectionName).find({}).toArray();
      console.log(`   - 소스 데이터 개수: ${sourceData.length}`);

      if (sourceData.length > 0) {
        // 타겟에 기존 데이터가 있다면 삭제
        await targetConnection.db.collection(collectionName).deleteMany({});

        // 새 데이터 삽입
        await targetConnection.db.collection(collectionName).insertMany(sourceData);
        console.log(`   - ✅ ${sourceData.length}개 데이터 복사 완료`);
      } else {
        console.log(`   - ⚠️ 복사할 데이터가 없습니다`);
      }
    }

    // 마이그레이션 결과 확인
    console.log("\n📊 마이그레이션 결과:");
    const targetCollections = await targetConnection.db.listCollections().toArray();

    for (const collection of targetCollections) {
      const count = await targetConnection.db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count}개 문서`);
    }

    console.log("\n🎉 데이터 마이그레이션 완료!");
    console.log("이제 .env 파일에서 다음 설정을 사용할 수 있습니다:");
    console.log("MONGODB_URI=mongodb://localhost:27017/spotline-dev");

    // 연결 종료
    await sourceConnection.close();
    await targetConnection.close();
  } catch (error) {
    console.error("❌ 데이터 마이그레이션 실패:", error);
  } finally {
    process.exit(0);
  }
};

migrateData();
