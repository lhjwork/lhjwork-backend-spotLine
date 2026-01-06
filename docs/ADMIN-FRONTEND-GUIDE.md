# 🚀 Spotline Admin Frontend 개발 가이드

## 📋 프로젝트 개요

Spotline 관리자 페이지는 매장 관리, 추천 관리, 분석 대시보드를 제공하는 웹 애플리케이션입니다.

### 기술 스택
- **Frontend**: React + Vite + TypeScript
- **UI Library**: Ant Design 또는 Material-UI
- **State Management**: React Query + Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Chart.js 또는 Recharts

---

## 🔑 API 연동 정보

### 기본 설정
```javascript
// api/config.js
export const API_BASE_URL = 'http://localhost:4000';
export const API_ENDPOINTS = {
  // 인증
  LOGIN: '/api/admin/login',
  PROFILE: '/api/admin/profile',
  VERIFY: '/api/admin/verify',
  
  // 매장 관리
  STORES: '/api/admin/stores',
  STORE_DETAIL: (id) => `/api/admin/stores/${id}`,
  
  // 추천 관리
  RECOMMENDATIONS: '/api/admin/recommendations',
  RECOMMENDATION_DETAIL: (id) => `/api/admin/recommendations/${id}`,
  
  // 분석
  DASHBOARD: '/api/admin/analytics/dashboard',
  STORE_ANALYTICS: '/api/admin/analytics/stores'
};
```

