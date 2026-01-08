# SpotLine Admin 시스템 구현 가이드 - VERSION003 FINAL

## 📋 개요

SpotLine 백엔드 API와 완전히 호환되는 Admin 시스템 구현을 위한 최종 가이드입니다.
Experience API 정상화, 실제 데이터베이스 구조 반영, 모든 엔드포인트 검증 완료된 상태입니다.

---

## 🔧 백엔드 API 현재 상태 (2026-01-08 업데이트)

### ✅ 정상 작동 확인된 API

1. **Experience API** - 완전히 정상 작동

   - `GET /api/experience` ✅
   - `GET /api/experience/select` ✅
   - `GET /api/experience/available-stores` ✅
   - `GET /api/experience/stats` ✅

2. **Store API** - 모든 엔드포인트 정상

   - `GET /api/stores` ✅
   - `GET /api/stores/spotline/{qrId}` ✅
   - `POST /api/stores` ✅
   - `PUT /api/stores/{id}` ✅
   - `DELETE /api/stores/{id}` ✅

3. **Admin API** - 인증 및 관리 기능

   - `POST /api/admin/login` ✅
   - `GET /api/admin/profile` ✅
   - `POST /api/admin/create` ✅

4. **Analytics API** - 분석 데이터
   - `GET /api/analytics` ✅
   - `POST /api/analytics/log` ✅

---

## 🏗️ 데이터베이스 구조 (실제 운영 중)

### Admin 계정 정보

```javascript
// 표준 관리자 계정
{
  username: "spotline-admin",
  password: "12341234",
  email: "spotline-admin@spotline.com", // 현재 도메인
  role: "super_admin"
}
```

### Store 데이터 구조 (실제 8개 매장 운영 중)

```javascript
{
  name: "카페 스팟라인",
  category: "cafe",
  location: {
    address: "서울특별시 강남구 강남대로 123",
    coordinates: {
      type: "Point",
      coordinates: [127.0276, 37.4979] // [경도, 위도]
    },
    area: "강남역"
  },
  qrCode: {
    id: "cafe_gangnam_001", // 의미있는 QR 코드 ID
    isActive: true
  },
  shortDescription: "강남역 대표 카페",
  spotlineStory: "자세한 매장 스토리...",
  representativeImage: "https://example.com/image.jpg",
  externalLinks: {
    instagram: "https://instagram.com/cafe_spotline",
    website: "https://cafe-spotline.com"
  },
  isActive: true
}
```

### Experience Config (체험 설정) - 새로 추가됨

```javascript
{
  name: "기본 체험 (카페 스팟라인)",
  type: "fixed", // fixed, random, area_based, weighted
  isActive: true,
  isDefault: true,
  settings: {
    fixedStoreQrId: "cafe_gangnam_001"
  },
  priority: 100
}
```

---

## 🎯 Admin 시스템 구현 요구사항

### 1. 인증 시스템

#### 로그인 API

```typescript
// POST /api/admin/login
const loginData = {
  username: "spotline-admin",
  password: "12341234"
};

// 응답
{
  success: true,
  message: "로그인 성공",
  data: {
    admin: {
      id: "695bad104e53e6bb484d0b35",
      username: "spotline-admin",
      email: "spotline-admin@spotline.com",
      role: "super_admin",
      lastLogin: "2026-01-08T02:19:16.425Z"
    },
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 토큰 검증

```typescript
// 모든 API 요청 시 헤더에 포함
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 2. 대시보드 구현

#### 통계 데이터 표시

```typescript
// 현재 실제 데이터 (2026-01-08 기준)
const dashboardStats = {
  totalStores: 8,
  activeStores: 8,
  totalRecommendations: 7,
  totalAnalytics: 155,
  experienceConfigs: 5,
  areas: ["강남역", "홍대입구", "논현동", "신사동"],
};
```

#### 매장 현황 차트

```typescript
// GET /api/stores 데이터로 차트 생성
const storesByArea = {
  강남역: 3,
  홍대입구: 3,
  논현동: 1,
  신사동: 1,
};

const storesByCategory = {
  cafe: 2,
  restaurant: 1,
  culture: 2,
  exhibition: 1,
  retail: 1,
  other: 1,
};
```

### 3. 매장 관리 시스템

#### 매장 목록 테이블

```typescript
// GET /api/stores
interface StoreListItem {
  id: string;
  name: string;
  category: string;
  area: string;
  qrId: string;
  isActive: boolean;
  createdAt: string;
  // 액션: 수정, 삭제, QR 코드 보기
}
```

#### 매장 등록/수정 폼

