# SpotLine 통합 Admin API 레퍼런스

## 📋 개요

SpotLine의 모든 관리자 기능이 `/api/admin/*` 경로로 통합되었습니다. 이 문서는 통합된 Admin API의 완전한 레퍼런스를 제공합니다.

## 🔐 인증

모든 Admin API는 JWT 토큰 기반 인증이 필요합니다.

### 로그인
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
      "id": "695e539458b2929f55f353e1",
      "username": "spotline-admin",
      "email": "admin@spotline.co.kr",
      "role": "super_admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### 인증 헤더
모든 요청에 다음 헤더를 포함해야 합니다:
```
Authorization: Bearer <JWT_TOKEN>
```

## 🏢 기본 Admin 관리

### 1. 관리자 프로필 조회
```http
GET /api/admin/profile
Authorization: Bearer <TOKEN>
```

### 2. 관리자 목록 조회 (super_admin만)
```http
GET /api/admin/list?page=1&limit=20&role=admin&isActive=true
Authorization: Bearer <TOKEN>
```

### 3. 관리자 권한 수정 (super_admin만)
```http
PATCH /api/admin/{adminId}/permissions
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "role": "admin",
  "isActive": true
}
```

## 🏪 매장 관리 (기존)

### 1. 매장 목록 조회
```http
GET /api/admin/stores?category=cafe&area=gangnam&active=true&page=1&limit=20
Authorization: Bearer <TOKEN>
```

### 2. 매장 생성
```http
POST /api/admin/stores
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "새로운 카페",
  "category": "cafe",
  "location": {
    "address": "서울시 강남구 테헤란로 123",
    "coordinates": {
      "coordinates": [127.0276, 37.4979]
    }
  },
  "qrCode": {
    "id": "new_cafe_001"
  }
}
```

### 3. 매장 수정
```http
PUT /api/admin/stores/{id}
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "수정된 카페명",
  "isActive": true
}
```

### 4. 매장 삭제
```http
DELETE /api/admin/stores/{id}
Authorization: Bearer <TOKEN>
```

### 5. 매장 상태 토글
```http
PATCH /api/admin/stores/{id}/toggle
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "active": false
}
```

### 6. 매장 통계
```http
GET /api/admin/stores/stats
Authorization: Bearer <TOKEN>
```

## 🎯 추천 관리 (기존)

### 1. 추천 목록 조회
```http
GET /api/admin/recommendations?fromStore=store1&toStore=store2&category=next_meal&page=1
Authorization: Bearer <TOKEN>
```

### 2. 추천 생성
```http
POST /api/admin/recommendations
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "fromStore": "store_id_1",
  "toStore": "store_id_2",
  "category": "next_meal",
  "priority": 9,
  "description": "추천 설명",
  "walkingTime": 5,
  "distance": 200
}
```

### 3. 추천 수정
```http
PUT /api/admin/recommendations/{id}
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "priority": 8,
  "isActive": true
}
```

### 4. 추천 삭제
```http
DELETE /api/admin/recommendations/{id}
Authorization: Bearer <TOKEN>
```

### 5. 특정 매장의 추천 조회
```http
GET /api/admin/stores/{storeId}/recommendations
Authorization: Bearer <TOKEN>
```

## 🎪 데모 시스템 관리 (신규)

### 1. 데모 매장 관리

#### 데모 매장 목록 조회
```http
GET /api/admin/demo/stores
Authorization: Bearer <TOKEN>
```

**응답:**
```json
{
  "success": true,
  "message": "데모 매장 목록을 성공적으로 가져왔습니다.",
  "data": {
    "stores": [
      {
        "id": "demo-store",
        "name": "아늑한 카페 스토리",
        "shortDescription": "따뜻한 분위기의 동네 카페",
        "representativeImage": "https://images.unsplash.com/photo-1554118811-1e0d58224f24...",
        "category": "cafe",
        "location": {
          "address": "서울시 강남구 테헤란로 123",
          "coordinates": [127.0276, 37.4979]
        },
        "qrCode": {
          "id": "demo_cafe_001",
          "isActive": true
        }
      }
    ],
    "total": 1,
    "system": "demo"
  },
  "meta": {
    "system": "admin",
    "subsystem": "demo",
    "adminId": "695e539458b2929f55f353e1",
    "timestamp": "2026-01-08T14:35:35.551Z"
  }
}
```

