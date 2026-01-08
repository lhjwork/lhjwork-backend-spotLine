import mongoose from "mongoose";
import dotenv from "dotenv";
import DemoStore from "../models/DemoStore";
import QRCode from "../models/QRCode";

dotenv.config();

const migrateDemoStores = async (): Promise<void> => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/spotline");
    console.log("MongoDB 연결 성공");

    console.log("🔄 데모 매장 QR 코드 마이그레이션 시작...");

    // 데모 매장 데이터 조회
    const demoStores = await DemoStore.find({});
    console.log(`📊 총 ${demoStores.length}개의 데모 매장 발견`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const store of demoStores) {
      try {
        // 데모 매장의 QR 코드 정보가 있는 경우에만 마이그레이션
        if (store.qrCode && store.qrCode.id) {
          // QR 코드가 이미 존재하는지 확인
          const existingQR = await QRCode.findOne({ qrId: store.qrCode.id });

          if (!existingQR) {
            // 새로운 QR 코드 생성 (데모용)
            const newQRCode = new QRCode({
              qrId: store.qrCode.id,
              storeId: store._id,
              isActive: store.qrCode.isActive,
              scanCount: 0,
              metadata: {
                purpose: "demo",
                location: store.location.area || "demo",
                campaign: "demo_showcase",
              },
            });

            await newQRCode.save();

            console.log(`✅ 데모 매장 "${store.name}" QR 코드 마이그레이션 완료: ${store.qrCode.id}`);
            migratedCount++;
          } else {
            console.log(`⏭️  데모 매장 "${store.name}" QR 코드 이미 존재: ${store.qrCode.id}`);
            skippedCount++;
          }
        } else {
          console.log(`⚠️  데모 매장 "${store.name}" QR 코드 정보 없음`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ 데모 매장 "${store.name}" 마이그레이션 실패:`, error);
      }
    }

    console.log("\n📋 데모 매장 마이그레이션 결과:");
    console.log(`- 성공: ${migratedCount}개`);
    console.log(`- 건너뜀: ${skippedCount}개`);
    console.log(`- 총 처리: ${migratedCount + skippedCount}개`);

    // 마이그레이션 결과 검증
    console.log("\n🔍 데모 QR 코드 검증...");

    const demoQRCodes = await QRCode.find({
      "metadata.purpose": "demo",
    }).populate("storeId");

    console.log(`- 데모 QR 코드: ${demoQRCodes.length}개`);

    if (demoQRCodes.length > 0) {
      console.log("\n🧪 샘플 데모 QR 코드:");
      const sampleQR = demoQRCodes[0];
      console.log(`- QR ID: ${sampleQR.qrId}`);
      console.log(`- 매장 ID: ${sampleQR.storeId}`);
      console.log(`- 용도: ${sampleQR.metadata?.purpose}`);
      console.log(`- 스캔 횟수: ${sampleQR.scanCount}`);
    }

    console.log("\n✅ 데모 매장 QR 코드 마이그레이션 완료!");
  } catch (error) {
    console.error("❌ 데모 매장 마이그레이션 실패:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB 연결 종료");
  }
};

// 스크립트 실행
if (require.main === module) {
  migrateDemoStores();
}

export default migrateDemoStores;
