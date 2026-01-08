import mongoose from "mongoose";
import DemoStore from "../models/DemoStore";
import DemoRecommendation from "../models/DemoRecommendation";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function createDemoRecommendations() {
  try {
    console.log("🔗 데모 추천 관계 생성 시작...");

    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/spotline-dev");
    console.log("✅ MongoDB 연결 성공!");

    // 기존 추천 데이터 삭제
    await DemoRecommendation.deleteMany({});
    console.log("🗑️ 기존 데모 추천 데이터 삭제 완료");

    // 데모 매장들 조회
    const demoStores = await DemoStore.find({ isActive: true });
    console.log(`📊 총 ${demoStores.length}개의 데모 매장 발견`);

    if (demoStores.length === 0) {
      console.log("❌ 데모 매장이 없습니다. 먼저 데모 매장을 생성해주세요.");
      return;
    }

    // 매장별로 매핑
    const storeMap = new Map();
    demoStores.forEach((store) => {
      const qrId = store.qrCode.id;
      storeMap.set(qrId, store);
    });

    const recommendations = [];

    // 카페 데모 → 다른 매장들
    const cafeDemo = storeMap.get("demo_cafe_001");
    if (cafeDemo) {
      const galleryDemo = storeMap.get("demo_gallery_001");
      const restaurantDemo = storeMap.get("demo_restaurant_001");
      const bookcafeDemo = storeMap.get("demo_bookcafe_001");

      if (galleryDemo) {
        recommendations.push({
          fromStoreId: cafeDemo._id,
          toStoreId: galleryDemo._id,
          category: "culture",
          priority: 8,
          distance: 250,
          walkingTime: 5,
          description: "카페에서 갤러리로 이어지는 문화적 경험",
        });
      }

      if (restaurantDemo) {
        recommendations.push({
          fromStoreId: cafeDemo._id,
          toStoreId: restaurantDemo._id,
          category: "restaurant",
          priority: 7,
          distance: 400,
          walkingTime: 8,
          description: "커피 후 건강한 식사",
        });
      }

      if (bookcafeDemo) {
        recommendations.push({
          fromStoreId: cafeDemo._id,
          toStoreId: bookcafeDemo._id,
          category: "cafe",
          priority: 6,
          distance: 150,
          walkingTime: 3,
          description: "카페에서 북카페로 이어지는 독서 시간",
        });
      }
    }

    // 갤러리 데모 → 다른 매장들
    const galleryDemo = storeMap.get("demo_gallery_001");
    if (galleryDemo) {
      const cafeDemo = storeMap.get("demo_cafe_001");
      const restaurantDemo = storeMap.get("demo_restaurant_001");
      const bookcafeDemo = storeMap.get("demo_bookcafe_001");

      if (bookcafeDemo) {
        recommendations.push({
          fromStoreId: galleryDemo._id,
          toStoreId: bookcafeDemo._id,
          category: "cafe",
          priority: 9,
          distance: 300,
          walkingTime: 6,
          description: "예술 감상 후 독서와 함께하는 시간",
        });
      }

      if (cafeDemo) {
        recommendations.push({
          fromStoreId: galleryDemo._id,
          toStoreId: cafeDemo._id,
          category: "cafe",
          priority: 7,
          distance: 250,
          walkingTime: 5,
          description: "갤러리에서 카페로 여유로운 시간",
        });
      }

      if (restaurantDemo) {
        recommendations.push({
          fromStoreId: galleryDemo._id,
          toStoreId: restaurantDemo._id,
          category: "restaurant",
          priority: 6,
          distance: 500,
          walkingTime: 10,
          description: "문화 활동 후 맛있는 식사",
        });
      }
    }

    // 레스토랑 데모 → 다른 매장들
    const restaurantDemo = storeMap.get("demo_restaurant_001");
    if (restaurantDemo) {
      const cafeDemo = storeMap.get("demo_cafe_001");
      const galleryDemo = storeMap.get("demo_gallery_001");
      const bookcafeDemo = storeMap.get("demo_bookcafe_001");

      if (cafeDemo) {
        recommendations.push({
          fromStoreId: restaurantDemo._id,
          toStoreId: cafeDemo._id,
          category: "cafe",
          priority: 8,
          distance: 400,
          walkingTime: 8,
          description: "식사 후 커피와 함께하는 여유",
        });
      }

      if (galleryDemo) {
        recommendations.push({
          fromStoreId: restaurantDemo._id,
          toStoreId: galleryDemo._id,
          category: "culture",
          priority: 7,
          distance: 500,
          walkingTime: 10,
          description: "식사 후 문화 활동",
        });
      }

      if (bookcafeDemo) {
        recommendations.push({
          fromStoreId: restaurantDemo._id,
          toStoreId: bookcafeDemo._id,
          category: "cafe",
          priority: 6,
          distance: 350,
          walkingTime: 7,
          description: "식사 후 독서와 함께하는 시간",
        });
      }
    }

    // 북카페 데모 → 다른 매장들
    const bookcafeDemo = storeMap.get("demo_bookcafe_001");
    if (bookcafeDemo) {
      const cafeDemo = storeMap.get("demo_cafe_001");
      const galleryDemo = storeMap.get("demo_gallery_001");
      const restaurantDemo = storeMap.get("demo_restaurant_001");

      if (galleryDemo) {
        recommendations.push({
          fromStoreId: bookcafeDemo._id,
          toStoreId: galleryDemo._id,
          category: "culture",
          priority: 8,
          distance: 300,
          walkingTime: 6,
          description: "독서 후 예술 감상",
        });
      }

      if (cafeDemo) {
        recommendations.push({
          fromStoreId: bookcafeDemo._id,
          toStoreId: cafeDemo._id,
          category: "cafe",
          priority: 7,
          distance: 150,
          walkingTime: 3,
          description: "북카페에서 일반 카페로 분위기 전환",
        });
      }

      if (restaurantDemo) {
        recommendations.push({
          fromStoreId: bookcafeDemo._id,
          toStoreId: restaurantDemo._id,
          category: "restaurant",
          priority: 6,
          distance: 350,
          walkingTime: 7,
          description: "독서 후 건강한 식사",
        });
      }
    }

    // 추천 관계 생성
    if (recommendations.length > 0) {
      await DemoRecommendation.insertMany(recommendations);
      console.log(`✅ ${recommendations.length}개의 데모 추천 관계가 생성되었습니다!`);

      // 생성된 추천 관계 요약
      console.log("\n📋 생성된 추천 관계 요약:");
      const groupedRecs = recommendations.reduce((acc: any, rec: any) => {
        const fromStore = demoStores.find((s) => s._id.equals(rec.fromStoreId));
        const toStore = demoStores.find((s) => s._id.equals(rec.toStoreId));

        if (fromStore && toStore) {
          const key = fromStore.name;
          if (!acc[key]) acc[key] = [];
          acc[key].push(`${toStore.name} (${rec.walkingTime}분, ${rec.distance}m)`);
        }
        return acc;
      }, {});

      Object.entries(groupedRecs).forEach(([from, tos]: [string, any]) => {
        console.log(`   ${from} → ${tos.join(", ")}`);
      });
    } else {
      console.log("❌ 생성할 추천 관계가 없습니다.");
    }

    console.log("\n🎉 데모 추천 관계 생성 완료!");
  } catch (error) {
    console.error("❌ 데모 추천 관계 생성 오류:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📡 MongoDB 연결 종료");
  }
}

// 직접 실행 시
if (require.main === module) {
  createDemoRecommendations();
}

export default createDemoRecommendations;
