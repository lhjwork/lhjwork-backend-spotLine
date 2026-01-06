# Spotline Backend (TypeScript)

QR 기반 로컬 연결 서비스 백엔드 API - TypeScript, Node.js, MongoDB, Mongoose 스펙

## 🚀 기술 스택

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Package Manager**: pnpm
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI 3.0

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.example`을 참고하여 `.env` 파일을 생성하고 설정:

```env
PORT=4000
MONGODB_URI=your-mongodb-connection-string
NODE_ENV=development
JWT_SECRET=your-jwt-secret
```

### 3. TypeScript 빌드

```bash
pnpm run build
```

### 4. 서버 실행

#### 개발 모드 (TypeScript 직접 실행)

```bash
pnpm run dev
```

#### 프로덕션 모드 (빌드된 JavaScript 실행)

```bash
pnpm start
```

#### 개발 모드 (파일 변경 감지)

```bash
pnpm run dev:watch
```

## 🔧 주요 스크립트

- `pnpm run build` - TypeScript 컴파일
- `pnpm start` - 프로덕션 서버 실행
- `pnpm run dev` - 개발 서버 실행
- `pnpm run dev:watch` - 파일 변경 감지 개발 서버
- `pnpm run test:db` - 데이터베이스 연결 테스트
- `pnpm run type-check` - TypeScript 타입 검사

## 📁 프로젝트 구조

```
src/
├── config/          # 설정 파일 (Swagger 등)
├── controllers/     # 컨트롤러 (비즈니스 로직)
├── middleware/      # 미들웨어 (인증, 에러 처리)
├── models/          # MongoDB 모델 (Mongoose)
├── routes/          # API 라우트
├── services/        # 서비스 레이어
├── types/           # TypeScript 타입 정의
├── utils/           # 유틸리티 함수
└── server.ts        # 메인 서버 파일

dist/                # 빌드된 JavaScript 파일
```

## 🌐 API 엔드포인트

### 기본 정보

- **Base URL**: `http://localhost:4000`
- **API 문서**: `http://localhost:4000/api-docs`
- **Health Check**: `http://localhost:4000/health`

### 주요 엔드포인트

- `GET /api/stores` - 매장 목록 조회
- `GET /api/recommendations` - 추천 목록 조회
- `GET /api/analytics` - 분석 데이터 조회
- `POST /api/admin/login` - 관리자 로그인
- `GET /api/geocoding/naver` - 네이버 지오코딩

## 🔐 인증

JWT 토큰 기반 인증을 사용합니다.

```bash
# 로그인 후 받은 토큰을 헤더에 포함
Authorization: Bearer <your-jwt-token>
```

## 🗄️ 데이터베이스

MongoDB를 사용하며, Mongoose ODM으로 스키마를 관리합니다.

### 주요 컬렉션

- `stores` - 매장 정보
- `recommendations` - 추천 데이터
- `analytics` - 분석 데이터
- `admins` - 관리자 계정

## 🔧 개발 환경 설정

### TypeScript 설정

- 타겟: ES2020
- 모듈: CommonJS
- Strict 모드 활성화
- 경로 별칭: `@/*` → `src/*`

### 코드 품질

- TypeScript strict 모드
- 타입 검사: `pnpm run type-check`

## 🚀 배포

### 빌드 및 실행

```bash
# 1. 빌드
pnpm run build

# 2. 프로덕션 실행
pnpm start
```

### 환경 변수 (프로덕션)

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-jwt-secret
```

## 📊 모니터링

- Health Check: `GET /health`
- API 상태: `GET /api`
- 데이터베이스 연결 테스트: `pnpm run test:db`

## 🔍 문제 해결

### 일반적인 문제

1. **모듈을 찾을 수 없음 오류**

   ```bash
   pnpm run build  # TypeScript 컴파일 확인
   ```

2. **MongoDB 연결 실패**

   ```bash
   pnpm run test:db  # 연결 테스트
   ```

3. **포트 충돌**
   - `.env` 파일에서 `PORT` 변경

### 로그 확인

서버 실행 시 콘솔에서 다음 메시지 확인:

- `MongoDB 연결 성공`
- `Spotline 서버가 포트 4000에서 실행 중입니다 (TypeScript)`

## 📝 라이선스

MIT License

---

**Spotline v2.0.0-ts** - TypeScript로 완전히 재구성된 안정적인 백엔드 API
