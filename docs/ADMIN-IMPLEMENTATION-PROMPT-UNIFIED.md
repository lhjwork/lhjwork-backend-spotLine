# SpotLine 통합 Admin API 구현 프롬프트

## 🎯 목적
SpotLine의 통합된 Admin API를 사용하여 관리자 인터페이스를 구현하기 위한 완전한 가이드입니다.

## 📋 시스템 개요

### 아키텍처
```
SpotLine Admin System
├── 기본 관리자 기능 (/api/admin/)
├── 매장 관리 (/api/admin/stores)
├── 추천 관리 (/api/admin/recommendations)
├── 데모 시스템 관리 (/api/admin/demo/*)
├── 라이브 시스템 관리 (/api/admin/live/*)
└── 시스템 관리 (/api/admin/system/*)
```

### 핵심 특징
- **통합 인증**: 모든 API가 동일한 JWT 토큰 사용
- **시스템 분리**: 데모와 라이브 시스템의 명확한 구분
- **실시간 모니터링**: 시스템 상태 및 분석 데이터 제공
- **권한 관리**: 역할 기반 접근 제어

## 🔐 인증 구현

### 1. 로그인 구현
```javascript
class AdminAuth {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('admin_token');
  }

  async login(username, password) {
    try {
      const response = await fetch(`${this.baseURL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();
      
      if (result.success) {
        this.token = result.data.token;
        localStorage.setItem('admin_token', this.token);
        localStorage.setItem('admin_info', JSON.stringify(result.data.admin));
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
  }

  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }

  getAdminInfo() {
    const info = localStorage.getItem('admin_info');
    return info ? JSON.parse(info) : null;
  }
}
```

### 2. API 클라이언트 구현
```javascript
class AdminAPIClient {
  constructor(baseURL, authManager) {
    this.baseURL = baseURL;
    this.auth = authManager;
  }

  async request(method, endpoint, data = null, params = {}) {
    if (!this.auth.isAuthenticated()) {
      throw new Error('인증이 필요합니다.');
    }

    const url = new URL(`${this.baseURL}/api/admin${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const config = {
      method,
      headers: {
        'Authorization': `Bearer ${this.auth.getToken()}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url.toString(), config);
      const result = await response.json();

      if (response.status === 401) {
        this.auth.logout();
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }

      return result;
    } catch (error) {
      console.error('API 요청 실패:', error);
      throw error;
    }
  }

  // GET 요청
  async get(endpoint, params = {}) {
    return this.request('GET', endpoint, null, params);
  }

  // POST 요청
  async post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  // PUT 요청
  async put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  // DELETE 요청
  async delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}
```

## 🏢 기본 관리자 기능 구현

### 1. 관리자 프로필 관리
```javascript
class AdminProfileManager {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async getProfile() {
    return this.api.get('/profile');
  }

  async getAdminList(filters = {}) {
    return this.api.get('/list', filters);
  }

  async updatePermissions(adminId, permissions) {
    return this.api.request('PATCH', `/${adminId}/permissions`, permissions);
  }

  async createAdmin(adminData) {
    return this.api.post('/create', adminData);
  }
}
```

### 2. 사용 예제
```javascript
// 초기화
const auth = new AdminAuth('http://localhost:4000');
const api = new AdminAPIClient('http://localhost:4000', auth);
const profileManager = new AdminProfileManager(api);

// 로그인
try {
  await auth.login('spotline-admin', '12341234');
  console.log('로그인 성공');
  
  // 프로필 조회
  const profile = await profileManager.getProfile();
  console.log('관리자 프로필:', profile);
} catch (error) {
  console.error('로그인 실패:', error.message);
}
```

## 🏪 매장 관리 구현

### 1. 매장 관리 클래스
```javascript
class StoreManager {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async getStores(filters = {}) {
    return this.api.get('/stores', filters);
  }

  async createStore(storeData) {
    return this.api.post('/stores', storeData);
  }

  async updateStore(storeId, updateData) {
    return this.api.put(`/stores/${storeId}`, updateData);
  }

  async deleteStore(storeId) {
    return this.api.delete(`/stores/${storeId}`);
  }

