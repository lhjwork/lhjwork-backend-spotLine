# SpotLine API 문서 VERSION003

## 개요

SpotLine 백엔드 API 문서입니다. VERSION003에서는 시스템 구조를 명확히 구분하여 체험 시스템과 운영 시스템을 분리했습니다.

## 변경사항 (VERSION003)

- **시스템 구조 명확화**: 체험 시스템 vs 운영 시스템 완전 분리
- **용어 통일**: "데모" → "체험" (업주 소개용)
- **API 엔드포인트 정리**: 각 시스템별 명확한 API 구분
- **관리자 권한 명확화**: 운영 시스템만 Admin 관리 대상

## 기본 정보

- **Base URL**: `http://localhost:4000` (개발환경)
- **Content-Type**: `application/json`
- **인증 방식**: JWT Bearer Token (Admin API만)

## 🎭 체험 시스템 (업주 소개용)

### 중요: 체험 시스템의 특징

- **목적**: "이런 서비스입니다" - 업주에게 서비스 소개
- **데이터**: DemoStore 스키마 (수정 금지)
- **통계**: 수집하지 않음
- **관리**: 읽기 전용

### 1.1 체험하기 (업주 소개용)

```http
GET /api/demo/experience
```

**설명**: 업주에게 서비스를 소개할 때 사용하는 체험 기능

**응답:**

```json
{
  "success": true,
  "message": "데모 체험 매장 선택 성공",
  "data": {
    "qrId": "demo_cafe_001",
    "storeName": "카페 데모",
    "storeId": "675a1b2c3d4e5f6789012345",
    "area": "강남역",
    "redirectUrl": "http://localhost:4000/api/demo/stores/demo_cafe_001",
    "isDemoMode": true
  }
}
```

### 1.2 체험 매장 상세 조회

```http
GET /api/demo/stores/{qrId}
```

**예시:**

```http
GET /api/demo/stores/demo_cafe_001
```

**응답:**

```json
{
  "success": true,
  "message": "데모 매장 조회 성공",
  "data": {
    "id": "675a1b2c3d4e5f6789012345",
    "name": "카페 데모",
    "shortDescription": "조용한 분위기에서 커피와 함께하는 시간",
    "representativeImage": "https://images.unsplash.com/photo-1...",
    "location": {
      "address": "서울시 강남구 테헤란로 123 (데모용 주소)",
      "mapLink": "https://map.naver.com/v5/search/..."
    },
    "externalLinks": {
      "instagram": "https://instagram.com/demo_cafe",
      "website": "https://demo-cafe.spotline.com"
    },
    "spotlineStory": "이곳은 SpotLine 서비스를 소개하기 위한 데모 카페입니다...",
    "isDemoMode": true,
    "demoNotice": "이것은 업주 소개용 데모 페이지입니다."
  }
}
```

### 1.3 체험 매장 목록 조회

```http
GET /api/demo/stores
```

**응답:**

```json
{
  "success": true,
  "message": "데모 매장 목록 조회 성공",
  "data": [
    {
      "id": "675a1b2c3d4e5f6789012345",
      "name": "카페 데모",
      "shortDescription": "조용한 분위기에서 커피와 함께하는 시간",
      "representativeImage": "https://images.unsplash.com/photo-1...",
      "area": "강남역",
      "qrCodeId": "demo_cafe_001"
    }
  ]
}
```

### 1.4 체험 추천 매장 조회

```http
GET /api/demo/stores/{qrId}/recommendations
```

**예시:**

```http
GET /api/demo/stores/demo_cafe_001/recommendations
```

## 🏪 운영 시스템 (실제 서비스)

### 중요: 운영 시스템의 특징

- **목적**: "실제로 사용하세요" - 정식 서비스 운영
- **데이터**: Store 스키마 (Admin 관리)
- **통계**: 완전한 수집 및 분석
- **관리**: Admin에서 완전 관리

### 2.1 SpotLine 체험하기 (사용자용)

```http
GET /api/experience
```

**헤더:**

- `x-session-id`: 세션 ID (분석용, 선택사항)

**설명**: 사용자가 SpotLine 서비스를 체험할 때 사용

**응답:**

