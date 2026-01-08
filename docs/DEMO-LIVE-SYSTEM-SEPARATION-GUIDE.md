# SpotLine Demo vs Live 시스템 분리 가이드

## 📋 시스템 분리 개요

SpotLine을 **Demo**와 **Live** 두 개의 독립적인 시스템으로 분리하여 운영합니다.

## 🔄 **핵심 차이점 (수정된 버전)**

| 구분 | **Demo System** | **Live System** |
|------|----------------|-----------------|
| **URL** | `/api/demo/*` | `/api/live/*` |
| **목적** | 🎭 시연/데모용 | 🚀 실제 서비스용 |
| **데이터베이스** | 💾 MongoDB | 💾 MongoDB |
| **컬렉션** | `demostores`, `demorecommendations` | `stores`, `recommendations` |
| **인증** | ❌ 불필요 | 📖 READ: 불필요<br>✏️ CUD: 나중에 필요 |
| **관리** | ✏️ 어드민 (Demo 탭) | ✏️ 어드민 (Live 탭) |
| **사이드바** | 📂 Demo 섹션 | 📂 Live 섹션 |
| **통계** | ❌ 불필요 | 📊 실제 수집 |
| **QR코드** | 🔒 고정 | 🔄 동적 생성 |
| **추천** | 📋 관리자 설정 (고정) | 📋 관리자 설정 (고정) |

## 🗄️ **데이터베이스 구조**

### **Demo Collections**
```typescript
// MongoDB Collections for Demo System
demostores: {
  _id: ObjectId,
  storeId: "demo_store_001",
  name: "아늑한 카페 스토리",
  // ... demo 전용 데이터
}

demorecommendations: {
  _id: ObjectId,
  fromStoreId: "demo_store_001",
  toStoreId: "demo_bakery_001",
  // ... demo 추천 데이터
}
```

### **Live Collections**
```typescript
// MongoDB Collections for Live System
stores: {
  _id: ObjectId,
  storeId: "live_store_001", 
  name: "강남 브런치 카페",
  ownerId: ObjectId,
  analytics: { ... }, // 실제 통계 데이터
  // ... live 전용 데이터
}

recommendations: {
  _id: ObjectId,
  fromStoreId: "live_store_001",
  toStoreId: "live_store_002",
  analytics: { ... }, // 추천 성과 데이터
  // ... live 추천 데이터
}
```

## 🎛️ **어드민 관리 구조**

### **어드민 사이드바 구조**
```
📁 SpotLine Admin
├── 📂 Demo System
│   ├── 📄 Demo Stores
│   ├── 📄 Demo Recommendations  
│   ├── 📄 Demo QR Codes
│   └── 📄 Demo Settings
├── 📂 Live System
│   ├── 📄 Live Stores
│   ├── 📄 Live Recommendations
│   ├── 📄 Live QR Codes
│   ├── 📄 Live Analytics
│   └── 📄 Live Settings
└── 📂 System Management
    ├── 📄 Admin Users
    └── 📄 System Logs
```

### **어드민 API 구조**
```typescript
// Demo 관리 API
/api/admin/demo/stores          // Demo 매장 관리
/api/admin/demo/recommendations // Demo 추천 관리
/api/admin/demo/settings        // Demo 설정

// Live 관리 API  
/api/admin/live/stores          // Live 매장 관리
/api/admin/live/recommendations // Live 추천 관리
/api/admin/live/analytics       // Live 통계 관리
/api/admin/live/settings        // Live 설정
```

## 🎯 **사용 시나리오**

### **1. Demo System 사용**
```bash
# 시연용 - 인증 없이 바로 사용
curl http://localhost:4000/api/demo/store
# → demostores 컬렉션에서 데이터 조회

curl http://localhost:4000/api/demo/recommendations/demo_store_001  
# → demorecommendations 컬렉션에서 데이터 조회
```

### **2. Live System 사용**
```bash
# READ 작업 - 인증 불필요 (공개)
curl http://localhost:4000/api/live/stores
curl http://localhost:4000/api/live/stores/live_store_001
curl http://localhost:4000/api/live/qr/qr_live_001
curl http://localhost:4000/api/live/recommendations/live_store_001

# CREATE/UPDATE/DELETE 작업 - 현재는 인증 불필요, 나중에 인증 필요
curl -X POST http://localhost:4000/api/live/stores \
     -H "Content-Type: application/json" \
     -d '{"name":"새 매장"}'

# 나중에 인증이 활성화되면:
# curl -H "Authorization: Bearer <token>" \
#      -X POST http://localhost:4000/api/live/stores
```

## 💻 **구현 차이점**

### **Demo Controller (통계 없음)**
```typescript
export const getDemoStore = async (req: Request, res: Response) => {
  // demostores 컬렉션에서 조회
  const store = await DemoStore.findOne({ storeId });
  
  // 통계 업데이트 없음
  res.json(formatResponse(true, "데모 데이터", store));
};
```

### **Live Controller (통계 포함)**
```typescript
export const getLiveStore = async (req: Request, res: Response) => {
  // stores 컬렉션에서 조회
  const store = await LiveStore.findOne({ storeId });
  
  // 통계 업데이트 (조회수 증가)
  await LiveStore.updateOne(
    { _id: store._id },
    { $inc: { 'analytics.totalViews': 1 } }
  );
  
  res.json(formatResponse(true, "실제 데이터", store));
};
```

