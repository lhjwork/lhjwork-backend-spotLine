# SpotLine Admin 개발 가이드 VERSION003-FINAL

## 📌 SpotLine 정체성 (중요 - 반드시 준수)

SpotLine은:

- **광고 플랫폼이 아닙니다**
- **리뷰 서비스가 아닙니다**
- **사용자 참여형 커뮤니티가 아닙니다**

SpotLine의 목적:

- **현재 장소를 기준으로 다음 경험을 자연스럽게 제안**
- **사용자 이동 흐름을 관찰**
- **큐레이션의 신뢰를 축적**

## 🆕 VERSION003 주요 변경사항

### 1. 시스템 구조 명확화

- **데모 시스템**: 업주 소개용 ("이런 서비스입니다") - 읽기 전용
- **운영 시스템**: 실제 서비스 ("실제로 사용하세요") - Admin 관리 대상

### 2. Admin 관리 범위 명확화

- **데모 데이터**: 건드리지 말 것 (DemoStore 스키마)
- **운영 데이터**: Admin이 관리해야 할 대상 (Store 스키마)

### 3. 버튼 구분 명확화

- **데모보기**: 업주에게 서비스 소개할 때 사용
- **SpotLine 시작**: 사용자가 실제 서비스 체험

## 🏗️ Admin 시스템 구조

### 1. 대시보드 구성

```typescript
interface DashboardData {
  operationalStores: number; // 운영 매장 수
  activeQRCodes: number; // 활성 QR 코드 수
  monthlyStarts: number; // 이번 달 SpotLine 시작 수
  monthlyScans: number; // 이번 달 실제 QR 스캔 수
  systemStatus: {
    demoSystem: boolean; // 데모 시스템 상태 (읽기 전용)
    operationalSystem: boolean; // 운영 시스템 상태
    spotlineStart: boolean; // SpotLine 시작 활성화 상태
  };
}
```

### 2. 메뉴 구조

```
📊 SpotLine Admin
├── 🏠 대시보드
├── 🏪 운영 매장 관리 ⭐ (주요 관리 대상)
│   ├── 매장 목록
│   ├── 새 매장 등록
│   ├── 매장 수정/삭제
│   └── QR 코드 관리
├── 🎯 SpotLine 시작 설정
│   ├── 시작 설정 관리
│   ├── 대상 매장 선택
│   └── 시작 통계
├── 🎭 데모 시스템 (읽기 전용)
│   ├── 데모 매장 목록 (수정 금지)
│   └── 데모 링크 확인
├── 📊 분석 및 통계
│   ├── 운영 매장 통계
│   ├── 사용자 행동 분석
│   └── SpotLine 시작 분석
└── ⚙️ 시스템 설정
    ├── 관리자 계정 관리
    └── 시스템 상태 확인
```

## 🏪 운영 매장 관리 (핵심 기능)

### 1. 매장 등록 폼

```typescript
interface StoreFormData {
  // 기본 정보
  name: string; // 매장명 (필수)
  category: StoreCategory; // 카테고리 (필수)

  // 위치 정보
  location: {
    address: string; // 주소 (필수)
    coordinates: [number, number]; // [경도, 위도] (필수)
    area: string; // 지역 (강남역, 홍대입구 등) (필수)
  };

  // QR 코드 정보
  qrCode: {
    id: string; // QR 코드 ID (자동 생성 또는 수동 입력)
    isActive: boolean; // 활성화 상태
  };

  // SpotLine 정체성에 맞는 정보
  shortDescription: string; // 한 문장 설명 (최대 100자) (필수)
  representativeImage: string; // 대표 이미지 URL (필수)
  spotlineStory?: string; // 상세 설명 (최대 500자) (선택)

  // 외부 링크
  externalLinks: {
    instagram?: string;
    website?: string;
    blog?: string;
    notion?: string;
  };

  // 상태
  isActive: boolean; // 매장 활성화 상태
}

type StoreCategory = "cafe" | "restaurant" | "exhibition" | "hotel" | "retail" | "culture" | "other";
```

### 2. 매장 목록 화면

