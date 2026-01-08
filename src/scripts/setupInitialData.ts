import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin";
import Store from "../models/Store";

dotenv.config();

const setupInitialData = async () => {
  try {
    console.log("🚀 SpotLine 초기 데이터 설정 시작...");

    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/spotline";
    console.log(`📡 MongoDB 연결 중: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB 연결 성공!");

    // 1. 관리자 계정 생성
    console.log("\n👤 관리자 계정 생성 중...");
    
    // 기존 spotline-admin 계정이 있는지 확인
    const existingAdmin = await Admin.findOne({ username: "spotline-admin" });
    if (existingAdmin) {
      console.log("⚠️ spotline-admin 계정이 이미 존재합니다. 삭제 후 재생성합니다.");
      await Admin.deleteOne({ username: "spotline-admin" });
    }

    // 비밀번호 해시 생성
    const plainPassword = "12341234";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 새로운 관리자 계정 생성
    const adminData = {
      username: "spotline-admin",
      password: hashedPassword,
      role: "super_admin",
      name: "SpotLine 관리자",
      email: "admin@spotline.co.kr",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await Admin.collection.insertOne(adminData);
    console.log("✅ spotline-admin 계정 생성 완료!");
    console.log("   - 사용자명: spotline-admin");
    console.log("   - 비밀번호: 12341234");
    console.log("   - 권한: super_admin");

    // 2. 초기 매장 데이터 생성
    console.log("\n🏪 초기 매장 데이터 생성 중...");

    // 기존 매장 데이터 삭제 (전체 초기화)
    await Store.deleteMany({});
    console.log("🗑️ 기존 매장 데이터 삭제 완료");

    const initialStores = [
      {
        name: "카페 스팟라인",
        category: "cafe",
        location: {
          address: "서울시 강남구 테헤란로 123",
          coordinates: {
            type: "Point",
            coordinates: [127.0276, 37.4979], // 강남역 좌표
          },
          district: "강남구",
          area: "강남",
        },
        contact: {
          phone: "02-1234-5678",
          website: "https://cafe-spotline.com",
          instagram: "@cafe_spotline",
        },
        businessHours: {
          monday: { open: "08:00", close: "22:00" },
          tuesday: { open: "08:00", close: "22:00" },
          wednesday: { open: "08:00", close: "22:00" },
          thursday: { open: "08:00", close: "22:00" },
          friday: { open: "08:00", close: "23:00" },
          saturday: { open: "09:00", close: "23:00" },
          sunday: { open: "09:00", close: "21:00" },
        },
        shortDescription: "조용하고 아늑한 분위기의 카페입니다. 노트북 작업하기 좋아요.",
        spotlineStory: "강남역 근처에 위치한 아늑한 카페입니다. 조용한 분위기에서 커피를 마시며 작업하거나 대화를 나누기 좋은 공간입니다. 다음에는 근처 갤러리나 맛집을 추천해드릴게요.",
        representativeImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
        externalLinks: {
          instagram: "https://instagram.com/cafe_spotline",
          website: "https://cafe-spotline.com",
        },
        description: "조용하고 아늑한 분위기의 카페입니다. 노트북 작업하기 좋아요.",
        tags: ["조용한", "와이파이", "노트북작업", "데이트"],
        images: ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop"],
        qrCode: {
          id: "demo_cafe_001",
          isActive: true,
        },
        isActive: true,
      },
      {
        name: "디저트 하우스",
        category: "restaurant",
        location: {
          address: "서울시 강남구 테헤란로 456",
          coordinates: {
            type: "Point",
            coordinates: [127.0286, 37.5048],
          },
          district: "강남구",
          area: "강남",
        },
        contact: {
          phone: "02-2345-6789",
        },
        businessHours: {
          monday: { open: "10:00", close: "21:00" },
          tuesday: { open: "10:00", close: "21:00" },
          wednesday: { open: "10:00", close: "21:00" },
          thursday: { open: "10:00", close: "21:00" },
          friday: { open: "10:00", close: "22:00" },
          saturday: { open: "10:00", close: "22:00" },
          sunday: { open: "11:00", close: "20:00" },
        },
        shortDescription: "달콤한 디저트와 음료를 즐길 수 있는 곳입니다.",
        spotlineStory: "강남에서 가장 맛있는 디저트를 만나보세요. 수제 케이크와 다양한 음료가 준비되어 있습니다. 달콤한 시간 후에는 근처 문화공간을 추천해드릴게요.",
        representativeImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
        externalLinks: {
          instagram: "https://instagram.com/dessert_house",
        },
        description: "달콤한 디저트와 음료를 즐길 수 있는 곳입니다.",
        tags: ["디저트", "달콤한", "인스타그램", "분위기좋은"],
        images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"],
        qrCode: {
          id: "demo_dessert_001",
          isActive: true,
        },
        isActive: true,
      },
      {
        name: "아트 갤러리 카페",
        category: "culture",
        location: {
          address: "서울시 강남구 테헤란로 789",
          coordinates: {
            type: "Point",
            coordinates: [126.98, 37.5685],
          },
          district: "강남구",
          area: "강남",
        },
        contact: {
          phone: "02-3456-7890",
          instagram: "@art_gallery_cafe",
        },
        businessHours: {
          monday: { open: "closed", close: "closed" },
          tuesday: { open: "11:00", close: "20:00" },
          wednesday: { open: "11:00", close: "20:00" },
          thursday: { open: "11:00", close: "20:00" },
          friday: { open: "11:00", close: "21:00" },
          saturday: { open: "10:00", close: "21:00" },
          sunday: { open: "10:00", close: "20:00" },
        },
        shortDescription: "예술 작품을 감상하며 커피를 마실 수 있는 갤러리 카페입니다.",
        spotlineStory: "예술과 커피가 만나는 특별한 공간입니다. 매월 새로운 작가의 전시가 열리며, 문화적 영감을 얻을 수 있습니다. 예술적 감성을 충전한 후 다음 장소를 추천해드릴게요.",
        representativeImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
        externalLinks: {
          instagram: "https://instagram.com/art_gallery_cafe",
          notion: "https://notion.so/art-gallery-cafe",
        },
        description: "예술 작품을 감상하며 커피를 마실 수 있는 갤러리 카페입니다.",
        tags: ["예술", "전시", "문화", "독특한"],
        images: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop"],
        qrCode: {
          id: "demo_gallery_001",
          isActive: true,
        },
        isActive: true,
      },
      {
        name: "홍대 북카페",
        category: "cafe",
        location: {
          address: "서울시 마포구 와우산로 321",
          coordinates: {
            type: "Point",
            coordinates: [126.925, 37.5575],
          },
          district: "마포구",
          area: "홍대",
        },
        contact: {
          phone: "02-4567-8901",
          instagram: "@hongdae_bookcafe",
        },
        businessHours: {
          monday: { open: "09:00", close: "23:00" },
          tuesday: { open: "09:00", close: "23:00" },
          wednesday: { open: "09:00", close: "23:00" },
          thursday: { open: "09:00", close: "23:00" },
          friday: { open: "09:00", close: "24:00" },
          saturday: { open: "10:00", close: "24:00" },
          sunday: { open: "10:00", close: "22:00" },
        },
        shortDescription: "책과 커피가 만나는 아늑한 공간입니다.",
        spotlineStory: "홍대의 활기찬 에너지 속에서 조용히 책을 읽을 수 있는 공간입니다. 다양한 장르의 책들과 함께 여유로운 시간을 보내세요. 독서 후에는 홍대의 다른 문화공간을 추천해드릴게요.",
        representativeImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
        externalLinks: {
          instagram: "https://instagram.com/hongdae_bookcafe",
          blog: "https://blog.naver.com/hongdae_bookcafe",
        },
        description: "책과 커피가 만나는 아늑한 공간입니다.",
        tags: ["책", "조용한", "홍대", "문화"],
        images: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"],
        qrCode: {
          id: "demo_bookcafe_001",
          isActive: true,
        },
        isActive: true,
      },
    ];

    // 매장 데이터 생성
    const createdStores = await Store.insertMany(initialStores);
    console.log(`✅ ${createdStores.length}개 초기 매장 생성 완료!`);

    console.log("\n🎉 SpotLine 초기 데이터 설정 완료!");
    
    console.log("\n👤 관리자 계정:");
    console.log("   - 사용자명: spotline-admin");
    console.log("   - 비밀번호: 12341234");
    console.log("   - 관리자 페이지: http://localhost:3002");

    console.log("\n🏪 생성된 매장 목록:");
    createdStores.forEach((store, index) => {
      console.log(`   ${index + 1}. ${store.name} (${store.qrCode.id}) - ${store.location.area}`);
    });

    console.log("\n🌐 테스트 URL:");
    console.log("   - 체험하기: http://localhost:4000/api/experience");
    console.log("   - 매장 목록: http://localhost:4000/api/stores");
    console.log("   - API 문서: http://localhost:4000/api-docs");

    await mongoose.disconnect();
    console.log("📡 MongoDB 연결 종료");
  } catch (error) {
    console.error("❌ 오류:", error);
    process.exit(1);
  }
};

setupInitialData();