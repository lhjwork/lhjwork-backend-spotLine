# Spotline Admin API Reference

## 인증

모든 API 요청에는 JWT 토큰이 필요합니다.

```
Authorization: Bearer <JWT_TOKEN>
```

## 매장 관리 API

### 1. 매장 목록 조회

**GET** `/api/admin/stores`

**Query Parameters:**
- `page` (number): 페이지 번호 (기본값: 1)
- `limit` (number): 페이지 크기 (기본값: 20)
- `search` (string): 검색어 (매장명, 주소, QR코드)
- `category` (string): 카테고리 필터
- `status` (string): 상태 필터 ('active', 'inactive')

**Response:**
```json
{
  "stores": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "카페 스팟라인",
      "category": "cafe",
      "location": {
        "address": "서울 마포구 홍익로 39",
        "coordinates": {
          "type": "Point",
          "coordinates": [126.9229004, 37.5511694]
        },
        "area": "홍대",
        "district": "마포구"
      },
      "contact": {
        "phone": "02-1234-5678",
        "website": "https://example.com"
      },
      "qrCode": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "isActive": true
      },
      "isActive": true,
      "stats": {
        "monthlyScans": 150
      },
      "createdAt": "2024-01-05T10:30:00.000Z",
      "updatedAt": "2024-01-05T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "count": 100,
    "limit": 20
  }
}
```

### 2. 매장 상세 조회

**GET** `/api/admin/stores/:id`

**Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "카페 스팟라인",
  "category": "cafe",
  "location": {
    "address": "서울 마포구 홍익로 39",
    "coordinates": {
      "type": "Point",
      "coordinates": [126.9229004, 37.5511694]
    },
    "area": "홍대",
    "district": "마포구"
  },
  "contact": {
    "phone": "02-1234-5678",
    "website": "https://example.com",
    "instagram": "@spotline_cafe"
  },
  "businessHours": {
    "monday": { "open": "09:00", "close": "22:00" },
    "tuesday": { "open": "09:00", "close": "22:00" }
  },
  "description": "홍대 근처 분위기 좋은 카페",
  "tags": ["데이트", "조용한", "와이파이"],
  "images": ["https://example.com/image1.jpg"],
  "qrCode": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "isActive": true
  },
  "isActive": true,
  "stats": {
    "monthlyScans": 150,
    "recommendationClicks": 45,
    "clickThroughRate": "30.00"
  },
  "createdAt": "2024-01-05T10:30:00.000Z",
  "updatedAt": "2024-01-05T10:30:00.000Z"
}
```

### 3. 매장 생성

**POST** `/api/admin/stores`

**Request Body:**
```json
{
  "name": "카페 스팟라인",
  "category": "cafe",
  "location": {
    "address": "서울 마포구 홍익로 39",
    "coordinates": {
      "type": "Point",
      "coordinates": [126.9229004, 37.5511694]
    },
    "area": "홍대",
    "district": "마포구"
  },
  "contact": {
    "phone": "02-1234-5678",
    "website": "https://example.com",
    "instagram": "@spotline_cafe"
  },
  "businessHours": {
    "monday": { "open": "09:00", "close": "22:00" },
    "tuesday": { "open": "09:00", "close": "22:00" },
    "wednesday": { "open": "09:00", "close": "22:00" },
    "thursday": { "open": "09:00", "close": "22:00" },
    "friday": { "open": "09:00", "close": "22:00" },
    "saturday": { "open": "10:00", "close": "23:00" },
    "sunday": { "open": "10:00", "close": "23:00" }
  },
  "description": "홍대 근처 분위기 좋은 카페",
  "tags": ["데이트", "조용한", "와이파이"],
  "images": ["https://example.com/image1.jpg"]
}
```

**Response:** 생성된 매장 정보 (상세 조회와 동일)

### 4. 매장 수정

**PUT** `/api/admin/stores/:id`

**Request Body:** 생성 API와 동일 (수정할 필드만 포함 가능)

**Response:** 수정된 매장 정보

### 5. 매장 상태 변경

**PATCH** `/api/admin/stores/:id/status`

**Request Body:**
```json
{
  "isActive": true
}
```

**Response:** 수정된 매장 정보

### 6. 매장 삭제

**DELETE** `/api/admin/stores/:id`

**Response:**
```json
{
  "message": "매장이 완전히 삭제되었습니다"
}
```

## 추천 관리 API

### 1. 추천 관계 목록 조회

**GET** `/api/admin/recommendations`

**Query Parameters:**
- `page` (number): 페이지 번호
- `limit` (number): 페이지 크기
- `fromStore` (string): 출발 매장 ID
- `toStore` (string): 추천 매장 ID

**Response:**
```json
{
  "recommendations": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "fromStore": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "카페 스팟라인",
        "category": "cafe"
      },
      "toStore": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "갤러리 아트",
        "category": "exhibition"
      },
      "category": "culture",
      "priority": 8,
      "distance": 250,
      "walkingTime": 3,
      "description": "카페 후 문화 체험하기 좋은 갤러리",
      "tags": ["문화", "데이트"],
      "isActive": true,
      "createdAt": "2024-01-05T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 3,
    "count": 50,
    "limit": 20
  }
}
```

### 2. 추천 관계 생성

**POST** `/api/admin/recommendations`

**Request Body:**
```json
{
  "fromStore": "64f8a1b2c3d4e5f6a7b8c9d0",
  "toStore": "64f8a1b2c3d4e5f6a7b8c9d2",
  "category": "culture",
  "priority": 8,
  "distance": 250,
  "walkingTime": 3,
  "description": "카페 후 문화 체험하기 좋은 갤러리",
  "tags": ["문화", "데이트"]
}
```

**Response:** 생성된 추천 관계 정보

### 3. 추천 관계 수정

**PUT** `/api/admin/recommendations/:id`

**Request Body:** 생성 API와 동일

**Response:** 수정된 추천 관계 정보

### 4. 추천 관계 삭제

**DELETE** `/api/admin/recommendations/:id`

**Response:**
```json
{
  "message": "추천 관계가 삭제되었습니다"
}
```

## 분석 API

### 1. 대시보드 통계

**GET** `/api/admin/dashboard/stats`

**Response:**
```json
{
  "overview": {
    "totalStores": 25,
    "totalInactiveStores": 3,
    "todayScans": 150,
    "scanGrowth": "12.5",
    "weeklyScans": 980,
    "monthlyScans": 4200,
    "clickThroughRate": "28.5"
  },
  "storesByCategory": [
    { "_id": "cafe", "count": 12 },
    { "_id": "restaurant", "count": 8 },
    { "_id": "exhibition", "count": 5 }
  ],
  "recentActivity": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "type": "qr_scan",
      "store": "카페 스팟라인",
      "targetStore": null,
      "timestamp": "2024-01-05T15:30:00.000Z",
      "metadata": {}
    }
  ]
}
```

### 2. 분석 데이터 조회

**GET** `/api/admin/analytics`

**Query Parameters:**
- `startDate` (string): 시작 날짜 (YYYY-MM-DD)
- `endDate` (string): 종료 날짜 (YYYY-MM-DD)
- `storeId` (string): 매장 ID 필터
- `eventType` (string): 이벤트 타입 필터

**Response:**
```json
{
  "events": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "qrCode": "550e8400-e29b-41d4-a716-446655440000",
      "store": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "카페 스팟라인",
        "category": "cafe"
      },
      "eventType": "qr_scan",
      "sessionId": "sess_123456",
      "timestamp": "2024-01-05T15:30:00.000Z",
      "metadata": {
        "duration": 45
      }
    }
  ],
  "dailyStats": [
    {
      "_id": {
        "date": "2024-01-05",
        "eventType": "qr_scan"
      },
      "count": 25
    }
  ]
}
```

### 3. 인기 매장 순위

**GET** `/api/admin/analytics/popular-stores`

**Query Parameters:**
- `period` (string): 기간 ('7d', '30d')
- `limit` (number): 결과 수 제한

**Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "store": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "카페 스팟라인",
      "category": "cafe"
    },
    "scanCount": 150,
    "uniqueVisitors": 120
  }
]
```

