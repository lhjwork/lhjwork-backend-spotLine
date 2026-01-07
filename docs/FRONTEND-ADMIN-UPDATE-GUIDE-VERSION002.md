# 프론트엔드 & 관리자 시스템 업데이트 가이드 VERSION002

## 📋 개요

데모 시스템과 실제 운영 시스템이 분리됨에 따라 프론트엔드와 관리자 시스템에서 수정해야 할 사항들을 정리합니다.

---

## 🎭 프론트엔드 수정사항

### 1. "SpotLine 체험하기" 버튼 분리

#### 기존 구조 (수정 전)

```typescript
// ❌ 기존: 하나의 버튼으로 모든 용도 처리
const handleSpotlineExperience = () => {
  window.location.href = "http://localhost:4000/api/stores/spotline/cafe_gangnam_001";
};
```

#### 새로운 구조 (수정 후)

```typescript
// ✅ 새로운: 용도별로 분리된 버튼

// 1. 업주 소개용 데모 버튼
const handleDemoExperience = async (): Promise<void> => {
  try {
    const response = await fetch("http://localhost:4000/api/demo/experience");
    const data = await response.json();

    if (data.success) {
      window.location.href = data.data.redirectUrl;
    }
  } catch (error) {
    console.error("데모 체험 중 오류:", error);
    // 폴백: 기본 데모 매장으로 이동
    window.location.href = "http://localhost:4000/api/demo/stores/demo_cafe_001";
  }
};

// 2. 실제 서비스용 버튼
const handleSpotlineExperience = (): void => {
  // 실제 운영 매장으로 이동 (관리자가 등록한 데이터)
  window.location.href = "http://localhost:4000/api/stores/spotline/cafe_gangnam_001";
};
```

### 2. 컴포넌트 분리

#### React 컴포넌트 예시

```typescript
// DemoExperienceButton.tsx - 업주 소개용
import React, { useState } from "react";

interface DemoExperienceButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

const DemoExperienceButton: React.FC<DemoExperienceButtonProps> = ({ className = "demo-experience-btn", style = {} }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/demo/experience");
      const data = await response.json();

      if (data.success) {
        window.location.href = data.data.redirectUrl;
      }
    } catch (error) {
      console.error("데모 체험 오류:", error);
      window.location.href = "http://localhost:4000/api/demo/stores/demo_cafe_001";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={{
        backgroundColor: "#4285f4",
        color: "white",
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        cursor: isLoading ? "not-allowed" : "pointer",
        opacity: isLoading ? 0.7 : 1,
        ...style,
      }}
      disabled={isLoading}
    >
      {isLoading ? "데모 준비 중..." : "🎭 SpotLine 데모 체험"}
    </button>
  );
};

// SpotlineExperienceButton.tsx - 실제 서비스용
const SpotlineExperienceButton: React.FC<SpotlineExperienceButtonProps> = ({ className = "spotline-experience-btn", style = {} }) => {
  const handleClick = (): void => {
    window.location.href = "http://localhost:4000/api/stores/spotline/cafe_gangnam_001";
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={{
        backgroundColor: "#4285f4",
        color: "white",
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        cursor: "pointer",
        fontWeight: "bold",
        ...style,
      }}
    >
      🎯 SpotLine 체험하기
    </button>
  );
};
```

### 3. 페이지별 사용 구분

#### 랜딩 페이지 (업주 대상)

```typescript
// pages/landing.tsx 또는 components/LandingPage.tsx
const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <h1>SpotLine - 자연스러운 경험의 흐름</h1>
      <p>현재 장소를 기준으로 다음 경험을 자연스럽게 제안합니다</p>

      {/* 업주 소개용 데모 버튼 */}
      <DemoExperienceButton />

      <div className="demo-notice">
        <small>* 이것은 서비스 소개용 데모입니다</small>
      </div>
    </div>
  );
};
```

#### 실제 서비스 페이지 (사용자 대상)

```typescript
// pages/service.tsx 또는 components/ServicePage.tsx
const ServicePage: React.FC = () => {
  return (
    <div className="service-page">
      <h1>SpotLine</h1>
      <p>현재 장소 기준으로 다음 경험을 자연스럽게 제안하는 서비스</p>

      {/* 실제 서비스용 버튼 */}
      <SpotlineExperienceButton />
    </div>
  );
};
```

### 4. 환경변수 설정

#### .env.local

