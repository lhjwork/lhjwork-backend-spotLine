# SpotLine Live 시스템 아키텍처 가이드

## 📋 시스템 분리 개요

SpotLine 시스템을 **Demo**와 **Live** 두 개의 독립적인 시스템으로 분리하여 운영합니다.

### 🎭 Demo System (`/api/demo/*`)
- **목적**: 서비스 시연 및 데모
- **데이터**: 고정된 샘플 데이터
- **관리**: 어드민에서 실시간 수정 가능
- **DB**: 파일 기반 또는 별도 데모 DB

### 🚀 Live System (`/api/live/*`)
- **목적**: 실제 서비스 운영
- **데이터**: 실제 매장 및 사용자 데이터
- **관리**: 실제 매장주 등록 및 관리
- **DB**: 프로덕션 MongoDB

## 🏗️ Live 시스템 아키텍처

### 1. API 엔드포인트 구조

```
/api/live/
├── stores/                 # 실제 매장 관리
│   ├── GET /              # 매장 목록 조회
│   ├── GET /:storeId      # 특정 매장 조회
│   ├── POST /             # 새 매장 등록
│   ├── PUT /:storeId      # 매장 정보 수정
│   └── DELETE /:storeId   # 매장 삭제
├── qr/                    # QR 코드 시스템
│   ├── GET /:qrId         # QR 코드로 매장 조회
│   └── POST /generate     # QR 코드 생성
├── recommendations/       # 실제 추천 시스템
│   ├── GET /:storeId      # 매장 기반 추천
│   └── POST /feedback     # 추천 피드백
├── analytics/            # 실시간 분석
│   ├── GET /store/:storeId # 매장별 통계
│   └── GET /system        # 전체 시스템 통계
└── auth/                 # 매장주 인증
    ├── POST /register     # 매장주 회원가입
    ├── POST /login        # 로그인
    └── POST /verify       # 토큰 검증
```

### 2. 데이터베이스 스키마

#### Live Store Schema
```typescript
interface LiveStore {
  _id: ObjectId;
  storeId: string;           // 고유 매장 ID
  ownerId: ObjectId;         // 매장주 ID
  name: string;              // 매장명
  description: string;       // 매장 설명
  category: string;          // 카테고리
  location: {
    address: string;         // 주소
    coordinates: [number, number]; // 좌표
    district: string;        // 구/군
    city: string;           // 시/도
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
  };
  images: {
    representative: string;  // 대표 이미지
    gallery: string[];      // 갤러리 이미지
  };
  businessHours: {
    [key: string]: {        // 요일별 영업시간
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  spotlineStory: {
    title: string;
    content: string;
    tags: string[];
  };
  qrCodes: Array<{
    id: string;
    location: string;       // QR 코드 위치
    isActive: boolean;
    createdAt: Date;
  }>;
  status: 'pending' | 'active' | 'suspended' | 'closed';
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise';
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  };
  analytics: {
    totalViews: number;
    monthlyViews: number;
    qrScans: number;
    recommendations: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### Live Owner Schema
```typescript
interface LiveOwner {
  _id: ObjectId;
  email: string;
  password: string;         // 해시된 비밀번호
  name: string;
  phone: string;
  businessInfo: {
    businessName: string;
    businessNumber: string; // 사업자등록번호
    businessType: string;
  };
  stores: ObjectId[];       // 소유 매장 목록
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise';
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  };
  profile: {
    avatar?: string;
    bio?: string;
  };
  settings: {
    notifications: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  status: 'pending' | 'verified' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}
