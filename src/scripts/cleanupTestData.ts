import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/Store";
import Analytics from "../models/Analytics";

dotenv.config();

async function cleanupTestData() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/spotline");
    console.log("✅ MongoDB 연결 성공");

    console.log("\n🧹 테스트 데이터 정리 중...\n");

    // 1. Store 컬렉션의 테스트 데이터 확인
    const testStores = await Store.find({});
    console.log(`📋 현재 Store 컬렉션에 ${testStores.length}개 매장이 있습니다:`);

    testStores.forEach((store, index) => {
      console.log(`   ${index + 1}. ${store.name} (${store.qrCode.id})`);
    });

    console.log("\n⚠️  이 데이터들은 테스트용 데이터입니다.");
    console.log("💡 실제 운영을 위해서는 Admin에서 새로 등록해야 합니다.");

    // 2. Store 컬렉션 비우기
    const deleteResult = await Store.deleteMany({});
    console.log(`\n🗑️  Store 컬렉션에서 ${deleteResult.deletedCount}개 매장을 삭제했습니다.`);

    // 3. 관련 Analytics 데이터도 정리
    const analyticsResult = await Analytics.deleteMany({
      eventType: { $in: ["page_enter", "page_exit", "recommendation_click"] },
    });
    console.log(`📊 관련 Analytics 데이터 ${analyticsResult.deletedCount}개를 삭제했습니다.`);

    // 4. 최종 확인
    const remainingStores = await Store.countDocuments({});
    const remainingAnalytics = await Analytics.countDocuments({});

    console.log("\n✅ 정리 완료:");
    console.log(`   - Store 컬렉션: ${remainingStores}개 (비어있어야 함)`);
    console.log(`   - Analytics 컬렉션: ${remainingAnalytics}개`);

    console.log("\n🎯 이제 올바른 구조입니다:");
    console.log("   - DemoStore: 업주 소개용 데이터 (유지)");
    console.log("   - Store: 비어있음 (Admin에서 실제 매장 등록 대기)");
    console.log("   - Analytics: 정리됨");

    console.log("\n💡 다음 단계:");
    console.log("   1. Admin에서 실제 운영할 매장들을 등록");
    console.log("   2. 실제 QR 코드 생성 및 배포");
    console.log("   3. 체험하기 설정 구성");
  } catch (error) {
    console.error("❌ 오류 발생:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 MongoDB 연결 종료");
  }
}

cleanupTestData();
