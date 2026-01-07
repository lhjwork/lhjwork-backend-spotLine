import mongoose from "mongoose";
import dotenv from "dotenv";

// 환경에 따른 .env 파일 로드
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";
dotenv.config({ path: envFile });

async function testConnection(): Promise<void> {
  try {
    console.log("MongoDB 연결 테스트 중...");
    console.log(`환경: ${process.env.NODE_ENV || "development"}`);

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI 환경 변수가 설정되지 않았습니다.");
    }

    // URI에서 비밀번호 부분을 마스킹하여 출력
    const maskedUri = mongoUri.replace(/\/\/.*@/, "//***:***@");
    console.log("연결 URI:", maskedUri);

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB 연결 성공!");

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
    console.error("❌ MongoDB 연결 실패:", errorMessage);

    if (errorMessage.includes("authentication failed")) {
      console.log("💡 해결 방법: 사용자명과 비밀번호를 확인하세요");
    } else if (errorMessage.includes("IP")) {
      console.log("💡 해결 방법: Network Access에서 현재 IP를 허용하세요");
    } else if (errorMessage.includes("ECONNREFUSED")) {
      console.log("💡 해결 방법: 로컬 MongoDB 서버가 실행 중인지 확인하세요");
      console.log("   - MongoDB 설치: https://www.mongodb.com/try/download/community");
      console.log("   - 서버 시작: mongod");
    }
  } finally {
    await mongoose.disconnect();
    console.log("연결 테스트 완료");
  }
}

testConnection();
