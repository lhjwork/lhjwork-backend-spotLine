# 🎯 Admin 시스템 최종 구조 가이드

## ✅ 현재 백엔드 구조 (검증 완료)

### 🎭 데모 시스템 (업주 소개용) - 완료

- **스키마**: `DemoStore`
- **데이터**: 4개 데모 매장 준비 완료
  1. 카페 데모 (demo_cafe_001) - 강남역
  2. 갤러리 데모 (demo_gallery_001) - 홍대입구
  3. 레스토랑 데모 (demo_restaurant_001) - 논현동
  4. 북카페 데모 (demo_bookcafe_001) - 홍대입구
- **API**: `/api/demo/*`
- **특징**: 통계 수집 없음, 업주 소개 전용

### 🏪 실제 운영 시스템 (Admin 관리 대상) - 대기 중

- **스키마**: `Store`
- **데이터**: **0개** (Admin에서 등록해야 함)
- **API**: `/api/stores/*`, `/api/experience`
- **특징**: 완전한 통계 수집, 실제 서비스 운영

## 🔧 Admin에서 구현해야 할 핵심 기능

### 1. 실제 매장 관리 시스템

```typescript
// 매장 등록 폼 데이터 구조
interface StoreFormData {
  name: string; // 매장명
  category: "cafe" | "restaurant" | "exhibition" | "hotel" | "retail" | "culture" | "other";
  location: {
    address: string; // 실제 주소
    coordinates: [number, number]; // [경도, 위도]
    area: string; // 지역 (강남역, 홍대입구 등)
  };
  qrCode: {
    id: string; // 고유 QR 코드 ID (예: real_cafe_gangnam_001)
    isActive: boolean;
  };
  shortDescription: string; // 한 문장 설명 (최대 100자)
  representativeImage: string; // 대표 이미지 URL
  externalLinks: {
    instagram?: string;
    website?: string;
    blog?: string;
    notion?: string;
  };
  spotlineStory?: string; // 상세 설명 (최대 500자)
  isActive: boolean;
}
```

### 2. Admin UI 구조

#### 2.1 대시보드

```
📊 SpotLine Admin Dashboard
├── 📈 전체 통계
│   ├── 등록된 매장: 0개 ⚠️
│   ├── 활성 QR 코드: 0개
│   ├── 이번 달 체험: 0회
│   └── 실제 사용: 0회
├── ⚠️ 알림
│   └── "실제 운영용 매장을 등록해주세요"
└── 🚀 빠른 시작
    └── "첫 매장 등록하기" 버튼
```

#### 2.2 매장 관리

```
🏪 매장 관리
├── 📋 매장 목록 (현재: 0개)
│   └── "매장이 없습니다. 첫 매장을 등록해보세요."
├── ➕ 새 매장 등록
│   ├── 기본 정보 입력
│   ├── 위치 정보 설정
│   ├── QR 코드 생성
│   └── 이미지 업로드
└── 🔗 QR 코드 관리
    └── QR 코드 생성 및 다운로드
```

#### 2.3 데모 시스템 (읽기 전용)

```
🎭 데모 시스템 (업주 소개용)
├── 📋 데모 매장 목록 (4개)
│   ├── 카페 데모 (demo_cafe_001)
│   ├── 갤러리 데모 (demo_gallery_001)
│   ├── 레스토랑 데모 (demo_restaurant_001)
│   └── 북카페 데모 (demo_bookcafe_001)
├── ⚠️ 주의사항
│   └── "데모 데이터는 수정하지 마세요"
└── 🔗 데모 링크
    └── /api/demo/experience
```

#### 2.4 체험하기 설정

```
🎯 SpotLine 체험하기 설정
├── ⚠️ 상태: 비활성화
│   └── "실제 매장을 먼저 등록해주세요"
├── 🔧 설정 (매장 등록 후 활성화)
│   ├── 체험 방식 선택
│   ├── 대상 매장 선택
│   └── 활성화/비활성화
└── 📊 체험 통계
    └── 현재 데이터 없음
```

