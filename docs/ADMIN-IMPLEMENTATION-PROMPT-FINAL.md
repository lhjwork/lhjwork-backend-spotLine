# Spotline Admin 시스템 구현 가이드 (최종 버전)

## 🎯 프로젝트 개요

Spotline Admin은 QR 기반 로컬 연결 서비스의 관리자 시스템입니다. 매장 관리, 추천 관리, 분석 대시보드를 제공하는 React 기반 웹 애플리케이션입니다.

## 🔧 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Material-UI (MUI) 또는 Ant Design
- **상태 관리**: React Query + Zustand
- **라우팅**: React Router v6
- **HTTP 클라이언트**: Axios
- **지도**: Kakao Map API
- **주소 검색**: Daum Postcode API

## 🏗️ 프로젝트 구조

```
admin-frontend/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── common/         # 공통 컴포넌트
│   │   ├── forms/          # 폼 컴포넌트
│   │   ├── tables/         # 테이블 컴포넌트
│   │   └── charts/         # 차트 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── auth/           # 인증 관련
│   │   ├── stores/         # 매장 관리
│   │   ├── recommendations/ # 추천 관리
│   │   ├── analytics/      # 분석 대시보드
│   │   └── settings/       # 설정
│   ├── hooks/              # 커스텀 훅
│   ├── services/           # API 서비스
│   ├── types/              # TypeScript 타입
│   ├── utils/              # 유틸리티 함수
│   └── stores/             # 상태 관리
├── public/
└── package.json
```

## 🔐 인증 시스템

### 1. 로그인 컴포넌트
```typescript
// src/pages/auth/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';

interface LoginForm {
  username: string;
  password: string;
}

export const Login: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authService.login(form);
      setAuth(response.data.admin, response.data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('로그인 실패:', error);
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="사용자명"
          value={form.username}
          onChange={(e) => setForm({...form, username: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={(e) => setForm({...form, password: e.target.value})}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
};
```

### 2. 인증 서비스
```typescript
// src/services/authService.ts
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://lhjwork-backend-spotline.onrender.com'
  : 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  },
  
  verify: async () => {
    const response = await api.get('/admin/verify');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/admin/profile');
    return response.data;
  }
};
```

### 3. 인증 상태 관리
```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (admin: Admin, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      setAuth: (admin, token) => {
        localStorage.setItem('admin_token', token);
        set({ admin, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('admin_token');
        set({ admin: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'admin-auth',
    }
  )
);
```

## 🏪 매장 관리 시스템

### 1. 매장 목록 컴포넌트
```typescript
// src/pages/stores/StoreList.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeService } from '../services/storeService';
import { StoreTable } from '../components/tables/StoreTable';
import { StoreFilters } from '../components/forms/StoreFilters';

export const StoreList: React.FC = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    category: '',
    area: '',
    active: ''
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['stores', filters],
    queryFn: () => storeService.getStores(filters),
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="store-list">
      <h1>매장 관리</h1>
      
      <StoreFilters 
        filters={filters}
        onChange={handleFilterChange}
      />
      
      <StoreTable
        data={data?.data}
        loading={isLoading}
        onPageChange={handlePageChange}
        onRefresh={refetch}
      />
    </div>
  );
};
```

