import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin";
import Store from "../models/Store";
import Recommendation from "../models/Recommendation";
import Analytics from "../models/Analytics";

dotenv.config();

const seedData = async () => {
  try {
    console.log("🌱 SpotLine 임시 데이터 생성 시작...");

    // 현재 .env 설정의 MongoDB 연결
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/spotline";
    console.log(`📡 MongoDB 연결 중: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB 연결 성공!");

    // 기존 데이터 정리 여부 확인
    const existingStores = await Store.countDocuments();
    const existingAdmins = await Admin.countDocuments();

    if (existingStores > 0 || existingAdmins > 0) {
      console.log(`⚠️ 기존 데이터 발견: 매장 ${existingStores}개, 관리자 ${existingAdmins}개`);
      console.log("🧹 기존 데이터 정리 중...");

      await Admin.deleteMany({});
      await Store.deleteMany({});
      await Recommendation.deleteMany({});
      await Analytics.deleteMany({});
      console.log("✅ 기존 데이터 정리 완료!");
    }

    // 1. 관리자 계정 생성
    console.log("👤 관리자 계정 생성 중...");
    const adminAccounts = [
      {
        username: "admin",
        email: "admin@spotline.com",
        password: "admin123",
        role: "super_admin" as const,
        isActive: true,
      },
      {
        username: "manager",
        email: "manager@spotline.com",
        password: "manager123",
        role: "admin" as const,
        isActive: true,
      },
    ];

    const createdAdmins = await Admin.insertMany(adminAccounts);
    console.log(`✅ ${createdAdmins.length}개 관리자 계정 생성 완료!`);
    adminAccounts.forEach((admin, index) => {
      console.log(`   - ${admin.username} (${admin.role}): ${admin.password}`);
    });

    // 2. 강남 지역 매장 데이터 생성
    console.log("\n🏪 강남 지역 매장 데이터 생성 중...");
    const gangnamStores = [
      {
        name: "카페 스팟라인",
        category: "cafe" as const,
        location: {
          address: "서울시 강남구 테헤란로 123",
          coordinates: {
            type: "Point" as const,
            coordinates: [127.0276, 37.4979], // 강남역 근처
          },
          district: "강남구",
          area: "강남역",
        },
        shortDescription: "조용한 분위기에서 책과 함께하는 시간",
        representativeImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
        spotlineStory: "이 카페는 개발자들이 조용히 작업할 수 있도록 설계된 공간입니다. 오후 2시부터 5시까지는 특히 집중하기 좋은 시간대입니다.",
        externalLinks: {
          instagram: "https://instagram.com/cafe_spotline",
          website: "https://cafe-spotline.com",
        },
        qrCode: {
          id: "cafe_gangnam_001",
          isActive: true,
        },
        contact: {
          phone: "02-1234-5678",
          website: "https://cafe-spotline.com",
          instagram: "https://instagram.com/cafe_spotline",
        },
        isActive: true,
      },
      {
        name: "디저트 하우스",
        category: "restaurant" as const,
        location: {
          address: "서울시 강남구 테헤란로 125",
          coordinates: {
            type: "Point" as const,
            coordinates: [127.028, 37.4985],
          },
          district: "강남구",
          area: "강남역",
        },
        shortDescription: "수제 케이크와 마카롱 전문점",
        representativeImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
        spotlineStory: "매일 아침 신선한 재료로 만드는 수제 디저트를 맛볼 수 있는 곳입니다. 특히 마카롱과 티라미수가 인기입니다.",
        externalLinks: {
          instagram: "https://instagram.com/dessert_house_gangnam",
        },
        qrCode: {
          id: "dessert_gangnam_001",
          isActive: true,
        },
        isActive: true,
      },
      {
        name: "북카페 리딩룸",
        category: "culture" as const,
        location: {
          address: "서울시 강남구 테헤란로 127",
          coordinates: {
            type: "Point" as const,
            coordinates: [127.0285, 37.499],
          },
          district: "강남구",
          area: "강남역",
        },
        shortDescription: "커피와 함께 책을 읽기 좋은 곳",
        representativeImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
        spotlineStory: "다양한 장르의 책과 함께 조용한 시간을 보낼 수 있는 북카페입니다. 2층에는 더욱 조용한 독서 공간이 마련되어 있습니다.",
        externalLinks: {
          website: "https://bookcafe-reading.com",
        },
        qrCode: {
          id: "culture_gangnam_001",
          isActive: true,
        },
        isActive: true,
      },
      {
        name: "아트 갤러리 모던",
        category: "culture" as const,
        location: {
          address: "서울시 강남구 논현로 456",
          coordinates: {
            type: "Point" as const,
            coordinates: [127.032, 37.505],
          },
          district: "강남구",
          area: "논현동",
        },
        shortDescription: "현대 미술 작품을 감상할 수 있는 작은 갤러리",
        representativeImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
        spotlineStory: "신진 작가들의 작품을 중심으로 한 현대 미술 갤러리입니다. 매월 새로운 전시가 열리며, 작가와의 만남도 정기적으로 진행됩니다.",
        externalLinks: {
          instagram: "https://instagram.com/art_gallery_modern",
          website: "https://artgallerymodern.com",
        },
        qrCode: {
          id: "gallery_gangnam_001",
          isActive: true,
        },
        isActive: true,
      },
      {
        name: "브런치 스팟",
        category: "restaurant" as const,
        location: {
          address: "서울시 강남구 신사동 789",
          coordinates: {
            type: "Point" as const,
            coordinates: [127.02, 37.518],
          },
          district: "강남구",
          area: "신사동",
        },
        shortDescription: "건강한 재료로 만든 브런치 전문점",
        representativeImage: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
        spotlineStory: "오가닉 재료를 사용한 건강한 브런치를 제공합니다. 주말 오전에는 특히 인기가 많으니 예약을 권장합니다.",
        externalLinks: {
          instagram: "https://instagram.com/brunch_spot_sinsa",
        },
        qrCode: {
          id: "brunch_gangnam_001",
          isActive: true,
        },
        isActive: true,
      },
    ];

    // 3. 홍대 지역 매장 데이터 생성
    console.log("🎨 홍대 지역 매장 데이터 생성 중...");
    const hongdaeStores = [
      {
        name: "바이닐 카페",
        category: "cafe" as const,
        location: {
          address: "서울시 마포구 홍익로 234",
          coordinates: {
            type: "Point" as const,
            coordinates: [126.924, 37.5563],
          },
          district: "마포구",
          area: "홍대입구",
        },
        shortDescription: "LP와 함께 즐기는 아날로그 감성 카페",
        representativeImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
        spotlineStory: "1970-80년대 LP 컬렉션과 함께 아날로그 감성을 느낄 수 있는 카페입니다. 매주 목요일에는 재즈 라이브 공연이 있습니다.",
        externalLinks: {
          instagram: "https://instagram.com/vinyl_cafe_hongdae",
        },
        qrCode: {
          id: "cafe_hongdae_001",
          isActive: true,
        },
        isActive: true,
      },
      {
        name: "스트리트 푸드 마켓",
        category: "restaurant" as const,
        location: {
          address: "서울시 마포구 홍익로 236",
          coordinates: {
            type: "Point" as const,
            coordinates: [126.9245, 37.557],
          },
          district: "마포구",
          area: "홍대입구",
        },
        shortDescription: "세계 각국의 스트리트 푸드를 한 곳에서",
        representativeImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
        spotlineStory: "타코, 바오, 케밥 등 세계 각국의 스트리트 푸드를 맛볼 수 있는 푸드 마켓입니다. 젊은 셰프들이 운영하는 다양한 부스가 있습니다.",
        externalLinks: {
          instagram: "https://instagram.com/street_food_hongdae",
        },
        qrCode: {
          id: "food_hongdae_001",
          isActive: true,
        },
        isActive: true,
      },
      {
        name: "인디 레코드샵",
        category: "retail" as const,
        location: {
          address: "서울시 마포구 홍익로 238",
          coordinates: {
            type: "Point" as const,
            coordinates: [126.925, 37.5575],
          },
          district: "마포구",
          area: "홍대입구",
        },
        shortDescription: "독립 음악과 빈티지 레코드 전문점",
        representativeImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
        spotlineStory: "국내외 인디 뮤지션들의 앨범과 빈티지 LP를 판매하는 레코드샵입니다. 음악 애호가들의 성지로 불립니다.",
        externalLinks: {
          instagram: "https://instagram.com/indie_record_hongdae",
          website: "https://indierecord.com",
        },
        qrCode: {
          id: "record_hongdae_001",
          isActive: true,
        },
        isActive: true,
      },
    ];

    // 모든 매장 데이터 합치기
    const allStores = [...gangnamStores, ...hongdaeStores];
    const createdStores = await Store.insertMany(allStores);
    console.log(`✅ ${createdStores.length}개 매장 생성 완료!`);
    console.log(`   - 강남 지역: ${gangnamStores.length}개`);
    console.log(`   - 홍대 지역: ${hongdaeStores.length}개`);

    // 4. 추천 연결 생성
    console.log("\n🔗 매장 간 추천 연결 생성 중...");
    const recommendations = [
      // 강남 지역 연결
      {
        fromStore: createdStores[0]._id, // 카페 스팟라인
        toStore: createdStores[1]._id, // 디저트 하우스
        category: "dessert" as const,
        priority: 9,
        description: "커피 후 달콤한 디저트로 마무리하기 좋은 곳",
        walkingTime: 3,
        distance: 150,
        tags: ["dessert", "sweet"],
        isActive: true,
      },
      {
        fromStore: createdStores[0]._id, // 카페 스팟라인
        toStore: createdStores[2]._id, // 북카페 리딩룸
        category: "culture" as const,
        priority: 7,
        description: "책과 함께 조용한 시간을 보내기 좋은 곳",
        walkingTime: 5,
        distance: 200,
        tags: ["book", "quiet"],
        isActive: true,
      },
      {
        fromStore: createdStores[1]._id, // 디저트 하우스
        toStore: createdStores[3]._id, // 아트 갤러리 모던
        category: "culture" as const,
        priority: 8,
        description: "디저트 후 예술 작품 감상으로 여유로운 시간",
        walkingTime: 8,
        distance: 400,
        tags: ["art", "culture"],
        isActive: true,
      },
      {
        fromStore: createdStores[4]._id, // 브런치 스팟
        toStore: createdStores[0]._id, // 카페 스팟라인
        category: "rest" as const,
        priority: 6,
        description: "브런치 후 커피와 함께 여유로운 시간",
        walkingTime: 12,
        distance: 800,
        tags: ["coffee", "relax"],
        isActive: true,
      },
      // 홍대 지역 연결
      {
        fromStore: createdStores[5]._id, // 바이닐 카페
        toStore: createdStores[7]._id, // 인디 레코드샵
        category: "shopping" as const,
        priority: 9,
        description: "음악 감상 후 좋아하는 앨범을 찾아보세요",
        walkingTime: 2,
        distance: 100,
        tags: ["music", "vinyl"],
        isActive: true,
      },
      {
        fromStore: createdStores[6]._id, // 스트리트 푸드 마켓
        toStore: createdStores[5]._id, // 바이닐 카페
        category: "rest" as const,
        priority: 7,
        description: "식사 후 음악과 함께 여유로운 커피 시간",
        walkingTime: 3,
        distance: 120,
        tags: ["music", "coffee"],
        isActive: true,
      },
      // 지역 간 연결
      {
        fromStore: createdStores[3]._id, // 아트 갤러리 모던 (강남)
        toStore: createdStores[5]._id, // 바이닐 카페 (홍대)
        category: "culture" as const,
        priority: 5,
        description: "미술 감상 후 음악이 있는 공간에서 여운을 즐겨보세요",
        walkingTime: 25,
        distance: 5000,
        tags: ["art", "music", "culture"],
        isActive: true,
      },
    ];

    const createdRecommendations = await Recommendation.insertMany(recommendations);
    console.log(`✅ ${createdRecommendations.length}개 추천 연결 생성 완료!`);

    // 5. 샘플 분석 데이터 생성
    console.log("\n📊 샘플 분석 데이터 생성 중...");
    const analyticsData = [];
    const eventTypes = ["page_enter", "spot_click", "map_link_click", "external_link_click", "page_exit"] as const;

    // 각 매장별로 랜덤 분석 데이터 생성
    for (let i = 0; i < createdStores.length; i++) {
      const store = createdStores[i];
      const eventCount = Math.floor(Math.random() * 20) + 10; // 10-30개 이벤트

      for (let j = 0; j < eventCount; j++) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        analyticsData.push({
          qrCode: store.qrCode.id,
          store: store._id,
          eventType,
          sessionId,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 최근 7일 내
          metadata: {
            spotPosition: eventType === "spot_click" ? Math.floor(Math.random() * 4) + 1 : undefined,
            stayDuration: eventType === "page_exit" ? Math.floor(Math.random() * 120) + 30 : undefined,
            linkType: eventType === "external_link_click" ? ["instagram", "website", "blog"][Math.floor(Math.random() * 3)] : undefined,
          },
        });
      }
    }

    const createdAnalytics = await Analytics.insertMany(analyticsData);
    console.log(`✅ ${createdAnalytics.length}개 분석 데이터 생성 완료!`);

    // 6. 생성 결과 요약
    console.log("\n🎉 SpotLine 임시 데이터 생성 완료!");
    console.log("\n📋 생성된 데이터 요약:");
    console.log(`   - 관리자 계정: ${createdAdmins.length}개`);
    console.log(`   - 매장: ${createdStores.length}개 (강남 ${gangnamStores.length}개, 홍대 ${hongdaeStores.length}개)`);
    console.log(`   - 추천 연결: ${createdRecommendations.length}개`);
    console.log(`   - 분석 데이터: ${createdAnalytics.length}개`);

    console.log("\n🔐 관리자 로그인 정보:");
    console.log(`   - 슈퍼 관리자: admin / admin123`);
    console.log(`   - 일반 관리자: manager / manager123`);

    console.log("\n🌐 테스트 URL:");
    console.log(`   - 서버: http://localhost:4000`);
    console.log(`   - API 문서: http://localhost:4000/api-docs`);
    console.log(`   - QR 테스트 (강남): http://localhost:4000/api/stores/spotline/cafe_gangnam_001`);
    console.log(`   - QR 테스트 (홍대): http://localhost:4000/api/stores/spotline/cafe_hongdae_001`);

    console.log("\n📍 생성된 매장 목록:");
    createdStores.forEach((store, index) => {
      console.log(`   ${index + 1}. ${store.name} (${store.location.area}) - QR: ${store.qrCode.id}`);
    });
  } catch (error) {
    console.error("❌ 임시 데이터 생성 실패:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📡 MongoDB 연결 종료");
    process.exit(0);
  }
};

seedData();