```bash
# 데모 시스템
NEXT_PUBLIC_DEMO_API_URL=http://localhost:4000/api/demo
NEXT_PUBLIC_DEMO_ENABLED=true

# 실제 운영 시스템
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SERVICE_MODE=development

# 프로덕션에서는
# NEXT_PUBLIC_DEMO_API_URL=https://api.spotline.com/api/demo
# NEXT_PUBLIC_API_URL=https://api.spotline.com/api
```

### 5. TypeScript 타입 정의 업데이트

```typescript
// types/demo.ts
export interface DemoExperienceResult {
  qrId: string;
  storeName: string;
  storeId: string;
  area: string;
  redirectUrl: string;
  isDemoMode: true;
}

export interface DemoStore {
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

// types/service.ts
export interface SpotlineStore {
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

---

## 🔧 관리자 시스템 수정사항

### 1. 데모 매장 관리 기능 추가

#### 새로운 관리 메뉴 구조

```
관리자 대시보드
├── 실제 운영 관리
│   ├── 매장 관리 (기존)
│   ├── 추천 관리 (기존)
│   └── 분석 데이터 (기존)
└── 데모 시스템 관리 (신규)
    ├── 데모 매장 관리
    ├── 데모 설정
    └── 데모 사용 현황
```

#### 데모 매장 관리 컴포넌트

```typescript
// components/admin/DemoStoreManager.tsx
import React, { useState, useEffect } from "react";

interface DemoStore {
  _id: string;
  name: string;
  category: string;
  location: {
    address: string;
    area: string;
  };
  qrCode: {
    id: string;
    isActive: boolean;
  };
  shortDescription: string;
  isActive: boolean;
  isDemoOnly: boolean;
}

