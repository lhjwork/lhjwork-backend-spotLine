# Spotline Admin API 완전 가이드 (최종 버전)

## 🔐 인증 시스템

### 1. 관리자 로그인
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
      "id": "admin_id",
      "username": "spotline-admin",
      "email": "admin@spotline.co.kr",
      "role": "super_admin",
      "lastLogin": "2026-01-08T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### 2. 토큰 검증
```http
GET /api/admin/verify
Authorization: Bearer {token}
```

### 3. 관리자 프로필 조회
```http
GET /api/admin/profile
Authorization: Bearer {token}
```

---

## 🏪 매장 관리 API

### 1. 매장 목록 조회 (관리자용)
```http
GET /api/admin/stores?page=1&limit=20&category=cafe&area=강남&active=true
Authorization: Bearer {token}
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 결과 수 (기본값: 20)
- `category`: 카테고리 필터 (cafe, restaurant, exhibition, hotel, retail, culture, other)
- `area`: 지역 필터
- `active`: 활성화 상태 (true/false)

**응답:**
```json
{
  "success": true,
  "message": "관리자 매장 목록 조회 성공",
  "data": {
    "stores": [
      {
        "id": "store_id",
        "name": "카페 이름",
        "category": "cafe",
        "location": {
          "address": "서울시 강남구...",
          "coordinates": {
            "type": "Point",
            "coordinates": [127.0276, 37.4979]
          },
          "area": "강남"
        },
        "qrCode": {
          "id": "qr_unique_id",
          "isActive": true
        },
        "isActive": true,
        "createdAt": "2026-01-08T...",
        "updatedAt": "2026-01-08T..."
      }
    ],
    "totalCount": 50,
    "totalPages": 3,
    "currentPage": 1
  }
}
```

### 2. 매장 생성
```http
POST /api/admin/stores
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "새로운 카페",
  "category": "cafe",
  "location": {
    "address": "서울시 강남구 테헤란로 123",
    "coordinates": {
      "type": "Point",
      "coordinates": [127.0276, 37.4979]
    },
    "area": "강남"
  },
  "qrCode": {
    "id": "unique_qr_id",
    "isActive": true
  },
  "shortDescription": "분위기 좋은 카페",
  "spotlineStory": "이곳에서 커피 한 잔의 여유를...",
  "representativeImage": "https://example.com/image.jpg",
  "contact": {
    "phone": "02-1234-5678",
    "website": "https://cafe.com",
    "instagram": "@cafe_instagram"
  },
  "externalLinks": {
    "instagram": "https://instagram.com/cafe",
    "website": "https://cafe.com"
  },
  "businessHours": {
    "monday": { "open": "09:00", "close": "22:00" },
    "tuesday": { "open": "09:00", "close": "22:00" }
  }
}
```

### 3. 매장 수정
```http
PUT /api/admin/stores/{storeId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "수정된 매장명",
  "shortDescription": "수정된 설명"
}
```

### 4. 매장 삭제 (비활성화)
```http
DELETE /api/admin/stores/{storeId}
Authorization: Bearer {token}
```

### 5. 매장 상태 변경
```http
PATCH /api/admin/stores/{storeId}/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "active": false
}
```

### 6. 매장 통계 조회
```http
GET /api/admin/stores/stats
Authorization: Bearer {token}
```

**응답:**
```json
{
  "success": true,
  "message": "매장 통계 조회 성공",
  "data": {
    "totalStores": 25,
    "activeStores": 23,
    "inactiveStores": 2,
    "categoryStats": [
      { "_id": "cafe", "count": 15 },
      { "_id": "restaurant", "count": 8 },
      { "_id": "exhibition", "count": 2 }
    ],
    "recentStores": [...]
  }
}
```

---

## 🎯 추천 관리 API

### 1. 추천 목록 조회 (관리자용)
```http
GET /api/admin/recommendations?page=1&limit=20&fromStore=store_id&category=next_meal
Authorization: Bearer {token}
```

**쿼리 파라미터:**
- `page`: 페이지 번호
- `limit`: 페이지당 결과 수
- `fromStore`: 출발 매장 ID
- `toStore`: 도착 매장 ID
- `category`: 추천 카테고리 (next_meal, dessert, activity, shopping, culture, rest)
- `active`: 활성화 상태

### 2. 추천 생성
```http
POST /api/admin/recommendations
Authorization: Bearer {token}
Content-Type: application/json

