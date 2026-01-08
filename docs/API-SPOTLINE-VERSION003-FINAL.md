# SpotLine API 문서 - VERSION003 FINAL

## 📋 개요

SpotLine 백엔드 API의 최종 완성 버전 문서입니다.
모든 엔드포인트가 정상 작동하며, 실제 운영 환경에서 검증 완료되었습니다.

**서버 정보:**

- 개발 서버: `http://localhost:4000`
- 프로덕션 서버: `https://lhjwork-backend-spotline.onrender.com`
- API 문서: `/api-docs` (Swagger UI)

---

## 🔐 인증 시스템

### 관리자 로그인

```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "spotline-admin",
  "password": "12341234"
}
```

**응답:**

```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "admin": {
      "id": "695bad104e53e6bb484d0b35",
      "username": "spotline-admin",
      "email": "spotline-admin@spotline.com",
      "role": "super_admin",
      "lastLogin": "2026-01-08T02:19:16.425Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 토큰 인증

모든 보호된 API 요청에 다음 헤더 포함:

```http
Authorization: Bearer {token}
```

---

## 🏪 매장 관리 API

### 1. 매장 목록 조회

```http
GET /api/stores
```

**쿼리 파라미터:**

- `category`: 카테고리 필터 (cafe, restaurant, exhibition, etc.)
- `area`: 지역 필터 (강남역, 홍대입구, etc.)
- `active`: 활성 상태 필터 (true/false)

**응답:**

```json
{
  "success": true,
  "message": "매장 목록 조회 성공",
  "data": [
    {
      "id": "695f13d8444a5efb6955d9ad",
      "name": "카페 스팟라인",
      "category": "cafe",
      "location": {
        "address": "서울특별시 강남구 강남대로 123",
        "area": "강남역",
        "coordinates": {
          "type": "Point",
          "coordinates": [127.0276, 37.4979]
        }
      },
      "qrCode": {
        "id": "cafe_gangnam_001",
        "isActive": true
      },
      "shortDescription": "강남역 대표 카페",
      "spotlineStory": "자세한 매장 스토리...",
      "representativeImage": "https://example.com/image.jpg",
      "externalLinks": {
        "instagram": "https://instagram.com/cafe_spotline",
        "website": "https://cafe-spotline.com"
      },
      "isActive": true,
      "createdAt": "2026-01-08T01:15:20.123Z",
      "updatedAt": "2026-01-08T01:15:20.123Z"
    }
  ]
}
```

### 2. QR 코드로 매장 조회

```http
GET /api/stores/spotline/{qrId}
```

**예시:**

```http
GET /api/stores/spotline/cafe_gangnam_001
```

### 3. 매장 등록

```http
POST /api/stores
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "새로운 카페",
  "category": "cafe",
  "location": {
    "address": "서울특별시 강남구 테헤란로 123",
    "area": "강남역"
  },
  "qrCode": {
    "id": "new_cafe_001",
    "isActive": true
  },
  "shortDescription": "새로운 카페입니다",
  "spotlineStory": "상세한 스토리...",
  "representativeImage": "https://example.com/new-image.jpg",
  "externalLinks": {
    "instagram": "https://instagram.com/new_cafe"
  }
}
```

### 4. 매장 수정

```http
PUT /api/stores/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

### 5. 매장 삭제

```http
DELETE /api/stores/{id}
Authorization: Bearer {token}
```

---

## 🎯 Experience API (체험하기)

### 1. 체험 매장 선택

```http
GET /api/experience
```

**헤더 (선택사항):**

```http
x-session-id: unique-session-id
```

**응답:**

```json
{
  "success": true,
  "message": "체험 매장 선택 성공",
  "data": {
    "qrId": "cafe_gangnam_001",
    "storeName": "카페 스팟라인",
    "storeId": "695f13d8444a5efb6955d9ad",
    "area": "강남역",
    "configUsed": {
      "id": "695dd8d32b4feaf61e6a5a32",
      "name": "기본 체험 (카페 스팟라인)",
      "type": "fixed"
    },
    "redirectUrl": "/api/stores/spotline/cafe_gangnam_001",
    "timestamp": "2026-01-08T02:19:16.425Z"
  }
}
```