### 3. API 엔드포인트 (Admin용)

#### 3.1 매장 관리 API

```typescript
// 매장 등록
POST /api/admin/stores
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
  "representativeImage": "https://...",
  "externalLinks": {
    "instagram": "https://instagram.com/real_cafe"
  }
}

// 매장 목록 조회
GET /api/admin/stores

// 매장 수정
PUT /api/admin/stores/{id}

// 매장 삭제 (비활성화)
DELETE /api/admin/stores/{id}
```

#### 3.2 QR 코드 관리 API

```typescript
// QR 코드 생성
POST /api/admin/qr-codes/generate
{
  "storeId": "store_id",
  "customId": "real_cafe_gangnam_001"
}

// QR 코드 목록
GET /api/admin/qr-codes

// QR 코드 활성화/비활성화
PUT /api/admin/qr-codes/{id}/toggle
```

#### 3.3 체험하기 설정 API

```typescript
// 체험 설정 조회
GET /api/admin/experience-configs

// 체험 설정 생성/수정
POST /api/admin/experience-configs
{
  "name": "기본 체험 설정",
  "type": "random", // random, sequential, fixed
  "targetStores": ["store_id_1", "store_id_2"],
  "isActive": true
}
```

### 4. 데이터 흐름 구분

#### 4.1 데모 흐름 (업주 소개)

```
업주에게 시연
↓
"데모 체험하기" 클릭
↓
/api/demo/experience
↓
DemoStore에서 랜덤 선택
↓
데모 매장 페이지 표시
↓
통계 수집 없음
```

#### 4.2 실제 체험 흐름 (사용자)

```
사용자 체험
↓
"SpotLine 체험하기" 클릭
↓
/api/experience
↓
Store에서 관리자 설정에 따라 선택
↓
실제 매장 페이지 표시
↓
Analytics에 통계 수집
```

#### 4.3 실제 QR 스캔 흐름

```
실제 QR 코드 스캔
↓
/api/stores/spotline/{qrId}
↓
Store에서 매장 정보 조회
↓
추천 매장 표시
↓
모든 행동 Analytics에 기록
```

### 5. 개발 우선순위

#### Phase 1: 기본 매장 관리 (필수)

- [ ] 매장 등록 폼
- [ ] 매장 목록 표시
- [ ] 매장 수정/삭제
- [ ] QR 코드 생성

#### Phase 2: 체험 시스템 연동

- [ ] 체험하기 설정 관리
- [ ] 체험 통계 확인
- [ ] 체험 활성화/비활성화

#### Phase 3: 고급 기능

- [ ] 매장 간 추천 관계 설정
- [ ] 상세 분석 대시보드
- [ ] 사용자 행동 분석

### 6. 주의사항

#### ⚠️ 절대 하지 말아야 할 것

1. **DemoStore 데이터 수정**: 업주 소개용이므로 건드리지 말 것
2. **QR 코드 ID 중복**: demo*\* 와 real*\* 형태로 구분 유지
3. **데모 통계 수집**: 데모 사용 시 Analytics 기록 금지

#### ✅ 반드시 해야 할 것

1. **실제 매장만 관리**: Store 스키마의 데이터만 CRUD
2. **QR 코드 고유성**: 각 매장마다 고유한 QR 코드 ID 생성
3. **통계 구분**: 데모/체험/실제 사용 데이터 명확히 구분

### 7. 테스트 방법

#### 7.1 구조 확인

```bash
pnpm run check-structure
```

#### 7.2 데모 테스트

```bash
curl http://localhost:4000/api/demo/experience
```

#### 7.3 실제 체험 테스트 (매장 등록 후)

```bash
curl http://localhost:4000/api/experience
```

## 🎯 최종 목표

- **데모**: "이런 서비스입니다" (업주 소개용)
- **체험**: "한번 써보세요" (사용자 체험용)
- **운영**: "실제로 사용하세요" (정식 서비스)

각각이 완전히 분리되어 독립적으로 작동하는 구조가 완성되었습니다!
