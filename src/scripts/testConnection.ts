import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function testConnection(): Promise<void> {
  try {
    console.log("MongoDB Atlas 연결 테스트 중...");
    console.log("연결 URI:", process.env.MONGODB_URI?.replace(/\/\/.*@/, "//***:***@"));

    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("✅ MongoDB Atlas 연결 성공!");

    // 간단한 테스트 쿼리
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(
        "📁 사용 가능한 컬렉션:",
        collections.map((c) => c.name)
      );
    }

    // 연결 정보 출력
    console.log("🌐 연결된 데이터베이스:", mongoose.connection.name);
    console.log("🏠 호스트:", mongoose.connection.host);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("❌ MongoDB Atlas 연결 실패:", errorMessage);

    if (errorMessage.includes("authentication failed")) {
      console.log("💡 해결 방법: 사용자명과 비밀번호를 확인하세요");
    } else if (errorMessage.includes("IP")) {
      console.log("💡 해결 방법: Network Access에서 현재 IP를 허용하세요");
    }
  } finally {
    await mongoose.disconnect();
    console.log("연결 테스트 완료");
  }
}

testConnection();