### 2. 매장 생성/수정 폼
```typescript
// src/components/forms/StoreForm.tsx
import React, { useState } from 'react';
import { AddressSearch } from './AddressSearch';

interface StoreFormData {
  name: string;
  category: string;
  location: {
    address: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number];
    };
    area: string;
  };
  qrCode: {
    id: string;
    isActive: boolean;
  };
  shortDescription: string;
  spotlineStory: string;
  representativeImage: string;
  contact: {
    phone: string;
    website: string;
    instagram: string;
  };
  externalLinks: {
    instagram: string;
    website: string;
  };
}

export const StoreForm: React.FC<{
  initialData?: Partial<StoreFormData>;
  onSubmit: (data: StoreFormData) => void;
  loading?: boolean;
}> = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    category: 'cafe',
    location: {
      address: '',
      coordinates: { type: 'Point', coordinates: [0, 0] },
      area: ''
    },
    qrCode: {
      id: '',
      isActive: true
    },
    shortDescription: '',
    spotlineStory: '',
    representativeImage: '',
    contact: {
      phone: '',
      website: '',
      instagram: ''
    },
    externalLinks: {
      instagram: '',
      website: ''
    },
    ...initialData
  });

  const handleAddressSelect = (addressData: any) => {
    setFormData({
      ...formData,
      location: {
        address: addressData.address,
        coordinates: {
          type: 'Point',
          coordinates: [addressData.longitude, addressData.latitude]
        },
        area: addressData.area || ''
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="store-form">
      <div className="form-group">
        <label>매장명 *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>카테고리 *</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          required
        >
          <option value="cafe">카페</option>
          <option value="restaurant">레스토랑</option>
          <option value="exhibition">전시</option>
          <option value="hotel">호텔</option>
          <option value="retail">리테일</option>
          <option value="culture">문화</option>
          <option value="other">기타</option>
        </select>
      </div>

      <div className="form-group">
        <label>주소 *</label>
        <AddressSearch
          onAddressSelect={handleAddressSelect}
          initialAddress={formData.location.address}
        />
      </div>

      <div className="form-group">
        <label>QR 코드 ID *</label>
        <input
          type="text"
          value={formData.qrCode.id}
          onChange={(e) => setFormData({
            ...formData,
            qrCode: { ...formData.qrCode, id: e.target.value }
          })}
          required
        />
      </div>

      <div className="form-group">
        <label>간단 설명</label>
        <input
          type="text"
          value={formData.shortDescription}
          onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
          placeholder="한 줄로 매장을 설명해주세요"
        />
      </div>

      <div className="form-group">
        <label>Spotline 스토리</label>
        <textarea
          value={formData.spotlineStory}
          onChange={(e) => setFormData({...formData, spotlineStory: e.target.value})}
          placeholder="매장의 특별한 이야기를 들려주세요"
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>대표 이미지 URL</label>
        <input
          type="url"
          value={formData.representativeImage}
          onChange={(e) => setFormData({...formData, representativeImage: e.target.value})}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="form-group">
        <label>연락처</label>
        <input
          type="tel"
          value={formData.contact.phone}
          onChange={(e) => setFormData({
            ...formData,
            contact: { ...formData.contact, phone: e.target.value }
          })}
          placeholder="02-1234-5678"
        />
      </div>

      <div className="form-group">
        <label>웹사이트</label>
        <input
          type="url"
          value={formData.contact.website}
          onChange={(e) => setFormData({
            ...formData,
            contact: { ...formData.contact, website: e.target.value }
          })}
          placeholder="https://website.com"
        />
      </div>

      <div className="form-group">
        <label>인스타그램</label>
        <input
          type="text"
          value={formData.contact.instagram}
          onChange={(e) => setFormData({
            ...formData,
            contact: { ...formData.contact, instagram: e.target.value }
          })}
          placeholder="@instagram_handle"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? '저장 중...' : '저장'}
      </button>
    </form>
  );
};
```

### 3. Daum 주소 검색 컴포넌트
```typescript
// src/components/forms/AddressSearch.tsx
import React, { useEffect } from 'react';

declare global {
  interface Window {
    daum: any;
  }
}

interface AddressSearchProps {
  onAddressSelect: (data: {
    address: string;
    latitude: number;
    longitude: number;
    area: string;
  }) => void;
  initialAddress?: string;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({
  onAddressSelect,
  initialAddress = ''
}) => {
  const [address, setAddress] = React.useState(initialAddress);
  const [coordinates, setCoordinates] = React.useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Daum Postcode API 스크립트 로드
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const openAddressSearch = () => {
    if (!window.daum) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: async (data: any) => {
        const fullAddress = data.address;
        setAddress(fullAddress);

        // 좌표 변환 API 호출
        try {
          const response = await fetch('/api/geocoding/convert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: fullAddress }),
          });

          const result = await response.json();
          
          if (result.success) {
            const coords = {
              lat: result.data.coordinates.latitude,
              lng: result.data.coordinates.longitude
            };
            setCoordinates(coords);
            
            onAddressSelect({
              address: fullAddress,
              latitude: coords.lat,
              longitude: coords.lng,
              area: result.data.region?.sigungu || ''
            });
          }
        } catch (error) {
          console.error('좌표 변환 실패:', error);
          // GPS 위치 사용 또는 수동 입력 옵션 제공
        }
      }
    }).open();
  };

  return (
    <div className="address-search">
      <div className="address-input-group">
        <input
          type="text"
          value={address}
          placeholder="주소를 검색하세요"
          readOnly
          onClick={openAddressSearch}
        />
        <button type="button" onClick={openAddressSearch}>
          주소 검색
        </button>
      </div>
      
      {coordinates && (
        <div className="coordinates-info">
          <small>
            좌표: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </small>
        </div>
      )}
    </div>
  );
};
```

