# Design Document: Spotline Admin Dashboard

## Overview

Spotline 어드민 대시보드는 React + Vite 기반의 SPA(Single Page Application)로 구현되며, 기존 Node.js/Express 백엔드와 RESTful API를 통해 통신합니다. 관리자는 직관적인 웹 인터페이스를 통해 매장, 추천, 분석 데이터를 효율적으로 관리할 수 있습니다.

## Architecture

### Frontend Architecture (React + Vite)
```
┌─────────────────────────────────────────┐
│              Admin Dashboard            │
│                (React SPA)             │
├─────────────────────────────────────────┤
│  Components Layer                       │
│  ├── Auth (Login, ProtectedRoute)      │
│  ├── Dashboard (Overview, Analytics)   │
│  ├── Stores (List, Form, Detail)       │
│  ├── Recommendations (Manager)         │
│  ├── QR (Generator, Manager)           │
│  └── Settings (Config, Export)         │
├─────────────────────────────────────────┤
│  State Management (Zustand)            │
│  ├── Auth Store                        │
│  ├── Stores Store                      │
│  ├── Analytics Store                   │
│  └── UI Store                          │
├─────────────────────────────────────────┤
│  Services Layer                         │
│  ├── API Client (Axios)                │
│  ├── Auth Service                      │
│  └── Utils (Formatters, Validators)    │
└─────────────────────────────────────────┘
```

### Backend API Extensions
```
┌─────────────────────────────────────────┐
│         Existing Backend                │
│        (Node.js + Express)             │
├─────────────────────────────────────────┤
│  New Admin Routes                       │
│  ├── /api/admin/auth                   │
│  ├── /api/admin/stores                 │
│  ├── /api/admin/recommendations        │
│  ├── /api/admin/analytics              │
│  ├── /api/admin/qr                     │
│  └── /api/admin/export                 │
├─────────────────────────────────────────┤
│  Middleware                             │
│  ├── Admin Auth Middleware             │
│  ├── Rate Limiting                     │
│  └── Request Validation                │
├─────────────────────────────────────────┤
│  Existing Models & Services             │
│  ├── Store Model                       │
│  ├── Recommendation Model              │
│  └── Analytics Model                   │
└─────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. Authentication Components
```typescript
// AuthProvider.tsx
interface AuthContextType {
  user: AdminUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// LoginForm.tsx
interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error?: string;
}
```

#### 2. Dashboard Components
```typescript
// Dashboard.tsx
interface DashboardProps {
  analyticsData: AnalyticsOverview;
  recentActivity: ActivityItem[];
  systemStatus: SystemStatus;
}

// AnalyticsChart.tsx
interface AnalyticsChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie';
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}
```

#### 3. Store Management Components
```typescript
// StoreList.tsx
interface StoreListProps {
  stores: Store[];
  pagination: PaginationInfo;
  filters: StoreFilters;
  onFilterChange: (filters: StoreFilters) => void;
  onEdit: (store: Store) => void;
  onDelete: (storeId: string) => void;
}

// StoreForm.tsx
interface StoreFormProps {
  store?: Store;
  onSubmit: (storeData: StoreFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}
```

### Backend API Interfaces

#### 1. Admin Authentication API
```typescript
// POST /api/admin/auth/login
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: AdminUser;
  expiresIn: number;
}

// POST /api/admin/auth/refresh
interface RefreshResponse {
  token: string;
  expiresIn: number;
}
```

#### 2. Admin Store Management API
```typescript
// GET /api/admin/stores
interface AdminStoreListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  area?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

interface AdminStoreListResponse {
  stores: Store[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    categories: string[];
    areas: string[];
  };
}

// POST /api/admin/stores
interface CreateStoreRequest {
  name: string;
  category: string;
  location: StoreLocation;
  contact?: StoreContact;
  businessHours?: BusinessHours;
  description?: string;
  tags?: string[];
  images?: string[];
}
```

#### 3. Analytics API
```typescript
// GET /api/admin/analytics/overview
interface AnalyticsOverviewQuery {
  startDate?: string;
  endDate?: string;
  storeId?: string;
}

