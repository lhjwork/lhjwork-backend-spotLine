# Spotline Admin API 문서

관리자 대시보드 개발을 위한 Spotline API 가이드입니다.

## 🌐 Base URL

```
Production: https://your-render-app.onrender.com
Development: http://localhost:4000
```

## 🔐 인증

모든 관리자 API는 JWT 토큰 인증이 필요합니다.

**헤더 설정:**

```
Authorization: Bearer {your-jwt-token}
```

## 📋 목차

- [인증 API](#인증-api)
- [매장 관리 API](#매장-관리-api)
- [추천 관리 API](#추천-관리-api)
- [분석 API](#분석-api)
- [지오코딩 API](#지오코딩-api)
- [데이터 구조](#데이터-구조)
- [에러 처리](#에러-처리)

---

## 인증 API

### 1. 관리자 로그인

```http
POST /api/admin/login
```

**Request Body:**

```json
{
  "username": "admin",
  "password": "password123"
}
```

**응답 예시:**

```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "admin": {
      "_id": "admin_id_123",
      "username": "admin",
      "email": "admin@spotline.com",
      "role": "admin",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### 2. 관리자 프로필 조회

```http
GET /api/admin/profile
```

**Headers:**

```
Authorization: Bearer {token}
```

**응답 예시:**

```json
{
  "success": true,
  "message": "프로필 조회 성공",
  "data": {
    "_id": "admin_id_123",
    "username": "admin",
    "email": "admin@spotline.com",
    "role": "admin",
    "isActive": true,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 토큰 검증

```http
GET /api/admin/verify
```

**Headers:**

```
Authorization: Bearer {token}
```

### 4. 관리자 계정 생성

```http
POST /api/admin/create
```

**Request Body:**

```json
{
  "username": "newadmin",
  "email": "newadmin@spotline.com",
  "password": "securepassword123",
  "role": "admin"
}
```

---

## 매장 관리 API

### 1. 모든 매장 조회

```http
GET /api/stores
```

**Query Parameters:**

- `category` (선택): 매장 카테고리 필터
- `area` (선택): 상권 필터
- `limit` (선택): 결과 개수 제한

### 2. 매장 등록

```http
POST /api/stores
```

**Request Body:**

```json
{
  "name": "새로운 카페",
  "category": "cafe",
  "location": {
    "address": "서울시 강남구 테헤란로 789",
    "coordinates": {
      "type": "Point",
      "coordinates": [127.0286, 37.4989]
    },
    "district": "강남구",
    "area": "테헤란로"
  },
  "contact": {
    "phone": "02-9876-5432",
    "website": "https://newcafe.com",
    "instagram": "@new_cafe"
  },
  "businessHours": {
    "monday": { "open": "09:00", "close": "21:00" },
    "tuesday": { "open": "09:00", "close": "21:00" },
    "wednesday": { "open": "09:00", "close": "21:00" },
    "thursday": { "open": "09:00", "close": "21:00" },
    "friday": { "open": "09:00", "close": "22:00" },
    "saturday": { "open": "10:00", "close": "22:00" },
    "sunday": { "open": "10:00", "close": "20:00" }
  },
  "description": "아늑한 분위기의 신규 카페",
  "tags": ["wifi", "조용한", "디저트", "커피"],
  "images": ["cafe1.jpg", "cafe2.jpg"],
  "qrCode": {
    "id": "qr_new_789",
    "isActive": true
  }
}
```

**응답 예시:**

```json
{
  "success": true,
  "message": "매장 등록 성공",
  "data": {
    "_id": "store_id_789",
    "name": "새로운 카페",
    "category": "cafe",
    "location": {
      "address": "서울시 강남구 테헤란로 789",
      "coordinates": {
        "type": "Point",
        "coordinates": [127.0286, 37.4989]
      }
    },
    "qrCode": {
      "id": "qr_new_789",
      "isActive": true
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 매장 정보 수정

```http
PUT /api/stores/{id}
```

**Path Parameters:**

- `id`: 매장 ID

**Request Body:** (수정할 필드만 포함)

```json
{
  "name": "수정된 카페명",
  "description": "업데이트된 설명",
  "businessHours": {
    "monday": { "open": "08:00", "close": "22:00" }
  }
}
```

### 4. 매장 삭제 (비활성화)

```http
DELETE /api/stores/{id}
```

**Path Parameters:**

- `id`: 매장 ID

### 5. 특정 매장 조회

```http
GET /api/stores/{id}
```

### 6. QR 코드로 매장 조회

```http
GET /api/stores/qr/{qrId}
```

### 7. 근처 매장 검색

```http
GET /api/stores/nearby/{lat}/{lng}
```

---

## 추천 관리 API

### 1. 추천 관계 생성

```http
POST /api/recommendations
```

**Request Body:**

```json
{
  "fromStore": "store_id_123",
  "toStore": "store_id_456",
  "category": "next_meal",
  "priority": 8,
  "description": "카페 후 식사하기 좋은 곳",
  "tags": ["한식", "점심", "가까운"]
}
```

**응답 예시:**

```json
{
  "success": true,
  "message": "추천 관계 생성 성공",
  "data": {
    "_id": "rec_id_789",
    "fromStore": "store_id_123",
    "toStore": "store_id_456",
    "category": "next_meal",
    "priority": 8,
    "description": "카페 후 식사하기 좋은 곳",
    "tags": ["한식", "점심", "가까운"],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 추천 관계 수정

```http
PUT /api/recommendations/{id}
```

**Path Parameters:**

- `id`: 추천 ID

**Request Body:**

```json
{
  "priority": 9,
  "description": "업데이트된 설명"
}
```

### 3. 추천 관계 삭제

```http
DELETE /api/recommendations/{id}
```

### 4. QR 코드별 추천 조회

```http
GET /api/recommendations/qr/{qrId}
```

### 5. 매장별 추천 조회

```http
GET /api/recommendations/store/{storeId}
```

### 6. 카테고리별 추천 통계

```http
GET /api/recommendations/stats/categories
```

---

## 분석 API

### 1. QR 코드별 통계

```http
GET /api/analytics/qr/{qrId}
```

**Query Parameters:**

- `startDate` (선택): 시작 날짜 (YYYY-MM-DD)
- `endDate` (선택): 종료 날짜 (YYYY-MM-DD)

**응답 예시:**

```json
{
  "success": true,
  "message": "QR 코드 통계 조회 성공",
  "data": {
    "qrCode": "qr_123456",
    "totalScans": 1250,
    "uniqueVisitors": 890,
    "eventBreakdown": {
      "qr_scan": 1250,
      "page_view": 2340,
      "recommendation_click": 456,
      "map_click": 123,
      "store_visit": 89
    },
    "dailyStats": [
      {
        "date": "2024-01-01",
        "scans": 45,
        "visitors": 32
      }
    ]
  }
}
```

### 2. 매장별 통계

```http
GET /api/analytics/store/{storeId}
```

**Query Parameters:**

- `period` (선택): 통계 기간 (`day`, `week`, `month`)

**응답 예시:**

```json
{
  "success": true,
  "message": "매장 통계 조회 성공",
  "data": {
    "storeId": "store_id_123",
    "totalVisits": 2340,
    "recommendationClicks": 456,
    "conversionRate": 0.195,
    "popularRecommendations": [
      {
        "category": "next_meal",
        "clicks": 234
      },
      {
        "category": "dessert",
        "clicks": 123
      }
    ]
  }
}
```

### 3. 추천 성과 분석

```http
GET /api/analytics/recommendations/performance
```

**Query Parameters:**

- `category` (선택): 카테고리 필터
- `limit` (선택): 결과 개수 제한

**응답 예시:**

```json
{
  "success": true,
  "message": "추천 성과 분석 조회 성공",
  "data": [
    {
      "recommendationId": "rec_id_123",
      "fromStore": {
        "name": "카페 스팟라인",
        "category": "cafe"
      },
      "toStore": {
        "name": "맛집 레스토랑",
        "category": "restaurant"
      },
      "clicks": 234,
      "impressions": 1200,
      "clickRate": 0.195,
      "category": "next_meal"
    }
  ]
}
```

### 4. 일별 트래픽 통계

```http
GET /api/analytics/traffic/daily
```

**Query Parameters:**

- `days` (선택): 조회할 일수 (기본값: 30)

**응답 예시:**

```json
{
  "success": true,
  "message": "일별 트래픽 조회 성공",
  "data": [
    {
      "date": "2024-01-01",
      "totalEvents": 1250,
      "uniqueUsers": 890,
      "qrScans": 456,
      "pageViews": 2340,
      "recommendationClicks": 234
    },
    {
      "date": "2024-01-02",
      "totalEvents": 1180,
      "uniqueUsers": 820,
      "qrScans": 423,
      "pageViews": 2100,
      "recommendationClicks": 210
    }
  ]
}
```

### 5. 이벤트 로깅 (관리자도 사용 가능)

```http
POST /api/analytics/event
```

---

## 지오코딩 API

### 1. 통합 지오코딩

```http
GET /api/geocoding/unified?address={주소}
```

### 2. 네이버 지오코딩

```http
GET /api/geocoding/naver?address={주소}
```

### 3. 구글 지오코딩

```http
GET /api/geocoding/google?address={주소}
```

### 4. 좌표 유효성 검증

```http
POST /api/geocoding/validate
```

---

## 데이터 구조

### Admin (관리자)

```typescript
interface Admin {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "super_admin";
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Store (매장) - 프론트엔드와 동일

### Recommendation (추천) - 프론트엔드와 동일

### Analytics (분석)

```typescript
interface Analytics {
  _id: string;
  qrCode: string;
  store: string;
  eventType: "qr_scan" | "page_view" | "recommendation_click" | "map_click" | "store_visit";
  targetStore?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  timestamp: string;
  metadata?: {
    category?: string;
    position?: number;
    duration?: number;
  };
}
```

---

## 에러 처리

### 인증 에러

```json
{
  "success": false,
  "message": "인증이 필요합니다",
  "status": 401
}
```

### 권한 에러

```json
{
  "success": false,
  "message": "권한이 없습니다",
  "status": 403
}
```

### 일반 에러 - 프론트엔드와 동일

---

## 사용 예시

### React Admin Dashboard 예시

```javascript
// 인증 토큰 저장
const setAuthToken = (token) => {
  localStorage.setItem("admin_token", token);
};

// API 요청 헬퍼
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("admin_token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data;
};

// 관리자 로그인
const adminLogin = async (username, password) => {
  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      setAuthToken(data.data.token);
      return data.data.admin;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("로그인 실패:", error);
    throw error;
  }
};

// 매장 목록 조회
const fetchStores = async (filters = {}) => {
  const url = new URL("/api/stores", window.location.origin);
  Object.keys(filters).forEach((key) => {
    if (filters[key]) url.searchParams.append(key, filters[key]);
  });

  return await apiRequest(url);
};

// 매장 등록
const createStore = async (storeData) => {
  return await apiRequest("/api/stores", {
    method: "POST",
    body: JSON.stringify(storeData),
  });
};

// 매장 수정
const updateStore = async (storeId, updateData) => {
  return await apiRequest(`/api/stores/${storeId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
};

// 매장 삭제
const deleteStore = async (storeId) => {
  return await apiRequest(`/api/stores/${storeId}`, {
    method: "DELETE",
  });
};

// 추천 관계 생성
const createRecommendation = async (recommendationData) => {
  return await apiRequest("/api/recommendations", {
    method: "POST",
    body: JSON.stringify(recommendationData),
  });
};

// 분석 데이터 조회
const fetchAnalytics = async (type, id, params = {}) => {
  const url = new URL(`/api/analytics/${type}/${id}`, window.location.origin);
  Object.keys(params).forEach((key) => {
    if (params[key]) url.searchParams.append(key, params[key]);
  });

  return await apiRequest(url);
};
```

### 대시보드 컴포넌트 예시

```jsx
// 매장 관리 컴포넌트
const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const storeData = await fetchStores();
        setStores(storeData);
      } catch (error) {
        console.error("매장 목록 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  const handleCreateStore = async (storeData) => {
    try {
      const newStore = await createStore(storeData);
      setStores([...stores, newStore]);
    } catch (error) {
      console.error("매장 생성 실패:", error);
    }
  };

  const handleUpdateStore = async (storeId, updateData) => {
    try {
      const updatedStore = await updateStore(storeId, updateData);
      setStores(stores.map((store) => (store._id === storeId ? updatedStore : store)));
    } catch (error) {
      console.error("매장 수정 실패:", error);
    }
  };

  const handleDeleteStore = async (storeId) => {
    try {
      await deleteStore(storeId);
      setStores(stores.filter((store) => store._id !== storeId));
    } catch (error) {
      console.error("매장 삭제 실패:", error);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <h2>매장 관리</h2>
      {/* 매장 목록 및 관리 UI */}
    </div>
  );
};
```

---

## 📊 대시보드 권장 기능

### 1. 실시간 통계

- 오늘의 QR 스캔 수
- 활성 매장 수
- 추천 클릭률
- 신규 방문자 수

### 2. 매장 관리

- 매장 목록 (필터링, 검색)
- 매장 등록/수정/삭제
- QR 코드 관리
- 매장별 통계

### 3. 추천 관리

- 추천 관계 설정
- 카테고리별 추천 현황
- 추천 성과 분석

### 4. 분석 대시보드

- 일별/주별/월별 트래픽
- 인기 매장 순위
- 추천 클릭률 분석
- 사용자 행동 패턴

---

## 📞 문의

관리자 API 관련 문의사항이 있으시면 개발팀에 연락해주세요.