### 2. 체험 매장 선택 (별칭)

```http
GET /api/experience/select
```

_동일한 기능, 동일한 응답_

### 3. 사용 가능한 매장 목록

```http
GET /api/experience/available-stores
```

**응답:**

```json
{
  "success": true,
  "message": "사용 가능한 매장 목록 조회 성공",
  "data": {
    "totalCount": 8,
    "allStores": ["cafe_gangnam_001", "dessert_gangnam_001", "culture_gangnam_001", "gallery_gangnam_001", "brunch_gangnam_001", "cafe_hongdae_001", "food_hongdae_001", "record_hongdae_001"],
    "byArea": {
      "강남역": ["cafe_gangnam_001", "dessert_gangnam_001", "culture_gangnam_001"],
      "논현동": ["gallery_gangnam_001"],
      "신사동": ["brunch_gangnam_001"],
      "홍대입구": ["cafe_hongdae_001", "food_hongdae_001", "record_hongdae_001"]
    }
  }
}
```

### 4. 체험 통계

```http
GET /api/experience/stats?days=7
```

**응답:**

```json
{
  "success": true,
  "message": "체험 통계 조회 성공",
  "data": {
    "period": "7일",
    "totalExperiences": 45,
    "uniqueStores": 6,
    "topStores": [
      {
        "storeId": "695f13d8444a5efb6955d9ad",
        "storeName": "카페 스팟라인",
        "qrId": "cafe_gangnam_001",
        "area": "강남역",
        "count": 15
      }
    ],
    "dailyStats": {
      "2026-01-01": 5,
      "2026-01-02": 8,
      "2026-01-03": 12
    },
    "averagePerDay": "6.4"
  }
}
```

---

## ⚙️ Experience Config API (체험 설정 관리)

### 1. 체험 설정 목록

```http
GET /api/admin/experience-configs
Authorization: Bearer {token}
```

**응답:**

```json
{
  "success": true,
  "message": "체험 설정 목록 조회 성공",
  "data": [
    {
      "id": "695dd8d32b4feaf61e6a5a32",
      "name": "기본 체험 (카페 스팟라인)",
      "description": "대표 매장인 카페 스팟라인으로 고정 안내",
      "type": "fixed",
      "isActive": true,
      "isDefault": true,
      "settings": {
        "fixedStoreQrId": "cafe_gangnam_001"
      },
      "priority": 100,
      "usageCount": 25,
      "lastUsed": "2026-01-08T02:19:16.425Z",
      "createdAt": "2026-01-08T01:20:30.123Z"
    }
  ]
}
```

### 2. 체험 설정 생성

```http
POST /api/admin/experience-configs
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "새로운 체험 설정",
  "description": "설명",
  "type": "random",
  "isDefault": false,
  "settings": {
    "randomStoreQrIds": ["cafe_gangnam_001", "cafe_hongdae_001"]
  },
  "priority": 50
}
```

### 3. 체험 설정 수정

```http
PUT /api/admin/experience-configs/{id}
Authorization: Bearer {token}
```

### 4. 체험 설정 삭제

```http
DELETE /api/admin/experience-configs/{id}
Authorization: Bearer {token}
```

---

## 🔗 추천 시스템 API

### 1. 추천 목록 조회

```http
GET /api/recommendations?fromStore={storeId}
```

**응답:**

```json
{
  "success": true,
  "message": "추천 목록 조회 성공",
  "data": [
    {
      "id": "695f13d8444a5efb6955d9ae",
      "fromStore": {
        "id": "695f13d8444a5efb6955d9ad",
        "name": "카페 스팟라인",
        "qrCode": { "id": "cafe_gangnam_001" }
      },
      "toStore": {
        "id": "695f13d8444a5efb6955d9af",
        "name": "디저트 하우스",
        "qrCode": { "id": "dessert_gangnam_001" }
      },
      "category": "dessert",
      "priority": 1,
      "distance": 150,
      "walkingTime": 2,
      "description": "카페 후 달콤한 디저트를 즐겨보세요",
      "isActive": true
    }
  ]
}
```