## 🎯 추천 관리 시스템

### 1. 추천 목록 컴포넌트
```typescript
// src/pages/recommendations/RecommendationList.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recommendationService } from '../services/recommendationService';

export const RecommendationList: React.FC = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    fromStore: '',
    toStore: '',
    category: '',
    active: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['recommendations', filters],
    queryFn: () => recommendationService.getRecommendations(filters),
  });

  return (
    <div className="recommendation-list">
      <h1>추천 관리</h1>
      {/* 추천 목록 테이블 */}
    </div>
  );
};
```

### 2. 추천 생성 폼
```typescript
// src/components/forms/RecommendationForm.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeService } from '../services/storeService';

interface RecommendationFormData {
  fromStore: string;
  toStore: string;
  category: string;
  description: string;
  walkingTime: number;
  distance: number;
  priority: number;
  tags: string[];
}

export const RecommendationForm: React.FC<{
  initialData?: Partial<RecommendationFormData>;
  onSubmit: (data: RecommendationFormData) => void;
  loading?: boolean;
}> = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState<RecommendationFormData>({
    fromStore: '',
    toStore: '',
    category: 'next_meal',
    description: '',
    walkingTime: 0,
    distance: 0,
    priority: 10,
    tags: [],
    ...initialData
  });

  // 매장 목록 조회
  const { data: storesData } = useQuery({
    queryKey: ['stores-for-recommendation'],
    queryFn: () => storeService.getStores({ limit: 1000 }),
  });

  const stores = storesData?.data?.stores || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="recommendation-form">
      <div className="form-group">
        <label>출발 매장 *</label>
        <select
          value={formData.fromStore}
          onChange={(e) => setFormData({...formData, fromStore: e.target.value})}
          required
        >
          <option value="">매장을 선택하세요</option>
          {stores.map((store: any) => (
            <option key={store.id} value={store.id}>
              {store.name} ({store.location.area})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>도착 매장 *</label>
        <select
          value={formData.toStore}
          onChange={(e) => setFormData({...formData, toStore: e.target.value})}
          required
        >
          <option value="">매장을 선택하세요</option>
          {stores
            .filter((store: any) => store.id !== formData.fromStore)
            .map((store: any) => (
              <option key={store.id} value={store.id}>
                {store.name} ({store.location.area})
              </option>
            ))}
        </select>
      </div>

      <div className="form-group">
        <label>추천 카테고리 *</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          required
        >
          <option value="next_meal">다음 식사</option>
          <option value="dessert">디저트</option>
          <option value="activity">액티비티</option>
          <option value="shopping">쇼핑</option>
          <option value="culture">문화</option>
          <option value="rest">휴식</option>
        </select>
      </div>

      <div className="form-group">
        <label>추천 설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="이 추천에 대한 설명을 입력하세요"
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>도보 시간 (분)</label>
          <input
            type="number"
            value={formData.walkingTime}
            onChange={(e) => setFormData({...formData, walkingTime: parseInt(e.target.value)})}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>거리 (미터)</label>
          <input
            type="number"
            value={formData.distance}
            onChange={(e) => setFormData({...formData, distance: parseInt(e.target.value)})}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>우선순위</label>
          <input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
            min="1"
            max="100"
          />
        </div>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? '저장 중...' : '저장'}
      </button>
    </form>
  );
};
```

## 📊 분석 대시보드

### 1. 대시보드 메인
```typescript
// src/pages/analytics/Dashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import { StoreStatsCard } from '../components/cards/StoreStatsCard';
import { RecommendationStatsCard } from '../components/cards/RecommendationStatsCard';
import { AnalyticsChart } from '../components/charts/AnalyticsChart';

export const Dashboard: React.FC = () => {
  const { data: storeStats } = useQuery({
    queryKey: ['store-stats'],
    queryFn: () => analyticsService.getStoreStats(),
  });

  const { data: recommendationStats } = useQuery({
    queryKey: ['recommendation-stats'],
    queryFn: () => analyticsService.getRecommendationStats(),
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics', { days: 7 }],
    queryFn: () => analyticsService.getAnalytics({ days: 7 }),
  });

  return (
    <div className="dashboard">
      <h1>대시보드</h1>
      
      <div className="stats-grid">
        <StoreStatsCard data={storeStats?.data} />
        <RecommendationStatsCard data={recommendationStats?.data} />
      </div>

      <div className="charts-section">
        <AnalyticsChart data={analyticsData?.data} />
      </div>
    </div>
  );
};
```