interface AnalyticsOverviewResponse {
  totalScans: number;
  totalStores: number;
  totalRecommendations: number;
  scanTrends: TrendData[];
  popularStores: PopularStore[];
  recommendationStats: RecommendationStats;
}

// GET /api/admin/analytics/realtime
interface RealtimeAnalyticsResponse {
  activeScans: number;
  recentScans: RecentScan[];
  liveMap: MapData[];
}
```

## Data Models

### Frontend State Models
```typescript
// Auth Store
interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// Stores Store
interface StoresState {
  stores: Store[];
  currentStore: Store | null;
  pagination: PaginationInfo;
  filters: StoreFilters;
  isLoading: boolean;
  error: string | null;
  fetchStores: (query?: StoreQuery) => Promise<void>;
  createStore: (storeData: CreateStoreRequest) => Promise<void>;
  updateStore: (id: string, storeData: UpdateStoreRequest) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
}

// Analytics Store
interface AnalyticsState {
  overview: AnalyticsOverview | null;
  realtime: RealtimeAnalytics | null;
  timeRange: TimeRange;
  selectedStore: string | null;
  isLoading: boolean;
  fetchOverview: () => Promise<void>;
  fetchRealtime: () => Promise<void>;
  setTimeRange: (range: TimeRange) => void;
}
```

### Backend Extensions
```typescript
// Admin User Model (new)
interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: Permission[];
  lastLogin: Date;
  isActive: boolean;
  createdAt: Date;
}

// QR Code Management (extension to existing Store model)
interface QRCodeInfo {
  id: string;
  storeId: string;
  isActive: boolean;
  generatedAt: Date;
  downloadCount: number;
  format: 'png' | 'svg' | 'pdf';
}
```

## Error Handling

### Frontend Error Handling
```typescript
// Global Error Boundary
class AdminErrorBoundary extends React.Component {
  handleError(error: Error, errorInfo: ErrorInfo): void;
  render(): React.ReactNode;
}

// API Error Handler
interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Error Toast System
interface ErrorToastProps {
  error: APIError;
  onDismiss: () => void;
  autoHide?: boolean;
}
```

### Backend Error Responses
```typescript
// Standardized Error Response
interface AdminErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

// Common Error Codes
enum AdminErrorCodes {
  UNAUTHORIZED = 'ADMIN_UNAUTHORIZED',
  FORBIDDEN = 'ADMIN_FORBIDDEN',
  VALIDATION_ERROR = 'ADMIN_VALIDATION_ERROR',
  STORE_NOT_FOUND = 'STORE_NOT_FOUND',
  QR_GENERATION_FAILED = 'QR_GENERATION_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED'
}
```

## Testing Strategy

### Frontend Testing
- **Unit Tests**: React Testing Library + Vitest for component testing
- **Integration Tests**: MSW (Mock Service Worker) for API mocking
- **E2E Tests**: Playwright for critical user flows
- **Property Tests**: Fast-check for form validation and data transformation

### Backend Testing
- **Unit Tests**: Jest for service layer testing
- **Integration Tests**: Supertest for API endpoint testing
- **Property Tests**: Fast-check for data validation and business logic
- **Load Tests**: Artillery for admin API performance testing

### Test Configuration
```typescript
// Vitest config for frontend
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});

// Jest config for backend admin routes
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/admin/setup.js'],
  testMatch: ['**/tests/admin/**/*.test.js'],
  collectCoverageFrom: [
    'routes/admin/**/*.js',
    'middleware/admin/**/*.js',
    'services/admin/**/*.js'
  ]
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication Properties

**Property 1: Valid credential authentication**
*For any* valid administrator credentials, authentication should succeed and grant dashboard access
**Validates: Requirements 1.1**

**Property 2: Invalid credential rejection**
*For any* invalid administrator credentials, authentication should fail and display appropriate error messages
**Validates: Requirements 1.2**

**Property 3: Session expiration handling**
*For any* expired administrator session, the system should redirect to login and require re-authentication
**Validates: Requirements 1.3**

**Property 4: Logout session cleanup**
*For any* administrator logout action, all session data should be cleared and redirect to login should occur
**Validates: Requirements 1.5**