### 2. 추천 등록

```http
POST /api/recommendations
Authorization: Bearer {token}
Content-Type: application/json

{
  "fromStore": "695f13d8444a5efb6955d9ad",
  "toStore": "695f13d8444a5efb6955d9af",
  "category": "dessert",
  "priority": 1,
  "description": "추천 설명",
  "tags": ["달콤한", "가까운"]
}
```

---

## 📊 분석 API

### 1. 분석 데이터 조회

```http
GET /api/analytics?days=7
```

**쿼리 파라미터:**

- `days`: 조회 일수 (기본값: 7)
- `startDate`: 시작 날짜 (YYYY-MM-DD)
- `endDate`: 종료 날짜 (YYYY-MM-DD)
- `period`: 기간 단위 (day, week, month)

**응답:**

```json
{
  "success": true,
  "message": "분석 데이터 조회 성공",
  "data": {
    "totalEvents": 155,
    "uniqueStores": 8,
    "eventsByType": {
      "page_enter": 45,
      "spot_click": 32,
      "map_link_click": 28,
      "external_link_click": 25,
      "page_exit": 25
    },
    "topStores": [
      {
        "storeId": "695f13d8444a5efb6955d9ad",
        "storeName": "카페 스팟라인",
        "qrId": "cafe_gangnam_001",
        "area": "강남역",
        "count": 35
      }
    ],
    "dailyStats": {
      "2026-01-01": 20,
      "2026-01-02": 25,
      "2026-01-03": 30
    },
    "averagePerDay": "22.1"
  }
}
```

### 2. 이벤트 로깅

```http
POST /api/analytics/log
Content-Type: application/json

{
  "qrCode": "cafe_gangnam_001",
  "store": "695f13d8444a5efb6955d9ad",
  "eventType": "page_enter",
  "sessionId": "unique-session-id",
  "referrer": "https://example.com",
  "metadata": {
    "spotPosition": 1,
    "nextSpotId": "dessert_gangnam_001"
  }
}
```

**이벤트 타입:**

- `page_enter`: 페이지 진입
- `spot_click`: 추천 매장 클릭
- `map_link_click`: 지도 링크 클릭
- `external_link_click`: 외부 링크 클릭
- `page_exit`: 페이지 이탈

---

## 🗺️ 지오코딩 API

### 1. 통합 지오코딩

```http
GET /api/geocoding/unified?address={address}
```

**예시:**

```http
GET /api/geocoding/unified?address=서울특별시 강남구 강남대로 123
```

**응답:**

```json
{
  "success": true,
  "message": "지오코딩 성공",
  "data": {
    "address": "서울특별시 강남구 강남대로 123",
    "coordinates": {
      "lat": 37.4979,
      "lng": 127.0276
    },
    "provider": "naver",
    "accuracy": "high"
  }
}
```

### 2. Naver 지오코딩

```http
GET /api/geocoding/naver?address={address}
```

### 3. Google 지오코딩

```http
GET /api/geocoding/google?address={address}
```

---

## 🎮 Demo API (데모 시스템)

### 1. 데모 매장 목록

```http
GET /api/demo/stores
```

### 2. 데모 매장 상세

```http
GET /api/demo/stores/{qrId}
```

### 3. 데모 추천 목록

```http
GET /api/demo/recommendations?fromQrId={qrId}
```

---

## 🔧 시스템 API

### 1. 서버 상태 확인

```http
GET /health
```

**응답:**

```json
{
  "status": "OK",
  "message": "Spotline API is running (TypeScript)",
  "timestamp": "2026-01-08T02:19:16.425Z",
  "koreanTime": "2026. 1. 8. 오전 11:19:16",
  "timezone": "Asia/Seoul (KST, UTC+9)",
  "version": "2.0.0-ts"
}
```