```

#### Live Recommendation Schema
```typescript
interface LiveRecommendation {
  _id: ObjectId;
  fromStoreId: ObjectId;    // 출발 매장
  toStoreId: ObjectId;      // 추천 매장
  distance: number;         // 거리 (미터)
  walkingTime: number;      // 도보 시간 (분)
  category: string;         // 추천 카테고리
  reason: string;           // 추천 이유
  priority: number;         // 우선순위 (1-10)
  isActive: boolean;
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## 💻 Live 시스템 구현

### 1. Live Store Controller

```typescript
// src/controllers/liveStoreController.ts
import { Request, Response } from "express";
import { LiveStore } from "../models/LiveStore";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";

/**
 * GET /api/live/stores
 * 실제 매장 목록 조회
 */
export const getLiveStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      city, 
      district,
      status = 'active'
    } = req.query;

    const filter: any = { status };
    if (category) filter.category = category;
    if (city) filter['location.city'] = city;
    if (district) filter['location.district'] = district;

    const stores = await LiveStore.find(filter)
      .populate('ownerId', 'name email')
      .select('-qrCodes -analytics') // 민감한 정보 제외
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await LiveStore.countDocuments(filter);

    res.json(
      formatResponse(
        true,
        "매장 목록을 성공적으로 가져왔습니다.",
        {
          stores,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        },
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Live stores get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 목록을 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/live/stores/:storeId
 * 특정 매장 상세 조회
 */
export const getLiveStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    const store = await LiveStore.findOne({ 
      storeId, 
      status: 'active' 
    })
    .populate('ownerId', 'name businessInfo.businessName')
    .select('-qrCodes'); // QR 코드 정보는 제외

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // 조회수 증가
    await LiveStore.updateOne(
      { _id: store._id },
      { 
        $inc: { 
          'analytics.totalViews': 1,
          'analytics.monthlyViews': 1 
        }
      }
    );

    res.json(
      formatResponse(
        true,
        "매장 정보를 성공적으로 가져왔습니다.",
        store,
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Live store get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 정보를 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * POST /api/live/stores
 * 새 매장 등록 (매장주 전용)
 */
export const createLiveStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id; // JWT에서 추출
    const storeData = req.body;

    // 매장 ID 생성
    const storeId = `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newStore = new LiveStore({
      ...storeData,
      storeId,
      ownerId,
      status: 'pending', // 승인 대기
      analytics: {
        totalViews: 0,
        monthlyViews: 0,
        qrScans: 0,
        recommendations: 0
      }
    });

    await newStore.save();