#### 특정 데모 매장 조회
```http
GET /api/admin/demo/stores/{storeId}
Authorization: Bearer <TOKEN>
```

#### 데모 매장 생성
```http
POST /api/admin/demo/stores
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "새로운 데모 매장",
  "shortDescription": "매장 한줄 설명",
  "representativeImage": "https://example.com/image.jpg",
  "category": "cafe",
  "location": {
    "address": "서울시 강남구 테헤란로 456",
    "coordinates": [127.0300, 37.5000]
  }
}
```

#### 데모 매장 수정
```http
PUT /api/admin/demo/stores/{storeId}
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "수정된 데모 매장명",
  "shortDescription": "수정된 설명"
}
```

#### 데모 매장 삭제
```http
DELETE /api/admin/demo/stores/{storeId}
Authorization: Bearer <TOKEN>
```

### 2. 데모 추천 관리

#### 데모 추천 목록 조회
```http
GET /api/admin/demo/recommendations
Authorization: Bearer <TOKEN>
```

#### 데모 추천 생성
```http
POST /api/admin/demo/recommendations
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "새로운 추천 장소",
  "shortDescription": "추천 장소 설명",
  "category": "bakery",
  "distance": 150,
  "walkingTime": 2,
  "representativeImage": "https://example.com/image.jpg"
}
```

#### 데모 추천 수정
```http
PUT /api/admin/demo/recommendations/{id}
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "수정된 추천 장소명",
  "distance": 200
}
```

#### 데모 추천 삭제
```http
DELETE /api/admin/demo/recommendations/{id}
Authorization: Bearer <TOKEN>
```

### 3. 데모 시스템 설정

#### 데모 설정 조회
```http
GET /api/admin/demo/settings
Authorization: Bearer <TOKEN>
```

**응답:**
```json
{
  "success": true,
  "message": "데모 시스템 설정을 성공적으로 가져왔습니다.",
  "data": {
    "isEnabled": true,
    "loadingSimulationMs": 500,
    "version": "2.0",
    "lastUpdated": "2026-01-08T14:35:35.551Z"
  }
}
```

#### 데모 설정 수정
```http
PUT /api/admin/demo/settings
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "isEnabled": true,
  "loadingSimulationMs": 1000
}
```

## 🚀 라이브 시스템 관리 (신규)

### 1. 라이브 매장 관리

#### 라이브 매장 목록 조회 (관리자 뷰)
```http
GET /api/admin/live/stores?page=1&limit=20&status=pending&category=cafe&search=카페
Authorization: Bearer <TOKEN>
```

**응답:**
```json
{
  "success": true,
  "message": "실제 매장 목록을 성공적으로 가져왔습니다.",
  "data": {
    "stores": [
      {
        "storeId": "live_store_001",
        "name": "강남 브런치 카페",
        "description": "신선한 재료로 만든 건강한 브런치와 스페셜티 커피",
        "category": "cafe",
        "status": "active",
        "ownerId": "owner_001",
        "analytics": {
          "totalViews": 1247,
          "monthlyViews": 89,
          "qrScans": 156,
          "recommendations": 23
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-08T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "pages": 1
    },
    "summary": {
      "total": 2,
      "active": 1,
      "pending": 1,
      "suspended": 0
    }
  }
}
```

#### 특정 라이브 매장 조회 (관리자 뷰)
```http
GET /api/admin/live/stores/{storeId}
Authorization: Bearer <TOKEN>
```

#### 매장 승인 (관리자 전용)
```http
POST /api/admin/live/stores/{storeId}/approve
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "approvalNote": "모든 요구사항을 충족합니다."
}
```