```json
{
  "success": true,
  "message": "체험 매장 선택 성공",
  "data": {
    "qrId": "real_cafe_gangnam_001",
    "storeName": "실제 카페명",
    "storeId": "675a1b2c3d4e5f6789012346",
    "area": "강남역",
    "configUsed": {
      "id": "675a1b2c3d4e5f6789012347",
      "name": "기본 체험 설정",
      "type": "random"
    },
    "redirectUrl": "/api/stores/spotline/real_cafe_gangnam_001",
    "timestamp": "2026-01-07T07:00:00.000Z"
  }
}
```

### 2.2 운영 매장 상세 조회 (QR 스캔용)

```http
GET /api/stores/spotline/{qrId}
```

**예시:**

```http
GET /api/stores/spotline/real_cafe_gangnam_001
```

**응답:**

```json
{
  "success": true,
  "message": "SpotLine 매장 조회 성공",
  "data": {
    "id": "675a1b2c3d4e5f6789012346",
    "name": "실제 카페명",
    "shortDescription": "조용한 분위기의 프리미엄 카페",
    "representativeImage": "https://real-image-url.com/image.jpg",
    "location": {
      "address": "서울시 강남구 테헤란로 123",
      "coordinates": {
        "type": "Point",
        "coordinates": [127.0276, 37.4979]
      },
      "mapLink": "https://maps.google.com/?q=37.4979,127.0276"
    },
    "externalLinks": {
      "instagram": "https://instagram.com/real_cafe",
      "website": "https://real-cafe.com"
    },
    "spotlineStory": "실제 매장의 SpotLine 스토리...",
    "nextSpots": [
      {
        "id": "675a1b2c3d4e5f6789012348",
        "name": "추천 매장명",
        "qrId": "real_restaurant_gangnam_001",
        "shortDescription": "추천 매장 설명",
        "representativeImage": "https://...",
        "area": "강남역"
      }
    ],
    "qrCode": {
      "id": "real_cafe_gangnam_001",
      "isActive": true
    }
  }
}
```

### 2.3 운영 매장 목록 조회

```http
GET /api/stores
```

**쿼리 파라미터:**

- `category`: 카테고리 필터 (선택사항)
- `area`: 지역 필터 (선택사항)
- `active`: 활성화 상태 필터 (선택사항)

### 2.4 운영 매장 추천 조회

```http
GET /api/stores/{qrId}/recommendations
```

### 2.5 체험 가능한 매장 목록

```http
GET /api/experience/available-stores
```

**응답:**

```json
{
  "success": true,
  "message": "사용 가능한 매장 목록 조회 성공",
  "data": {
    "totalCount": 5,
    "allStores": ["real_cafe_gangnam_001", "real_restaurant_gangnam_001", "real_gallery_hongdae_001"],
    "byArea": {
      "강남역": ["real_cafe_gangnam_001", "real_restaurant_gangnam_001"],
      "홍대입구": ["real_gallery_hongdae_001"]
    }
  }
}
```

### 2.6 체험 통계 조회

```http
GET /api/experience/stats?days=7
```

**쿼리 파라미터:**

- `days`: 조회할 일수 (기본값: 7)

## 🔧 Admin API (운영 시스템 관리)

### 중요: Admin API 특징

- **인증**: JWT Bearer Token 필수
- **권한**: 운영 시스템(Store 스키마)만 관리 가능
- **제한**: 체험 시스템(DemoStore 스키마)은 읽기 전용

### 3.1 관리자 인증

```http
POST /api/admin/login
```

**요청:**