{
  "fromStore": "출발_매장_ID",
  "toStore": "도착_매장_ID",
  "category": "next_meal",
  "description": "점심 식사 후 디저트로 좋은 곳",
  "walkingTime": 5,
  "distance": 300,
  "priority": 10,
  "tags": ["디저트", "분위기좋은", "데이트"]
}
```

### 3. 추천 수정
```http
PUT /api/admin/recommendations/{recommendationId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "수정된 추천 설명",
  "priority": 15
}
```

### 4. 추천 삭제
```http
DELETE /api/admin/recommendations/{recommendationId}
Authorization: Bearer {token}
```

### 5. 추천 상태 변경
```http
PATCH /api/admin/recommendations/{recommendationId}/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "active": false
}
```

### 6. 추천 통계 조회
```http
GET /api/admin/recommendations/stats
Authorization: Bearer {token}
```

### 7. 특정 매장의 추천 목록
```http
GET /api/admin/stores/{storeId}/recommendations
Authorization: Bearer {token}
```

---

## 📊 분석 API

### 1. 전체 분석 데이터
```http
GET /api/analytics?days=7
Authorization: Bearer {token}
```

### 2. 매장별 분석
```http
GET /api/analytics/store/{storeId}?days=30
Authorization: Bearer {token}
```

---

## 🌐 지오코딩 API (Daum 주소 연동)

### 1. 주소 검색 및 좌표 변환
```http
POST /api/geocoding/convert
Content-Type: application/json

{
  "address": "서울시 강남구 테헤란로 123"
}
```

**응답:**
```json
{
  "success": true,
  "message": "좌표 변환 성공",
  "data": {
    "address": "서울시 강남구 테헤란로 123",
    "coordinates": {
      "latitude": 37.4979,
      "longitude": 127.0276
    },
    "provider": "kakao",
    "region": {
      "sido": "서울특별시",
      "sigungu": "강남구",
      "dong": "역삼동"
    }
  }
}
```

---

## 🎮 체험 설정 API

### 1. 체험 설정 목록
```http
GET /api/admin/experience-configs
Authorization: Bearer {token}
```

### 2. 체험 설정 생성
```http
POST /api/admin/experience-configs
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "강남 지역 체험",
  "description": "강남 지역 매장들로 구성된 체험",
  "type": "area_based",
  "isDefault": false,
  "settings": {
    "areaSettings": {
      "gangnam": {
        "enabled": true,
        "storeQrIds": ["qr1", "qr2", "qr3"],
        "weight": 10
      }
    }
  },
  "priority": 5
}
```

---

## 🔧 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "message": "작업 성공 메시지",
  "data": { ... }
}
```

### 오류 응답
```json
{
  "success": false,
  "message": "오류 메시지",
  "data": null,
  "status": 400
}
```

---

## 🚨 오류 코드

- `400`: 잘못된 요청 (Bad Request)
- `401`: 인증 실패 (Unauthorized)
- `403`: 권한 없음 (Forbidden)
- `404`: 리소스를 찾을 수 없음 (Not Found)
- `409`: 중복 데이터 (Conflict)
- `500`: 서버 내부 오류 (Internal Server Error)

---

## 🔑 인증 헤더

모든 보호된 엔드포인트에는 다음 헤더가 필요합니다:

```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

---

## 📍 베이스 URL

- **로컬 개발**: `http://localhost:4000`
- **프로덕션**: `https://lhjwork-backend-spotline.onrender.com`

---

## 🎯 주요 변경사항 (최종 버전)

1. **CORS 설정 완료**: `https://admin-spotline.vercel.app` 도메인 허용
2. **관리자 전용 API 추가**: 매장/추천 관리를 위한 전용 엔드포인트
3. **페이지네이션 지원**: 대용량 데이터 처리를 위한 페이징
4. **통계 API 추가**: 대시보드용 통계 데이터 제공
5. **상태 관리**: 매장/추천의 활성화/비활성화 기능
6. **Daum 주소 API 연동**: 주소 검색 및 좌표 변환 지원

이제 어드민 프론트엔드에서 이 API들을 사용하여 완전한 관리 시스템을 구축할 수 있습니다!