```typescript
interface StoreForm {
  name: string;
  category: "cafe" | "restaurant" | "exhibition" | "hotel" | "retail" | "culture" | "other";
  location: {
    address: string;
    area: string;
    coordinates?: [number, number]; // 선택사항
  };
  qrCode: {
    id: string; // 예: "new_cafe_001"
    isActive: boolean;
  };
  shortDescription?: string;
  spotlineStory?: string;
  representativeImage?: string;
  externalLinks?: {
    instagram?: string;
    website?: string;
  };
  contact?: {
    phone?: string;
    website?: string;
    instagram?: string;
  };
  businessHours?: {
    [key: string]: { open?: string; close?: string };
  };
}
```

### 4. Experience 관리 시스템 (새로 추가)

#### Experience Config 목록

```typescript
// GET /api/admin/experience-configs
interface ExperienceConfig {
  id: string;
  name: string;
  type: "fixed" | "random" | "area_based" | "weighted";
  isActive: boolean;
  isDefault: boolean;
  priority: number;
  usageCount: number;
  lastUsed?: string;
}
```

#### Experience Config 설정 폼

```typescript
interface ExperienceConfigForm {
  name: string;
  description?: string;
  type: "fixed" | "random" | "area_based" | "weighted";
  isDefault?: boolean;
  settings: {
    // fixed 타입
    fixedStoreQrId?: string;

    // random 타입
    randomStoreQrIds?: string[];

    // area_based 타입
    areaSettings?: {
      [area: string]: {
        enabled: boolean;
        storeQrIds: string[];
        weight: number;
      };
    };

    // weighted 타입
    weightedStores?: Array<{
      qrId: string;
      weight: number;
      enabled: boolean;
    }>;
  };
  priority?: number;
}
```

### 5. 분석 시스템

#### 분석 데이터 차트

```typescript
// GET /api/analytics?days=7
interface AnalyticsData {
  totalEvents: number;
  uniqueStores: number;
  eventsByType: {
    page_enter: number;
    spot_click: number;
    map_link_click: number;
    external_link_click: number;
    page_exit: number;
  };
  topStores: Array<{
    storeId: string;
    storeName: string;
    qrId: string;
    area: string;
    count: number;
  }>;
  dailyStats: { [date: string]: number };
}
```

#### Experience 통계

```typescript
// GET /api/experience/stats?days=7
interface ExperienceStats {
  totalExperiences: number;
  uniqueStores: number;
  topStores: Array<{
    storeId: string;
    storeName: string;
    qrId: string;
    area: string;
    count: number;
  }>;
  averagePerDay: string;
}
```

---

## 🔧 구현 가이드

### 1. 프로젝트 설정

```bash
# React + TypeScript 프로젝트 생성
npx create-react-app spotline-admin --template typescript
cd spotline-admin

# 필요한 패키지 설치
npm install axios react-router-dom @types/react-router-dom
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-data-grid
npm install recharts react-hook-form
npm install react-query @tanstack/react-query
```

### 2. API 클라이언트 설정

```typescript
// src/api/client.ts
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 인터셉터
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### 3. 인증 서비스

```typescript
// src/services/authService.ts
import { apiClient } from "../api/client";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    admin: {
      id: string;
      username: string;
      email: string;
      role: string;
      lastLogin: string;
    };
    token: string;
  };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post("/api/admin/login", credentials);

    if (response.data.success) {
      localStorage.setItem("admin_token", response.data.data.token);
      localStorage.setItem("admin_user", JSON.stringify(response.data.data.admin));
    }

    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get("/api/admin/profile");
    return response.data;
  },

  logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/login";
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("admin_token");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("admin_user");
    return userStr ? JSON.parse(userStr) : null;
  },
};
```

### 4. 매장 관리 서비스

```typescript
// src/services/storeService.ts
import { apiClient } from "../api/client";

export const storeService = {
  async getStores() {
    const response = await apiClient.get("/api/stores");
    return response.data;
  },

  async createStore(storeData: any) {
    const response = await apiClient.post("/api/stores", storeData);
    return response.data;
  },

  async updateStore(id: string, storeData: any) {
    const response = await apiClient.put(`/api/stores/${id}`, storeData);
    return response.data;
  },

  async deleteStore(id: string) {
    const response = await apiClient.delete(`/api/stores/${id}`);
    return response.data;
  },

  async getStoreByQrId(qrId: string) {
    const response = await apiClient.get(`/api/stores/spotline/${qrId}`);
    return response.data;
  },
};
```

### 5. Experience 관리 서비스

```typescript
// src/services/experienceService.ts
import { apiClient } from "../api/client";

export const experienceService = {
  async getConfigs() {
    const response = await apiClient.get("/api/admin/experience-configs");
    return response.data;
  },

  async createConfig(configData: any) {
    const response = await apiClient.post("/api/admin/experience-configs", configData);
    return response.data;
  },

  async updateConfig(id: string, configData: any) {
    const response = await apiClient.put(`/api/admin/experience-configs/${id}`, configData);
    return response.data;
  },

  async deleteConfig(id: string) {
    const response = await apiClient.delete(`/api/admin/experience-configs/${id}`);
    return response.data;
  },

  async getExperienceStats(days: number = 7) {
    const response = await apiClient.get(`/api/experience/stats?days=${days}`);
    return response.data;
  },

  async getAvailableStores() {
    const response = await apiClient.get("/api/experience/available-stores");
    return response.data;
  },
};
```

### 6. 분석 서비스

```typescript
// src/services/analyticsService.ts
import { apiClient } from "../api/client";