```json
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
      "id": "675a1b2c3d4e5f6789012349",
      "username": "spotline-admin",
      "email": "spotline-admin@spotline.com",
      "role": "super_admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3.2 운영 매장 관리

#### 3.2.1 운영 매장 목록 조회

```http
GET /api/admin/stores
Authorization: Bearer {token}
```

#### 3.2.2 운영 매장 등록

```http
POST /api/admin/stores
Authorization: Bearer {token}
Content-Type: application/json
```

**요청:**

```json
{
  "name": "실제 카페명",
  "category": "cafe",
  "location": {
    "address": "서울시 강남구 테헤란로 123",
    "coordinates": [127.0276, 37.4979],
    "area": "강남역"
  },
  "qrCode": {
    "id": "real_cafe_gangnam_001",
    "isActive": true
  },
  "shortDescription": "조용한 분위기의 프리미엄 카페",
  "representativeImage": "https://real-image-url.com/image.jpg",
  "externalLinks": {
    "instagram": "https://instagram.com/real_cafe",
    "website": "https://real-cafe.com"
  },
  "spotlineStory": "실제 매장의 SpotLine 스토리...",
  "isActive": true
}
```

#### 3.2.3 운영 매장 수정

```http
PUT /api/admin/stores/{id}
Authorization: Bearer {token}
```

#### 3.2.4 운영 매장 삭제 (비활성화)

```http
DELETE /api/admin/stores/{id}
Authorization: Bearer {token}
```

### 3.3 SpotLine 체험하기 설정 관리

#### 3.3.1 체험 설정 조회

```http
GET /api/admin/experience-configs
Authorization: Bearer {token}
```

#### 3.3.2 체험 설정 저장

```http
POST /api/admin/experience-configs
Authorization: Bearer {token}
```

**요청:**

```json
{
  "name": "기본 체험 설정",
  "type": "random",
  "targetStores": ["675a1b2c3d4e5f6789012346", "675a1b2c3d4e5f6789012348"],
  "isActive": true
}
```

### 3.4 분석 데이터 조회

#### 3.4.1 운영 매장 통계

```http
GET /api/admin/analytics/stores
Authorization: Bearer {token}
```

#### 3.4.2 SpotLine 체험하기 통계

```http
GET /api/admin/analytics/experience
Authorization: Bearer {token}
```

#### 3.4.3 체험 시스템 데이터 (읽기 전용)

```http
GET /api/admin/demo/stores
Authorization: Bearer {token}
```

**응답:**

```json
{
  "success": true,
  "message": "체험 매장 목록 조회 성공 (읽기 전용)",
  "data": [
    {
      "id": "675a1b2c3d4e5f6789012345",
      "name": "카페 데모",
      "qrCodeId": "demo_cafe_001",
      "area": "강남역",
      "isDemoOnly": true
    }
  ],
  "warning": "이 데이터는 업주 소개용이므로 수정하지 마세요."
}
```

## 📊 분석 및 통계 API

### 4.1 운영 매장 분석

```http
GET /api/analytics/stores/{storeId}
```

### 4.2 사용자 행동 분석

```http
GET /api/analytics/user-behavior?days=30
```

### 4.3 QR 스캔 통계

```http
GET /api/analytics/qr-scans?storeId={storeId}&days=7
```

## 🚨 중요 주의사항

### ⚠️ API 사용 시 주의할 점

1. **시스템 구분**: 체험용(`/api/demo/*`)과 운영용(`/api/stores/*`, `/api/experience`) API를 명확히 구분
2. **통계 수집**: 체험 시스템은 통계 수집하지 않음, 운영 시스템만 Analytics 데이터 수집
3. **QR 코드 ID**: `demo_*` (체험용) vs `real_*` (운영용) 접두사로 구분
4. **Admin 권한**: 운영 시스템만 Admin에서 관리 가능, 체험 시스템은 읽기 전용

### ✅ 올바른 사용법

1. **업주 소개**: `/api/demo/experience` 사용
2. **사용자 체험**: `/api/experience` 사용
3. **실제 QR 스캔**: `/api/stores/spotline/{qrId}` 사용
4. **Admin 관리**: `/api/admin/*` 사용 (JWT 토큰 필수)

## 🔄 데이터 흐름

### 체험 흐름 (업주 소개용)

```
업주 시연 → /api/demo/experience → DemoStore 선택 → 통계 수집 없음
```

### 운영 흐름 - SpotLine 체험하기

```
사용자 체험 → /api/experience → Store 선택 → Analytics 수집
```

### 운영 흐름 - 실제 QR 스캔

```
QR 스캔 → /api/stores/spotline/{qrId} → Store 조회 → Analytics 수집
```

## 🎯 최종 목표

- **체험 시스템**: "이런 서비스입니다" (업주 소개용)
- **운영 시스템**: "실제로 사용하세요" (정식 서비스)

각 시스템의 목적에 맞게 적절한 API를 사용해주세요!
