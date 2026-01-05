# Spotline Backend - MVC Architecture

Spotline QR 기반 로컬 연결 서비스의 백엔드 API (MVC 패턴 적용)

## 프로젝트 구조

```
backendSpotLine/
├── controllers/          # 컨트롤러 레이어
│   ├── storeController.js
│   ├── recommendationController.js
│   └── analyticsController.js
├── services/            # 서비스 레이어 (비즈니스 로직)
│   ├── storeService.js
│   ├── recommendationService.js
│   └── analyticsService.js
├── models/              # 데이터 모델 (MongoDB Schemas)
│   ├── Store.js
│   ├── Recommendation.js
│   └── Analytics.js
├── routes/              # 라우터 (엔드포인트 정의)
│   ├── stores.js
│   ├── recommendations.js
│   └── analytics.js
├── middleware/          # 미들웨어
│   ├── validation.js
│   └── errorHandler.js
├── utils/               # 유틸리티
│   ├── responseFormatter.js
│   └── constants.js
├── .npmrc              # pnpm 설정
└── server.js           # 애플리케이션 진입점
```

## MVC 아키텍처

### Model (모델)
- **Store**: 매장 정보 (위치, 카테고리, QR 코드 등)
- **Recommendation**: 매장 간 추천 관계
- **Analytics**: 사용자 행동 분석 데이터

### View (뷰)
- RESTful API 응답 (JSON 형태)
- 표준화된 응답 포맷 (ResponseFormatter 사용)

### Controller (컨트롤러)
- **StoreController**: 매장 관련 요청 처리
- **RecommendationController**: 추천 관련 요청 처리  
- **AnalyticsController**: 분석 관련 요청 처리

### Service (서비스)
- 비즈니스 로직 분리
- 데이터베이스 작업 추상화
- 재사용 가능한 기능 모듈화

## 설치 및 실행

### 필수 요구사항
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MongoDB

### pnpm 설치 (필요한 경우)
```bash
# npm을 통한 설치
npm install -g pnpm

# 또는 curl을 통한 설치
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 프로젝트 설정
```bash
# backend 폴더로 이동
cd backendSpotLine

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env

# MongoDB 실행 (로컬)
mongod

# 개발 서버 실행
pnpm dev

# 프로덕션 실행
pnpm start
```

### pnpm 명령어
```bash
# 의존성 설치
pnpm install

# 개발 의존성 추가
pnpm add -D <package>

# 프로덕션 의존성 추가
pnpm add <package>

# 패키지 제거
pnpm remove <package>

# 캐시 정리
pnpm store prune

# 프로젝트 재설치
pnpm reinstall
```

## 환경 변수

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/spotline
NODE_ENV=development
```

## 주요 API 엔드포인트

### 매장 관리
- `GET /api/stores` - 매장 목록 조회
- `GET /api/stores/qr/:qrId` - QR 코드로 매장 조회
- `POST /api/stores` - 새 매장 등록
- `PUT /api/stores/:id` - 매장 정보 수정

### 추천 시스템 (핵심 기능)
- `GET /api/recommendations/qr/:qrId` - QR 기반 추천 조회
- `POST /api/recommendations` - 추천 관계 생성

### 분석 및 통계
- `POST /api/analytics/event` - 이벤트 로깅
- `GET /api/analytics/qr/:qrId` - QR별 통계
- `GET /api/analytics/recommendations/performance` - 추천 성과 분석

## 핵심 기능

1. **QR 스캔 → 추천 조회**: 매장의 QR 코드 스캔 시 다음 장소 추천
2. **실시간 분석**: 사용자 행동 추적 및 성과 측정
3. **위치 기반 검색**: 근처 매장 및 추천 장소 검색
4. **데이터 검증**: 입력 데이터 유효성 검사
5. **에러 처리**: 체계적인 에러 핸들링 및 응답

## 기술 스택

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Package Manager**: pnpm
- **Architecture**: MVC Pattern
- **Validation**: Custom middleware
- **Error Handling**: Centralized error handling

## API 테스트

서버 실행 후 다음 URL에서 API 정보 확인:
- Health Check: `http://localhost:3000/health`
- API 정보: `http://localhost:3000/api`

## pnpm 장점

- **빠른 설치**: 심볼릭 링크를 사용한 효율적인 의존성 관리
- **디스크 절약**: 글로벌 스토어를 통한 중복 제거
- **엄격한 의존성**: phantom dependencies 방지
- **모노레포 지원**: workspace 기능으로 멀티 패키지 관리 최적화