# SpotLine API 문서 VERSION002

## 개요

SpotLine 백엔드 API 문서입니다. 이 문서는 프론트엔드 개발자와 관리자를 위한 완전한 API 가이드를 제공합니다.

## 변경사항 (VERSION002)

- **체험 설정 시스템 추가**: 관리자가 "SpotLine 체험하기" 버튼의 동작을 설정할 수 있는 시스템
- **Experience API 추가**: 프론트엔드에서 체험 설정에 따라 매장을 선택하는 API
- **관리자 계정 표준화**: `spotline-admin` / `12341234` 계정으로 통일
- **QR 코드 ID 표준화**: UUID 대신 의미있는 QR 코드 ID 사용
- **TypeScript 완전 지원**: 모든 API에 대한 TypeScript 타입 정의 제공

## 기본 정보

- **Base URL**: `http://localhost:4000` (개발환경)
- **Content-Type**: `application/json`
- **인증 방식**: JWT Bearer Token

## 인증

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
      "id": "...",
      "username": "spotline-admin",
      "role": "super_admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

## 1. SpotLine 체험 API (프론트엔드용)

### 1.1 체험하기 (추천)

프론트엔드의 "SpotLine 체험하기" 버튼에서 사용하는 API입니다.

```http
GET /api/experience
```

**응답:**

```json
{
  "success": true,
  "message": "SpotLine 체험 매장 선택 성공",
  "data": {
    "qrId": "cafe_gangnam_001",
    "storeName": "카페 스팟라인",
    "storeId": "...",
    "area": "강남역",
    "configUsed": {
      "id": "...",
      "name": "기본 랜덤 체험",
      "type": "random"
    },
    "redirectUrl": "http://localhost:4000/api/stores/spotline/cafe_gangnam_001"
  }
}
```

### 1.2 직접 매장 조회

QR 코드 ID로 직접 매장 정보를 조회합니다.

```http
GET /api/stores/spotline/{qrId}
```

**예시:**

```http
GET /api/stores/spotline/cafe_gangnam_001
```

**응답:**

```json
{
  "success": true,
  "message": "SpotLine 매장 조회 성공",
  "data": {
    "id": "695dc59e914a0496da641266",
    "name": "카페 스팟라인",
    "shortDescription": "조용한 분위기에서 책과 함께하는 시간",
    "representativeImage": "https://images.unsplash.com/photo-1...",
    "location": {
      "address": "서울시 강남구 강남대로 123",
      "mapLink": "https://map.naver.com/..."
    },
    "externalLinks": {
      "instagram": "https://instagram.com/cafe_spotline",
      "website": "https://cafe-spotline.com"
    },
    "spotlineStory": "이 장소가 포함된 이유..."
  }
}
```

## 2. 매장 관리 API

### 2.1 모든 매장 조회

```http
GET /api/stores
```

### 2.2 매장 생성

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

## 3. 체험 설정 관리 API (관리자용)

### 3.1 모든 체험 설정 조회

```http
GET /api/admin/experience-configs
Authorization: Bearer {token}
```

### 3.2 기본 체험 설정 조회

```http
GET /api/admin/experience-configs/default
```

### 3.3 체험 설정 생성

```http
POST /api/admin/experience-configs
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "강남 지역 체험",
  "description": "강남 지역 매장만 선택하는 체험",
  "type": "area_based",
  "settings": {
    "areas": ["강남역", "논현동", "신사동"]
  },
  "priority": 1
}
```

### 3.4 체험 설정 미리보기

```http
GET /api/admin/experience-configs/{id}/preview?testCount=10
Authorization: Bearer {token}
```

## 4. 사용 가능한 QR 코드 ID 목록

### 강남 지역

- `cafe_gangnam_001` - 카페 스팟라인
- `dessert_gangnam_001` - 디저트 하우스
- `culture_gangnam_001` - 북카페 리딩룸
- `gallery_gangnam_001` - 아트 갤러리 모던
- `brunch_gangnam_001` - 브런치 스팟

### 홍대 지역

- `cafe_hongdae_001` - 바이닐 카페
- `food_hongdae_001` - 스트리트 푸드 마켓
- `record_hongdae_001` - 인디 레코드샵

## 5. TypeScript 타입 정의

```typescript
// 기본 응답 타입
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  status?: number;
}

// SpotLine 매장 타입
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

// 체험 결과 타입
interface ExperienceResult {
  qrId: string;
  storeName: string;
  storeId: string;
  area: string;
  configUsed: {
    id: string;
    name: string;
    type: string;
  };
  redirectUrl: string;
}

// 체험 설정 타입
interface ExperienceConfig {
  _id: string;
  name: string;
  description: string;
  type: "fixed" | "random" | "area_based" | "weighted";
  isActive: boolean;
  isDefault: boolean;
  settings: {
    qrId?: string; // fixed 타입용
    areas?: string[]; // area_based 타입용
    weights?: { qrId: string; weight: number }[]; // weighted 타입용
  };
  priority: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}
```

## 6. 에러 코드

| 상태 코드 | 설명        |
| --------- | ----------- |
| 200       | 성공        |
| 201       | 생성 성공   |
| 400       | 잘못된 요청 |
| 401       | 인증 필요   |
| 403       | 권한 없음   |
| 404       | 리소스 없음 |
| 500       | 서버 오류   |

## 7. 개발 환경 설정

### 환경변수

```bash
PORT=4000
MONGODB_URI=mongodb://localhost:27017/spotline
JWT_SECRET=spotline-jwt-secret-jin
NODE_ENV=development
```

### 서버 시작

```bash
# 개발 서버 시작
pnpm dev

# 데이터베이스 시드 데이터 생성
pnpm seed

# 관리자 계정 생성
ts-node -r tsconfig-paths/register src/scripts/createSpotlineAdmin.ts
```

## 8. API 테스트 예시

### cURL 예시

```bash
# 체험하기 API 테스트
curl http://localhost:4000/api/experience

# 특정 매장 조회
curl http://localhost:4000/api/stores/spotline/cafe_gangnam_001

# 관리자 로그인
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"spotline-admin","password":"12341234"}'
```

### JavaScript/TypeScript 예시

```typescript
// 체험하기 API 호출
const getExperience = async (): Promise<ExperienceResult> => {
  const response = await fetch("http://localhost:4000/api/experience");
  const data: ApiResponse<ExperienceResult> = await response.json();
  return data.data;
};

// 매장 정보 조회
const getStore = async (qrId: string): Promise<SpotlineStore> => {
  const response = await fetch(`http://localhost:4000/api/stores/spotline/${qrId}`);
  const data: ApiResponse<SpotlineStore> = await response.json();
  return data.data;
};
```

## 9. 주의사항

1. **QR 코드 ID**: UUID 대신 의미있는 QR 코드 ID를 사용해야 합니다
2. **인증**: 관리자 API는 JWT 토큰이 필요합니다
3. **CORS**: 프론트엔드 도메인이 허용되어 있는지 확인하세요
4. **환경**: 프로덕션에서는 BASE_URL을 실제 서버 주소로 변경하세요

## 10. 지원 및 문의

- API 문서: http://localhost:4000/api-docs
- 개발 환경: Node.js 18+, MongoDB, TypeScript
- 패키지 매니저: pnpm
