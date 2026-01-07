# SpotLine 관리자 개발 가이드 VERSION002

## 📌 관리자 시스템 개요

SpotLine 관리자 시스템은 **운영자가 SpotLine 체험의 흐름을 설정하고 관리**할 수 있는 도구입니다.

### 🆕 VERSION002 주요 변경사항

1. **체험 설정 시스템 도입**: "SpotLine 체험하기" 버튼의 동작을 관리자가 설정
2. **표준 관리자 계정**: `spotline-admin` / `12341234`로 통일
3. **실시간 통계 대시보드**: 체험 설정별 사용 통계 제공
4. **미리보기 기능**: 설정 변경 전 결과 미리보기 가능
5. **TypeScript 완전 지원**: 모든 관리자 API에 타입 정의 제공

## 🔐 인증 시스템

### 관리자 로그인

```typescript
interface AdminLoginRequest {
  username: string;
  password: string;
}

interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: {
      id: string;
      username: string;
      email: string;
      role: "admin" | "super_admin";
      lastLogin: string;
    };
    token: string;
    expiresIn: string;
  };
}

// 로그인 API 호출
const adminLogin = async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const response = await fetch("http://localhost:4000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  return await response.json();
};

// 사용 예시
const loginResult = await adminLogin({
  username: "spotline-admin",
  password: "12341234",
});
```

### JWT 토큰 관리

```typescript
class AdminAuthManager {
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem("spotline_admin_token", token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem("spotline_admin_token");
    }
    return this.token;
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem("spotline_admin_token");
  }
}

const authManager = new AdminAuthManager();
```

## 🎯 체험 설정 관리 시스템

### 체험 설정 타입 정의

```typescript
type ExperienceType = "fixed" | "random" | "area_based" | "weighted";

interface ExperienceConfig {
  _id: string;
  name: string;
  description: string;
  type: ExperienceType;
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

interface ExperienceConfigCreateRequest {
  name: string;
  description: string;
  type: ExperienceType;
  isDefault?: boolean;
  settings: ExperienceConfig["settings"];
  priority?: number;
}
```

### 체험 설정 CRUD 작업

#### 1. 모든 체험 설정 조회

```typescript
const getAllExperienceConfigs = async (): Promise<ExperienceConfig[]> => {
  const response = await fetch("http://localhost:4000/api/admin/experience-configs", {
    headers: authManager.getAuthHeaders(),
  });

  const data = await response.json();
  return data.success ? data.data : [];
};
```

#### 2. 체험 설정 생성

```typescript
const createExperienceConfig = async (config: ExperienceConfigCreateRequest): Promise<ExperienceConfig> => {
  const response = await fetch("http://localhost:4000/api/admin/experience-configs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authManager.getAuthHeaders(),
    },
    body: JSON.stringify(config),
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

// 사용 예시들
const examples = {
  // 고정 매장 체험
  fixed: {
    name: "카페 스팟라인 체험",
    description: "항상 카페 스팟라인으로 안내",
    type: "fixed" as const,
    settings: { qrId: "cafe_gangnam_001" },
  },

  // 랜덤 체험
  random: {
    name: "랜덤 체험",
    description: "모든 매장 중 랜덤 선택",
    type: "random" as const,
    settings: {},
  },

  // 지역 기반 체험
  areaBased: {
    name: "강남 지역 체험",
    description: "강남 지역 매장만 선택",
    type: "area_based" as const,
    settings: { areas: ["강남역", "논현동", "신사동"] },
  },

  // 가중치 기반 체험
  weighted: {
    name: "인기 매장 위주 체험",
    description: "인기 매장에 높은 가중치 부여",
    type: "weighted" as const,
    settings: {
      weights: [
        { qrId: "cafe_gangnam_001", weight: 50 },
        { qrId: "cafe_hongdae_001", weight: 30 },
        { qrId: "culture_gangnam_001", weight: 20 },
      ],
    },
  },
};
```

#### 3. 체험 설정 수정

```typescript
const updateExperienceConfig = async (id: string, updates: Partial<ExperienceConfigCreateRequest>): Promise<ExperienceConfig> => {
  const response = await fetch(`http://localhost:4000/api/admin/experience-configs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authManager.getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};