## 🎨 **어드민 프론트엔드 구조**

### **사이드바 컴포넌트**
```tsx
const AdminSidebar = () => {
  return (
    <div className="admin-sidebar">
      {/* Demo System Section */}
      <div className="section">
        <h3>🎭 Demo System</h3>
        <ul>
          <li><Link to="/admin/demo/stores">Demo Stores</Link></li>
          <li><Link to="/admin/demo/recommendations">Demo Recommendations</Link></li>
          <li><Link to="/admin/demo/qr">Demo QR Codes</Link></li>
          <li><Link to="/admin/demo/settings">Demo Settings</Link></li>
        </ul>
      </div>

      {/* Live System Section */}
      <div className="section">
        <h3>🚀 Live System</h3>
        <ul>
          <li><Link to="/admin/live/stores">Live Stores</Link></li>
          <li><Link to="/admin/live/recommendations">Live Recommendations</Link></li>
          <li><Link to="/admin/live/qr">Live QR Codes</Link></li>
          <li><Link to="/admin/live/analytics">Live Analytics</Link></li>
          <li><Link to="/admin/live/settings">Live Settings</Link></li>
        </ul>
      </div>
    </div>
  );
};
```

### **Demo 관리 페이지**
```tsx
const DemoStoresPage = () => {
  const [demoStores, setDemoStores] = useState([]);
  
  useEffect(() => {
    // Demo 전용 API 호출
    adminApi.get('/admin/demo/stores').then(response => {
      setDemoStores(response.data.data);
    });
  }, []);

  return (
    <div className="demo-stores-page">
      <h1>🎭 Demo Stores Management</h1>
      <p>시연용 매장 데이터를 관리합니다.</p>
      {/* Demo 매장 목록 및 편집 UI */}
    </div>
  );
};
```

### **Live 관리 페이지**
```tsx
const LiveStoresPage = () => {
  const [liveStores, setLiveStores] = useState([]);
  
  useEffect(() => {
    // Live 전용 API 호출
    adminApi.get('/admin/live/stores').then(response => {
      setLiveStores(response.data.data);
    });
  }, []);

  return (
    <div className="live-stores-page">
      <h1>🚀 Live Stores Management</h1>
      <p>실제 서비스 매장 데이터를 관리합니다.</p>
      {/* Live 매장 목록, 통계, 편집 UI */}
    </div>
  );
};
```

## 🔧 **MongoDB 모델 분리**

### **Demo Models**
```typescript
// src/models/DemoStore.ts
const demoStoreSchema = new Schema({
  storeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  // 통계 필드 없음
}, { collection: 'demostores' });

// src/models/DemoRecommendation.ts  
const demoRecommendationSchema = new Schema({
  fromStoreId: { type: String, required: true },
  toStoreId: { type: String, required: true },
  // 통계 필드 없음
}, { collection: 'demorecommendations' });
```

### **Live Models**
```typescript
// src/models/LiveStore.ts
const liveStoreSchema = new Schema({
  storeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  ownerId: { type: ObjectId, ref: 'Owner' },
  analytics: {
    totalViews: { type: Number, default: 0 },
    monthlyViews: { type: Number, default: 0 },
    qrScans: { type: Number, default: 0 }
  }
}, { collection: 'stores' });

// src/models/LiveRecommendation.ts
const liveRecommendationSchema = new Schema({
  fromStoreId: { type: String, required: true },
  toStoreId: { type: String, required: true },
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  }
}, { collection: 'recommendations' });
```

## 🎯 **주요 특징 요약**

### **Demo System**
- ✅ MongoDB 사용 (별도 컬렉션)
- ✅ 어드민에서 관리 (Demo 탭)
- ❌ 통계 수집 없음
- ❌ 인증 불필요
- 🎭 시연 목적

### **Live System**  
- ✅ MongoDB 사용 (별도 컬렉션)
- ✅ 어드민에서 관리 (Live 탭)
- ✅ 실시간 통계 수집
- 📖 READ 인증 불필요 (공개 접근)
- ✏️ CUD 인증 나중에 필요 (설정으로 제어)
- 🚀 실제 서비스 목적

## 🔧 **인증 설정 관리**

### **현재 설정 (src/config/auth.ts)**
```typescript
export const authConfig = {
  enabled: false, // 전역 인증 비활성화
  
  live: {
    enabled: false, // Live 시스템 인증 비활성화
    requireAuth: {
      read: false,    // READ는 항상 인증 불필요
      create: false,  // 나중에 true로 변경
      update: false,  // 나중에 true로 변경  
      delete: false   // 나중에 true로 변경
    }
  }
};
```

### **나중에 인증 활성화 시**
```typescript
export const authConfig = {
  enabled: true, // 전역 인증 활성화
  
  live: {
    enabled: true, // Live 시스템 인증 활성화
    requireAuth: {
      read: false,   // READ는 여전히 인증 불필요
      create: true,  // CREATE 인증 필요
      update: true,  // UPDATE 인증 필요
      delete: true   // DELETE 인증 필요
    }
  }
};
```

이제 두 시스템이 명확하게 분리되면서도 둘 다 어드민에서 관리할 수 있고, 사이드바에서 구별해서 볼 수 있는 구조가 완성되었습니다! 🎉