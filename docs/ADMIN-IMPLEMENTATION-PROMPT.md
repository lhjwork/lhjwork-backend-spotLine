# Spotline Admin 시스템 구현 프롬프트

## 시스템 개요

Spotline은 QR 기반 로컬 연결 서비스로, 매장에서 QR 코드를 스캔하면 다음에 갈 만한 장소를 추천해주는 서비스입니다. 이 어드민 시스템은 매장 관리, 추천 관계 설정, 분석 데이터 확인 등의 기능을 제공합니다.

## 🎯 핵심 기능 요구사항

### 1. 매장 관리
- **매장 등록**: Daum 주소 API를 사용한 정확한 주소 입력 및 좌표 자동 변환
- **매장 수정**: 기존 매장 정보 수정
- **매장 상태 관리**: 활성화/비활성화 토글
- **매장 삭제**: 완전 삭제 (관련 데이터 모두 삭제)
- **검색 및 필터링**: 매장명, 주소, 카테고리, 상태별 필터링
- **페이지네이션**: 대량 데이터 효율적 처리

### 2. 추천 관계 관리
- **추천 관계 생성**: 매장 간 추천 관계 설정
- **우선순위 설정**: 추천 순서 조정
- **카테고리 분류**: 추천 유형별 분류
- **추천 성과 추적**: 클릭률 및 전환율 모니터링

### 3. 분석 대시보드
- **실시간 통계**: QR 스캔 수, 추천 클릭률 등
- **시각화**: 차트와 그래프를 통한 데이터 시각화
- **성과 분석**: 매장별, 기간별 성과 분석
- **인기 매장 순위**: 스캔 수 기반 인기 매장 랭킹

### 4. 권한 관리
- **역할 기반 접근 제어**: super_admin, admin, moderator
- **세분화된 권한**: 기능별 읽기/쓰기/삭제 권한
- **JWT 인증**: 보안 토큰 기반 인증

## 🏗️ 기술 스택

### Backend
- **Framework**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **Validation**: Custom middleware
- **Architecture**: MVC Pattern

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router DOM
- **State Management**: React Query
- **Forms**: React Hook Form
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

### External APIs
- **Daum 주소 검색**: 주소 검색 팝업
- **Kakao 좌표 변환**: 주소 → 좌표 변환

## 📁 프로젝트 구조

```
backend-spotLine/
├── controllers/          # API 컨트롤러
│   ├── adminController.js
│   ├── storeController.js
│   └── analyticsController.js
├── services/            # 비즈니스 로직
│   ├── adminService.js
│   └── storeService.js
├── models/              # 데이터 모델
│   ├── Admin.js
│   ├── Store.js
│   ├── Recommendation.js
│   └── Analytics.js
├── routes/              # API 라우트
│   └── admin.js
├── middleware/          # 미들웨어
│   ├── adminAuth.js
│   └── errorHandler.js
├── scripts/             # 유틸리티 스크립트
│   └── createSpotlineAdmin.js
└── admin-frontend/      # 프론트엔드
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── AddressSearch.jsx
    │   │   └── StoreFormModal.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Stores.jsx
    │   │   ├── Recommendations.jsx
    │   │   ├── Analytics.jsx
    │   │   └── Admins.jsx
    │   ├── services/
    │   │   └── api.js
    │   └── contexts/
    │       └── AuthContext.jsx
    └── index.html
```

## 🔧 구현 가이드

### 1. 환경 설정

```bash
# 백엔드 의존성
pnpm add express mongoose cors dotenv uuid bcryptjs jsonwebtoken

# 프론트엔드 의존성
npm add react react-dom react-router-dom axios recharts lucide-react react-hook-form react-query date-fns clsx tailwindcss
```

### 2. 환경 변수

```env
# 백엔드 (.env)
PORT=4000
MONGODB_URI=mongodb://localhost:27017/spotline
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key

# 프론트엔드 (admin-frontend/.env)
VITE_API_URL=http://localhost:4000
VITE_KAKAO_REST_API_KEY=your-kakao-api-key
```

### 3. 데이터 모델 설계

#### Store 모델
```javascript
{
  name: String,                    // 매장명
  category: String,               // 카테고리 (cafe, restaurant, etc.)
  location: {
    address: String,              // 주소
    coordinates: {                // GeoJSON 좌표
      type: 'Point',
      coordinates: [lng, lat]
    },
    area: String,                 // 상권 (홍대, 강남 등)
    district: String              // 구/동
  },
  contact: {
    phone: String,
    website: String,
    instagram: String
  },
  businessHours: Object,          // 영업시간
  description: String,            // 설명
  tags: [String],                // 태그
  images: [String],              // 이미지 URL
  qrCode: {
    id: String,                   // UUID
    isActive: Boolean
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Recommendation 모델
```javascript
{
  fromStore: ObjectId,            // 출발 매장
  toStore: ObjectId,              // 추천 매장
  category: String,               // 추천 카테고리
  priority: Number,               // 우선순위 (1-10)
  distance: Number,               // 거리 (미터)
  walkingTime: Number,            // 도보 시간 (분)
  description: String,            // 추천 이유
  tags: [String],                // 태그
  isActive: Boolean,
  createdAt: Date
}
```

### 4. API 설계 원칙

#### RESTful API 구조
```
GET    /api/admin/stores           # 매장 목록
POST   /api/admin/stores           # 매장 생성
GET    /api/admin/stores/:id       # 매장 상세
PUT    /api/admin/stores/:id       # 매장 수정
DELETE /api/admin/stores/:id       # 매장 삭제
PATCH  /api/admin/stores/:id/status # 상태 변경
```

#### 응답 형식 표준화
```javascript
// 성공 응답
{
  data: {...},
  pagination: {...}  // 목록 API의 경우
}