const DemoStoreManager: React.FC = () => {
  const [demoStores, setDemoStores] = useState<DemoStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemoStores();
  }, []);

  const loadDemoStores = async (): Promise<void> => {
    try {
      const response = await fetch("/api/admin/demo-stores", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await response.json();
      setDemoStores(data.data);
    } catch (error) {
      console.error("데모 매장 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDemoStore = async (id: string, isActive: boolean): Promise<void> => {
    try {
      await fetch(`/api/admin/demo-stores/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      await loadDemoStores();
    } catch (error) {
      console.error("데모 매장 상태 변경 실패:", error);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="demo-store-manager">
      <div className="header">
        <h2>데모 매장 관리</h2>
        <div className="notice">
          <p>⚠️ 데모 매장은 업주 소개용으로만 사용되며, 통계 수집하지 않습니다.</p>
        </div>
      </div>

      <div className="demo-stores-list">
        {demoStores.map((store) => (
          <div key={store._id} className={`demo-store-card ${store.isActive ? "active" : "inactive"}`}>
            <div className="store-info">
              <h3>{store.name}</h3>
              <p className="description">{store.shortDescription}</p>
              <div className="meta">
                <span className="qr-id">QR: {store.qrCode.id}</span>
                <span className="area">{store.location.area}</span>
                <span className="category">{store.category}</span>
              </div>
            </div>

            <div className="store-actions">
              <button onClick={() => toggleDemoStore(store._id, store.isActive)} className={`toggle-btn ${store.isActive ? "active" : "inactive"}`}>
                {store.isActive ? "활성" : "비활성"}
              </button>

              <button className="edit-btn">편집</button>

              <a href={`http://localhost:4000/api/demo/stores/${store.qrCode.id}`} target="_blank" rel="noopener noreferrer" className="preview-btn">
                미리보기
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2. 실제 운영 매장 관리 강화

#### 기존 매장 관리에 구분 표시 추가

```typescript
// components/admin/StoreManager.tsx (기존 수정)
const StoreManager: React.FC = () => {
  // ... 기존 코드

  return (
    <div className="store-manager">
      <div className="header">
        <h2>실제 운영 매장 관리</h2>
        <div className="notice">
          <p>✅ 실제 서비스에서 사용되는 매장들입니다. 사용자 분석 데이터가 수집됩니다.</p>
        </div>
      </div>

      {/* 기존 매장 관리 UI */}
      <div className="stores-list">
        {stores.map((store) => (
          <div key={store._id} className="store-card real-store">
            <div className="store-badge">실제 운영</div>
            {/* 기존 매장 카드 내용 */}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. 대시보드 업데이트

#### 메인 대시보드에 구분 표시

```typescript
// components/admin/Dashboard.tsx
const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    realStores: 0,
    demoStores: 0,
    totalAnalytics: 0,
    demoUsage: 0,
  });

  return (
    <div className="admin-dashboard">
      <h1>SpotLine 관리자 대시보드</h1>

      <div className="stats-grid">
        <div className="stat-card real-service">
          <h3>실제 운영</h3>
          <div className="stat-number">{stats.realStores}</div>
          <div className="stat-label">운영 매장</div>
          <div className="stat-note">사용자 분석 데이터 수집</div>
        </div>

        <div className="stat-card demo-service">
          <h3>데모 시스템</h3>
          <div className="stat-number">{stats.demoStores}</div>
          <div className="stat-label">데모 매장</div>
          <div className="stat-note">업주 소개용 (통계 수집 없음)</div>
        </div>

        <div className="stat-card analytics">
          <h3>분석 데이터</h3>
          <div className="stat-number">{stats.totalAnalytics}</div>
          <div className="stat-label">실제 서비스만</div>
        </div>
      </div>

      <div className="quick-actions">
        <div className="action-section">
          <h3>실제 운영 관리</h3>
          <button onClick={() => navigate("/admin/stores")}>매장 관리</button>
          <button onClick={() => navigate("/admin/analytics")}>분석 데이터</button>
        </div>

        <div className="action-section">
          <h3>데모 시스템 관리</h3>
          <button onClick={() => navigate("/admin/demo-stores")}>데모 매장 관리</button>
          <button onClick={() => navigate("/admin/demo-settings")}>데모 설정</button>
        </div>
      </div>
    </div>
  );
};
```

### 4. 새로운 API 엔드포인트 추가 필요

#### 관리자용 데모 관리 API

```typescript
// 백엔드에 추가해야 할 API들

// 1. 데모 매장 목록 조회 (관리자용)
GET /api/admin/demo-stores
Authorization: Bearer {token}

// 2. 데모 매장 생성
POST /api/admin/demo-stores
Authorization: Bearer {token}

// 3. 데모 매장 수정
PUT /api/admin/demo-stores/{id}
Authorization: Bearer {token}

// 4. 데모 매장 활성화/비활성화
PATCH /api/admin/demo-stores/{id}
Authorization: Bearer {token}

// 5. 데모 사용 통계 (간단한 카운트만)
GET /api/admin/demo-stats
Authorization: Bearer {token}
```

### 5. 네비게이션 메뉴 업데이트

```typescript
// components/admin/Navigation.tsx
const AdminNavigation: React.FC = () => {
  return (
    <nav className="admin-nav">
      <div className="nav-section">
        <h3>실제 운영</h3>
        <ul>
          <li>
            <Link to="/admin/stores">매장 관리</Link>
          </li>
          <li>
            <Link to="/admin/recommendations">추천 관리</Link>
          </li>
          <li>
            <Link to="/admin/analytics">분석 데이터</Link>
          </li>
        </ul>
      </div>

      <div className="nav-section">
        <h3>데모 시스템</h3>
        <ul>
          <li>
            <Link to="/admin/demo-stores">데모 매장 관리</Link>
          </li>
          <li>
            <Link to="/admin/demo-settings">데모 설정</Link>
          </li>
        </ul>
      </div>

      <div className="nav-section">
        <h3>시스템</h3>
        <ul>
          <li>
            <Link to="/admin/settings">설정</Link>
          </li>
          <li>
            <Link to="/admin/profile">프로필</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
```

## 📋 체크리스트

### 프론트엔드 개발자 체크리스트

- [ ] `DemoExperienceButton` 컴포넌트 생성
- [ ] `SpotlineExperienceButton` 컴포넌트 수정
- [ ] 랜딩 페이지에 데모 버튼 적용
- [ ] 서비스 페이지에 실제 버튼 적용
- [ ] 환경변수 설정 추가
- [ ] TypeScript 타입 정의 업데이트
- [ ] 데모 페이지 스타일링 구분

### 관리자 시스템 개발자 체크리스트

- [ ] `DemoStoreManager` 컴포넌트 생성
- [ ] 기존 `StoreManager` 컴포넌트 수정
- [ ] 대시보드 통계 구분 표시
- [ ] 네비게이션 메뉴 업데이트
- [ ] 데모 관리 API 엔드포인트 추가
- [ ] 권한 관리 (데모 관리 권한)
- [ ] 데모/실제 구분 스타일링

### 백엔드 개발자 체크리스트 (추가 필요)

- [ ] 관리자용 데모 매장 CRUD API 구현
- [ ] 데모 사용 통계 API (간단한 카운트)
- [ ] 데모 매장 권한 관리
- [ ] Swagger 문서 업데이트

이렇게 수정하면 데모와 실제 운영이 명확히 구분되어 관리할 수 있습니다!
