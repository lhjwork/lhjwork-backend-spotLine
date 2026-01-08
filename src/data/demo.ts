// SpotLine 데모 데이터 V2.0
// 백엔드 API에서 사용하는 데모 데이터 정의

export interface DemoStore {
  id: string;
  name: string;
  shortDescription: string;
  representativeImage: string;
  category: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  qrCode: {
    id: string;
    isActive: boolean;
  };
  spotlineStory: {
    title: string;
    content: string;
    tags: string[];
  };
  externalLinks: Array<{
    type: string;
    url: string;
    title: string;
  }>;
  demoNotice: string;
}

export interface DemoNextSpot {
  id: string;
  name: string;
  shortDescription: string;
  representativeImage: string;
  category: string;
  distance: number;
  walkingTime: number;
  spotlineStory: {
    title: string;
    content: string;
  };
}

// 메인 데모 매장 (카페)
export const DEMO_STORE: DemoStore = {
  id: "demo-store",
  name: "아늑한 카페 스토리",
  shortDescription: "따뜻한 분위기의 동네 카페",
  representativeImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
  category: "cafe",
  location: {
    address: "서울시 강남구 테헤란로 123",
    coordinates: [127.0276, 37.4979]
  },
  qrCode: {
    id: "demo_cafe_001",
    isActive: true
  },
  spotlineStory: {
    title: "커피 한 잔의 여유",
    content: "바쁜 일상 속에서 잠시 멈춰 서서 향긋한 커피 한 잔과 함께하는 소중한 시간을 선사합니다. 정성스럽게 내린 원두커피와 수제 디저트로 특별한 순간을 만들어보세요. 아늑한 인테리어와 따뜻한 조명이 만들어내는 편안한 분위기에서 일상의 피로를 잠시 내려놓고 여유를 즐겨보세요.",
    tags: ["커피", "휴식", "분위기", "수제디저트"]
  },
  externalLinks: [
    {
      type: "instagram",
      url: "https://instagram.com/demo_cafe",
      title: "인스타그램"
    },
    {
      type: "website",
      url: "https://demo-cafe.com",
      title: "홈페이지"
    }
  ],
  demoNotice: "이것은 SpotLine 서비스 소개용 데모입니다. 실제 매장이 아닙니다."
};

// 근처 추천 Spot들 (4개)
export const DEMO_NEXT_SPOTS: DemoNextSpot[] = [
  {
    id: "demo_bakery_001",
    name: "달콤한 베이커리",
    shortDescription: "갓 구운 빵의 향기",
    representativeImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
    category: "bakery",
    distance: 150,
    walkingTime: 2,
    spotlineStory: {
      title: "갓 구운 빵의 행복",
      content: "매일 새벽부터 정성스럽게 구워내는 빵들이 여러분을 기다립니다. 밀가루 향과 버터의 고소함이 어우러진 따뜻한 빵 한 조각으로 하루를 달콤하게 시작해보세요."
    }
  },
  {
    id: "demo_bookstore_001",
    name: "조용한 서점",
    shortDescription: "책과 함께하는 시간",
    representativeImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
    category: "bookstore",
    distance: 200,
    walkingTime: 3,
    spotlineStory: {
      title: "책 속 여행",
      content: "좋은 책과 함께 떠나는 마음의 여행을 시작해보세요. 조용한 공간에서 책장을 넘기며 새로운 세상을 만나는 특별한 경험을 선사합니다."
    }
  },
  {
    id: "demo_flower_001",
    name: "꽃향기 플라워샵",
    shortDescription: "싱싱한 꽃과 식물",
    representativeImage: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
    category: "flower",
    distance: 300,
    walkingTime: 4,
    spotlineStory: {
      title: "자연의 선물",
      content: "아름다운 꽃과 식물로 일상에 생기를 더해보세요. 계절마다 다른 꽃들의 향기와 색깔로 마음에 평온함을 선사하는 특별한 공간입니다."
    }
  },
  {
    id: "demo_art_001",
    name: "작은 갤러리",
    shortDescription: "예술과의 만남",
    representativeImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
    category: "art",
    distance: 250,
    walkingTime: 3,
    spotlineStory: {
      title: "예술이 있는 공간",
      content: "지역 작가들의 작품을 감상하며 영감을 얻어보세요. 작은 공간이지만 큰 감동을 주는 예술 작품들이 여러분의 마음을 움직일 것입니다."
    }
  }
];

// 다양한 데모 시나리오 (향후 확장용)
export const DEMO_SCENARIOS = {
  cafe: {
    store: DEMO_STORE,
    nextSpots: DEMO_NEXT_SPOTS
  }
  // 향후 restaurant, retail 등 추가 가능
};

// 데모 응답 메타데이터
export const getDemoMeta = () => ({
  isDemo: true,
  scenario: "cafe",
  timestamp: new Date().toISOString()
});