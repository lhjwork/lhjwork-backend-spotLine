import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/Store";
import QRCode from "../models/QRCode";

dotenv.config();

const migrateToStoreIdStructure = async (): Promise<void> => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/spotline");
    console.log("MongoDB 연결 성공");

    console.log("🔄 매장 ID 기반 구조로 마이그레이션 시작...");

    // 1. 기존 Store 데이터 조회
    const stores = await Store.find({});
    console.log(`📊 총 ${stores.length}개의 매장 발견`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const store of stores) {
      try {
        // 기존 QR 코드 정보가 있는 경우에만 마이그레이션
        if (store.qrCode && store.qrCode.id) {
          // QR 코드가 이미 존재하는지 확인
          const existingQR = await QRCode.findOne({ qrId: store.qrCode.id });

          if (!existingQR) {
            // 새로운 QR 코드 생성
            const newQRCode = new QRCode({
              qrId: store.qrCode.id,
              storeId: store._id,
              isActive: store.qrCode.isActive,
              scanCount: 0,
              metadata: {
                purpose: "migration",
                location: store.location.area || "unknown",
              },
            });

            await newQRCode.save();

            // Store의 qrCodes 배열에 추가
            await Store.findByIdAndUpdate(store._id, {
              $push: { qrCodes: newQRCode._id },
            });

            console.log(`✅ 매장 "${store.name}" QR 코드 마이그레이션 완료: ${store.qrCode.id}`);
            migratedCount++;
          } else {
            console.log(`⏭️  매장 "${store.name}" QR 코드 이미 존재: ${store.qrCode.id}`);
            skippedCount++;
          }
        } else {
          console.log(`⚠️  매장 "${store.name}" QR 코드 정보 없음`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ 매장 "${store.name}" 마이그레이션 실패:`, error);
      }
    }

    console.log("\n📋 마이그레이션 결과:");
    console.log(`- 성공: ${migratedCount}개`);
    console.log(`- 건너뜀: ${skippedCount}개`);
    console.log(`- 총 처리: ${migratedCount + skippedCount}개`);

    // 2. 마이그레이션 결과 검증
    console.log("\n🔍 마이그레이션 결과 검증...");

    const totalQRCodes = await QRCode.countDocuments();
    const activeQRCodes = await QRCode.countDocuments({ isActive: true });

    console.log(`- 총 QR 코드: ${totalQRCodes}개`);
    console.log(`- 활성 QR 코드: ${activeQRCodes}개`);

    // 3. 샘플 QR 코드 테스트
    console.log("\n🧪 샘플 QR 코드 테스트...");
    const sampleQR = await QRCode.findOne().populate("storeId");
    if (sampleQR) {
      console.log(`- QR ID: ${sampleQR.qrId}`);
      console.log(`- 매장 ID: ${sampleQR.storeId}`);
      console.log(`- 매장명: ${(sampleQR.storeId as any)?.name || "N/A"}`);
      console.log(`- 스캔 횟수: ${sampleQR.scanCount}`);
    }

    console.log("\n✅ 매장 ID 기반 구조 마이그레이션 완료!");
  } catch (error) {
    console.error("❌ 마이그레이션 실패:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB 연결 종료");
  }
};

// 스크립트 실행
if (require.main === module) {
  migrateToStoreIdStructure();
}

export default migrateToStoreIdStructure;
