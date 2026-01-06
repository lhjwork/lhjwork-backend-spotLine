# 🔐 Spotline Admin API 완전 가이드

## 기본 정보
- **서버 URL**: `http://localhost:4000`
- **관리자 계정**: `spotline-admin` / `12341234`
- **프론트엔드**: `http://localhost:3002` (프록시 사용 시 `/api` 경로)

## 📋 목차
1. [인증 API](#인증-api)
2. [매장 관리 API](#매장-관리-api)
3. [추천 관리 API](#추천-관리-api)
4. [분석 및 통계 API](#분석-및-통계-api)
5. [응답 형식](#응답-형식)
6. [에러 코드](#에러-코드)

---

## 🔑 인증 API

### 1. 관리자 로그인
```http
POST /api/admin/login
```

**요청 본문**:
```json
{
  "username": "spotline-admin",
  "password": "12341234"
}
```

**성공 응답**:
```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "admin": {
      "id": "695bad104e53e6bb484d0b35",
      "username": "spotline-admin",
      "email": "admin@spotline.co.kr",
      "role": "super_admin",
      "lastLogin": "2026-01-06T12:24:36.716Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### 2. 관리자 프로필 조회
```http
GET /api/admin/profile
Authorization: Bearer {token}
```

### 3. 토큰 검증
```http
GET /api/admin/verify
Authorization: Bearer {token}
```

### 4. 관리자 계정 생성
```http
POST /api/admin/create
```

**요청 본문**:
```json
{
  "username": "new-admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

---

## 🏪 매장 관리 API

### 1. 매장 목록 조회
```http
GET /api/admin/stores?page=1&limit=20&search=&category=&status=
Authorization: Bearer {token}
```

**쿼리 파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `search`: 검색어 (매장명, 주소)
- `category`: 카테고리 필터
- `status`: 상태 필터 (`active`, `inactive`)

**성공 응답**:
```json
{
  "success": true,
  "message": "매장 목록 조회 성공",
  "data": {
    "stores": [
      {
        "_id": "store_id",
        "name": "스타벅스 강남점",
        "category": "카페",
        "address": "서울시 강남구 테헤란로 123",
        "coordinates": {
          "lat": 37.5665,
          "lng": 126.9780
        },
        "phone": "02-1234-5678",
        "description": "강남역 근처 스타벅스",
        "operatingHours": {
          "monday": "07:00-22:00",
          "tuesday": "07:00-22:00"
        },
        "images": ["image1.jpg", "image2.jpg"],
        "isActive": true,
        "createdAt": "2026-01-06T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 2. 매장 상세 조회
```http
GET /api/admin/stores/{id}
Authorization: Bearer {token}
```

### 3. 매장 생성
```http
POST /api/admin/stores
Authorization: Bearer {token}
```

**요청 본문**:
```json
{
  "name": "새로운 카페",
  "category": "카페",
  "address": "서울시 강남구 테헤란로 456",
  "coordinates": {
    "lat": 37.5665,
    "lng": 126.9780
  },
  "phone": "02-9876-5432",
  "description": "새로 오픈한 카페입니다",
  "operatingHours": {
    "monday": "08:00-22:00",
    "tuesday": "08:00-22:00",
    "wednesday": "08:00-22:00",
    "thursday": "08:00-22:00",
    "friday": "08:00-23:00",
    "saturday": "09:00-23:00",
    "sunday": "09:00-21:00"
  },
  "images": ["cafe1.jpg", "cafe2.jpg"]
}
```

### 4. 매장 수정
```http
PUT /api/admin/stores/{id}
Authorization: Bearer {token}
```

**요청 본문**: 수정할 필드만 포함
```json
{
  "name": "수정된 매장명",
  "isActive": false
}
```

### 5. 매장 삭제
```http
DELETE /api/admin/stores/{id}
Authorization: Bearer {token}
```

---

## 🎯 추천 관리 API

### 1. 추천 목록 조회
```http
GET /api/admin/recommendations?page=1&limit=20&fromStore=&toStore=
Authorization: Bearer {token}
```

**쿼리 파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `fromStore`: 출발 매장 ID
- `toStore`: 도착 매장 ID

**성공 응답**:
```json
{
  "success": true,
  "message": "추천 목록 조회 성공",
  "data": {
    "recommendations": [
      {
        "_id": "recommendation_id",
        "fromStoreId": {
          "_id": "store1_id",
          "name": "스타벅스 강남점",
          "category": "카페",
          "address": "서울시 강남구 테헤란로 123"
        },
        "toStoreId": {
          "_id": "store2_id",
          "name": "교보문고 강남점",
          "category": "서점",
          "address": "서울시 강남구 테헤란로 789"
        },
        "priority": 5,
        "description": "커피 후 독서하기 좋은 곳",
        "tags": ["독서", "조용한", "가까운"],
        "isActive": true,
        "createdAt": "2026-01-06T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

### 2. 추천 상세 조회
```http
GET /api/admin/recommendations/{id}
Authorization: Bearer {token}
```

### 3. 추천 생성
```http
POST /api/admin/recommendations
Authorization: Bearer {token}
```

**요청 본문**:
```json
{
  "fromStoreId": "store1_id",
  "toStoreId": "store2_id",
  "priority": 5,
  "description": "커피 후 독서하기 좋은 곳",
  "tags": ["독서", "조용한", "가까운"]
}
```

### 4. 추천 수정
```http
PUT /api/admin/recommendations/{id}
Authorization: Bearer {token}
```

### 5. 추천 삭제
```http
DELETE /api/admin/recommendations/{id}
Authorization: Bearer {token}
```

---

## 📊 분석 및 통계 API

### 1. 대시보드 통계 조회
```http
GET /api/admin/analytics/dashboard
Authorization: Bearer {token}
```

**성공 응답**:
```json
{
  "success": true,
  "message": "대시보드 통계 조회 성공",
  "data": {
    "stores": {
      "total": 150,
      "active": 142,
      "inactive": 8
    },
    "recommendations": {
      "total": 320,
      "active": 298,
      "inactive": 22
    },
    "recentActivity": [
      {
        "_id": "analytics_id",
        "storeId": "store_id",
        "action": "qr_scan",
        "metadata": {},
        "createdAt": "2026-01-06T12:00:00.000Z"
      }
    ]
  }
}
```

### 2. 매장별 통계 조회
```http
GET /api/admin/analytics/stores?storeId=&period=month
Authorization: Bearer {token}
```

**쿼리 파라미터**:
- `storeId`: 특정 매장 ID (선택사항)
- `period`: 통계 기간 (`day`, `week`, `month`, `year`)

---

## 📝 응답 형식

### 성공 응답
```json
{
  "success": true,
  "message": "작업 성공 메시지",
  "data": { /* 응답 데이터 */ }
}
```

### 실패 응답
```json
{
  "success": false,
  "message": "에러 메시지",
  "data": null,
  "status": 400
}
```

---

## ⚠️ 에러 코드

| 상태 코드 | 설명 |
|-----------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스를 찾을 수 없음 |
| 409 | 중복 데이터 |
| 500 | 서버 내부 오류 |

---

## 🔧 프론트엔드 사용 예시

### JavaScript (fetch)
```javascript
// 로그인
const loginResponse = await fetch('/api/admin/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'spotline-admin',
    password: '12341234'
  })
});

const loginData = await loginResponse.json();
if (loginData.success) {
  localStorage.setItem('adminToken', loginData.data.token);
}

// 매장 목록 조회
const token = localStorage.getItem('adminToken');
const storesResponse = await fetch('/api/admin/stores?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const storesData = await storesResponse.json();
```

### JavaScript (axios)
```javascript
import axios from 'axios';

// axios 인터셉터 설정
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 매장 생성
const newStore = await axios.post('/api/admin/stores', {
  name: '새로운 카페',
  category: '카페',
  address: '서울시 강남구 테헤란로 456',
  coordinates: {
    lat: 37.5665,
    lng: 126.9780
  }
});
```

---

## 🚀 테스트 방법

### cURL 테스트
```bash
# 로그인
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "spotline-admin", "password": "12341234"}'

# 매장 목록 조회 (토큰 필요)
curl -X GET "http://localhost:4000/api/admin/stores?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Swagger UI
API 문서는 `http://localhost:4000/api-docs`에서 확인할 수 있습니다.

---

이제 모든 Admin API가 구현되었습니다! 프론트엔드에서 위 엔드포인트들을 사용하여 매장 관리, 추천 관리, 통계 조회 등을 할 수 있습니다.