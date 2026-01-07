# Spotline Frontend API 문서

프론트엔드 개발을 위한 Spotline API 가이드입니다.

## 🌐 Base URL
```
Production: https://your-render-app.onrender.com
Development: http://localhost:4000
```

## 📋 목차
- [매장 API](#매장-api)
- [추천 API](#추천-api)
- [분석 API](#분석-api)
- [지오코딩 API](#지오코딩-api)
- [데이터 구조](#데이터-구조)
- [에러 처리](#에러-처리)

---

## 매장 API

### 1. 모든 매장 조회
```http
GET /api/stores
```

**Query Parameters:**
- `category` (선택): 매장 카테고리 필터
  - `cafe`, `restaurant`, `exhibition`, `hotel`, `retail`, `culture`, `other`
- `area` (선택): 상권 필터
- `limit` (선택): 결과 개수 제한 (기본값: 20)

**응답 예시:**
```json
{
  "success": true,
  "message": "매장 목록 조회 성공",
  "data": [
    {
      "_id": "store_id_123",
      "name": "카페 스팟라인",
      "category": "cafe",
      "location": {
        "address": "서울시 강남구 테헤란로 123",
        "coordinates": {
          "type": "Point",
          "coordinates": [127.0276, 37.4979]
        },
        "district": "강남구",
        "area": "테헤란로"
      },
      "contact": {
        "phone": "02-1234-5678",
        "website": "https://cafe-spotline.com",
        "instagram": "@cafe_spotline"
      },
      "businessHours": {
        "monday": { "open": "08:00", "close": "22:00" },
        "tuesday": { "open": "08:00", "close": "22:00" }
      },
      "description": "편안한 분위기의 카페",
      "tags": ["wifi", "디저트", "조용한"],
      "images": ["image1.jpg", "image2.jpg"],
      "qrCode": {
        "id": "qr_123456",
        "isActive": true
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. QR 코드로 매장 조회 (핵심 기능)
```http
GET /api/stores/qr/{qrId}
```

**Path Parameters:**
- `qrId`: QR 코드 ID

**응답 예시:**
```json
{
  "success": true,
  "message": "매장 조회 성공",
  "data": {
    "_id": "store_id_123",
    "name": "카페 스팟라인",
    "category": "cafe",
    "location": {
      "address": "서울시 강남구 테헤란로 123",
      "coordinates": {
        "type": "Point",
        "coordinates": [127.0276, 37.4979]
      }
    },
    "qrCode": {
      "id": "qr_123456",
      "isActive": true
    }
  }
}
```

### 3. 근처 매장 검색
```http
GET /api/stores/nearby/{lat}/{lng}
```

**Path Parameters:**
- `lat`: 위도
- `lng`: 경도

**Query Parameters:**
- `radius` (선택): 검색 반경 (미터, 기본값: 1000)
- `category` (선택): 카테고리 필터

**응답 예시:**
```json
{
  "success": true,
  "message": "근처 매장 조회 성공",
  "data": [
    {
      "_id": "store_id_123",
      "name": "카페 스팟라인",
      "category": "cafe",
      "location": {
        "address": "서울시 강남구 테헤란로 123",
        "coordinates": {
          "type": "Point",
          "coordinates": [127.0276, 37.4979]
        }
      },
      "distance": 250
    }
  ]
}
```

### 4. 특정 매장 조회
```http
GET /api/stores/{id}
```

**Path Parameters:**
- `id`: 매장 ID

---

## 추천 API

### 1. QR 코드 기반 추천 조회 (핵심 기능)
```http
GET /api/recommendations/qr/{qrId}
```

**Path Parameters:**
- `qrId`: QR 코드 ID

**Query Parameters:**
- `category` (선택): 추천 카테고리 필터
  - `next_meal`, `dessert`, `activity`, `shopping`, `culture`, `rest`
- `limit` (선택): 결과 개수 제한 (기본값: 10)

**응답 예시:**
```json
{
  "success": true,
  "message": "추천 목록 조회 성공",
  "data": [
    {
      "_id": "rec_id_123",
      "fromStore": {
        "_id": "store_id_123",
        "name": "카페 스팟라인",
        "category": "cafe"
      },
      "toStore": {
        "_id": "store_id_456",
        "name": "맛집 레스토랑",
        "category": "restaurant",
        "location": {
          "address": "서울시 강남구 테헤란로 456",
          "coordinates": {
            "type": "Point",
            "coordinates": [127.0286, 37.4989]
          }
        }
      },
      "category": "next_meal",
      "priority": 8,
      "distance": 300,
      "walkingTime": 4,
      "description": "카페 후 식사하기 좋은 곳",
      "tags": ["한식", "점심", "가까운"]
    }
  ]
}
```

### 2. 매장별 추천 조회
```http
GET /api/recommendations/store/{storeId}
```

**Path Parameters:**
- `storeId`: 매장 ID

**Query Parameters:**
- `category` (선택): 카테고리 필터

### 3. 카테고리별 추천 통계
```http
GET /api/recommendations/stats/categories
```

**응답 예시:**
```json
{
  "success": true,
  "message": "카테고리별 통계 조회 성공",
  "data": {
    "categories": [
      {
        "category": "next_meal",
        "count": 45
      },
      {
        "category": "dessert",
        "count": 32
      }
    ]
  }
}
```

---

## 분석 API

### 1. 이벤트 로깅 (중요!)
```http
POST /api/analytics/event
```

**Request Body:**
```json
{
  "qrCode": "qr_123456",
  "store": "store_id_123",
  "eventType": "qr_scan",
  "targetStore": "store_id_456",
  "sessionId": "session_789",
  "metadata": {
    "category": "next_meal",
    "position": 1,
    "duration": 5000
  }
}
```

**이벤트 타입:**
- `qr_scan`: QR 코드 스캔
- `page_view`: 페이지 조회
- `recommendation_click`: 추천 클릭
- `map_click`: 지도 클릭
- `store_visit`: 매장 방문

**응답 예시:**
```json
{
  "success": true,
  "message": "이벤트 로깅 성공",
  "data": {
    "id": "analytics_id_123"
  }
}
```

### 2. QR 코드별 통계 조회
```http
GET /api/analytics/qr/{qrId}
```

**Query Parameters:**
- `startDate` (선택): 시작 날짜 (YYYY-MM-DD)
- `endDate` (선택): 종료 날짜 (YYYY-MM-DD)

### 3. 매장별 통계 조회
```http
GET /api/analytics/store/{storeId}
```

**Query Parameters:**
- `period` (선택): 통계 기간 (`day`, `week`, `month`)

---

## 지오코딩 API

### 1. 통합 지오코딩 (추천)
```http
GET /api/geocoding/unified?address={주소}
```

**Query Parameters:**
- `address`: 변환할 주소

**응답 예시:**
```json
{
  "coordinates": {
    "lat": 37.4979,
    "lng": 127.0276
  },
  "source": "kakao",
  "address": "서울특별시 강남구 테헤란로 123"
}
```

### 2. 좌표 유효성 검증
```http
POST /api/geocoding/validate
```

**Request Body:**
```json
{
  "lat": 37.4979,
  "lng": 127.0276
}
```

**응답 예시:**
```json
{
  "valid": true,
  "coordinates": {
    "lat": 37.4979,
    "lng": 127.0276
  },
  "message": "유효한 좌표입니다"
}
```

---

## 데이터 구조

### Store (매장)
```typescript
interface Store {
  _id: string;
  name: string;
  category: "cafe" | "restaurant" | "exhibition" | "hotel" | "retail" | "culture" | "other";
  location: {
    address: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [경도, 위도]
    };
    district?: string;
    area?: string;
  };
  contact?: {
    phone?: string;
    website?: string;
    instagram?: string;
  };
  businessHours?: {
    [key: string]: { open?: string; close?: string };
  };
  description?: string;
  tags?: string[];
  images?: string[];
  qrCode: {
    id: string;
    isActive: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Recommendation (추천)
```typescript
interface Recommendation {
  _id: string;
  fromStore: Store;
  toStore: Store;
  category: "next_meal" | "dessert" | "activity" | "shopping" | "culture" | "rest";
  priority: number;
  distance?: number;
  walkingTime?: number;
  description?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
}
```

---

## 에러 처리

### 공통 에러 응답 형식
```json
{
  "success": false,
  "message": "에러 메시지",
  "status": 400
}
```

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 내부 오류

---

## 사용 예시

### React/Next.js 예시
```javascript
// QR 코드로 매장 정보 가져오기
const fetchStoreByQR = async (qrId) => {
  try {
    const response = await fetch(`/api/stores/qr/${qrId}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('매장 조회 실패:', error);
    throw error;
  }
};

// 추천 목록 가져오기
const fetchRecommendations = async (qrId, category = null) => {
  try {
    const url = new URL(`/api/recommendations/qr/${qrId}`, window.location.origin);
    if (category) url.searchParams.append('category', category);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('추천 조회 실패:', error);
    throw error;
  }
};

// 이벤트 로깅
const logEvent = async (eventData) => {
  try {
    const response = await fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('이벤트 로깅 실패:', error);
    return false;
  }
};
```

### 사용 시나리오
1. **QR 코드 스캔 시**: `GET /api/stores/qr/{qrId}` → 매장 정보 표시
2. **추천 목록 표시**: `GET /api/recommendations/qr/{qrId}` → 추천 매장들 표시
3. **사용자 행동 추적**: `POST /api/analytics/event` → 클릭, 스캔 등 이벤트 로깅
4. **근처 매장 검색**: `GET /api/stores/nearby/{lat}/{lng}` → 위치 기반 매장 검색

---

## 📞 문의
API 관련 문의사항이 있으시면 개발팀에 연락해주세요.