```typescript
interface StoreListItem {
  id: string;
  name: string;
  category: StoreCategory;
  area: string;
  qrCodeId: string;
  isActive: boolean;
  createdAt: string;
  lastScanned?: string; // 마지막 QR 스캔 시간
  totalScans: number; // 총 스캔 수
}

// 매장 목록 컴포넌트 예시
const StoreList: React.FC = () => {
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/admin/stores", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await response.json();
      setStores(data.data);
    } catch (error) {
      console.error("매장 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  if (stores.length === 0) {
    return (
      <div className="empty-state">
        <h3>등록된 운영 매장이 없습니다</h3>
        <p>SpotLine 서비스를 시작하려면 첫 매장을 등록해주세요.</p>
        <button onClick={() => navigate("/admin/stores/new")}>첫 매장 등록하기</button>
      </div>
    );
  }

  return (
    <div className="store-list">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
};
```

### 3. QR 코드 관리

```typescript
interface QRCodeData {
  id: string;
  storeId: string;
  storeName: string;
  qrCodeId: string;
  isActive: boolean;
  createdAt: string;
  totalScans: number;
  qrCodeUrl: string; // QR 코드 이미지 URL
  downloadUrl: string; // 다운로드 링크
}

// QR 코드 생성 함수
const generateQRCode = (storeId: string, customId?: string): string => {
  if (customId) {
    return customId;
  }

  // 자동 생성 로직 (real_ 접두사 사용)
  const timestamp = Date.now();
  return `real_${storeId.slice(-8)}_${timestamp}`;
};
```

## 🎯 SpotLine 시작 설정

### 1. 시작 설정 관리

```typescript
interface StartConfig {
  id: string;
  name: string; // 설정명
  type: "random" | "sequential" | "fixed"; // 선택 방식
  targetStores: string[]; // 대상 매장 ID 배열
  isActive: boolean; // 활성화 상태
  createdAt: string;
  updatedAt: string;
}

// 시작 설정 컴포넌트
const StartSettings: React.FC = () => {
  const [config, setConfig] = useState<StartConfig | null>(null);
  const [availableStores, setAvailableStores] = useState<StoreListItem[]>([]);

  const handleSaveConfig = async (configData: Partial<StartConfig>) => {
    try {
      const response = await fetch("/api/admin/experience-configs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(configData),
      });

      if (response.ok) {
        alert("SpotLine 시작 설정이 저장되었습니다.");
        fetchConfig();
      }
    } catch (error) {
      console.error("설정 저장 실패:", error);
    }
  };

  return (
    <div className="start-settings">
      <h2>SpotLine 시작 설정</h2>

      {availableStores.length === 0 ? (
        <div className="warning">
          <p>⚠️ 운영 매장을 먼저 등록해주세요.</p>
          <p>SpotLine 시작 기능을 사용하려면 최소 1개 이상의 운영 매장이 필요합니다.</p>
        </div>
      ) : (
        <StartConfigForm config={config} availableStores={availableStores} onSave={handleSaveConfig} />
      )}
    </div>
  );
};
```

## 🎭 데모 시스템 (읽기 전용)

### 1. 데모 매장 목록 (수정 금지)

```typescript
interface DemoStore {
  id: string;
  name: string;
  qrCodeId: string;
  area: string;
  isDemoOnly: true; // 항상 true
}

const DemoStoreList: React.FC = () => {
  const [demoStores, setDemoStores] = useState<DemoStore[]>([]);

  return (
    <div className="demo-store-list">
      <div className="warning-banner">
        <h3>⚠️ 주의사항</h3>
        <p>이 데이터들은 업주 소개용 데모 데이터입니다.</p>
        <p>수정하거나 삭제하지 마세요.</p>
      </div>

      <div className="store-grid">
        {demoStores.map((store) => (
          <div key={store.id} className="demo-store-card readonly">
            <h4>{store.name}</h4>
            <p>QR ID: {store.qrCodeId}</p>
            <p>지역: {store.area}</p>
            <span className="demo-badge">데모 전용</span>
          </div>
        ))}
      </div>

      <div className="demo-link">
        <h4>데모 링크</h4>
        <code>http://localhost:4000/api/demo/experience</code>
        <button onClick={() => window.open("/api/demo/experience", "_blank")}>데모보기</button>
      </div>
    </div>
  );
};
```

