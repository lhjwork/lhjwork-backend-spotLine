# SpotLine 백엔드 API 준수성 보고서

## 📋 개요

Admin 시스템에서 요구하는 API 명세서와 현재 구현된 백엔드 API 간의 차이점을 분석하고 수정이 필요한 부분을 정리합니다.

---

## 🔍 현재 상태 분석

### ✅ 올바르게 구현된 부분

1. **기본 응답 형식**: `formatResponse` 유틸리티로 일관된 응답 구조 제공
2. **JWT 인증**: 관리자 로그인 및 토큰 기반 인증 구현
3. **MongoDB 스키마**: Store, Admin, Analytics 모델 구현
4. **CORS 설정**: 프론트엔드 연동을 위한 CORS 설정

### ❌ 수정이 필요한 부분

---

## 1. 인증 API 수정사항

### 1.1 누락된 엔드포인트

#### 현재 구현

```typescript
// src/routes/admin.ts
router.post("/login", login);
router.get("/profile", authenticateAdmin, getProfile);
router.post("/create", createAdmin);
```

#### 요구사항 대비 누락

```typescript
// 추가 필요한 엔드포인트
router.get("/verify", authenticateAdmin, verifyToken); // ❌ 누락
router.get("/list", authenticateAdmin, getAdminList); // ❌ 누락
router.patch("/:adminId/permissions", authenticateAdmin, updatePermissions); // ❌ 누락
```

### 1.2 응답 형식 불일치

#### Admin 요구사항

```json
{
  "admin": {
    "id": "695bad104e53e6bb484d0b35",
    "username": "spotline-admin",
    "email": "admin@spotline.co.kr",
    "role": "super_admin",
    "lastLogin": "2026-01-06T09:24:57.449Z"
  }
}
```

#### 현재 구현

```json
{
  "admin": {
    "id": "...",
    "username": "spotline-admin",
    "email": "spotline-admin@spotline.com", // ❌ 도메인 불일치
    "role": "super_admin"
    // ❌ lastLogin 필드 누락
  }
}
```

---

## 2. 대시보드 API 누락

### 2.1 완전히 누락된 API

```typescript
// ❌ 구현 필요
GET / api / admin / dashboard / stats;
```

#### 요구되는 응답 구조

```json
{
  "totalStores": 150,
  "activeStores": 142,
  "totalRecommendations": 320,
  "totalQRScans": 1250,
  "todayScans": 45,
  "uniqueVisitors": 890,
  "conversionRate": 12.5
}
```

---

## 3. 매장 관리 API 수정사항

### 3.1 스키마 불일치

#### Admin 요구사항

```javascript
{
  contact: {
    phone: String,
    website: String,
    instagram: String
  },
  businessHours: {
    monday: { open: "08:00", close: "22:00" },
    tuesday: { open: "08:00", close: "22:00" }
    // ... 모든 요일
  },
  description: String,
  tags: [String],
  images: [String]
}
```

#### 현재 구현 (Store 모델)

```javascript
{
  contact: {
    phone: String,
    website: String,
    instagram: String  // ✅ 일치
  },
  businessHours: {
    monday: { open: String, close: String }  // ✅ 일치
  },
  // ❌ description 필드 누락 (shortDescription만 있음)
  tags: [String],  // ✅ 일치
  images: [String] // ✅ 일치
}
```

### 3.2 누락된 엔드포인트

```typescript
// ❌ 구현 필요
GET / api / stores / nearby / { lat } / { lng };
```

---

## 4. 분석 API 수정사항

### 4.1 이벤트 타입 불일치

#### Admin 요구사항

```javascript
eventType: "qr_scan" | "page_view" | "recommendation_click" | "map_click" | "store_visit";
```

#### 현재 구현

```javascript
eventType: "page_enter" | "spot_click" | "map_link_click" | "external_link_click" | "page_exit";
```

### 4.2 누락된 분석 엔드포인트

```typescript
// ❌ 모두 구현 필요
GET / api / analytics / qr / { qrId };
GET / api / analytics / store / { storeId };
GET / api / analytics / recommendations / performance;
GET / api / analytics / traffic / daily;
```

---

## 5. 지오코딩 API 수정사항

### 5.1 현재 구현 상태

```typescript
// ✅ 기본 구조는 있음
router.get("/unified", getUnifiedGeocoding);
router.get("/naver", getNaverGeocoding);
router.get("/google", getGoogleGeocoding);

// ❌ 누락된 엔드포인트
router.post("/validate", validateCoordinates);
```

---

## 6. 완전히 누락된 API

### 6.1 데이터 내보내기 API

```typescript
// ❌ 완전히 누락
GET /api/admin/export
```

---

## 🔧 수정 계획