## 🔧 서비스 레이어

### 1. 매장 서비스
```typescript
// src/services/storeService.ts
import { api } from './api';

export const storeService = {
  getStores: async (params: any) => {
    const response = await api.get('/admin/stores', { params });
    return response.data;
  },

  createStore: async (data: any) => {
    const response = await api.post('/admin/stores', data);
    return response.data;
  },

  updateStore: async (id: string, data: any) => {
    const response = await api.put(`/admin/stores/${id}`, data);
    return response.data;
  },

  deleteStore: async (id: string) => {
    const response = await api.delete(`/admin/stores/${id}`);
    return response.data;
  },

  toggleStoreStatus: async (id: string, active: boolean) => {
    const response = await api.patch(`/admin/stores/${id}/toggle`, { active });
    return response.data;
  },

  getStoreStats: async () => {
    const response = await api.get('/admin/stores/stats');
    return response.data;
  }
};
```

### 2. 추천 서비스
```typescript
// src/services/recommendationService.ts
import { api } from './api';

export const recommendationService = {
  getRecommendations: async (params: any) => {
    const response = await api.get('/admin/recommendations', { params });
    return response.data;
  },

  createRecommendation: async (data: any) => {
    const response = await api.post('/admin/recommendations', data);
    return response.data;
  },

  updateRecommendation: async (id: string, data: any) => {
    const response = await api.put(`/admin/recommendations/${id}`, data);
    return response.data;
  },

  deleteRecommendation: async (id: string) => {
    const response = await api.delete(`/admin/recommendations/${id}`);
    return response.data;
  },

  toggleRecommendationStatus: async (id: string, active: boolean) => {
    const response = await api.patch(`/admin/recommendations/${id}/toggle`, { active });
    return response.data;
  },

  getRecommendationStats: async () => {
    const response = await api.get('/admin/recommendations/stats');
    return response.data;
  },

  getStoreRecommendations: async (storeId: string) => {
    const response = await api.get(`/admin/stores/${storeId}/recommendations`);
    return response.data;
  }
};
```

## 🚀 배포 설정

### 1. 환경 변수 (.env)
```env
# 개발 환경
VITE_API_BASE_URL=http://localhost:4000
VITE_KAKAO_MAP_API_KEY=your_kakao_map_api_key

# 프로덕션 환경
VITE_API_BASE_URL=https://lhjwork-backend-spotline.onrender.com
```

### 2. Vercel 배포 설정 (vercel.json)
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://lhjwork-backend-spotline.onrender.com"
  }
}
```

## 📋 주요 기능 체크리스트

### ✅ 완료된 기능
- [x] 관리자 로그인/인증
- [x] 매장 CRUD 관리
- [x] 추천 CRUD 관리
- [x] Daum 주소 API 연동
- [x] 좌표 변환 시스템
- [x] 페이지네이션
- [x] 필터링/검색
- [x] 상태 관리 (활성화/비활성화)
- [x] 통계 대시보드

### 🔄 추가 개발 권장사항
- [ ] 이미지 업로드 기능
- [ ] 벌크 작업 (일괄 수정/삭제)
- [ ] 데이터 내보내기/가져오기
- [ ] 실시간 알림
- [ ] 사용자 권한 관리
- [ ] 로그 관리
- [ ] 백업/복원 기능

## 🎯 개발 시작 가이드

1. **프로젝트 초기화**
```bash
npm create vite@latest admin-frontend -- --template react-ts
cd admin-frontend
npm install
```

2. **필수 패키지 설치**
```bash
npm install @tanstack/react-query zustand axios react-router-dom
npm install @mui/material @emotion/react @emotion/styled
npm install @types/node
```

3. **개발 서버 실행**
```bash
npm run dev
```

4. **백엔드 연동 확인**
- 로그인 API 테스트
- CORS 설정 확인
- 토큰 인증 테스트

이제 이 가이드를 바탕으로 완전한 Spotline Admin 시스템을 구축할 수 있습니다!