# SpotLine API 문서 VERSION002 (수정됨)

## 개요

SpotLine 백엔드 API 문서입니다. 이 문서는 프론트엔드 개발자와 관리자를 위한 완전한 API 가이드를 제공합니다.

## 변경사항 (VERSION002)

- **데모 시스템 분리**: 업주 소개용 데모와 실제 운영 시스템 완전 분리
- **데모 API 추가**: `/api/demo/*` 엔드포인트로 업주 소개용 데모 제공
- **통계 수집 제외**: 데모 시스템은 통계 수집하지 않음
- **관리자 계정 표준화**: `spotline-admin` / `12341234` 계정으로 통일
- **QR 코드 ID 표준화**: UUID 대신 의미있는 QR 코드 ID 사용

## 기본 정보

- **Base URL**: `http://localhost:4000` (개발환경)
- **Content-Type**: `application/json`
- **인증 방식**: JWT Bearer Token

## 🎭 데모 시스템 (업주 소개용)

### 중요: 데모와 실제 운영의 차이점

- **데모**: 업주에게 서비스를 소개할 때 사용, 통계 수집 없음, 별도 스키마
- **실제 운영**: admin에서 등록한 실제 데이터, 통계 수집, 실제 서비스

### 1.1 데모 체험하기 (업주 소개용)

```http
GET /api/demo/experience
```

**응답:**

```json
{
  "success": true,
  "message": "데모 체험 매장 선택 성공",
  "data": {
    "qrId": "demo_cafe_001",
    "storeName": "카페 데모",
    "storeId": "...",
    "area": "강남역",
    "redirectUrl": "http://localhost:4000/api/demo/stores/demo_cafe_001",
    "isDemoMode": true
  }
}
```