#### 매장 정지 (관리자 전용)
```http
POST /api/admin/live/stores/{storeId}/suspend
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "suspensionReason": "정책 위반으로 인한 정지"
}
```

### 2. 라이브 추천 관리

#### 라이브 추천 목록 조회
```http
GET /api/admin/live/recommendations
Authorization: Bearer <TOKEN>
```

#### 라이브 추천 생성
```http
POST /api/admin/live/recommendations
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "fromStoreId": "live_store_001",
  "toStoreId": "live_store_002",
  "priority": 9,
  "isActive": true
}
```

#### 라이브 추천 수정
```http
PUT /api/admin/live/recommendations/{id}
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "priority": 8,
  "isActive": false
}
```

#### 라이브 추천 삭제
```http
DELETE /api/admin/live/recommendations/{id}
Authorization: Bearer <TOKEN>
```

### 3. 라이브 분석 데이터

#### 전체 라이브 시스템 분석
```http
GET /api/admin/live/analytics
Authorization: Bearer <TOKEN>
```

**응답:**
```json
{
  "success": true,
  "message": "Live 시스템 분석 데이터를 성공적으로 가져왔습니다.",
  "data": {
    "overview": {
      "totalStores": 2,
      "activeStores": 1,
      "pendingStores": 1,
      "totalViews": 2139,
      "totalQRScans": 290
    },
    "trends": {
      "dailyViews": [120, 135, 98, 156, 189, 167, 145],
      "dailyScans": [23, 28, 19, 31, 35, 29, 26],
      "topCategories": [
        {"category": "cafe", "count": 1, "percentage": 50},
        {"category": "bakery", "count": 1, "percentage": 50}
      ]
    },
    "performance": {
      "averageViewsPerStore": 1070,
      "averageScansPerStore": 145,
      "conversionRate": 12.5
    }
  }
}
```

#### 특정 매장 분석 데이터
```http
GET /api/admin/live/analytics/stores/{storeId}
Authorization: Bearer <TOKEN>
```

### 4. 라이브 시스템 설정

#### 라이브 설정 조회
```http
GET /api/admin/live/settings
Authorization: Bearer <TOKEN>
```

#### 라이브 설정 수정
```http
PUT /api/admin/live/settings
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "isEnabled": true,
  "requireApproval": true,
  "maxStoresPerOwner": 5,
  "analyticsRetentionDays": 365
}
```

## 🖥️ 시스템 관리 (신규)

### 1. 시스템 상태 확인
```http
GET /api/admin/system/health
Authorization: Bearer <TOKEN>
```

**응답:**
```json
{
  "success": true,
  "message": "어드민 시스템이 정상 작동 중입니다.",
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-08T14:36:02.671Z",
    "systems": {
      "demo": "active",
      "live": "active",
      "admin": "active"
    },
    "admin": {
      "adminId": "695e539458b2929f55f353e1",
      "type": "admin"
    }
  }
}
```

### 2. 전체 시스템 통계
```http
GET /api/admin/system/stats
Authorization: Bearer <TOKEN>
```

**응답:**
```json
{
  "success": true,
  "message": "시스템 통계를 성공적으로 가져왔습니다.",
  "data": {
    "demo": {
      "stores": 1,
      "recommendations": 4,
      "lastUpdated": "2026-01-08T14:36:36.932Z"
    },
    "live": {
      "stores": 2,
      "activeStores": 2,
      "pendingStores": 0,
      "totalViews": 2139,
      "totalQRScans": 290,
      "lastUpdated": "2026-01-08T14:36:36.932Z"
    },
    "admin": {
      "totalAdmins": 1,
      "lastLogin": "2026-01-08T14:36:36.932Z",
      "currentAdmin": "695e539458b2929f55f353e1"
    }
  }
}
```

## 📊 응답 형식

모든 Admin API는 일관된 응답 형식을 사용합니다:

### 성공 응답
```json
{
  "success": true,
  "message": "작업 성공 메시지",
  "data": {
    // 응답 데이터
  },
  "status": 200,
  "meta": {
    "system": "admin",
    "subsystem": "demo|live|system",
    "adminId": "관리자_ID",
    "timestamp": "2026-01-08T14:35:35.551Z"
  }
}
```