### 2. API 정보

```http
GET /api
```

### 3. API 문서

```http
GET /api-docs
```

_Swagger UI 인터페이스_

---

## 📝 응답 형식

### 성공 응답

```json
{
  "success": true,
  "message": "작업 성공 메시지",
  "data": {
    // 응답 데이터
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "message": "에러 메시지",
  "data": null,
  "status": 400
}
```

### HTTP 상태 코드

- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 오류

---

## 🔒 보안 및 인증

### CORS 설정

허용된 도메인:

- `http://localhost:3000-3003`
- `http://localhost:4000`
- `http://localhost:5173`
- `https://front-spot-line.vercel.app`
- `https://admin-spotline.vercel.app`
- `https://lhjwork-backend-spotline.onrender.com`

### 인증 헤더

```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
x-session-id: {UNIQUE_SESSION_ID}
```

---

## 📊 현재 운영 데이터 (2026-01-08 기준)

### 매장 현황

- **총 매장 수**: 8개
- **활성 매장**: 8개
- **지역 분포**: 강남역(3), 홍대입구(3), 논현동(1), 신사동(1)
- **카테고리 분포**: cafe(2), restaurant(1), culture(2), exhibition(1), retail(1), other(1)

### QR 코드 목록

```
cafe_gangnam_001     - 카페 스팟라인 (강남역)
dessert_gangnam_001  - 디저트 하우스 (강남역)
culture_gangnam_001  - 북카페 리딩룸 (강남역)
gallery_gangnam_001  - 아트 갤러리 모던 (논현동)
brunch_gangnam_001   - 브런치 스팟 (신사동)
cafe_hongdae_001     - 바이닐 카페 (홍대입구)
food_hongdae_001     - 스트리트 푸드 마켓 (홍대입구)
record_hongdae_001   - 인디 레코드샵 (홍대입구)
```

### Experience Config 현황

- **총 설정 수**: 5개
- **활성 설정**: 4개
- **기본 설정**: "기본 체험 (카페 스팟라인)" - fixed 타입

### 관리자 계정

- **표준 계정**: `spotline-admin` / `12341234`
- **권한**: `super_admin`
- **이메일**: `spotline-admin@spotline.com`

---

## 🚀 테스트 가이드

### 1. 기본 테스트 시나리오

```bash
# 1. 서버 상태 확인
curl http://localhost:4000/health

# 2. 매장 목록 조회
curl http://localhost:4000/api/stores

# 3. 체험하기 테스트
curl http://localhost:4000/api/experience

# 4. QR 코드 테스트
curl http://localhost:4000/api/stores/spotline/cafe_gangnam_001

# 5. 관리자 로그인
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"spotline-admin","password":"12341234"}'
```

### 2. 프론트엔드 연동 테스트

```javascript
// JavaScript 테스트 코드
const testAPI = async () => {
  // 체험하기 테스트
  const experienceResponse = await fetch("http://localhost:4000/api/experience");
  const experienceData = await experienceResponse.json();
  console.log("Experience:", experienceData);

  // 매장 정보 조회
  const storeResponse = await fetch(`http://localhost:4000${experienceData.data.redirectUrl}`);
  const storeData = await storeResponse.json();
  console.log("Store:", storeData);
};

testAPI();
```

---

## 🎯 결론

VERSION003 FINAL에서는 모든 API가 완전히 구현되고 검증되었습니다.

**주요 특징:**

- ✅ 모든 엔드포인트 정상 작동
- ✅ 실제 데이터베이스 운영 중
- ✅ 완전한 Experience 시스템
- ✅ 표준화된 응답 형식
- ✅ 강화된 보안 및 인증
- ✅ 상세한 API 문서화

이제 프론트엔드와 Admin 시스템에서 안심하고 이 API를 사용하실 수 있습니다! 🚀