### Store Management Properties

**Property 5: Store creation validation**
*For any* new store data, validation should ensure all required fields are present before database storage
**Validates: Requirements 2.1**

**Property 6: Store update history preservation**
*For any* store update operation, the system should preserve update history and timestamp information
**Validates: Requirements 2.2**

**Property 7: Store search filtering**
*For any* search query and store dataset, results should be properly filtered by name, category, or location criteria
**Validates: Requirements 2.3**

**Property 8: Store pagination and sorting**
*For any* store dataset, pagination and sorting should work correctly across different page sizes and sort criteria
**Validates: Requirements 2.4**

**Property 9: Store soft deletion**
*For any* store deletion request, the store should be deactivated rather than permanently removed from the database
**Validates: Requirements 2.5**

**Property 10: Image upload validation**
*For any* uploaded file, the system should validate file types and properly store image URLs
**Validates: Requirements 2.6**

**Property 11: QR code uniqueness**
*For any* newly created store, the generated QR code should be unique across all existing QR codes
**Validates: Requirements 2.7**

### Recommendation Management Properties

**Property 12: Recommendation store validation**
*For any* recommendation creation, both source and target stores must exist in the database
**Validates: Requirements 3.1**

**Property 13: Priority value validation**
*For any* recommendation priority setting, only values between 1 and 10 should be accepted
**Validates: Requirements 3.2**

**Property 14: Distance calculation consistency**
*For any* pair of store coordinates, walking distance and time calculations should be consistent and accurate
**Validates: Requirements 3.3**

**Property 15: Recommendation priority sorting**
*For any* store's recommendations, they should be displayed sorted by priority in descending order
**Validates: Requirements 3.4**

**Property 16: Recommendation deletion**
*For any* recommendation deletion, the recommendation should be removed from all active recommendation lists
**Validates: Requirements 3.5**

**Property 17: Duplicate recommendation prevention**
*For any* store pair and category combination, duplicate recommendations should be prevented
**Validates: Requirements 3.6**

### Analytics Properties

**Property 18: Store popularity ranking**
*For any* time period and scan data, stores should be ranked correctly by scan frequency
**Validates: Requirements 4.2**

**Property 19: Date range filtering**
*For any* selected date range, all analytics data should be filtered accordingly
**Validates: Requirements 4.3**

**Property 20: Click-through rate calculation**
*For any* store's recommendation data, click-through rates should be calculated correctly
**Validates: Requirements 4.4**

### QR Code Management Properties

**Property 21: QR code generation uniqueness**
*For any* store creation, the generated QR code should be unique and not conflict with existing codes
**Validates: Requirements 5.1**

**Property 22: QR code regeneration**
*For any* QR code regeneration request, the old code should be deactivated and a new unique code created
**Validates: Requirements 5.2**

**Property 23: QR code format availability**
*For any* QR code, downloadable images should be available in PNG, SVG, and PDF formats
**Validates: Requirements 5.3**

**Property 24: QR code status tracking**
*For any* QR code, its status (active, inactive, expired) should be accurately tracked and updated
**Validates: Requirements 5.5**

### Data Export Properties

**Property 25: Export file generation**
*For any* data export request, CSV or JSON files should be generated correctly for stores, recommendations, and analytics
**Validates: Requirements 6.1**

**Property 26: Export data filtering**
*For any* export filter combination (date range, category, location), the exported data should be filtered accordingly
**Validates: Requirements 6.2**

**Property 27: Export metadata inclusion**
*For any* data export, metadata including timestamp and applied filters should be included
**Validates: Requirements 6.3**

**Property 28: Large file compression**
*For any* large export file, automatic compression should be applied to reduce file size
**Validates: Requirements 6.4**

### Settings Management Properties

**Property 29: Settings persistence**
*For any* dashboard setting change, preferences should be saved to local storage correctly
**Validates: Requirements 7.1**

**Property 30: Notification preference respect**
*For any* notification preference setting, all alerts should respect those preferences
**Validates: Requirements 7.3**

**Property 31: Settings reset**
*For any* settings reset action, the system should restore default configuration regardless of current settings
**Validates: Requirements 7.5**