### 4. QR 성과 분석

**GET** `/api/admin/analytics/qr-performance`

**Query Parameters:**
- `period` (string): 기간 ('7d', '30d')

**Response:**
```json
[
  {
    "qrCode": "550e8400-e29b-41d4-a716-446655440000",
    "totalScans": 150,
    "recommendationClicks": 45,
    "uniqueVisitors": 120,
    "clickThroughRate": 30.0
  }
]
```

### 5. 추천 성과 분석

**GET** `/api/admin/analytics/recommendation-performance`

**Query Parameters:**
- `period` (string): 기간 ('7d', '30d')

**Response:**
```json
[
  {
    "_id": {
      "from": "64f8a1b2c3d4e5f6a7b8c9d0",
      "to": "64f8a1b2c3d4e5f6a7b8c9d2"
    },
    "fromStoreName": "카페 스팟라인",
    "toStoreName": "갤러리 아트",
    "clickCount": 25
  }
]
```

## 어드민 관리 API

### 1. 어드민 목록 조회

**GET** `/api/admin/admins`

**권한**: super_admin만 접근 가능

**Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "username": "spotline-admin",
    "email": "admin@spotline.co.kr",
    "role": "super_admin",
    "permissions": {
      "stores": { "read": true, "write": true, "delete": true },
      "analytics": { "read": true, "export": true },
      "users": { "read": true, "write": true, "delete": true }
    },
    "lastLogin": "2024-01-05T15:30:00.000Z",
    "isActive": true,
    "createdAt": "2024-01-05T10:30:00.000Z",
    "updatedAt": "2024-01-05T10:30:00.000Z"
  }
]
```

### 2. 어드민 생성

**POST** `/api/admin/admins`

**권한**: super_admin만 접근 가능

**Request Body:**
```json
{
  "username": "new-admin",
  "email": "newadmin@spotline.co.kr",
  "password": "password123",
  "role": "admin",
  "permissions": {
    "stores": { "read": true, "write": true, "delete": false },
    "analytics": { "read": true, "export": false },
    "users": { "read": false, "write": false, "delete": false }
  }
}
```

**Response:** 생성된 어드민 정보 (비밀번호 제외)

### 3. 어드민 권한 수정

**PATCH** `/api/admin/admins/:id/permissions`

**권한**: super_admin만 접근 가능

**Request Body:**
```json
{
  "permissions": {
    "stores": { "read": true, "write": true, "delete": true },
    "analytics": { "read": true, "export": true },
    "users": { "read": true, "write": false, "delete": false }
  }
}
```

**Response:** 수정된 어드민 정보

## 데이터 내보내기 API

### 데이터 내보내기

**GET** `/api/admin/export`

**Query Parameters:**
- `type` (string): 데이터 타입 ('stores', 'analytics', 'recommendations')
- `format` (string): 파일 형식 ('csv', 'json')
- `startDate` (string): 시작 날짜 (analytics용)
- `endDate` (string): 종료 날짜 (analytics용)

**Response:** 파일 다운로드

## 에러 응답

모든 API는 다음과 같은 에러 형식을 사용합니다:

```json
{
  "error": "에러 메시지"
}
```

**HTTP 상태 코드:**
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 오류

## 권한 시스템

### 역할 (Role)
- `super_admin`: 모든 권한
- `admin`: 일반 관리자 권한
- `moderator`: 제한된 권한

### 권한 (Permission)
- `stores.read`: 매장 조회
- `stores.write`: 매장 생성/수정
- `stores.delete`: 매장 삭제
- `analytics.read`: 분석 데이터 조회
- `analytics.export`: 데이터 내보내기
- `users.read`: 사용자 조회
- `users.write`: 사용자 생성/수정
- `users.delete`: 사용자 삭제