export const analyticsService = {
  async getAnalytics(params?: { days?: number; startDate?: string; endDate?: string }) {
    const response = await apiClient.get("/api/analytics", { params });
    return response.data;
  },

  async logEvent(eventData: { qrCode: string; store: string; eventType: string; targetStore?: string; sessionId?: string; metadata?: any }) {
    const response = await apiClient.post("/api/analytics/log", eventData);
    return response.data;
  },
};
```

---

## 🎨 UI 컴포넌트 가이드

### 1. 로그인 페이지

```typescript
// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: "spotline-admin",
    password: "12341234",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.login(credentials);
      navigate("/dashboard");
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h1>SpotLine Admin</h1>
        <input type="text" placeholder="사용자명" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} />
        <input type="password" placeholder="비밀번호" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} />
        <button type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
};
```

### 2. 대시보드 페이지

```typescript
// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from "react";
import { storeService } from "../services/storeService";
import { analyticsService } from "../services/analyticsService";
import { experienceService } from "../services/experienceService";

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    totalAnalytics: 0,
    experienceStats: null,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [storesData, analyticsData, experienceData] = await Promise.all([storeService.getStores(), analyticsService.getAnalytics({ days: 7 }), experienceService.getExperienceStats(7)]);

      setStats({
        totalStores: storesData.data?.length || 0,
        activeStores: storesData.data?.filter((s: any) => s.isActive).length || 0,
        totalAnalytics: analyticsData.data?.totalEvents || 0,
        experienceStats: experienceData.data,
      });
    } catch (error) {
      console.error("대시보드 데이터 로드 실패:", error);
    }
  };

  return (
    <div className="dashboard">
      <h1>SpotLine 관리자 대시보드</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>전체 매장</h3>
          <p>{stats.totalStores}</p>
        </div>
        <div className="stat-card">
          <h3>활성 매장</h3>
          <p>{stats.activeStores}</p>
        </div>
        <div className="stat-card">
          <h3>주간 분석 이벤트</h3>
          <p>{stats.totalAnalytics}</p>
        </div>
        <div className="stat-card">
          <h3>주간 체험 횟수</h3>
          <p>{stats.experienceStats?.totalExperiences || 0}</p>
        </div>
      </div>

      {/* 차트 및 추가 정보 */}
    </div>
  );
};
```

---

## 🚀 배포 및 환경 설정

### 환경 변수 설정

```env
# .env.development
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENV=development

# .env.production
REACT_APP_API_URL=https://lhjwork-backend-spotline.onrender.com
REACT_APP_ENV=production
```

### 빌드 및 배포

```bash
# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build

# Vercel 배포 (권장)
npm install -g vercel
vercel --prod
```

---

## 📝 주요 변경사항 (VERSION003)

### ✅ 해결된 이슈들

1. **Experience API 정상화** - 모든 엔드포인트 정상 작동 확인
2. **실제 데이터베이스 구조 반영** - 8개 매장, 5개 체험 설정 운영 중
3. **QR 코드 ID 형식 통일** - 의미있는 형식 (예: `cafe_gangnam_001`)
4. **관리자 계정 표준화** - `spotline-admin` / `12341234`

### 🆕 새로 추가된 기능들

1. **Experience Config 관리** - 체험 설정 CRUD 기능
2. **Experience 통계** - 체험 사용 현황 분석
3. **실시간 매장 현황** - 지역별, 카테고리별 분포
4. **향상된 분석 시스템** - 더 정확한 이벤트 추적

### 🔧 기술적 개선사항

1. **API 응답 일관성** - 모든 API가 동일한 응답 형식 사용
2. **에러 처리 강화** - 더 명확한 에러 메시지와 상태 코드
3. **데이터 검증** - 입력 데이터 유효성 검사 강화
4. **성능 최적화** - 데이터베이스 쿼리 최적화

---

## 🎯 결론

VERSION003에서는 모든 핵심 기능이 정상 작동하며, 실제 운영 환경에서 검증된 상태입니다.
Admin 시스템 구현 시 이 가이드를 따르면 백엔드와 완벽하게 호환되는 관리자 시스템을 구축할 수 있습니다.

**핵심 포인트:**

- 모든 API 엔드포인트 정상 작동 확인됨
- 실제 데이터베이스 구조 반영
- Experience 시스템 완전 구현
- 표준화된 관리자 계정 사용
- 의미있는 QR 코드 ID 형식 적용

이제 안심하고 Admin 시스템을 구현하실 수 있습니다! 🚀
