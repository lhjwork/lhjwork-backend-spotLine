import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/Store";

dotenv.config();

const checkStoreQRs = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/spotline";
    console.log(`📡 MongoDB 연결 중: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB 연결 성공!");

    const stores = await Store.find({}).select("_id name qrCode");
    console.log(`🏪 매장 수: ${stores.length}`);

    console.log("\n📋 매장별 ID 정보:");
    for (const store of stores) {
      console.log(`- ${store.name}:`);
      console.log(`  MongoDB ID: ${store._id}`);
      console.log(`  QR Code ID: ${store.qrCode.id}`);
    }

    // UUID 형태의 요청 테스트
    const testUUID = "6ccbb682-df55-4566-ac30-703ddb5cfb7f";
    console.log(`\n🔍 UUID 테스트: ${testUUID}`);

    // ObjectId로 변환 시도
    try {
      const objectId = new mongoose.Types.ObjectId(testUUID);
      console.log(`  ObjectId 변환 성공: ${objectId}`);
    } catch (error) {
      console.log(`  ObjectId 변환 실패: ${testUUID}는 유효한 ObjectId가 아닙니다`);
    }

    await mongoose.disconnect();
    console.log("\n📡 MongoDB 연결 종료");
  } catch (error) {
    console.error("❌ 오류:", error);
    process.exit(1);
  }
};

checkStoreQRs();