### Axios 설정
```javascript
// api/client.js
import axios from 'axios';
import { API_BASE_URL } from './config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔐 인증 API

### 1. 로그인
```javascript
// api/auth.js
import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const authAPI = {
  // 로그인
  login: async (credentials) => {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
    if (response.success) {
      localStorage.setItem('adminToken', response.data.token);
    }
    return response;
  },

  // 프로필 조회
  getProfile: () => apiClient.get(API_ENDPOINTS.PROFILE),

  // 토큰 검증
  verifyToken: () => apiClient.get(API_ENDPOINTS.VERIFY),

  // 로그아웃
  logout: () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  }
};
```

### 사용 예시
```javascript
// components/LoginForm.jsx
import { useState } from 'react';
import { authAPI } from '../api/auth';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authAPI.login(credentials);
      if (response.success) {
        // 로그인 성공 - 대시보드로 이동
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="사용자명"
        value={credentials.username}
        onChange={(e) => setCredentials({
          ...credentials,
          username: e.target.value
        })}
        required
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={credentials.password}
        onChange={(e) => setCredentials({
          ...credentials,
          password: e.target.value
        })}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
};
```

---

## 🏪 매장 관리 API

### API 함수들
```javascript
// api/stores.js
import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const storesAPI = {
  // 매장 목록 조회
  getStores: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      search: params.search || '',
      category: params.category || '',
      status: params.status || ''
    });
    return apiClient.get(`${API_ENDPOINTS.STORES}?${queryParams}`);
  },

  // 매장 상세 조회
  getStore: (id) => apiClient.get(API_ENDPOINTS.STORE_DETAIL(id)),

  // 매장 생성
  createStore: (storeData) => apiClient.post(API_ENDPOINTS.STORES, storeData),

  // 매장 수정
  updateStore: (id, storeData) => apiClient.put(API_ENDPOINTS.STORE_DETAIL(id), storeData),

  // 매장 삭제
  deleteStore: (id) => apiClient.delete(API_ENDPOINTS.STORE_DETAIL(id))
};
```

### 매장 목록 컴포넌트 예시
```javascript
// components/StoreList.jsx
import { useState, useEffect } from 'react';
import { storesAPI } from '../api/stores';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await storesAPI.getStores({
        ...pagination,
        ...filters
      });
      
      if (response.success) {
        setStores(response.data.stores);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      console.error('매장 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [pagination.page, filters]);

  const handleSearch = (searchValue) => {
    setFilters(prev => ({ ...prev, search: searchValue }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (storeId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await storesAPI.deleteStore(storeId);
        fetchStores(); // 목록 새로고침
        alert('매장이 삭제되었습니다.');
      } catch (error) {
        console.error('매장 삭제 실패:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div>
      <h2>매장 관리</h2>
      
      {/* 검색 및 필터 */}
      <div className="filters">
        <input
          type="text"
          placeholder="매장명 또는 주소 검색"
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="">전체 카테고리</option>
          <option value="cafe">카페</option>
          <option value="restaurant">음식점</option>
          <option value="culture">문화시설</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="">전체 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
      </div>

      {/* 매장 목록 */}
      {loading ? (
        <div>로딩 중...</div>
      ) : (
        <div className="store-list">
          {stores.map(store => (
            <div key={store._id} className="store-item">
              <h3>{store.name}</h3>
              <p>{store.category} | {store.location?.address}</p>
              <p>상태: {store.isActive ? '활성' : '비활성'}</p>
              <div className="actions">
                <button onClick={() => window.location.href = `/stores/${store._id}`}>
                  상세보기
                </button>
                <button onClick={() => window.location.href = `/stores/${store._id}/edit`}>
                  수정
                </button>
                <button onClick={() => handleDelete(store._id)}>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="pagination">
        <button
          disabled={pagination.page === 1}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
        >
          이전
        </button>
        <span>
          {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
        </span>
        <button
          disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
        >
          다음
        </button>
      </div>
    </div>
  );
};
```

### 매장 생성/수정 폼 예시
```javascript
// components/StoreForm.jsx
import { useState, useEffect } from 'react';
import { storesAPI } from '../api/stores';

const StoreForm = ({ storeId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    coordinates: { lat: 0, lng: 0 },
    phone: '',
    description: '',
    operatingHours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '22:00' }
    },
    images: []
  });
  const [loading, setLoading] = useState(false);

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (storeId) {
      loadStoreData();
    }
  }, [storeId]);

  const loadStoreData = async () => {
    try {
      const response = await storesAPI.getStore(storeId);
      if (response.success) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error('매장 데이터 로드 실패:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (storeId) {
        response = await storesAPI.updateStore(storeId, formData);
      } else {
        response = await storesAPI.createStore(formData);
      }

      if (response.success) {
        alert(storeId ? '매장이 수정되었습니다.' : '매장이 생성되었습니다.');
        onSuccess && onSuccess();
      }
    } catch (error) {
      console.error('매장 저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>매장명 *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <label>카테고리 *</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          required
        >
          <option value="">선택하세요</option>
          <option value="cafe">카페</option>
          <option value="restaurant">음식점</option>
          <option value="culture">문화시설</option>
        </select>
      </div>

      <div></div>   <label>주소 *</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          required
        />
      </div>

      <div>
        <label>좌표 *</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            step="any"
            placeholder="위도"
            value={formData.coordinates.lat}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) }
            }))}
            required
          />
          <input
            type="number"
            step="any"
            placeholder="경도"
            value={formData.coordinates.lng}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) }
            }))}
            required
          />
        </div>
      </div>

      <div>
        <label>전화번호</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div>
        <label>설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? '저장 중...' : (storeId ? '수정' : '생성')}
      </button>
    </form>
  );
};
```

---

## 🎯 추천 관리 API

### API 함수들
```javascript
// api/recommendations.js
import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const recommendationsAPI = {
  // 추천 목록 조회
  getRecommendations: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      fromStore: params.fromStore || '',
      toStore: params.toStore || ''
    });
    return apiClient.get(`${API_ENDPOINTS.RECOMMENDATIONS}?${queryParams}`);
  },

  // 추천 상세 조회
  getRecommendation: (id) => apiClient.get(API_ENDPOINTS.RECOMMENDATION_DETAIL(id)),

  // 추천 생성
  createRecommendation: (data) => apiClient.post(API_ENDPOINTS.RECOMMENDATIONS, data),

  // 추천 수정
  updateRecommendation: (id, data) => apiClient.put(API_ENDPOINTS.RECOMMENDATION_DETAIL(id), data),

  // 추천 삭제
  deleteRecommendation: (id) => apiClient.delete(API_ENDPOINTS.RECOMMENDATION_DETAIL(id))
};
```

### 추천 생성 폼 예시
```javascript
// components/RecommendationForm.jsx
const RecommendationForm = () => {
  const [formData, setFormData] = useState({
    fromStore: '',
    toStore: '',
    category: '',
    priority: 1,
    description: '',
    tags: []
  });
  const [stores, setStores] = useState([]);

  useEffect(() => {
    // 매장 목록 로드
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await storesAPI.getStores({ limit: 1000 });
      if (response.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error('매장 목록 로드 실패:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await recommendationsAPI.createRecommendation(formData);
      if (response.success) {
        alert('추천이 생성되었습니다.');
        // 폼 초기화 또는 목록으로 이동
      }
    } catch (error) {
      console.error('추천 생성 실패:', error);
      alert('생성에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>출발 매장 *</label>
        <select
          value={formData.fromStore}
          onChange={(e) => setFormData(prev => ({ ...prev, fromStore: e.target.value }))}
          required
        >
          <option value="">선택하세요</option>
          {stores.map(store => (
            <option key={store._id} value={store._id}>
              {store.name} ({store.category})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>도착 매장 *</label>
        <select
          value={formData.toStore}
          onChange={(e) => setFormData(prev => ({ ...prev, toStore: e.target.value }))}
          required
        >
          <option value="">선택하세요</option>
          {stores.filter(store => store._id !== formData.fromStore).map(store => (
            <option key={store._id} value={store._id}>
              {store.name} ({store.category})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>카테고리 *</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          required
        >
          <option value="">선택하세요</option>
          <option value="next_meal">다음 식사</option>
          <option value="dessert">디저트</option>
          <option value="activity">활동</option>
          <option value="shopping">쇼핑</option>
          <option value="culture">문화</option>
          <option value="rest">휴식</option>
        </select>
      </div>

      <div>
        <label>우선순위 (1-10)</label>
        <input
          type="number"
          min="1"
          max="10"
          value={formData.priority}
          onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
        />
      </div>

      <div>
        <label>설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <button type="submit">추천 생성</button>
    </form>
  );
};
```

---

## 📊 대시보드 API

### API 함수들
```javascript
// api/analytics.js
import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const analyticsAPI = {
  // 대시보드 통계
  getDashboardStats: () => apiClient.get(API_ENDPOINTS.DASHBOARD),

  // 매장별 통계
  getStoreAnalytics: (params = {}) => {
    const queryParams = new URLSearchParams({
      storeId: params.storeId || '',
      period: params.period || 'month'
    });
    return apiClient.get(`${API_ENDPOINTS.STORE_ANALYTICS}?${queryParams}`);
  }
};
```

### 대시보드 컴포넌트 예시
```javascript
// components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/analytics';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await analyticsAPI.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('대시보드 통계 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="dashboard">
      <h1>관리자 대시보드</h1>
      
      {/* 통계 카드들 */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>전체 매장</h3>
          <div className="stat-number">{stats?.stores?.total || 0}</div>
          <div className="stat-detail">
            활성: {stats?.stores?.active || 0} | 
            비활성: {stats?.stores?.inactive || 0}
          </div>
        </div>

        <div className="stat-card">
          <h3>전체 추천</h3>
          <div className="stat-number">{stats?.recommendations?.total || 0}</div>
          <div className="stat-detail">
            활성: {stats?.recommendations?.active || 0} | 
            비활성: {stats?.recommendations?.inactive || 0}
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="recent-activity">
        <h2>최근 활동</h2>
        <div className="activity-list">
          {stats?.recentActivity?.map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="activity-type">{activity.eventType}</span>
              <span className="activity-time">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 🛡️ 인증 가드 및 라우팅

### 인증 가드 컴포넌트
```javascript
// components/AuthGuard.jsx
import { useEffect, useState } from 'react';
import { authAPI } from '../api/auth';

const AuthGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      await authAPI.verifyToken();
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>인증 확인 중...</div>;
  if (!isAuthenticated) return null;

  return children;
};

export default AuthGuard;
```

### 라우터 설정
```javascript
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import StoreList from './components/StoreList';
import StoreForm from './components/StoreForm';
import RecommendationList from './components/RecommendationList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />
        <Route path="/stores" element={
          <AuthGuard>
            <StoreList />
          </AuthGuard>
        } />
        <Route path="/stores/new" element={
          <AuthGuard>
            <StoreForm />
          </AuthGuard>
        } />
        <Route path="/recommendations" element={
          <AuthGuard>
            <RecommendationList />
          </AuthGuard>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🎨 스타일링 가이드

### CSS 변수 설정
```css
/* styles/variables.css */
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #f5222d;
  --text-color: #262626;
  --border-color: #d9d9d9;
  --background-color: #f0f2f5;
}
```

### 기본 레이아웃 스타일
```css
/* styles/layout.css */
.dashboard {
  padding: 24px;
  background: var(--background-color);
  min-height: 100vh;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 8px 0;
}

.store-list {
  display: grid;
  gap: 16px;
}

.store-item {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.actions button {
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.actions button:hover {
  background: var(--background-color);
}
```

---

## 🚀 배포 설정

### Vite 설정
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### 환경 변수 설정
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:4000
VITE_APP_TITLE=Spotline Admin

# .env.production
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_TITLE=Spotline Admin
```

---

## 📝 개발 체크리스트

### 필수 구현 사항
- [ ] 로그인/로그아웃 기능
- [ ] 매장 목록 조회 (페이지네이션, 검색, 필터링)
- [ ] 매장 생성/수정/삭제
- [ ] 추천 목록 조회 (페이지네이션, 필터링)
- [ ] 추천 생성/수정/삭제
- [ ] 대시보드 통계 표시
- [ ] 반응형 디자인
- [ ] 에러 처리 및 로딩 상태
- [ ] 인증 가드

### 선택 구현 사항
- [ ] 매장 위치 지도 표시
- [ ] 이미지 업로드 기능
- [ ] 엑셀 내보내기
- [ ] 실시간 알림
- [ ] 다크 모드

---

## 🔧 개발 시작하기

1. **프로젝트 생성**
```bash
npm create vite@latest spotline-admin -- --template react-ts
cd spotline-admin
npm install
```

2. **필요한 패키지 설치**
```bash
npm install axios react-router-dom react-query zustand
npm install antd # 또는 @mui/material
npm install chart.js react-chartjs-2 # 차트용
```

3. **개발 서버 실행**
```bash
npm run dev
```

4. **API 연동 테스트**
- 로그인: `spotline-admin` / `12341234`
- API 서버: `http://localhost:4000`

---

이 가이드를 따라 구현하면 완전한 Spotline 관리자 페이지를 개발할 수 있습니다!