### 1.2 데모 매장 상세 조회

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
    "id": "...",
    "name": "카페 데모",
    "shortDescription": "조용한 분위기에서 커피와 함께하는 시간",
    "representativeImage": "https://images.unsplash.com/photo-1...",
    "location": {
      "address": "서울시 강남구 테헤란로 123 (데모용 주소)",
      "mapLink": "https://map.naver.com/..."
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

### 1.3 데모 매장 목록 조회

```http
GET /api/demo/stores
```

### 1.4 데모 추천 매장 조회

```http
GET /api/demo/stores/{qrId}/recommendations
```

## 🏪 실제 운영 시스템 (Admin 등록 데이터)

### 2.1 실제 매장 조회 (SpotLine 전용)

```http
GET /api/stores/spotline/{qrId}
```

**예시:**

```http
GET /api/stores/spotline/cafe_gangnam_001
```

### 2.2 모든 실제 매장 조회

```http
GET /api/stores
```

## 🔐 관리자 시스템

### 관리자 로그인

```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "spotline-admin",
  "password": "12341234"
}
```

### 매장 관리 (실제 운영용)

```http
POST /api/stores
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "새로운 카페",
  "category": "cafe",
  "location": {
    "address": "서울시 강남구 테헤란로 123",
    "coordinates": {
      "coordinates": [127.0276, 37.4979]
    },
    "district": "강남구",
    "area": "강남역"
  },
  "qrCode": {
    "id": "new_cafe_001"
  },
  "shortDescription": "새로운 카페입니다",
  "representativeImage": "https://example.com/image.jpg"
}
```

## 📊 분석 시스템 (실제 운영만)

**주의**: 데모 시스템은 분석 데이터를 수집하지 않습니다.

```http
GET /api/analytics
Authorization: Bearer {token}
```

## 4. 사용 가능한 QR 코드 ID

### 데모용 (업주 소개)

- `demo_cafe_001` - 카페 데모
- `demo_gallery_001` - 갤러리 데모
- `demo_restaurant_001` - 레스토랑 데모
- `demo_bookcafe_001` - 북카페 데모

### 실제 운영용

- `cafe_gangnam_001` - 카페 스팟라인
- `dessert_gangnam_001` - 디저트 하우스
- `culture_gangnam_001` - 북카페 리딩룸
- `gallery_gangnam_001` - 아트 갤러리 모던
- `brunch_gangnam_001` - 브런치 스팟
- `cafe_hongdae_001` - 바이닐 카페
- `food_hongdae_001` - 스트리트 푸드 마켓
- `record_hongdae_001` - 인디 레코드샵

## 5. TypeScript 타입 정의

```typescript
// 데모 응답 타입
interface DemoExperienceResult {
  qrId: string;
  storeName: string;
  storeId: string;
  area: string;
  redirectUrl: string;
  isDemoMode: true;
}

// 데모 매장 타입
interface DemoStore {
  id: string;
  name: string;
  shortDescription: string;
  representativeImage: string;
  location: {
    address: string;
    mapLink: string;
  };
  externalLinks: {
    instagram?: string;
    blog?: string;
    notion?: string;
    website?: string;
  };
  spotlineStory: string;
  isDemoMode: true;
  demoNotice: string;
}

// 실제 운영 매장 타입
interface SpotlineStore {
  id: string;
  name: string;
  shortDescription: string;
  representativeImage: string;
  location: {
    address: string;
    mapLink: string;
  };
  externalLinks: {
    instagram?: string;
    blog?: string;
    notion?: string;
    website?: string;
  };
  spotlineStory: string;
}
```

## 6. 개발 환경 설정

### 환경변수

```bash
PORT=4000
MONGODB_URI=mongodb://localhost:27017/spotline
JWT_SECRET=spotline-jwt-secret-jin
NODE_ENV=development
```

### 서버 시작 및 데이터 생성

```bash
# 개발 서버 시작
pnpm dev

# 실제 운영 데이터 생성
pnpm seed

# 데모 데이터 생성 (업주 소개용)
pnpm demo

# 관리자 계정 생성
ts-node -r tsconfig-paths/register src/scripts/createSpotlineAdmin.ts
```

## 7. API 테스트 예시

### 데모 시스템 테스트

```bash
# 데모 체험하기
curl http://localhost:4000/api/demo/experience

# 데모 매장 조회
curl http://localhost:4000/api/demo/stores/demo_cafe_001

# 데모 매장 목록
curl http://localhost:4000/api/demo/stores
```

### 실제 운영 시스템 테스트

```bash
# 실제 매장 조회
curl http://localhost:4000/api/stores/spotline/cafe_gangnam_001

# 관리자 로그인
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"spotline-admin","password":"12341234"}'
```

## 8. 프론트엔드 구현 가이드

### 업주 소개용 데모 버튼

```typescript
const handleDemoExperience = async (): Promise<void> => {
  try {
    const response = await fetch("http://localhost:4000/api/demo/experience");
    const data = await response.json();

    if (data.success) {
      // 데모 매장으로 이동
      window.location.href = data.data.redirectUrl;
    }
  } catch (error) {
    console.error("데모 체험 중 오류:", error);
  }
};
```

### 실제 서비스용 버튼

```typescript
const handleSpotlineExperience = (): void => {
  // 실제 운영 매장으로 이동
  window.location.href = "http://localhost:4000/api/stores/spotline/cafe_gangnam_001";
};
```

## 9. 주의사항

1. **데모와 실제 운영 분리**:

   - 데모: `/api/demo/*` 사용, 통계 수집 없음
   - 실제: `/api/stores/*` 사용, 통계 수집 있음

2. **QR 코드 ID 구분**:

   - 데모: `demo_*` 형태
   - 실제: `{category}_{area}_{number}` 형태

3. **데이터 관리**:

   - 데모: `pnpm demo`로 생성
   - 실제: admin 페이지에서 등록

4. **통계 수집**:
   - 데모: 수집하지 않음
   - 실제: 사용자 행동 분석 수집

## 10. 지원 및 문의

- API 문서: http://localhost:4000/api-docs
- 개발 환경: Node.js 18+, MongoDB, TypeScript
- 패키지 매니저: pnpm
