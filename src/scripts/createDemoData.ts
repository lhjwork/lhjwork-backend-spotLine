import mongoose from "mongoose";
import dotenv from "dotenv";
import DemoStore from "../models/DemoStore";

dotenv.config();

const createDemoData = async () => {
  try {
    console.log("🎭 SpotLine 데모 데이터 생성 시작...");

    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/spotline";
    console.log(`📡 MongoDB 연결 중: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB 연결 성공!");

    // 기존 데모 데이터 삭제
    await DemoStore.deleteMany({ isDemoOnly: true });
    console.log("🗑️ 기존 데모 데이터 삭제 완료");

    // 데모용 매장 데이터 생성
    const demoStores = [
      {
        name: "카페 데모",
        category: "cafe",
        location: {
          address: "서울시 강남구 테헤란로 123 (데모용 주소)",
          coordinates: {
            type: "Point",
            coordinates: [127.0276, 37.4979], // 강남역 좌표
          },
          district: "강남구",
          area: "강남역",
        },
        qrCode: {
          id: "demo_cafe_001",
          isActive: true,
        },
        shortDescription: "조용한 분위기에서 커피와 함께하는 시간",
        spotlineStory: "이곳은 SpotLine 서비스를 소개하기 위한 데모 카페입니다. 실제로는 존재하지 않는 가상의 공간이지만, SpotLine이 제공하는 경험의 흐름을 보여드리기 위해 준비했습니다.",
        representativeImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
        externalLinks: {
          instagram: "https://instagram.com/demo_cafe",
          website: "https://demo-cafe.spotline.com",
        },
        isActive: true,
        isDemoOnly: true,
      },
      {
        name: "갤러리 데모",
        category: "culture",
        location: {
          address: "서울시 마포구 홍익로 456 (데모용 주소)",
          coordinates: {
            type: "Point",
            coordinates: [126.925, 37.5575], // 홍대입구 좌표
          },
          district: "마포구",
          area: "홍대입구",
        },
        qrCode: {
          id: "demo_gallery_001",
          isActive: true,
        },
        shortDescription: "현대 미술과 만나는 특별한 공간",
        spotlineStory: "이곳은 SpotLine 서비스를 소개하기 위한 데모 갤러리입니다. 문화와 예술이 어떻게 자연스러운 경험의 흐름으로 연결되는지 보여드립니다.",
        representativeImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
        externalLinks: {
          instagram: "https://instagram.com/demo_gallery",
          notion: "https://notion.so/demo-gallery",
        },
        isActive: true,
        isDemoOnly: true,
      },
      {
        name: "레스토랑 데모",
        category: "restaurant",
        location: {
          address: "서울시 강남구 논현로 789 (데모용 주소)",
          coordinates: {
            type: "Point",
            coordinates: [127.0286, 37.5048], // 논현동 좌표
          },
          district: "강남구",
          area: "논현동",
        },
        qrCode: {
          id: "demo_restaurant_001",
          isActive: true,
        },
        shortDescription: "정성스러운 요리와 따뜻한 분위기",
        spotlineStory: "이곳은 SpotLine 서비스를 소개하기 위한 데모 레스토랑입니다. 맛있는 음식이 어떻게 다음 경험으로 이어지는지 보여드립니다.",
        representativeImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
        externalLinks: {
          website: "https://demo-restaurant.spotline.com",
          blog: "https://blog.naver.com/demo_restaurant",
        },
        isActive: true,
        isDemoOnly: true,
      },
      {
        name: "북카페 데모",
        category: "cafe",
        location: {
          address: "서울시 마포구 와우산로 321 (데모용 주소)",
          coordinates: {
            type: "Point",
            coordinates: [126.9244, 37.5563], // 홍대 근처
          },
          district: "마포구",
          area: "홍대입구",
        },
        qrCode: {
          id: "demo_bookcafe_001",
          isActive: true,
        },
        shortDescription: "책과 커피가 만나는 아늑한 공간",
        spotlineStory: "이곳은 SpotLine 서비스를 소개하기 위한 데모 북카페입니다. 독서와 휴식이 어떻게 자연스러운 경험의 연결고리가 되는지 보여드립니다.",
        representativeImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
        externalLinks: {
          instagram: "https://instagram.com/demo_bookcafe",
          notion: "https://notion.so/demo-bookcafe",
        },
        isActive: true,
        isDemoOnly: true,
      },
    ];

    // 데모 매장 생성
    const createdStores = await DemoStore.insertMany(demoStores);
    console.log(`✅ ${createdStores.length}개 데모 매장 생성 완료!`);

    console.log("\n🎉 SpotLine 데모 데이터 생성 완료!");
    console.log("\n📋 생성된 데모 매장 목록:");
    createdStores.forEach((store, index) => {
      console.log(`   ${index + 1}. ${store.name} (${store.qrCode.id}) - ${store.location.area}`);
    });

    console.log("\n🌐 데모 테스트 URL:");
    console.log("   - 데모 체험하기: http://localhost:4000/api/demo/experience");
    console.log("   - 데모 매장 목록: http://localhost:4000/api/demo/stores");
    console.log("   - 카페 데모: http://localhost:4000/api/demo/stores/demo_cafe_001");
    console.log("   - 갤러리 데모: http://localhost:4000/api/demo/stores/demo_gallery_001");

    console.log("\n💡 사용법:");
    console.log("   1. 업주에게 서비스 소개 시 /api/demo/experience 사용");
    console.log("   2. 데모 매장들은 통계 수집하지 않음");
    console.log("   3. 실제 운영은 admin에서 등록한 매장 데이터 사용");

    await mongoose.disconnect();
    console.log("📡 MongoDB 연결 종료");
  } catch (error) {
    console.error("❌ 오류:", error);
    process.exit(1);
  }
};

createDemoData();