```

#### 4. 기본 설정으로 지정

```typescript
const setAsDefault = async (id: string): Promise<void> => {
  const response = await fetch(`http://localhost:4000/api/admin/experience-configs/${id}/set-default`, {
    method: "PATCH",
    headers: authManager.getAuthHeaders(),
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.message);
};
```

## 📊 미리보기 및 통계 시스템

### 체험 설정 미리보기

```typescript
interface PreviewResult {
  config: ExperienceConfig;
  testCount: number;
  results: Array<{
    qrId: string;
    storeName: string;
    area: string;
    count: number;
    percentage: string;
  }>;
}

const previewExperienceConfig = async (id: string, testCount: number = 10): Promise<PreviewResult> => {
  const response = await fetch(`http://localhost:4000/api/admin/experience-configs/${id}/preview?testCount=${testCount}`, { headers: authManager.getAuthHeaders() });

  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};
```

### React 컴포넌트 예시

#### 체험 설정 관리 대시보드

```typescript
import React, { useState, useEffect } from "react";

const ExperienceConfigDashboard: React.FC = () => {
  const [configs, setConfigs] = useState<ExperienceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<ExperienceConfig | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getAllExperienceConfigs();
      setConfigs(data);
    } catch (error) {
      console.error("설정 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string): Promise<void> => {
    try {
      await setAsDefault(id);
      await loadConfigs(); // 목록 새로고침
      alert("기본 설정으로 지정되었습니다.");
    } catch (error) {
      alert("설정 변경에 실패했습니다.");
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="experience-config-dashboard">
      <h1>SpotLine 체험 설정 관리</h1>

      <div className="config-list">
        {configs.map((config) => (
          <div key={config._id} className={`config-card ${config.isDefault ? "default" : ""}`}>
            <div className="config-header">
              <h3>{config.name}</h3>
              {config.isDefault && <span className="default-badge">기본 설정</span>}
              <span className={`status ${config.isActive ? "active" : "inactive"}`}>{config.isActive ? "활성" : "비활성"}</span>
            </div>

            <p className="config-description">{config.description}</p>

            <div className="config-stats">
              <span>타입: {config.type}</span>
              <span>사용 횟수: {config.usageCount}</span>
              <span>우선순위: {config.priority}</span>
            </div>

            <div className="config-actions">
              <button onClick={() => setSelectedConfig(config)}>편집</button>
              <button onClick={() => previewConfig(config._id)}>미리보기</button>
              {!config.isDefault && <button onClick={() => handleSetDefault(config._id)}>기본 설정으로 지정</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### 체험 설정 생성/편집 폼

```typescript
const ExperienceConfigForm: React.FC<{
  config?: ExperienceConfig;
  onSave: (config: ExperienceConfigCreateRequest) => void;
  onCancel: () => void;
}> = ({ config, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ExperienceConfigCreateRequest>({
    name: config?.name || "",
    description: config?.description || "",
    type: config?.type || "random",
    settings: config?.settings || {},
    priority: config?.priority || 1,
  });

  const handleTypeChange = (type: ExperienceType): void => {
    setFormData((prev) => ({
      ...prev,
      type,
      settings: {}, // 타입 변경 시 설정 초기화
    }));
  };

  const renderSettingsForm = (): React.ReactNode => {
    switch (formData.type) {
      case "fixed":
        return (
          <div className="settings-form">
            <label>고정 매장 QR 코드 ID:</label>
            <select
              value={formData.settings.qrId || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  settings: { qrId: e.target.value },
                }))
              }
            >
              <option value="">선택하세요</option>
              <option value="cafe_gangnam_001">카페 스팟라인</option>
              <option value="cafe_hongdae_001">바이닐 카페</option>
              <option value="culture_gangnam_001">북카페 리딩룸</option>
              {/* 더 많은 옵션들... */}
            </select>
          </div>
        );

      case "area_based":
        return (
          <div className="settings-form">
            <label>선택할 지역들:</label>
            <div className="checkbox-group">
              {["강남역", "논현동", "신사동", "홍대입구"].map((area) => (
                <label key={area}>
                  <input
                    type="checkbox"
                    checked={formData.settings.areas?.includes(area) || false}
                    onChange={(e) => {
                      const areas = formData.settings.areas || [];
                      const newAreas = e.target.checked ? [...areas, area] : areas.filter((a) => a !== area);

                      setFormData((prev) => ({
                        ...prev,
                        settings: { areas: newAreas },
                      }));
                    }}
                  />
                  {area}
                </label>
              ))}
            </div>
          </div>
        );

      case "weighted":
        return (
          <div className="settings-form">
            <label>매장별 가중치:</label>
            <div className="weight-inputs">{/* 가중치 입력 폼 구현 */}</div>
          </div>
        );

      default:
        return <div>랜덤 선택은 추가 설정이 필요하지 않습니다.</div>;
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
    >
      <div className="form-group">
        <label>설정 이름:</label>
        <input type="text" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
      </div>

      <div className="form-group">
        <label>설명:</label>
        <textarea value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} required />
      </div>

      <div className="form-group">
        <label>체험 타입:</label>
        <select value={formData.type} onChange={(e) => handleTypeChange(e.target.value as ExperienceType)}>
          <option value="random">랜덤 선택</option>
          <option value="fixed">고정 매장</option>
          <option value="area_based">지역 기반</option>
          <option value="weighted">가중치 기반</option>
        </select>
      </div>

      {renderSettingsForm()}

      <div className="form-group">
        <label>우선순위:</label>
        <input type="number" min="1" value={formData.priority} onChange={(e) => setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value) }))} />
      </div>

      <div className="form-actions">
        <button type="submit">저장</button>
        <button type="button" onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
};
```

## 🏪 매장 관리 시스템

### 매장 CRUD 작업

```typescript
interface Store {
  _id: string;
  name: string;
  category: string;
  location: {
    address: string;
    coordinates: {
      coordinates: [number, number];
    };
    district: string;
    area: string;
  };
  qrCode: {
    id: string;
    isActive: boolean;
  };
  shortDescription: string;
  representativeImage: string;
  externalLinks: {
    instagram?: string;
    website?: string;
    blog?: string;
    notion?: string;
  };
  spotlineStory: string;
  isActive: boolean;
}

// 매장 생성
const createStore = async (storeData: Omit<Store, "_id">): Promise<Store> => {
  const response = await fetch("http://localhost:4000/api/stores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authManager.getAuthHeaders(),
    },
    body: JSON.stringify(storeData),
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

// 매장 수정
const updateStore = async (id: string, updates: Partial<Store>): Promise<Store> => {
  const response = await fetch(`http://localhost:4000/api/stores/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authManager.getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};
```

## 📈 분석 및 통계

### 분석 데이터 조회

```typescript
interface AnalyticsData {
  qrCode: string;
  eventType: "page_enter" | "spot_click" | "map_link_click" | "external_link_click" | "page_exit";
  store: string;
  sessionId: string;
  timestamp: string;
  metadata?: {
    spotPosition?: number;
    stayDuration?: number;
    linkType?: string;
  };
}

const getAnalytics = async (filters?: { startDate?: string; endDate?: string; storeId?: string; eventType?: string }): Promise<AnalyticsData[]> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }

  const response = await fetch(`http://localhost:4000/api/analytics?${params}`, {
    headers: authManager.getAuthHeaders(),
  });

  const data = await response.json();
  return data.success ? data.data : [];
};
```

## 🎨 관리자 UI 스타일 가이드

### CSS 변수

```css
:root {
  --admin-primary: #1a73e8;
  --admin-secondary: #34a853;
  --admin-danger: #ea4335;
  --admin-warning: #fbbc04;
  --admin-background: #f8f9fa;
  --admin-surface: #ffffff;
  --admin-border: #dadce0;
  --admin-text: #202124;
  --admin-text-secondary: #5f6368;
}
```

### 컴포넌트 스타일

```css
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.config-card {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s ease;
}

.config-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.config-card.default {
  border-color: var(--admin-primary);
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
}

.default-badge {
  background: var(--admin-primary);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status.active {
  color: var(--admin-secondary);
}

.status.inactive {
  color: var(--admin-text-secondary);
}
```

## 🔧 개발 환경 설정

### 환경변수

```bash
# .env.local (관리자 개발용)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_ADMIN_ROLE=super_admin
NEXT_PUBLIC_SESSION_TIMEOUT=86400000
```

### 권한 관리

```typescript
const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminRole, setAdminRole] = useState<"admin" | "super_admin" | null>(null);

  useEffect(() => {
    const token = authManager.getToken();
    if (token) {
      // JWT 토큰 검증
      verifyToken(token).then((result) => {
        setIsAuthenticated(result.success);
        setAdminRole(result.data?.admin?.role || null);
      });
    }
  }, []);

  return { isAuthenticated, adminRole };
};

// 권한 기반 컴포넌트 렌더링
const AdminRoute: React.FC<{ children: React.ReactNode; requiredRole?: "admin" | "super_admin" }> = ({ children, requiredRole = "admin" }) => {
  const { isAuthenticated, adminRole } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  if (requiredRole === "super_admin" && adminRole !== "super_admin") {
    return <div>권한이 없습니다.</div>;
  }

  return <>{children}</>;
};
```

## 🚀 배포 및 운영

### 프로덕션 설정

```typescript
const config = {
  development: {
    apiBaseUrl: "http://localhost:4000",
    logLevel: "debug",
  },
  production: {
    apiBaseUrl: "https://api.spotline.com",
    logLevel: "error",
  },
};

export const getConfig = () => {
  return config[process.env.NODE_ENV as keyof typeof config] || config.development;
};
```

이 가이드를 따라 구현하면 SpotLine의 체험 흐름을 효과적으로 관리할 수 있는 관리자 시스템을 만들 수 있습니다.
