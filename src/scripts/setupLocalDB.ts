import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin";
import Store from "../models/Store";
import Recommendation from "../models/Recommendation";
import Analytics from "../models/Analytics";

// 로컬 환경 변수 로드
dotenv.config({ path: ".env.local" });

const setupLocalDatabase = async () => {
  try {
    console.log("🔧 로컬 MongoDB 데이터베이스 설정 시작...");

    // MongoDB 연결
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/spotline-dev";
    console.log(`📡 MongoDB 연결 중: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB 연결 성공!");

    // 기존 데이터 정리 (선택사항)
    console.log("🧹 기존 데이터 정리 중...");
    await Admin.deleteMany({});
    await Store.deleteMany({});
    await Recommendation.deleteMany({});
    await Analytics.deleteMany({});
    console.log("✅ 기존 데이터 정리 완료!");

    // 기본 관리자 계정 생성
    console.log("👤 기본 관리자 계정 생성 중...");
    const adminData = {
      username: "admin",
      email: "admin@spotline.local",
      password: "admin123", // 실제로는 해시화됨
      role: "super_admin" as const,
      isActive: true,
    };

    const admin = new Admin(adminData);
    await admin.save();
    console.log("✅ 기본 관리자 계정 생성 완료!");
    console.log(`   - 사용자명: ${adminData.username}`);
    console.log(`   - 비밀번호: ${adminData.password}`);
    console.log(`   - 이메일: ${adminData.email}`);

    // 샘플 매장 데이터 생성
    console.log("🏪 샘플 매장 데이터 생성 중...");

    const sampleStores = [
      {
        name: "카페 스팟라인",
        category: "cafe" as const,
        location: {
          address: "서울시 강남구 테헤란로 123",
          coordinates: {
            type: "Point" as const,
            coordinates: [126.978, 37.5665],
          },
          district: "강남구",
          area: "테헤란로",
        },
        shortDescription: "조용한 분위기에서 책과 함께하는 시간",
        representativeImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Cafe+SpotLine",
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
            coordinates: [126.9785, 37.567],
          },
          district: "강남구",
          area: "테헤란로",
        },
        shortDescription: "수제 케이크와 마카롱 전문점",
        representativeImage: "https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Dessert+House",
        spotlineStory: "매일 아침 신선한 재료로 만드는 수제 디저트를 맛볼 수 있는 곳입니다.",
        externalLinks: {
          instagram: "https://instagram.com/dessert_house",
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
            coordinates: [126.979, 37.5675],
          },
          district: "강남구",
          area: "테헤란로",
        },
        shortDescription: "커피와 함께 책을 읽기 좋은 곳",
        representativeImage: "https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Book+Cafe",
        spotlineStory: "다양한 장르의 책과 함께 조용한 시간을 보낼 수 있는 북카페입니다.",
        externalLinks: {
          website: "https://bookcafe-reading.com",
        },
        qrCode: {
          id: "culture_gangnam_001",
          isActive: true,
        },
        isActive: true,
      },
    ];

    const createdStores = await Store.insertMany(sampleStores);
    console.log(`✅ ${createdStores.length}개 샘플 매장 생성 완료!`);

    // 샘플 추천 연결 생성
    console.log("🔗 샘플 추천 연결 생성 중...");

    const sampleRecommendations = [
      {
        fromStore: createdStores[0]._id, // 카페 스팟라인
        toStore: createdStores[1]._id, // 디저트 하우스
        category: "dessert" as const,
        priority: 8,
        description: "커피 후 달콤한 디저트로 마무리하기 좋은 곳",
        walkingTime: 3,
        distance: 200,
        tags: ["dessert", "sweet"],
        isActive: true,
      },
      {
        fromStore: createdStores[0]._id, // 카페 스팟라인
        toStore: createdStores[2]._id, // 북카페 리딩룸
        category: "culture" as const,
        priority: 6,
        description: "책과 함께 조용한 시간을 보내기 좋은 곳",
        walkingTime: 5,
        distance: 350,
        tags: ["book", "quiet"],
        isActive: true,
      },
      {
        fromStore: createdStores[1]._id, // 디저트 하우스
        toStore: createdStores[2]._id, // 북카페 리딩룸
        category: "culture" as const,
        priority: 7,
        description: "디저트 후 여유로운 독서 시간",
        walkingTime: 4,
        distance: 250,
        tags: ["culture", "relax"],
        isActive: true,
      },
    ];

    const createdRecommendations = await Recommendation.insertMany(sampleRecommendations);
    console.log(`✅ ${createdRecommendations.length}개 샘플 추천 연결 생성 완료!`);

    // 샘플 분석 데이터 생성
    console.log("📊 샘플 분석 데이터 생성 중...");

    const sampleAnalytics = [
      {
        qrCode: "cafe_gangnam_001",
        store: createdStores[0]._id,
        eventType: "page_enter" as const,
        sessionId: "session_001",
        timestamp: new Date(),
        metadata: {
          stayDuration: 45,
        },
      },
      {
        qrCode: "cafe_gangnam_001",
        store: createdStores[0]._id,
        eventType: "spot_click" as const,
        targetStore: createdStores[1]._id,
        sessionId: "session_001",
        timestamp: new Date(),
        metadata: {
          spotPosition: 1,
          nextSpotId: createdStores[1]._id.toString(),
        },
      },
    ];

    const createdAnalytics = await Analytics.insertMany(sampleAnalytics);
    console.log(`✅ ${createdAnalytics.length}개 샘플 분석 데이터 생성 완료!`);

    console.log("\n🎉 로컬 MongoDB 데이터베이스 설정 완료!");
    console.log("\n📋 생성된 데이터 요약:");
    console.log(`   - 관리자 계정: 1개`);
    console.log(`   - 매장: ${createdStores.length}개`);
    console.log(`   - 추천 연결: ${createdRecommendations.length}개`);
    console.log(`   - 분석 데이터: ${createdAnalytics.length}개`);

    console.log("\n🔐 관리자 로그인 정보:");
    console.log(`   - URL: http://localhost:4000/api/admin/login`);
    console.log(`   - 사용자명: admin`);
    console.log(`   - 비밀번호: admin123`);

    console.log("\n🌐 테스트 URL:");
    console.log(`   - 서버: http://localhost:4000`);
    console.log(`   - API 문서: http://localhost:4000/api-docs`);
    console.log(`   - QR 테스트: http://localhost:4000/api/stores/spotline/cafe_gangnam_001`);
  } catch (error) {
    console.error("❌ 로컬 데이터베이스 설정 실패:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📡 MongoDB 연결 종료");
    process.exit(0);
  }
};

// 스크립트 실행
setupLocalDatabase();
