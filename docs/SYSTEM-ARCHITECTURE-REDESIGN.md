# SpotLine 시스템 아키텍처 재설계 계획

## 📋 현재 상황 분석

### ❌ 현재 시스템의 문제점

1. **개념적 혼동**

   ```
   현재 구현:
   - /api/stores → 실제 운영 데이터 (하지만 "일반 매장"으로 명명)
   - /api/demo → 영업 시연용 데이터 (하지만 "데모"로 명명)

   요구사항:
   - /api/demo → 영업 시연용 데이터 (데모 매장 관리)
   - /api/production → 실제 운영 데이터 (실제 운영 관리)
   ```

2. **데이터 모델 혼동**

   ```
   현재:
   - Store 모델 → 실제로는 production 데이터
   - DemoStore 모델 → 실제로는 demo 데이터

   하지만 API 라우팅이 반대로 되어 있음
   ```

3. **권한 시스템 부재**
   - 데모/프로덕션 데이터 접근 제어 없음
   - 시나리오 기반 시연 도구 없음

## 🎯 재설계 전략

### Phase 1: 개념 정리 및 라우팅 수정 (긴급)

#### 1.1 현재 모델 재명명

```typescript
// 현재 Store 모델 → ProductionStore 모델로 변경
// 현재 DemoStore 모델 → DemoStore 모델 유지 (올바름)
```

#### 1.2 API 엔드포인트 재구성

```typescript
// 현재 (혼동된 구조)
/api/stores → 실제로는 production 데이터
/api/demo → 실제로는 demo 데이터

// 변경 후 (올바른 구조)
/api/demo → 영업 시연용 데이터 (현재 DemoStore)
/api/production → 실제 운영 데이터 (현재 Store)

// 호환성 유지를 위한 별칭
/api/stores → /api/production으로 리다이렉트
```

### Phase 2: 데이터베이스 분리 (1-2일)

#### 2.1 데이터베이스 구조

```javascript
// 1. 데모용 데이터베이스 (영업 시연용)
demo_spotline: {
  collections: [
    "demo_stores", // 시연용 매장
    "demo_recommendations", // 시연용 추천
    "demo_analytics", // 가짜 분석 데이터
    "demo_scenarios", // 시연 시나리오
  ];
}

// 2. 실제 운영 데이터베이스 (고객 데이터)
production_spotline: {
  collections: [
    "production_stores", // 실제 매장
    "production_recommendations", // 실제 추천
    "production_analytics", // 실제 분석 데이터
    "production_customers", // 고객 관리
  ];
}

// 3. 공통 관리 데이터베이스
admin_spotline: {
  collections: [
    "admins", // 관리자 계정
    "system_logs", // 시스템 로그
    "audit_logs", // 감사 로그
  ];
}
```

#### 2.2 QR 코드 식별자 패턴

```typescript
// 데모용 QR 코드
demo_qr_pattern: "demo_[category]_[area]_[number]";
// 예: "demo_cafe_gangnam_001"

// 실제 운영 QR 코드
production_qr_pattern: "prod_[category]_[area]_[number]";
// 예: "prod_cafe_gangnam_001"

// 기존 호환성 유지
legacy_qr_pattern: "[category]_[area]_[number]";
// 예: "cafe_gangnam_001" → production으로 분류
```

### Phase 3: 권한 시스템 구현 (3-5일)

#### 3.1 관리자 권한 레벨

```typescript
enum AdminRole {
  SUPER_ADMIN = "super_admin", // 모든 권한
  DEMO_ADMIN = "demo_admin", // 데모 데이터만
  PRODUCTION_ADMIN = "production_admin", // 실제 데이터만
  SALES_DEMO = "sales_demo", // 영업팀 시연용
}

const permissions = {
  super_admin: {
    demo: ["read", "write", "delete", "reset", "generate"],
    production: ["read", "write", "delete", "backup"],
    system: ["read", "write", "logs", "config"],
  },
  demo_admin: {
    demo: ["read", "write", "generate"],
    production: ["read"],
    system: ["read"],
  },
  production_admin: {
    demo: ["read"],
    production: ["read", "write"],
    system: ["read"],
  },
  sales_demo: {
    demo: ["read", "generate"],
    production: [],
    system: [],
  },
};
```

## 🚀 구현 계획

### 즉시 수정 (오늘)

1. **API 라우팅 수정**

   ```typescript
   // src/server.ts 수정
   app.use("/api/demo", demoRouter); // 영업 시연용 (현재 DemoStore)
   app.use("/api/production", productionRouter); // 실제 운영 (현재 Store)

   // 호환성 유지
   app.use("/api/stores", productionRouter); // 기존 API 호환성
   ```

2. **모델 재명명**

   ```typescript
   // Store.ts → ProductionStore.ts
   // DemoStore.ts → DemoStore.ts (유지)
   ```

3. **컨트롤러 분리**
   ```typescript
   // demoController.ts → 영업 시연용 로직
   // productionController.ts → 실제 운영 로직 (기존 storeController)
   ```

### 1-2일 내 완료

1. **데이터베이스 분리**
2. **QR 코드 패턴 통일**
3. **권한 미들웨어 구현**

### 1주일 내 완료

1. **시나리오 기반 데모 도구**
2. **영업 시연 대시보드**
3. **자동 데이터 생성 도구**

## 📝 마이그레이션 계획

### 1. 데이터 백업

```bash
# 현재 데이터 백업
mongodump --db spotline --out backup_$(date +%Y%m%d)
```

### 2. 데이터 분류 및 이동

```typescript
// 기존 Store 데이터 → production_stores로 이동
// 기존 DemoStore 데이터 → demo_stores로 이동
// QR 코드 패턴에 따라 자동 분류
```

### 3. API 호환성 유지

```typescript
// 기존 API 엔드포인트 유지하면서 새로운 구조로 리다이렉트
// 점진적 마이그레이션 지원
```

## 🎯 최종 목표

### 영업 시연 시나리오

1. **고객사 방문** → `/api/demo` 시스템 시연
2. **실제 데이터 보호** → `/api/production` 완전 분리
3. **권한 분리** → 영업팀은 demo만, 운영팀은 production만
4. **시나리오 기반** → 업종별 맞춤 시연 데이터

### 운영 효율성

1. **데이터 오염 방지** → 완전 분리된 데이터베이스
2. **권한 관리** → 역할별 접근 제어
3. **백업 및 복구** → 데이터 타입별 별도 관리
4. **성능 최적화** → 용도별 데이터베이스 최적화

---

**작성일**: 2026-01-08  
**우선순위**: 🔴 최고  
**예상 완료**: Phase 1 (오늘), 전체 (2주일)
