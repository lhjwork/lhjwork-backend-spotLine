import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/Store";
import Recommendation from "../models/Recommendation";

dotenv.config();

const createDemoRecommendations = async () => {
  try {
    console.log("🔗 SpotLine 데모 추천 데이터 생성 시작...");

    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/spotline";
    console.log(`📡 MongoDB 연결 중: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB 연결 성공!");

    // 기존 추천 데이터 삭제
    await Recommendation.deleteMany({});
    console.log("🗑️ 기존 추천 데이터 삭제 완료");

    // 매장 데이터 조회
    const stores = await Store.find({ isActive: true });
    console.log(`📍 ${stores.length}개 매장 조회 완료`);

    if (stores.length < 2) {
      console.log("⚠️ 추천 관계를 만들기 위해서는 최소 2개 이상의 매장이 필요합니다.");
      return;
    }

    // 매장별 ID 매핑
    const storeMap = new Map();
    stores.forEach(store => {
      storeMap.set(store.qrCode.id, store._id);
    });

    // 추천 관계 데이터 정의
    const recommendationData = [
      // 카페 스팟라인 → 다른 장소들
      {
        fromQrId: "demo_cafe_001",
        toQrId: "demo_dessert_001",
        category: "dessert",
        priority: 9,
        distance: 300,
        walkingTime: 4,
        description: "커피 후 달콤한 디저트는 어떠세요?",
        tags: ["디저트", "달콤한", "가까운"]
      },
      {
        fromQrId: "demo_cafe_001",
        toQrId: "demo_gallery_001",
        category: "culture",
        priority: 8,
        distance: 500,
        walkingTime: 6,
        description: "예술 작품을 감상하며 문화적 영감을 얻어보세요",
        tags: ["예술", "전시", "문화"]
      },
      {
        fromQrId: "demo_cafe_001",
        toQrId: "demo_bookcafe_001",
        category: "rest",
        priority: 7,
        distance: 2500,
        walkingTime: 15,
        description: "홍대의 활기찬 분위기에서 책과 함께하는 시간",
        tags: ["책", "홍대", "분위기전환"]
      },

      // 디저트 하우스 → 다른 장소들
      {
        fromQrId: "demo_dessert_001",
        toQrId: "demo_gallery_001",
        category: "culture",
        priority: 9,
        distance: 400,
        walkingTime: 5,
        description: "달콤한 시간 후 예술적 감성을 더해보세요",
        tags: ["예술", "전시", "감성"]
      },
      {
        fromQrId: "demo_dessert_001",
        toQrId: "demo_cafe_001",
        category: "rest",
        priority: 6,
        distance: 300,
        walkingTime: 4,
        description: "조용한 카페에서 여유로운 시간을 보내세요",
        tags: ["조용한", "휴식", "커피"]
      },
      {
        fromQrId: "demo_dessert_001",
        toQrId: "demo_bookcafe_001",
        category: "activity",
        priority: 7,
        distance: 2800,
        walkingTime: 18,
        description: "홍대로 이동해서 새로운 에너지를 느껴보세요",
        tags: ["홍대", "활기", "책"]
      },

      // 아트 갤러리 카페 → 다른 장소들
      {
        fromQrId: "demo_gallery_001",
        toQrId: "demo_bookcafe_001",
        category: "culture",
        priority: 8,
        distance: 2600,
        walkingTime: 16,
        description: "예술적 영감을 책으로 이어가보세요",
        tags: ["책", "문화", "영감"]
      },
      {
        fromQrId: "demo_gallery_001",
        toQrId: "demo_cafe_001",
        category: "rest",
        priority: 7,
        distance: 500,
        walkingTime: 6,
        description: "예술 감상 후 조용한 카페에서 여운을 즐겨보세요",
        tags: ["휴식", "여운", "조용한"]
      },
      {
        fromQrId: "demo_gallery_001",
        toQrId: "demo_dessert_001",
        category: "dessert",
        priority: 6,
        distance: 400,
        walkingTime: 5,
        description: "문화적 경험을 달콤하게 마무리해보세요",
        tags: ["디저트", "마무리", "달콤한"]
      },

      // 홍대 북카페 → 다른 장소들
      {
        fromQrId: "demo_bookcafe_001",
        toQrId: "demo_gallery_001",
        category: "culture",
        priority: 8,
        distance: 2600,
        walkingTime: 16,
        description: "책에서 얻은 영감을 예술로 확장해보세요",
        tags: ["예술", "영감", "확장"]
      },
      {
        fromQrId: "demo_bookcafe_001",
        toQrId: "demo_cafe_001",
        category: "activity",
        priority: 7,
        distance: 2500,
        walkingTime: 15,
        description: "강남으로 이동해서 다른 분위기를 경험해보세요",
        tags: ["강남", "분위기전환", "이동"]
      },
      {
        fromQrId: "demo_bookcafe_001",
        toQrId: "demo_dessert_001",
        category: "next_meal",
        priority: 6,
        distance: 2800,
        walkingTime: 18,
        description: "독서 후 강남에서 맛있는 디저트를 즐겨보세요",
        tags: ["디저트", "강남", "맛집"]
      }
    ];

    // 추천 데이터 생성
    const recommendations = [];
    for (const rec of recommendationData) {
      const fromStoreId = storeMap.get(rec.fromQrId);
      const toStoreId = storeMap.get(rec.toQrId);

      if (fromStoreId && toStoreId) {
        recommendations.push({
          fromStore: fromStoreId,
          toStore: toStoreId,
          category: rec.category,
          priority: rec.priority,
          distance: rec.distance,
          walkingTime: rec.walkingTime,
          description: rec.description,
          tags: rec.tags,
          isActive: true
        });
      }
    }

    // 데이터베이스에 저장
    const createdRecommendations = await Recommendation.insertMany(recommendations);
    console.log(`✅ ${createdRecommendations.length}개 추천 관계 생성 완료!`);

    // 매장별 추천 현황 출력
    console.log("\n📊 매장별 추천 현황:");
    for (const store of stores) {
      const outgoingCount = await Recommendation.countDocuments({ fromStore: store._id });
      const incomingCount = await Recommendation.countDocuments({ toStore: store._id });
      console.log(`   ${store.name} (${store.qrCode.id})`);
      console.log(`     → 추천하는 곳: ${outgoingCount}개`);
      console.log(`     ← 추천받는 곳: ${incomingCount}개`);
    }

    console.log("\n🎉 SpotLine 데모 추천 데이터 생성 완료!");
    console.log("\n🌐 테스트 URL:");
    console.log("   - 카페 스팟라인: http://localhost:4000/api/stores/spotline/demo_cafe_001");
    console.log("   - 디저트 하우스: http://localhost:4000/api/stores/spotline/demo_dessert_001");
    console.log("   - 아트 갤러리: http://localhost:4000/api/stores/spotline/demo_gallery_001");
    console.log("   - 홍대 북카페: http://localhost:4000/api/stores/spotline/demo_bookcafe_001");

    await mongoose.disconnect();
    console.log("📡 MongoDB 연결 종료");
  } catch (error) {
    console.error("❌ 오류:", error);
    process.exit(1);
  }
};

createDemoRecommendations();