## 📊 분석 및 통계

### 1. 운영 매장 통계

```typescript
interface StoreAnalytics {
  storeId: string;
  storeName: string;
  totalScans: number; // 총 QR 스캔 수
  uniqueVisitors: number; // 고유 방문자 수
  averageSessionTime: number; // 평균 세션 시간
  topReferrers: string[]; // 주요 유입 경로
  monthlyTrend: {
    month: string;
    scans: number;
  }[];
}
```

### 2. SpotLine 시작 통계

```typescript
interface StartAnalytics {
  totalStarts: number; // 총 시작 수
  uniqueUsers: number; // 고유 사용자 수
  topSelectedStores: {
    storeId: string;
    storeName: string;
    selectionCount: number;
  }[];
  conversionRate: number; // 시작 → 실제 스캔 전환율
}
```

## 🔧 API 엔드포인트

### 1. 운영 매장 관리 API

```typescript
// 매장 목록 조회
GET /api/admin/stores
Authorization: Bearer {token}

// 매장 등록
POST /api/admin/stores
Authorization: Bearer {token}
Content-Type: application/json
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

// 매장 수정
PUT /api/admin/stores/{id}
Authorization: Bearer {token}

// 매장 삭제 (비활성화)
DELETE /api/admin/stores/{id}
Authorization: Bearer {token}
```

### 2. SpotLine 시작 설정 API

```typescript
// 시작 설정 조회
GET /api/admin/experience-configs
Authorization: Bearer {token}

// 시작 설정 저장
POST /api/admin/experience-configs
Authorization: Bearer {token}
{
  "name": "기본 시작 설정",
  "type": "random",
  "targetStores": ["store_id_1", "store_id_2"],
  "isActive": true
}
```

### 3. 분석 데이터 API

```typescript
// 운영 매장 통계
GET /api/admin/analytics/stores
Authorization: Bearer {token}

// SpotLine 시작 통계
GET /api/admin/analytics/start
Authorization: Bearer {token}

// 데모 시스템 데이터 (읽기 전용)
GET /api/admin/demo/stores
Authorization: Bearer {token}
```

## 🚨 중요 주의사항

### ⚠️ 절대 하지 말아야 할 것

1. **데모 데이터 수정**: DemoStore 스키마의 데이터는 절대 수정하지 말 것
2. **QR 코드 ID 중복**: demo*\* 와 real*\* 접두사 구분 유지
3. **시스템 혼동**: 데모용과 운영용 API를 섞어서 사용하지 말 것

### ✅ 반드시 해야 할 것

1. **운영 매장만 관리**: Store 스키마의 데이터만 CRUD 작업
2. **QR 코드 고유성**: 각 매장마다 고유한 QR 코드 ID 생성
3. **권한 관리**: 모든 Admin API는 JWT 토큰 인증 필요
4. **데이터 검증**: 매장 등록 시 필수 필드 검증

## 🎯 개발 우선순위

### Phase 1: 기본 운영 매장 관리 (필수)

- [ ] 매장 등록 폼 구현
- [ ] 매장 목록 화면 구현
- [ ] 매장 수정/삭제 기능
- [ ] QR 코드 생성 및 관리

### Phase 2: SpotLine 시작 연동

- [ ] 시작 설정 관리 화면
- [ ] 시작 통계 대시보드
- [ ] 시작 활성화/비활성화 기능

### Phase 3: 고급 기능

- [ ] 상세 분석 대시보드
- [ ] 매장 간 추천 관계 설정
- [ ] 사용자 행동 분석

## 🎯 최종 목표

Admin 시스템은 **운영 시스템**만 관리합니다:

- **데모 시스템**: 읽기 전용 (건드리지 말 것)
- **운영 시스템**: Admin이 완전히 관리 (매장 등록, QR 코드 관리, 통계 분석)

SpotLine의 실제 서비스 운영을 위한 모든 도구를 제공하는 것이 목표입니다!