// 에러 응답
{
  error: "에러 메시지"
}
```

### 5. 프론트엔드 컴포넌트 설계

#### 페이지 구조
- **Layout**: 공통 레이아웃 (사이드바, 헤더)
- **Dashboard**: 대시보드 (통계, 차트)
- **Stores**: 매장 관리 (목록, 생성, 수정)
- **Recommendations**: 추천 관리
- **Analytics**: 분석 페이지
- **Admins**: 어드민 관리

#### 공통 컴포넌트
- **AddressSearch**: Daum 주소 검색
- **StoreFormModal**: 매장 생성/수정 모달
- **DataTable**: 데이터 테이블
- **Chart**: 차트 컴포넌트

### 6. 주소 검색 구현

#### Daum 주소 API 연동
```javascript
new window.daum.Postcode({
  oncomplete: async function(data) {
    const address = data.roadAddress || data.jibunAddress
    const coordinates = await getCoordinatesFromAddress(address)
    
    onAddressSelect({
      address,
      coordinates,
      addressData: data
    })
  }
}).open()
```

#### Kakao 좌표 변환
```javascript
const getCoordinatesFromAddress = async (address) => {
  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
    {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_API_KEY}`
      }
    }
  )
  
  const data = await response.json()
  if (data.documents?.length > 0) {
    const { x: lng, y: lat } = data.documents[0]
    return { lat: parseFloat(lat), lng: parseFloat(lng) }
  }
  return null
}
```

## 🔐 보안 고려사항

### 1. 인증 및 권한
- JWT 토큰 기반 인증
- 역할 기반 접근 제어 (RBAC)
- API 엔드포인트별 권한 검증

### 2. 데이터 검증
- 입력 데이터 유효성 검사
- SQL Injection 방지
- XSS 공격 방지

### 3. API 보안
- CORS 설정
- Rate Limiting
- API 키 보안 관리

## 📊 성능 최적화

### 1. 데이터베이스
- 적절한 인덱스 설정
- 집계 쿼리 최적화
- 페이지네이션 구현

### 2. 프론트엔드
- React Query를 통한 캐싱
- 컴포넌트 지연 로딩
- 이미지 최적화

### 3. API
- 응답 데이터 최소화
- 압축 설정
- 캐시 헤더 설정

## 🧪 테스트 전략

### 1. 백엔드 테스트
- API 엔드포인트 테스트
- 데이터베이스 연동 테스트
- 권한 검증 테스트

### 2. 프론트엔드 테스트
- 컴포넌트 단위 테스트
- 사용자 시나리오 테스트
- API 연동 테스트

## 🚀 배포 가이드

### 1. 개발 환경
```bash
# 백엔드
pnpm dev

# 프론트엔드
cd admin-frontend
npm run dev
```

### 2. 프로덕션 배포
```bash
# 백엔드
pnpm start

# 프론트엔드
npm run build
```

## 📝 개발 체크리스트

### 백엔드
- [ ] MongoDB 연결 설정
- [ ] JWT 인증 미들웨어 구현
- [ ] 매장 CRUD API 구현
- [ ] 추천 관계 API 구현
- [ ] 분석 API 구현
- [ ] 권한 검증 미들웨어
- [ ] 에러 핸들링
- [ ] API 문서 작성

### 프론트엔드
- [ ] React 프로젝트 설정
- [ ] 라우팅 구성
- [ ] 인증 컨텍스트 구현
- [ ] 레이아웃 컴포넌트
- [ ] 매장 관리 페이지
- [ ] 주소 검색 컴포넌트
- [ ] 추천 관리 페이지
- [ ] 대시보드 구현
- [ ] 차트 컴포넌트
- [ ] 반응형 디자인

### 통합
- [ ] API 연동 테스트
- [ ] 권한 시스템 테스트
- [ ] 주소 검색 기능 테스트
- [ ] 데이터 시각화 테스트
- [ ] 전체 시나리오 테스트

## 🎯 성공 지표

1. **기능 완성도**: 모든 CRUD 기능 정상 작동
2. **사용성**: 직관적인 UI/UX
3. **성능**: 빠른 응답 시간 (< 2초)
4. **안정성**: 에러 없는 안정적 운영
5. **확장성**: 새로운 기능 추가 용이성

이 프롬프트를 기반으로 Spotline 어드민 시스템을 구현하면, 매장 관리자와 서비스 운영자가 효율적으로 서비스를 관리할 수 있는 완성도 높은 시스템을 구축할 수 있습니다.