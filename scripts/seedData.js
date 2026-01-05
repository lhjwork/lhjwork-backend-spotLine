const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// 모델 import
const Store = require('../models/Store');
const Recommendation = require('../models/Recommendation');
const Analytics = require('../models/Analytics');

// 테스트 매장 데이터
const testStores = [
  {
    name: "카페 스팟라인",
    category: "cafe",
    location: {
      address: "서울시 강남구 테헤란로 123",
      coordinates: {
        type: "Point",
        coordinates: [126.9780, 37.5665] // [경도, 위도] 순서
      },
      district: "강남구",
      area: "강남"
    },
    contact: {
      phone: "02-1234-5678",
      website: "https://cafe-spotline.com",
      instagram: "@cafe_spotline"
    },
    businessHours: {
      monday: { open: "08:00", close: "22:00" },
      tuesday: { open: "08:00", close: "22:00" },
      wednesday: { open: "08:00", close: "22:00" },
      thursday: { open: "08:00", close: "22:00" },
      friday: { open: "08:00", close: "23:00" },
      saturday: { open: "09:00", close: "23:00" },
      sunday: { open: "09:00", close: "21:00" }
    },
    description: "조용하고 아늑한 분위기의 카페입니다. 노트북 작업하기 좋아요.",
    tags: ["조용한", "와이파이", "노트북작업", "데이트"],
    images: ["https://example.com/cafe1.jpg"],
    qrCode: {
      id: uuidv4(),
      isActive: true
    }
  },
  {
    name: "디저트 하우스",
    category: "restaurant",
    location: {
      address: "서울시 강남구 테헤란로 456",
      coordinates: {
        type: "Point",
        coordinates: [126.9790, 37.5675] // [경도, 위도] 순서
      },
      district: "강남구",
      area: "강남"
    },
    contact: {
      phone: "02-2345-6789"
    },
    businessHours: {
      monday: { open: "10:00", close: "21:00" },
      tuesday: { open: "10:00", close: "21:00" },
      wednesday: { open: "10:00", close: "21:00" },
      thursday: { open: "10:00", close: "21:00" },
      friday: { open: "10:00", close: "22:00" },
      saturday: { open: "10:00", close: "22:00" },
      sunday: { open: "11:00", close: "20:00" }
    },
    description: "달콤한 디저트와 음료를 즐길 수 있는 곳입니다.",
    tags: ["디저트", "달콤한", "인스타그램", "분위기좋은"],
    images: ["https://example.com/dessert1.jpg"],
    qrCode: {
      id: uuidv4(),
      isActive: true
    }
  },
  {
    name: "아트 갤러리 카페",
    category: "culture",
    location: {
      address: "서울시 강남구 테헤란로 789",
      coordinates: {
        type: "Point",
        coordinates: [126.9800, 37.5685] // [경도, 위도] 순서
      },
      district: "강남구",
      area: "강남"
    },
    contact: {
      phone: "02-3456-7890",
      instagram: "@art_gallery_cafe"
    },
    businessHours: {
      monday: { open: "closed", close: "closed" },
      tuesday: { open: "11:00", close: "20:00" },
      wednesday: { open: "11:00", close: "20:00" },
      thursday: { open: "11:00", close: "20:00" },
      friday: { open: "11:00", close: "21:00" },
      saturday: { open: "10:00", close: "21:00" },
      sunday: { open: "10:00", close: "20:00" }
    },
    description: "예술 작품을 감상하며 커피를 마실 수 있는 갤러리 카페입니다.",
    tags: ["예술", "전시", "문화", "독특한"],
    images: ["https://example.com/gallery1.jpg"],
    qrCode: {
      id: uuidv4(),
      isActive: true
    }
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 MongoDB Atlas 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas 연결 성공!');

    // 기존 데이터 삭제 (테스트용)
    console.log('🧹 기존 테스트 데이터 정리 중...');
    await Store.deleteMany({});
    await Recommendation.deleteMany({});
    await Analytics.deleteMany({});

    // 매장 데이터 생성
    console.log('🏪 테스트 매장 데이터 생성 중...');
    const createdStores = await Store.insertMany(testStores);
    console.log(`✅ ${createdStores.length}개 매장 생성 완료`);

    // 추천 관계 생성
    console.log('🔗 추천 관계 생성 중...');
    const recommendations = [
      {
        fromStore: createdStores[0]._id, // 카페 스팟라인
        toStore: createdStores[1]._id,   // 디저트 하우스
        category: "dessert",
        priority: 8,
        distance: 200,
        walkingTime: 3,
        description: "커피 후 달콤한 디저트는 어떠세요?",
        tags: ["디저트", "가까운", "추천"]
      },
      {
        fromStore: createdStores[0]._id, // 카페 스팟라인
        toStore: createdStores[2]._id,   // 아트 갤러리 카페
        category: "culture",
        priority: 7,
        distance: 300,
        walkingTime: 4,
        description: "예술 작품을 감상하며 여유로운 시간을 보내세요",
        tags: ["문화", "예술", "힐링"]
      },
      {
        fromStore: createdStores[1]._id, // 디저트 하우스
        toStore: createdStores[2]._id,   // 아트 갤러리 카페
        category: "culture",
        priority: 6,
        distance: 150,
        walkingTime: 2,
        description: "디저트 후 문화 생활은 어떠세요?",
        tags: ["문화", "산책", "여유"]
      }
    ];

    const createdRecommendations = await Recommendation.insertMany(recommendations);
    console.log(`✅ ${createdRecommendations.length}개 추천 관계 생성 완료`);

    // 샘플 분석 데이터 생성
    console.log('📊 샘플 분석 데이터 생성 중...');
    const analyticsData = [
      {
        qrCode: createdStores[0].qrCode.id,
        store: createdStores[0]._id,
        eventType: "qr_scan",
        sessionId: "session_001",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
        ipAddress: "192.168.1.100",
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30분 전
      },
      {
        qrCode: createdStores[0].qrCode.id,
        store: createdStores[0]._id,
        eventType: "page_view",
        sessionId: "session_001",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
        ipAddress: "192.168.1.100",
        timestamp: new Date(Date.now() - 1000 * 60 * 29) // 29분 전
      },
      {
        qrCode: createdStores[0].qrCode.id,
        store: createdStores[0]._id,
        eventType: "recommendation_click",
        targetStore: createdStores[1]._id,
        sessionId: "session_001",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
        ipAddress: "192.168.1.100",
        metadata: {
          category: "dessert",
          position: 1
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 25) // 25분 전
      }
    ];

    const createdAnalytics = await Analytics.insertMany(analyticsData);
    console.log(`✅ ${createdAnalytics.length}개 분석 데이터 생성 완료`);

    // 생성된 데이터 요약 출력
    console.log('\n📋 생성된 테스트 데이터 요약:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    createdStores.forEach((store, index) => {
      console.log(`🏪 매장 ${index + 1}: ${store.name}`);
      console.log(`   📍 위치: ${store.location.address}`);
      console.log(`   🏷️  카테고리: ${store.category}`);
      console.log(`   🔗 QR 코드: ${store.qrCode.id}`);
      console.log('');
    });

    console.log('🎯 테스트 API 호출 예시:');
    console.log(`GET http://localhost:3000/api/stores`);
    console.log(`GET http://localhost:3000/api/stores/qr/${createdStores[0].qrCode.id}`);
    console.log(`GET http://localhost:3000/api/recommendations/qr/${createdStores[0].qrCode.id}`);
    console.log('');

  } catch (error) {
    console.error('❌ 데이터 생성 실패:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 해결 방법: .env 파일의 사용자명과 비밀번호를 확인하세요');
    } else if (error.message.includes('IP')) {
      console.log('💡 해결 방법: Atlas Network Access에서 현재 IP를 허용하세요');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 데이터베이스 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, testStores };