    res.status(HTTP_STATUS.CREATED).json(
      formatResponse(
        true,
        "매장이 성공적으로 등록되었습니다. 승인 후 서비스가 시작됩니다.",
        { storeId: newStore.storeId },
        HTTP_STATUS.CREATED
      )
    );
  } catch (error) {
    console.error("Live store create error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 등록에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * PUT /api/live/stores/:storeId
 * 매장 정보 수정 (매장주 전용)
 */
export const updateLiveStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const ownerId = req.user?.id;
    const updateData = req.body;

    const store = await LiveStore.findOne({ storeId, ownerId });
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없거나 수정 권한이 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // 민감한 필드 제외
    const { _id, storeId: _, ownerId: __, createdAt, ...allowedUpdates } = updateData;

    await LiveStore.updateOne(
      { _id: store._id },
      { 
        ...allowedUpdates,
        updatedAt: new Date()
      }
    );

    res.json(
      formatResponse(
        true,
        "매장 정보가 성공적으로 수정되었습니다.",
        null,
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Live store update error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 정보 수정에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};
```

### 2. Live QR Controller

```typescript
// src/controllers/liveQrController.ts
import { Request, Response } from "express";
import { LiveStore } from "../models/LiveStore";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";

/**
 * GET /api/live/qr/:qrId
 * QR 코드로 매장 조회
 */
export const getStoreByQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;

    const store = await LiveStore.findOne({
      'qrCodes.id': qrId,
      'qrCodes.isActive': true,
      status: 'active'
    })
    .populate('ownerId', 'name businessInfo.businessName')
    .select('-qrCodes');

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "유효하지 않은 QR 코드입니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // QR 스캔 통계 업데이트
    await LiveStore.updateOne(
      { _id: store._id },
      { 
        $inc: { 
          'analytics.qrScans': 1,
          'analytics.totalViews': 1
        }
      }
    );

    res.json(
      formatResponse(
        true,
        "매장 정보를 성공적으로 가져왔습니다.",
        store,
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Live QR get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "QR 코드 처리 중 오류가 발생했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * POST /api/live/qr/generate
 * QR 코드 생성 (매장주 전용)
 */
export const generateQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId, location } = req.body;
    const ownerId = req.user?.id;

    const store = await LiveStore.findOne({ storeId, ownerId });
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없거나 권한이 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // QR 코드 ID 생성
    const qrId = `qr_${storeId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // QR 코드 추가
    await LiveStore.updateOne(
      { _id: store._id },
      {
        $push: {
          qrCodes: {
            id: qrId,
            location: location || 'default',
            isActive: true,
            createdAt: new Date()
          }
        }
      }
    );

    res.json(
      formatResponse(
        true,
        "QR 코드가 성공적으로 생성되었습니다.",
        { 
          qrId,
          qrUrl: `${process.env.FRONTEND_URL}/spotline/live?qr=${qrId}`,
          downloadUrl: `${process.env.API_URL}/api/live/qr/${qrId}/download`
        },
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("QR generate error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "QR 코드 생성에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};
```

### 3. Live Recommendation Controller

```typescript
// src/controllers/liveRecommendationController.ts
import { Request, Response } from "express";
import { LiveStore } from "../models/LiveStore";
import { LiveRecommendation } from "../models/LiveRecommendation";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";

/**
 * GET /api/live/recommendations/:storeId
 * 매장 기반 실제 추천
 */
export const getLiveRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { limit = 4 } = req.query;

    // 현재 매장 확인
    const currentStore = await LiveStore.findOne({ storeId, status: 'active' });
    if (!currentStore) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // 추천 매장 조회 (거리 기반 + 카테고리 다양성)
    const recommendations = await LiveRecommendation.find({
      fromStoreId: currentStore._id,
      isActive: true
    })
    .populate({
      path: 'toStoreId',
      match: { status: 'active' },
      select: 'storeId name description category location images spotlineStory'
    })
    .sort({ priority: -1, distance: 1 })
    .limit(Number(limit));

    // null인 추천 제거 (비활성 매장)
    const validRecommendations = recommendations
      .filter(rec => rec.toStoreId)
      .map(rec => ({
        id: rec.toStoreId.storeId,
        name: rec.toStoreId.name,
        shortDescription: rec.toStoreId.description,
        representativeImage: rec.toStoreId.images.representative,
        category: rec.toStoreId.category,
        distance: rec.distance,
        walkingTime: rec.walkingTime,
        spotlineStory: rec.toStoreId.spotlineStory,
        reason: rec.reason
      }));

    // 추천 통계 업데이트
    await LiveStore.updateOne(
      { _id: currentStore._id },
      { $inc: { 'analytics.recommendations': 1 } }
    );

    res.json(
      formatResponse(
        true,
        "추천 매장을 성공적으로 가져왔습니다.",
        {
          store: {
            id: currentStore.storeId,
            name: currentStore.name,
            shortDescription: currentStore.description,
            representativeImage: currentStore.images.representative,
            category: currentStore.category,
            location: currentStore.location,
            spotlineStory: currentStore.spotlineStory
          },
          nextSpots: validRecommendations
        },
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Live recommendations get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "추천 매장을 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * POST /api/live/recommendations/feedback
 * 추천 피드백 수집
 */
export const submitRecommendationFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fromStoreId, toStoreId, action, rating } = req.body;

    // 추천 기록 찾기
    const recommendation = await LiveRecommendation.findOne({
      fromStoreId,
      toStoreId
    });

    if (recommendation) {
      // 통계 업데이트
      const updateData: any = {};
      
      if (action === 'view') {
        updateData['analytics.views'] = (recommendation.analytics.views || 0) + 1;
      } else if (action === 'click') {
        updateData['analytics.clicks'] = (recommendation.analytics.clicks || 0) + 1;
      } else if (action === 'visit') {
        updateData['analytics.conversions'] = (recommendation.analytics.conversions || 0) + 1;
      }

      await LiveRecommendation.updateOne(
        { _id: recommendation._id },
        { $set: updateData }
      );
    }

    res.json(
      formatResponse(
        true,
        "피드백이 성공적으로 기록되었습니다.",
        null,
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Recommendation feedback error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "피드백 기록에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};
```

## 🔄 시스템 통합

### 1. 라우터 분리

```typescript
// src/server.ts
import demoRoutes from "./routes/demo";
import liveStoreRoutes from "./routes/liveStore";
import liveQrRoutes from "./routes/liveQr";
import liveRecommendationRoutes from "./routes/liveRecommendation";

// Demo 시스템 (기존)
app.use("/api/demo", demoRoutes);

// Live 시스템 (새로 추가)
app.use("/api/live/stores", liveStoreRoutes);
app.use("/api/live/qr", liveQrRoutes);
app.use("/api/live/recommendations", liveRecommendationRoutes);
```

### 2. 환경별 설정

```typescript
// config/system.ts
export const systemConfig = {
  demo: {
    enabled: true,
    dataSource: 'file', // 'file' | 'database'
    adminManageable: true
  },
  live: {
    enabled: process.env.NODE_ENV === 'production',
    dataSource: 'database',
    requireAuth: true,
    approvalRequired: true
  }
};
```

## 🎯 주요 차이점

| 구분 | Demo System | Live System |
|------|-------------|-------------|
| **목적** | 서비스 시연 | 실제 서비스 |
| **데이터** | 고정 샘플 | 실제 매장 |
| **인증** | 불필요 | JWT 기반 |
| **승인** | 불필요 | 관리자 승인 |
| **통계** | 시뮬레이션 | 실제 수집 |
| **QR코드** | 고정 | 동적 생성 |
| **추천** | 고정 4개 | AI 기반 동적 |
| **결제** | 없음 | 구독 기반 |

이제 Demo와 Live 시스템이 완전히 분리되어 각각의 목적에 맞게 운영할 수 있습니다!