  async toggleStoreStatus(storeId, active) {
    return this.api.request('PATCH', `/stores/${storeId}/toggle`, { active });
  }

  async getStoreStats() {
    return this.api.get('/stores/stats');
  }
}
```

### 2. 매장 목록 UI 구현 예제 (React)
```jsx
import React, { useState, useEffect } from 'react';

const StoreManagement = ({ storeManager }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    area: '',
    active: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    loadStores();
  }, [filters]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const result = await storeManager.getStores(filters);
      if (result.success) {
        setStores(result.data.stores || []);
      }
    } catch (error) {
      console.error('매장 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (storeId, currentStatus) => {
    try {
      const result = await storeManager.toggleStoreStatus(storeId, !currentStatus);
      if (result.success) {
        loadStores(); // 목록 새로고침
      }
    } catch (error) {
      console.error('매장 상태 변경 실패:', error);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="store-management">
      <h2>매장 관리</h2>
      
      {/* 필터 */}
      <div className="filters">
        <select 
          value={filters.category} 
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">전체 카테고리</option>
          <option value="cafe">카페</option>
          <option value="restaurant">레스토랑</option>
          <option value="retail">소매</option>
        </select>
        
        <select 
          value={filters.active} 
          onChange={(e) => setFilters({...filters, active: e.target.value})}
        >
          <option value="">전체 상태</option>
          <option value="true">활성</option>
          <option value="false">비활성</option>
        </select>
      </div>

      {/* 매장 목록 */}
      <div className="store-list">
        {stores.map(store => (
          <div key={store._id} className="store-item">
            <h3>{store.name}</h3>
            <p>카테고리: {store.category}</p>
            <p>주소: {store.location?.address}</p>
            <p>상태: {store.isActive ? '활성' : '비활성'}</p>
            
            <div className="actions">
              <button 
                onClick={() => handleToggleStatus(store._id, store.isActive)}
                className={store.isActive ? 'btn-deactivate' : 'btn-activate'}
              >
                {store.isActive ? '비활성화' : '활성화'}
              </button>
              <button onClick={() => editStore(store._id)}>수정</button>
              <button onClick={() => deleteStore(store._id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🎪 데모 시스템 관리 구현

### 1. 데모 관리 클래스
```javascript
class DemoSystemManager {
  constructor(apiClient) {
    this.api = apiClient;
  }

  // 데모 매장 관리
  async getDemoStores() {
    return this.api.get('/demo/stores');
  }

  async getDemoStore(storeId) {
    return this.api.get(`/demo/stores/${storeId}`);
  }

  async createDemoStore(storeData) {
    return this.api.post('/demo/stores', storeData);
  }

  async updateDemoStore(storeId, updateData) {
    return this.api.put(`/demo/stores/${storeId}`, updateData);
  }

  async deleteDemoStore(storeId) {
    return this.api.delete(`/demo/stores/${storeId}`);
  }

  // 데모 추천 관리
  async getDemoRecommendations() {
    return this.api.get('/demo/recommendations');
  }

  async createDemoRecommendation(recommendationData) {
    return this.api.post('/demo/recommendations', recommendationData);
  }

  async updateDemoRecommendation(id, updateData) {
    return this.api.put(`/demo/recommendations/${id}`, updateData);
  }

  async deleteDemoRecommendation(id) {
    return this.api.delete(`/demo/recommendations/${id}`);
  }

  // 데모 설정 관리
  async getDemoSettings() {
    return this.api.get('/demo/settings');
  }

  async updateDemoSettings(settings) {
    return this.api.put('/demo/settings', settings);
  }
}
```

### 2. 데모 매장 관리 UI 예제
```jsx
const DemoStoreManagement = ({ demoManager }) => {
  const [demoStores, setDemoStores] = useState([]);
  const [editingStore, setEditingStore] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadDemoStores();
  }, []);

  const loadDemoStores = async () => {
    try {
      const result = await demoManager.getDemoStores();
      if (result.success) {
        setDemoStores(result.data.stores || []);
      }
    } catch (error) {
      console.error('데모 매장 로드 실패:', error);
    }
  };

  const handleCreateStore = async (storeData) => {
    try {
      const result = await demoManager.createDemoStore(storeData);
      if (result.success) {
        setShowCreateForm(false);
        loadDemoStores();
      }
    } catch (error) {
      console.error('데모 매장 생성 실패:', error);
    }
  };

  const handleUpdateStore = async (storeId, updateData) => {
    try {
      const result = await demoManager.updateDemoStore(storeId, updateData);
      if (result.success) {
        setEditingStore(null);
        loadDemoStores();
      }
    } catch (error) {
      console.error('데모 매장 수정 실패:', error);
    }
  };

  return (
    <div className="demo-store-management">
      <h2>데모 매장 관리</h2>
      
      <button onClick={() => setShowCreateForm(true)}>
        새 데모 매장 추가
      </button>

      {showCreateForm && (
        <DemoStoreForm 
          onSubmit={handleCreateStore}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="demo-store-list">
        {demoStores.map(store => (
          <div key={store.id} className="demo-store-item">
            <img src={store.representativeImage} alt={store.name} />
            <h3>{store.name}</h3>
            <p>{store.shortDescription}</p>
            <p>카테고리: {store.category}</p>
            
            <div className="actions">
              <button onClick={() => setEditingStore(store)}>수정</button>
              <button onClick={() => handleDeleteStore(store.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>

      {editingStore && (
        <DemoStoreForm 
          store={editingStore}
          onSubmit={(data) => handleUpdateStore(editingStore.id, data)}
          onCancel={() => setEditingStore(null)}
        />
      )}
    </div>
  );
};

const DemoStoreForm = ({ store, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: store?.name || '',
    shortDescription: store?.shortDescription || '',
    representativeImage: store?.representativeImage || '',
    category: store?.category || 'cafe',
    location: {
      address: store?.location?.address || '',
      coordinates: store?.location?.coordinates || [127.0276, 37.4979]
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="demo-store-form">
      <h3>{store ? '데모 매장 수정' : '새 데모 매장 생성'}</h3>
      
      <input
        type="text"
        placeholder="매장명"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="한줄 설명"
        value={formData.shortDescription}
        onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
        required
      />
      
      <input
        type="url"
        placeholder="대표 이미지 URL"
        value={formData.representativeImage}
        onChange={(e) => setFormData({...formData, representativeImage: e.target.value})}
        required
      />
      
      <select
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
      >
        <option value="cafe">카페</option>
        <option value="restaurant">레스토랑</option>
        <option value="bakery">베이커리</option>
        <option value="retail">소매</option>
      </select>
      
      <input
        type="text"
        placeholder="주소"
        value={formData.location.address}
        onChange={(e) => setFormData({
          ...formData, 
          location: {...formData.location, address: e.target.value}
        })}
        required
      />
      
      <div className="form-actions">
        <button type="submit">{store ? '수정' : '생성'}</button>
        <button type="button" onClick={onCancel}>취소</button>
      </div>
    </form>
  );
};
```

## 🚀 라이브 시스템 관리 구현

### 1. 라이브 시스템 관리 클래스
```javascript
class LiveSystemManager {
  constructor(apiClient) {
    this.api = apiClient;
  }

  // 라이브 매장 관리
  async getLiveStores(filters = {}) {
    return this.api.get('/live/stores', filters);
  }

  async getLiveStore(storeId) {
    return this.api.get(`/live/stores/${storeId}`);
  }

  async approveStore(storeId, approvalNote = '') {
    return this.api.post(`/live/stores/${storeId}/approve`, { approvalNote });
  }

  async suspendStore(storeId, suspensionReason = '') {
    return this.api.post(`/live/stores/${storeId}/suspend`, { suspensionReason });
  }

  // 라이브 분석
  async getLiveAnalytics() {
    return this.api.get('/live/analytics');
  }

  async getStoreAnalytics(storeId) {
    return this.api.get(`/live/analytics/stores/${storeId}`);
  }

  // 라이브 추천 관리
  async getLiveRecommendations() {
    return this.api.get('/live/recommendations');
  }

  async createLiveRecommendation(recommendationData) {
    return this.api.post('/live/recommendations', recommendationData);
  }

  async updateLiveRecommendation(id, updateData) {
    return this.api.put(`/live/recommendations/${id}`, updateData);
  }

  async deleteLiveRecommendation(id) {
    return this.api.delete(`/live/recommendations/${id}`);
  }

  // 라이브 설정
  async getLiveSettings() {
    return this.api.get('/live/settings');
  }

  async updateLiveSettings(settings) {
    return this.api.put('/live/settings', settings);
  }
}
```

### 2. 라이브 매장 승인 관리 UI
```jsx
const LiveStoreApproval = ({ liveManager }) => {
  const [pendingStores, setPendingStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');

  useEffect(() => {
    loadPendingStores();
  }, []);

  const loadPendingStores = async () => {
    try {
      const result = await liveManager.getLiveStores({ status: 'pending' });
      if (result.success) {
        setPendingStores(result.data.stores || []);
      }
    } catch (error) {
      console.error('대기 매장 로드 실패:', error);
    }
  };

  const handleApprove = async (storeId) => {
    try {
      const result = await liveManager.approveStore(storeId, approvalNote);
      if (result.success) {
        setApprovalNote('');
        loadPendingStores();
        alert('매장이 승인되었습니다.');
      }
    } catch (error) {
      console.error('매장 승인 실패:', error);
      alert('매장 승인에 실패했습니다.');
    }
  };

  const handleSuspend = async (storeId) => {
    try {
      const result = await liveManager.suspendStore(storeId, suspensionReason);
      if (result.success) {
        setSuspensionReason('');
        loadPendingStores();
        alert('매장이 정지되었습니다.');
      }
    } catch (error) {
      console.error('매장 정지 실패:', error);
      alert('매장 정지에 실패했습니다.');
    }
  };

  return (
    <div className="live-store-approval">
      <h2>매장 승인 관리</h2>
      
      <div className="pending-stores">
        <h3>승인 대기 매장 ({pendingStores.length}개)</h3>
        
        {pendingStores.map(store => (
          <div key={store.storeId} className="pending-store-item">
            <div className="store-info">
              <h4>{store.name}</h4>
              <p>{store.description}</p>
              <p>카테고리: {store.category}</p>
              <p>소유자: {store.ownerId}</p>
              <p>신청일: {new Date(store.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className="approval-actions">
              <div className="approval-section">
                <textarea
                  placeholder="승인 메모 (선택사항)"
                  value={selectedStore === store.storeId ? approvalNote : ''}
                  onChange={(e) => {
                    setSelectedStore(store.storeId);
                    setApprovalNote(e.target.value);
                  }}
                />
                <button 
                  onClick={() => handleApprove(store.storeId)}
                  className="btn-approve"
                >
                  승인
                </button>
              </div>
              
              <div className="suspension-section">
                <textarea
                  placeholder="정지 사유"
                  value={selectedStore === store.storeId ? suspensionReason : ''}
                  onChange={(e) => {
                    setSelectedStore(store.storeId);
                    setSuspensionReason(e.target.value);
                  }}
                />
                <button 
                  onClick={() => handleSuspend(store.storeId)}
                  className="btn-suspend"
                >
                  정지
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 📊 분석 대시보드 구현

### 1. 분석 대시보드 클래스
```javascript
class AnalyticsDashboard {
  constructor(apiClient, liveManager) {
    this.api = apiClient;
    this.liveManager = liveManager;
  }

  async getSystemStats() {
    return this.api.get('/system/stats');
  }

  async getSystemHealth() {
    return this.api.get('/system/health');
  }

  async getLiveAnalytics() {
    return this.liveManager.getLiveAnalytics();
  }
}
```

### 2. 대시보드 UI 구현
```jsx
const AdminDashboard = ({ analytics }) => {
  const [systemStats, setSystemStats] = useState(null);
  const [liveAnalytics, setLiveAnalytics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResult, analyticsResult, healthResult] = await Promise.all([
        analytics.getSystemStats(),
        analytics.getLiveAnalytics(),
        analytics.getSystemHealth()
      ]);

      if (statsResult.success) setSystemStats(statsResult.data);
      if (analyticsResult.success) setLiveAnalytics(analyticsResult.data);
      if (healthResult.success) setSystemHealth(healthResult.data);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    }
  };

  if (!systemStats || !liveAnalytics || !systemHealth) {
    return <div>대시보드 로딩 중...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>SpotLine 관리자 대시보드</h1>
      
      {/* 시스템 상태 */}
      <div className="system-health">
        <h2>시스템 상태</h2>
        <div className="health-indicators">
          <div className={`indicator ${systemHealth.data.systems.demo}`}>
            데모 시스템: {systemHealth.data.systems.demo}
          </div>
          <div className={`indicator ${systemHealth.data.systems.live}`}>
            라이브 시스템: {systemHealth.data.systems.live}
          </div>
          <div className={`indicator ${systemHealth.data.systems.admin}`}>
            관리자 시스템: {systemHealth.data.systems.admin}
          </div>
        </div>
      </div>

      {/* 전체 통계 */}
      <div className="system-stats">
        <h2>전체 시스템 통계</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>데모 시스템</h3>
            <p>매장: {systemStats.demo.stores}개</p>
            <p>추천: {systemStats.demo.recommendations}개</p>
          </div>
          
          <div className="stat-card">
            <h3>라이브 시스템</h3>
            <p>총 매장: {systemStats.live.stores}개</p>
            <p>활성 매장: {systemStats.live.activeStores}개</p>
            <p>총 조회수: {systemStats.live.totalViews.toLocaleString()}</p>
            <p>QR 스캔: {systemStats.live.totalQRScans.toLocaleString()}</p>
          </div>
          
          <div className="stat-card">
            <h3>관리자</h3>
            <p>총 관리자: {systemStats.admin.totalAdmins}명</p>
            <p>현재 관리자: {systemStats.admin.currentAdmin}</p>
          </div>
        </div>
      </div>

      {/* 라이브 분석 */}
      <div className="live-analytics">
        <h2>라이브 시스템 분석</h2>
        
        <div className="analytics-overview">
          <div className="metric">
            <span className="label">평균 매장당 조회수:</span>
            <span className="value">{liveAnalytics.performance.averageViewsPerStore}</span>
          </div>
          <div className="metric">
            <span className="label">평균 매장당 스캔:</span>
            <span className="value">{liveAnalytics.performance.averageScansPerStore}</span>
          </div>
          <div className="metric">
            <span className="label">전환율:</span>
            <span className="value">{liveAnalytics.performance.conversionRate}%</span>
          </div>
        </div>

        <div className="trends">
          <h3>최근 7일 트렌드</h3>
          <div className="trend-charts">
            <div className="chart">
              <h4>일일 조회수</h4>
              <div className="simple-chart">
                {liveAnalytics.trends.dailyViews.map((views, index) => (
                  <div key={index} className="bar" style={{height: `${views/2}px`}}>
                    {views}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="chart">
              <h4>일일 스캔수</h4>
              <div className="simple-chart">
                {liveAnalytics.trends.dailyScans.map((scans, index) => (
                  <div key={index} className="bar" style={{height: `${scans*3}px`}}>
                    {scans}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 🎨 CSS 스타일 예제

```css
/* 관리자 대시보드 스타일 */
.admin-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.system-health {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.health-indicators {
  display: flex;
  gap: 15px;
}

.indicator {
  padding: 10px 15px;
  border-radius: 5px;
  font-weight: bold;
}

.indicator.active {
  background: #d4edda;
  color: #155724;
}

.indicator.inactive {
  background: #f8d7da;
  color: #721c24;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h3 {
  margin-top: 0;
  color: #333;
}

.analytics-overview {
  display: flex;
  gap: 30px;
  margin: 20px 0;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric .label {
  font-size: 14px;
  color: #666;
}

.metric .value {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.trend-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.simple-chart {
  display: flex;
  align-items: end;
  gap: 5px;
  height: 100px;
  margin-top: 10px;
}

.simple-chart .bar {
  background: #007bff;
  color: white;
  min-width: 30px;
  display: flex;
  align-items: end;
  justify-content: center;
  font-size: 12px;
  padding: 2px;
}

/* 매장 관리 스타일 */
.store-management {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.filters select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.store-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.store-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.store-item h3 {
  margin-top: 0;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-activate {
  background: #28a745;
  color: white;
}

.btn-deactivate {
  background: #dc3545;
  color: white;
}

.btn-approve {
  background: #28a745;
  color: white;
}

.btn-suspend {
  background: #dc3545;
  color: white;
}

/* 폼 스타일 */
.demo-store-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.demo-store-form input,
.demo-store-form select,
.demo-store-form textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background: #007bff;
  color: white;
}

.form-actions button[type="button"] {
  background: #6c757d;
  color: white;
}
```

## 🔧 완전한 구현 예제

### 메인 애플리케이션
```javascript
// main.js
class SpotLineAdmin {
  constructor() {
    this.auth = new AdminAuth('http://localhost:4000');
    this.api = new AdminAPIClient('http://localhost:4000', this.auth);
    
    // 관리자 기능들
    this.profileManager = new AdminProfileManager(this.api);
    this.storeManager = new StoreManager(this.api);
    this.demoManager = new DemoSystemManager(this.api);
    this.liveManager = new LiveSystemManager(this.api);
    this.analytics = new AnalyticsDashboard(this.api, this.liveManager);
    
    this.init();
  }

  async init() {
    // 로그인 상태 확인
    if (this.auth.isAuthenticated()) {
      this.showDashboard();
    } else {
      this.showLogin();
    }
  }

  showLogin() {
    document.getElementById('app').innerHTML = `
      <div class="login-container">
        <h1>SpotLine 관리자</h1>
        <form id="loginForm">
          <input type="text" id="username" placeholder="사용자명" required>
          <input type="password" id="password" placeholder="비밀번호" required>
          <button type="submit">로그인</button>
        </form>
      </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      try {
        await this.auth.login(username, password);
        this.showDashboard();
      } catch (error) {
        alert('로그인 실패: ' + error.message);
      }
    });
  }

  showDashboard() {
    document.getElementById('app').innerHTML = `
      <div class="admin-layout">
        <nav class="sidebar">
          <h2>SpotLine Admin</h2>
          <ul>
            <li><a href="#" data-page="dashboard">대시보드</a></li>
            <li><a href="#" data-page="stores">매장 관리</a></li>
            <li><a href="#" data-page="recommendations">추천 관리</a></li>
            <li><a href="#" data-page="demo">데모 관리</a></li>
            <li><a href="#" data-page="live">라이브 관리</a></li>
            <li><a href="#" data-page="settings">설정</a></li>
            <li><a href="#" id="logout">로그아웃</a></li>
          </ul>
        </nav>
        <main class="content">
          <div id="page-content"></div>
        </main>
      </div>
    `;

    // 네비게이션 이벤트
    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.showPage(e.target.dataset.page);
      });
    });

    document.getElementById('logout').addEventListener('click', (e) => {
      e.preventDefault();
      this.auth.logout();
      this.showLogin();
    });

    // 기본 페이지 표시
    this.showPage('dashboard');
  }

  async showPage(page) {
    const content = document.getElementById('page-content');
    
    switch (page) {
      case 'dashboard':
        content.innerHTML = '<div id="dashboard-container">대시보드 로딩 중...</div>';
        await this.renderDashboard();
        break;
      case 'stores':
        content.innerHTML = '<div id="stores-container">매장 관리 로딩 중...</div>';
        await this.renderStoreManagement();
        break;
      case 'demo':
        content.innerHTML = '<div id="demo-container">데모 관리 로딩 중...</div>';
        await this.renderDemoManagement();
        break;
      case 'live':
        content.innerHTML = '<div id="live-container">라이브 관리 로딩 중...</div>';
        await this.renderLiveManagement();
        break;
      default:
        content.innerHTML = '<div>페이지를 찾을 수 없습니다.</div>';
    }
  }

  async renderDashboard() {
    try {
      const [systemStats, liveAnalytics, systemHealth] = await Promise.all([
        this.analytics.getSystemStats(),
        this.analytics.getLiveAnalytics(),
        this.analytics.getSystemHealth()
      ]);

      document.getElementById('dashboard-container').innerHTML = `
        <h1>관리자 대시보드</h1>
        
        <div class="system-health">
          <h2>시스템 상태</h2>
          <div class="health-indicators">
            <div class="indicator ${systemHealth.data.systems.demo}">
              데모: ${systemHealth.data.systems.demo}
            </div>
            <div class="indicator ${systemHealth.data.systems.live}">
              라이브: ${systemHealth.data.systems.live}
            </div>
            <div class="indicator ${systemHealth.data.systems.admin}">
              관리자: ${systemHealth.data.systems.admin}
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <h3>데모 시스템</h3>
            <p>매장: ${systemStats.data.demo.stores}개</p>
            <p>추천: ${systemStats.data.demo.recommendations}개</p>
          </div>
          
          <div class="stat-card">
            <h3>라이브 시스템</h3>
            <p>총 매장: ${systemStats.data.live.stores}개</p>
            <p>활성 매장: ${systemStats.data.live.activeStores}개</p>
            <p>총 조회수: ${systemStats.data.live.totalViews.toLocaleString()}</p>
            <p>QR 스캔: ${systemStats.data.live.totalQRScans.toLocaleString()}</p>
          </div>
        </div>

        <div class="live-analytics">
          <h2>라이브 분석</h2>
          <div class="analytics-overview">
            <div class="metric">
              <span class="label">평균 조회수/매장</span>
              <span class="value">${liveAnalytics.data.performance.averageViewsPerStore}</span>
            </div>
            <div class="metric">
              <span class="label">평균 스캔/매장</span>
              <span class="value">${liveAnalytics.data.performance.averageScansPerStore}</span>
            </div>
            <div class="metric">
              <span class="label">전환율</span>
              <span class="value">${liveAnalytics.data.performance.conversionRate}%</span>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('대시보드 렌더링 실패:', error);
      document.getElementById('dashboard-container').innerHTML = 
        '<div class="error">대시보드 로드에 실패했습니다.</div>';
    }
  }

  async renderDemoManagement() {
    try {
      const demoStores = await this.demoManager.getDemoStores();
      const demoRecommendations = await this.demoManager.getDemoRecommendations();

      document.getElementById('demo-container').innerHTML = `
        <h1>데모 시스템 관리</h1>
        
        <div class="demo-section">
          <h2>데모 매장 (${demoStores.data.stores.length}개)</h2>
          <button id="add-demo-store">새 데모 매장 추가</button>
          <div class="demo-stores">
            ${demoStores.data.stores.map(store => `
              <div class="demo-store-item">
                <img src="${store.representativeImage}" alt="${store.name}" style="width: 100px; height: 75px; object-fit: cover;">
                <h3>${store.name}</h3>
                <p>${store.shortDescription}</p>
                <p>카테고리: ${store.category}</p>
                <div class="actions">
                  <button onclick="editDemoStore('${store.id}')">수정</button>
                  <button onclick="deleteDemoStore('${store.id}')">삭제</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="demo-section">
          <h2>데모 추천 (${demoRecommendations.data.recommendations.length}개)</h2>
          <button id="add-demo-recommendation">새 추천 추가</button>
          <div class="demo-recommendations">
            ${demoRecommendations.data.recommendations.map(rec => `
              <div class="demo-rec-item">
                <img src="${rec.representativeImage}" alt="${rec.name}" style="width: 80px; height: 60px; object-fit: cover;">
                <h4>${rec.name}</h4>
                <p>${rec.shortDescription}</p>
                <p>거리: ${rec.distance}m (도보 ${rec.walkingTime}분)</p>
                <div class="actions">
                  <button onclick="editDemoRecommendation('${rec.id}')">수정</button>
                  <button onclick="deleteDemoRecommendation('${rec.id}')">삭제</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('데모 관리 렌더링 실패:', error);
      document.getElementById('demo-container').innerHTML = 
        '<div class="error">데모 관리 로드에 실패했습니다.</div>';
    }
  }

  async renderLiveManagement() {
    try {
      const liveStores = await this.liveManager.getLiveStores();
      const pendingStores = await this.liveManager.getLiveStores({ status: 'pending' });

      document.getElementById('live-container').innerHTML = `
        <h1>라이브 시스템 관리</h1>
        
        <div class="live-section">
          <h2>승인 대기 매장 (${pendingStores.data.stores.length}개)</h2>
          <div class="pending-stores">
            ${pendingStores.data.stores.map(store => `
              <div class="pending-store-item">
                <h3>${store.name}</h3>
                <p>${store.description}</p>
                <p>카테고리: ${store.category}</p>
                <p>신청일: ${new Date(store.createdAt).toLocaleDateString()}</p>
                <div class="approval-actions">
                  <button onclick="approveStore('${store.storeId}')" class="btn-approve">승인</button>
                  <button onclick="suspendStore('${store.storeId}')" class="btn-suspend">정지</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="live-section">
          <h2>전체 라이브 매장 (${liveStores.data.stores.length}개)</h2>
          <div class="live-stores">
            ${liveStores.data.stores.map(store => `
              <div class="live-store-item">
                <h3>${store.name}</h3>
                <p>상태: <span class="status-${store.status}">${store.status}</span></p>
                <p>조회수: ${store.analytics.totalViews}</p>
                <p>QR 스캔: ${store.analytics.qrScans}</p>
                <div class="actions">
                  <button onclick="viewStoreAnalytics('${store.storeId}')">분석 보기</button>
                  ${store.status === 'active' ? 
                    `<button onclick="suspendStore('${store.storeId}')" class="btn-suspend">정지</button>` :
                    `<button onclick="approveStore('${store.storeId}')" class="btn-approve">승인</button>`
                  }
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      // 전역 함수들 정의
      window.approveStore = async (storeId) => {
        try {
          const result = await this.liveManager.approveStore(storeId, '관리자 승인');
          if (result.success) {
            alert('매장이 승인되었습니다.');
            this.renderLiveManagement();
          }
        } catch (error) {
          alert('승인 실패: ' + error.message);
        }
      };

      window.suspendStore = async (storeId) => {
        const reason = prompt('정지 사유를 입력하세요:');
        if (reason) {
          try {
            const result = await this.liveManager.suspendStore(storeId, reason);
            if (result.success) {
              alert('매장이 정지되었습니다.');
              this.renderLiveManagement();
            }
          } catch (error) {
            alert('정지 실패: ' + error.message);
          }
        }
      };

      window.viewStoreAnalytics = async (storeId) => {
        try {
          const analytics = await this.liveManager.getStoreAnalytics(storeId);
          if (analytics.success) {
            alert(`매장 분석 데이터:\n조회수: ${analytics.data.analytics.totalViews}\nQR 스캔: ${analytics.data.analytics.qrScans}\n추천: ${analytics.data.analytics.recommendations}`);
          }
        } catch (error) {
          alert('분석 데이터 로드 실패: ' + error.message);
        }
      };

    } catch (error) {
      console.error('라이브 관리 렌더링 실패:', error);
      document.getElementById('live-container').innerHTML = 
        '<div class="error">라이브 관리 로드에 실패했습니다.</div>';
    }
  }
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
  new SpotLineAdmin();
});
```

## 🚀 배포 및 운영 가이드

### 1. 환경 설정
```bash
# 개발 환경
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start
```

### 2. 환경 변수 설정
```env
# .env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb://localhost:27017/spotline
JWT_SECRET=your-super-secret-jwt-key
```

### 3. 보안 고려사항
- JWT 토큰의 적절한 만료 시간 설정
- HTTPS 사용 강제
- CORS 설정 검토
- 입력 데이터 검증
- 로그 모니터링

### 4. 모니터링
```javascript
// 에러 추적
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // 에러 로깅 서비스로 전송
});

// API 응답 시간 모니터링
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const start = Date.now();
  return originalFetch.apply(this, args).then(response => {
    const duration = Date.now() - start;
    console.log(`API call took ${duration}ms:`, args[0]);
    return response;
  });
};
```

이 프롬프트를 사용하여 SpotLine의 통합된 Admin API를 완전히 활용하는 관리자 인터페이스를 구현할 수 있습니다. 모든 기능이 `/api/admin/*` 경로로 통합되어 있어 일관된 인증과 관리가 가능합니다.