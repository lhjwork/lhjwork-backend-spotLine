import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/Store";
import DemoStore from "../models/DemoStore";
import Analytics from "../models/Analytics";

dotenv.config();

async function checkSystemStructure() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/spotline");
    console.log("✅ MongoDB 연결 성공");

    console.log("\n🔍 시스템 구조 확인 중...\n");

    // 1. DemoStore 확인 (업주 소개용 데이터)
    const demoStores = await DemoStore.find({});
    console.log("🎭 데모 시스템 (업주 소개용):");
    console.log(`   - DemoStore 컬렉션: ${demoStores.length}개 매장`);

    if (demoStores.length > 0) {
      console.log("   - 데모 매장 목록:");
      demoStores.forEach((store, index) => {
        console.log(`     ${index + 1}. ${store.name} (${store.qrCode.id}) - ${store.location.area}`);
      });
    }

    // 2. Store 확인 (실제 운영 데이터)
    const realStores = await Store.find({});
    console.log("\n🏪 실제 운영 시스템:");
    console.log(`   - Store 컬렉션: ${realStores.length}개 매장`);

    if (realStores.length > 0) {
      console.log("   - 실제 매장 목록:");
      realStores.forEach((store, index) => {
        console.log(`     ${index + 1}. ${store.name} (${store.qrCode.id}) - ${store.location.area}`);
      });
    } else {
      console.log("   ⚠️  실제 운영용 매장이 등록되지 않았습니다.");
      console.log("   💡 Admin에서 실제 매장을 등록해야 합니다.");
    }

    // 3. Analytics 확인 (통계 데이터)
    const analyticsCount = await Analytics.countDocuments({});
    const demoAnalytics = await Analytics.countDocuments({
      referrer: { $regex: /demo/i },
    });
    const realAnalytics = analyticsCount - demoAnalytics;

    console.log("\n📊 통계 데이터:");
    console.log(`   - 전체 Analytics: ${analyticsCount}개`);
    console.log(`   - 데모 관련: ${demoAnalytics}개 (수집되면 안됨)`);
    console.log(`   - 실제 사용: ${realAnalytics}개`);

    // 4. 구조 검증
    console.log("\n✅ 구조 검증 결과:");

    const isStructureCorrect =
      demoStores.length > 0 && // 데모 데이터 존재
      realStores.length === 0; // 실제 데이터 없음 (Admin이 등록해야 함)

    if (isStructureCorrect) {
      console.log("   🎯 구조가 올바릅니다!");
      console.log("   - 데모 데이터: 업주 소개용으로 준비됨");
      console.log("   - 실제 데이터: Admin에서 등록 대기 중");
    } else {
      console.log("   ⚠️  구조 확인이 필요합니다.");
    }

    // 5. QR 코드 ID 중복 확인
    const demoQrIds = demoStores.map((store) => store.qrCode.id);
    const realQrIds = realStores.map((store) => store.qrCode.id);
    const duplicateQrIds = demoQrIds.filter((id) => realQrIds.includes(id));

    console.log("\n🔗 QR 코드 ID 중복 확인:");
    if (duplicateQrIds.length === 0) {
      console.log("   ✅ QR 코드 ID 중복 없음");
    } else {
      console.log("   ⚠️  중복된 QR 코드 ID:", duplicateQrIds);
    }

    // 6. 권장사항
    console.log("\n💡 Admin 개발 권장사항:");
    console.log("   1. 운영 매장 등록 기능 구현");
    console.log("   2. QR 코드 생성 및 관리 기능");
    console.log("   3. 체험/운영 데이터 구분 표시");
    console.log("   4. SpotLine 체험하기 설정 관리 기능");
  } catch (error) {
    console.error("❌ 오류 발생:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 MongoDB 연결 종료");
  }
}

checkSystemStructure();