### Phase 1: 긴급 수정 (1-2일)

1. **Admin 모델 수정**

   ```typescript
   // src/models/Admin.ts 수정
   email: {
     type: String,
     required: true,
     unique: true,
     trim: true,
     lowercase: true,
     default: function() {
       return `${this.username}@spotline.co.kr`;
     }
   }
   ```

2. **인증 API 보완**

   ```typescript
   // src/controllers/adminController.ts 추가
   export const verifyToken = async (req: AuthenticatedRequest, res: Response) => {
     // 토큰 검증 로직
   };

   export const getAdminList = async (req: AuthenticatedRequest, res: Response) => {
     // 관리자 목록 조회 로직
   };
   ```

3. **Store 모델 수정**
   ```typescript
   // src/models/Store.ts 수정
   description: {
     type: String,
     required: true,
     trim: true
   }
   ```

### Phase 2: 기능 추가 (3-5일)

1. **대시보드 API 구현**

   ```typescript
   // src/routes/dashboard.ts 생성
   // src/controllers/dashboardController.ts 생성
   ```

2. **분석 API 확장**

   ```typescript
   // src/controllers/analyticsController.ts 확장
   // 이벤트 타입 통일
   ```

3. **지오코딩 API 보완**
   ```typescript
   // src/controllers/geocodingController.ts 확장
   ```

### Phase 3: 고급 기능 (1주)

1. **데이터 내보내기 API**
2. **권한 관리 시스템**
3. **고급 분석 기능**

---

## 📝 구체적인 수정 파일 목록

### 즉시 수정 필요

- [ ] `src/models/Admin.ts` - 이메일 도메인 수정
- [ ] `src/models/Store.ts` - description 필드 추가
- [ ] `src/models/Analytics.ts` - 이벤트 타입 통일
- [ ] `src/controllers/adminController.ts` - 누락된 함수 추가
- [ ] `src/routes/admin.ts` - 누락된 라우트 추가

### 새로 생성 필요

- [ ] `src/routes/dashboard.ts`
- [ ] `src/controllers/dashboardController.ts`
- [ ] `src/services/dashboardService.ts`
- [ ] `src/controllers/exportController.ts`
- [ ] `src/services/exportService.ts`

### 확장 필요

- [ ] `src/controllers/analyticsController.ts` - 분석 API 확장
- [ ] `src/controllers/storeController.ts` - 근처 매장 검색 추가
- [ ] `src/controllers/geocodingController.ts` - 좌표 검증 추가

---

## 🚨 호환성 주의사항

### 1. 기존 데이터 마이그레이션

```typescript
// 기존 Admin 데이터의 이메일 도메인 변경 스크립트 필요
// 기존 Analytics 데이터의 이벤트 타입 변경 스크립트 필요
```

### 2. 프론트엔드 영향도

- Admin 로그인 응답 구조 변경으로 프론트엔드 수정 필요
- 분석 데이터 이벤트 타입 변경으로 차트 로직 수정 필요

### 3. 환경변수 추가 필요

```env
# 추가 필요한 환경변수
ADMIN_EMAIL_DOMAIN=spotline.co.kr
EXPORT_TEMP_DIR=/tmp/exports
MAX_EXPORT_RECORDS=10000
```

---

## 📊 우선순위 매트릭스

| 항목                     | 중요도 | 긴급도 | 구현 난이도 | 우선순위 |
| ------------------------ | ------ | ------ | ----------- | -------- |
| Admin 이메일 도메인 수정 | 높음   | 높음   | 낮음        | 1        |
| 토큰 검증 API            | 높음   | 높음   | 낮음        | 2        |
| Store description 필드   | 높음   | 중간   | 낮음        | 3        |
| 대시보드 통계 API        | 중간   | 높음   | 중간        | 4        |
| 분석 API 확장            | 중간   | 중간   | 높음        | 5        |
| 데이터 내보내기          | 낮음   | 낮음   | 높음        | 6        |

---

## 🎯 결론

현재 구현된 백엔드는 Admin 요구사항의 약 **60-70%** 정도 충족하고 있습니다.

**즉시 수정이 필요한 핵심 이슈:**

1. Admin 이메일 도메인 불일치
2. 누락된 인증 API 엔드포인트
3. Store 모델의 description 필드 누락
4. Analytics 이벤트 타입 불일치

**권장 작업 순서:**

1. 데이터 모델 수정 (1일)
2. 누락된 API 엔드포인트 추가 (2일)
3. 대시보드 API 구현 (2일)
4. 분석 API 확장 (3일)
5. 고급 기능 추가 (1주)

이 순서로 작업하면 Admin 시스템과의 완전한 호환성을 확보할 수 있습니다.
