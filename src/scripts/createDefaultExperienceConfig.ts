import mongoose from "mongoose";
import dotenv from "dotenv";
import ExperienceConfig from "../models/ExperienceConfig";
import Admin from "../models/Admin";
import Store from "../models/Store";

dotenv.config();

const createDefaultExperienceConfig = async () => {
  try {
    console.log("🎯 기본 체험 설정 생성 시작...");

    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/spotline";
    console.log(`📡 MongoDB 연결 중: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB 연결 성공!");

    // 관리자 계정 확인
    const admin = await Admin.findOne({ username: "spotline-admin" });
    if (!admin) {
      console.log("❌ spotline-admin 계정을 찾을 수 없습니다.");
      process.exit(1);
    }

    // 사용 가능한 매장 QR 코드 조회
    const stores = await Store.find({ isActive: true }).select("name qrCode.id location.area");
    console.log(`🏪 활성 매장 수: ${stores.length}`);

    const gangnamStores = stores.filter((s) => s.location.area === "강남").map((s) => s.qrCode.id);
    const hongdaeStores = stores.filter((s) => s.location.area === "홍대입구").map((s) => s.qrCode.id);
    const allStoreQrIds = stores.map((s) => s.qrCode.id);

    console.log(`📍 강남 매장: ${gangnamStores.length}개`);
    console.log(`📍 홍대 매장: ${hongdaeStores.length}개`);

    // 기존 설정 확인
    const existingConfigs = await ExperienceConfig.find({});
    console.log(`⚙️ 기존 체험 설정: ${existingConfigs.length}개`);

    // 1. 기본 고정 설정 (카페 스팟라인)
    const fixedConfig = await ExperienceConfig.findOneAndUpdate(
      { name: "기본 체험 (카페 스팟라인)" },
      {
        name: "기본 체험 (카페 스팟라인)",
        description: "대표 매장인 카페 스팟라인으로 고정 안내",
        type: "fixed",
        isActive: true,
        isDefault: true,
        settings: {
          fixedStoreQrId: "cafe_gangnam_001",
        },
        priority: 100,
        createdBy: admin._id,
        updatedBy: admin._id,
      },
      { upsert: true, new: true }
    );
    console.log("✅ 기본 고정 설정 생성/업데이트 완료");

    // 2. 랜덤 체험 설정
    const randomConfig = await ExperienceConfig.findOneAndUpdate(
      { name: "랜덤 체험" },
      {
        name: "랜덤 체험",
        description: "모든 활성 매장 중 랜덤 선택",
        type: "random",
        isActive: true,
        isDefault: false,
        settings: {
          randomStoreQrIds: allStoreQrIds,
        },
        priority: 80,
        createdBy: admin._id,
        updatedBy: admin._id,
      },
      { upsert: true, new: true }
    );
    console.log("✅ 랜덤 체험 설정 생성/업데이트 완료");

    // 3. 지역별 체험 설정
    const areaConfig = await ExperienceConfig.findOneAndUpdate(
      { name: "지역별 체험" },
      {
        name: "지역별 체험",
        description: "강남과 홍대 지역을 균등하게 안내",
        type: "area_based",
        isActive: true,
        isDefault: false,
        settings: {
          areaSettings: {
            gangnam: {
              enabled: true,
              storeQrIds: gangnamStores,
              weight: 1,
            },
            hongdae: {
              enabled: true,
              storeQrIds: hongdaeStores,
              weight: 1,
            },
            itaewon: {
              enabled: false,
              storeQrIds: [],
              weight: 1,
            },
            myeongdong: {
              enabled: false,
              storeQrIds: [],
              weight: 1,
            },
          },
        },
        priority: 70,
        createdBy: admin._id,
        updatedBy: admin._id,
      },
      { upsert: true, new: true }
    );
    console.log("✅ 지역별 체험 설정 생성/업데이트 완료");

    // 4. 가중치 기반 체험 설정 (카페 위주)
    const weightedConfig = await ExperienceConfig.findOneAndUpdate(
      { name: "카페 중심 체험" },
      {
        name: "카페 중심 체험",
        description: "카페 매장에 높은 가중치를 부여",
        type: "weighted",
        isActive: true,
        isDefault: false,
        settings: {
          weightedStores: [
            { qrId: "cafe_gangnam_001", weight: 3, enabled: true },
            { qrId: "cafe_hongdae_001", weight: 3, enabled: true },
            { qrId: "culture_gangnam_001", weight: 2, enabled: true },
            { qrId: "dessert_gangnam_001", weight: 1, enabled: true },
            { qrId: "gallery_gangnam_001", weight: 1, enabled: true },
            { qrId: "food_hongdae_001", weight: 1, enabled: true },
            { qrId: "record_hongdae_001", weight: 1, enabled: true },
          ],
        },
        priority: 60,
        createdBy: admin._id,
        updatedBy: admin._id,
      },
      { upsert: true, new: true }
    );
    console.log("✅ 가중치 기반 체험 설정 생성/업데이트 완료");

    // 5. 시간대별 체험 설정
    const timeBasedConfig = await ExperienceConfig.findOneAndUpdate(
      { name: "시간대별 체험" },
      {
        name: "시간대별 체험",
        description: "시간대에 따라 적합한 매장 안내",
        type: "area_based",
        isActive: false, // 기본적으로 비활성화
        isDefault: false,
        settings: {
          areaSettings: {
            gangnam: {
              enabled: true,
              storeQrIds: gangnamStores,
              weight: 1,
            },
            hongdae: {
              enabled: true,
              storeQrIds: hongdaeStores,
              weight: 1,
            },
          },
          timeBasedSettings: {
            enabled: true,
            morning: {
              storeQrIds: ["cafe_gangnam_001", "cafe_hongdae_001", "brunch_gangnam_001"],
              weight: 1,
            },
            afternoon: {
              storeQrIds: ["cafe_gangnam_001", "dessert_gangnam_001", "culture_gangnam_001"],
              weight: 1,
            },
            evening: {
              storeQrIds: ["food_hongdae_001", "gallery_gangnam_001", "record_hongdae_001"],
              weight: 1,
            },
            night: {
              storeQrIds: ["cafe_hongdae_001", "record_hongdae_001"],
              weight: 1,
            },
          },
        },
        priority: 50,
        createdBy: admin._id,
        updatedBy: admin._id,
      },
      { upsert: true, new: true }
    );
    console.log("✅ 시간대별 체험 설정 생성/업데이트 완료");

    // 최종 설정 확인
    const finalConfigs = await ExperienceConfig.find({}).populate("createdBy", "username").sort({ priority: -1 });

    console.log("\n🎯 생성된 체험 설정 목록:");
    finalConfigs.forEach((config, index) => {
      console.log(`${index + 1}. ${config.name}`);
      console.log(`   - 타입: ${config.type}`);
      console.log(`   - 상태: ${config.isActive ? "활성" : "비활성"}`);
      console.log(`   - 기본: ${config.isDefault ? "YES" : "NO"}`);
      console.log(`   - 우선순위: ${config.priority}`);
      console.log(`   - 생성자: ${(config.createdBy as any)?.username || "Unknown"}`);
      console.log("");
    });

    await mongoose.disconnect();
    console.log("📡 MongoDB 연결 종료");
    console.log("🎉 기본 체험 설정 생성 완료!");
  } catch (error) {
    console.error("❌ 오류:", error);
    process.exit(1);
  }
};

createDefaultExperienceConfig();