### 오류 응답
```json
{
  "success": false,
  "message": "오류 메시지",
  "data": null,
  "status": 400,
  "meta": {
    "system": "admin",
    "error": "상세 오류 정보"
  }
}
```

## 🔒 권한 체계

### 관리자 역할
- **admin**: 기본 관리자 권한
- **super_admin**: 모든 권한 + 관리자 관리

### 접근 권한
- 모든 `/api/admin/*` 엔드포인트는 인증 필요
- 일부 기능은 `super_admin` 권한 필요
- 모든 작업은 관리자 ID로 추적됨

## 🧪 테스트 예제

### cURL 예제
```bash
# 1. 로그인
TOKEN=$(curl -s -X POST "http://localhost:4000/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "spotline-admin", "password": "12341234"}' \
  | jq -r '.data.token')

# 2. 데모 매장 조회
curl -X GET "http://localhost:4000/api/admin/demo/stores" \
  -H "Authorization: Bearer $TOKEN"

# 3. 라이브 매장 조회
curl -X GET "http://localhost:4000/api/admin/live/stores" \
  -H "Authorization: Bearer $TOKEN"

# 4. 시스템 상태 확인
curl -X GET "http://localhost:4000/api/admin/system/health" \
  -H "Authorization: Bearer $TOKEN"
```

### JavaScript 예제
```javascript
// 관리자 API 클라이언트 클래스
class AdminAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async request(method, endpoint, data = null) {
    const response = await fetch(`${this.baseURL}/api/admin${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : null
    });
    return response.json();
  }

  // 데모 시스템 관리
  async getDemoStores() {
    return this.request('GET', '/demo/stores');
  }

  async createDemoStore(storeData) {
    return this.request('POST', '/demo/stores', storeData);
  }

  // 라이브 시스템 관리
  async getLiveStores(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request('GET', `/live/stores?${query}`);
  }

  async approveStore(storeId, note) {
    return this.request('POST', `/live/stores/${storeId}/approve`, { approvalNote: note });
  }

  // 시스템 관리
  async getSystemHealth() {
    return this.request('GET', '/system/health');
  }

  async getSystemStats() {
    return this.request('GET', '/system/stats');
  }
}

// 사용 예제
const admin = new AdminAPI('http://localhost:4000', 'your-jwt-token');

// 데모 매장 조회
const demoStores = await admin.getDemoStores();
console.log('데모 매장:', demoStores);

// 라이브 매장 조회 (필터링)
const liveStores = await admin.getLiveStores({ status: 'pending', page: 1 });
console.log('대기 중인 매장:', liveStores);

// 시스템 상태 확인
const health = await admin.getSystemHealth();
console.log('시스템 상태:', health);
```

## 📝 주요 변경사항

### 이전 구조
```
/api/admin/login
/api/admin/stores
/api/admin/recommendations
```

### 현재 통합 구조
```
/api/admin/                    # 기본 관리자 기능
/api/admin/stores              # 기존 매장 관리
/api/admin/recommendations     # 기존 추천 관리
/api/admin/demo/*              # 데모 시스템 관리
/api/admin/live/*              # 라이브 시스템 관리
/api/admin/system/*            # 시스템 관리
```

### 주요 개선사항
1. **통합된 엔드포인트**: 모든 관리자 기능이 `/api/admin/*` 하위로 통합
2. **시스템 분리**: 데모와 라이브 시스템의 명확한 분리
3. **향상된 분석**: 라이브 시스템의 상세한 분석 데이터 제공
4. **시스템 모니터링**: 전체 시스템 상태 및 통계 제공
5. **일관된 응답**: 모든 API의 통일된 응답 형식
6. **감사 추적**: 모든 관리자 작업의 추적 가능

이 통합된 Admin API를 통해 SpotLine의 모든 관리 기능을 효율적으로 관리할 수 있습니다.