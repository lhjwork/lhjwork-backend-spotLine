import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const cleanupDatabases = async () => {
  try {
    console.log("🧹 MongoDB 데이터베이스 정리 시작...");

    // MongoDB 연결
    await mongoose.connect("mongodb://localhost:27017");
    console.log("✅ MongoDB 연결 성공!");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("데이터베이스 연결을 확인할 수 없습니다.");
    }

    const adminDb = db.admin();

    // 모든 데이터베이스 목록 조회
    const databases = await adminDb.listDatabases();
    console.log("\n📋 현재 데이터베이스 목록:");
    databases.databases.forEach((db: any, index: number) => {
      console.log(`${index + 1}. ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    // SpotLine 관련 데이터베이스만 필터링
    const spotlineDBs = databases.databases.filter((db: any) => db.name.includes("spotline") || db.name === "mydatabase");

    if (spotlineDBs.length === 0) {
      console.log("❌ SpotLine 관련 데이터베이스를 찾을 수 없습니다.");
      return;
    }

    console.log("\n🎯 SpotLine 관련 데이터베이스:");
    spotlineDBs.forEach((db: any, index: number) => {
      console.log(`${index + 1}. ${db.name}`);
    });

    // 사용자 선택을 위한 안내
    console.log("\n📌 권장 사항:");
    console.log("- spotline: 메인 데이터베이스로 사용 (권장)");
    console.log("- spotline-dev: 개발 전용 데이터베이스");
    console.log("- mydatabase: 테스트용 (삭제 가능)");

    // 자동으로 mydatabase 삭제 (테스트용이므로)
    const testDB = spotlineDBs.find((db: any) => db.name === "mydatabase");
    if (testDB) {
      console.log("\n🗑️ 테스트 데이터베이스 'mydatabase' 삭제 중...");

      // mydatabase로 연결 전환 후 삭제
      await mongoose.connection.useDb("mydatabase");
      await mongoose.connection.dropDatabase();
      console.log("✅ 'mydatabase' 삭제 완료!");
    }

    // 최종 데이터베이스 목록 확인
    const finalDatabases = await adminDb.listDatabases();
    console.log("\n📋 정리 후 데이터베이스 목록:");
    finalDatabases.databases
      .filter((db: any) => db.name.includes("spotline"))
      .forEach((db: any, index: number) => {
        console.log(`${index + 1}. ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
      });

    console.log("\n💡 데이터베이스 선택 가이드:");
    console.log("현재 .env 파일에서 사용할 데이터베이스를 선택하세요:");
    console.log("- 통합 사용: MONGODB_URI=mongodb://localhost:27017/spotline");
    console.log("- 개발 분리: MONGODB_URI=mongodb://localhost:27017/spotline-dev");
  } catch (error) {
    console.error("❌ 데이터베이스 정리 실패:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📡 MongoDB 연결 종료");
    process.exit(0);
  }
};

cleanupDatabases();
