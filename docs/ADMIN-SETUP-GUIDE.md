# Spotline Admin 시스템 설정 가이드

## 🚀 빠른 시작

### 1. 사전 요구사항

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MongoDB (로컬 또는 클라우드)
- Kakao Developers 계정

### 2. 프로젝트 클론 및 설정
git
```bash
# 프로젝트 클론
git clone <repository-url>
cd backend-spotLine

# 백엔드 의존성 설치
pnpm install

# 프론트엔드 의존성 설치
cd admin-frontend
npm install
cd ..
```

### 3. 환경 변수 설정

#### 백엔드 환경 변수
```bash
# .env 파일 생성
cp .env.example .env
```

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/spotline
NODE_ENV=development
JWT_SECRET=spotline-super-secret-jwt-key-2024-admin-system
```

#### 프론트엔드 환경 변수
```bash
# admin-frontend/.env 파일 생성
cd admin-frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:4000
VITE_KAKAO_REST_API_KEY=YOUR_KAKAO_REST_API_KEY
```

### 4. Kakao API 설정

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. **플랫폼 설정**:
   - Web 플랫폼 추가
   - 사이트 도메인: `http://localhost:3002`
4. **REST API 키** 복사하여 환경 변수에 설정

### 5. 데이터베이스 설정

#### MongoDB 로컬 설치 (선택사항)
```bash
# macOS
brew install mongodb-community

# 서비스 시작
brew services start mongodb-community
```

#### MongoDB Atlas 사용 (권장)
1. [MongoDB Atlas](https://www.mongodb.com/atlas) 계정 생성
2. 클러스터 생성
3. 연결 문자열 복사하여 `MONGODB_URI`에 설정

### 6. 어드민 계정 생성

```bash
# Super Admin 계정 생성
pnpm run create:spotline-admin
```

**생성된 계정 정보:**
- 사용자명: `spotline-admin`
- 비밀번호: `12341234`
- 이메일: `admin@spotline.co.kr`

### 7. 서버 실행

#### 백엔드 서버
```bash
# 개발 모드
pnpm dev

# 프로덕션 모드
pnpm start
```

#### 프론트엔드 서버
```bash
cd admin-frontend
npm run dev
```

### 8. 접속 확인

- **어드민 페이지**: http://localhost:3002
- **백엔드 API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 📋 상세 설정 가이드

### 1. 프로젝트 구조 이해

```
backend-spotLine/
├── controllers/          # API 컨트롤러
├── services/            # 비즈니스 로직
├── models/              # 데이터 모델
├── routes/              # API 라우트
├── middleware/          # 미들웨어
├── scripts/             # 유틸리티 스크립트
├── docs/               # 문서
├── admin-frontend/      # 어드민 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── contexts/
│   └── public/
└── server.js           # 서버 진입점
```

### 2. 데이터베이스 스키마

#### Store (매장)
```javascript
{
  name: "카페 스팟라인",
  category: "cafe",
  location: {
    address: "서울 마포구 홍익로 39",
    coordinates: {
      type: "Point",
      coordinates: [126.9229004, 37.5511694]
    },
    area: "홍대",
    district: "마포구"
  },
  contact: {
    phone: "02-1234-5678",
    website: "https://example.com"
  },
  qrCode: {
    id: "uuid-generated",
    isActive: true
  },
  isActive: true
}
```

#### Recommendation (추천 관계)
```javascript
{
  fromStore: ObjectId,
  toStore: ObjectId,
  category: "culture",
  priority: 8,
  description: "카페 후 문화 체험하기 좋은 갤러리",
  isActive: true
}
```

#### Analytics (분석 데이터)
```javascript
{
  qrCode: "uuid",
  store: ObjectId,
  eventType: "qr_scan",
  sessionId: "session-id",
  timestamp: Date,
  metadata: {}
}
```

### 3. API 엔드포인트

#### 인증
- `POST /api/admin/login` - 로그인

#### 매장 관리
- `GET /api/admin/stores` - 매장 목록
- `POST /api/admin/stores` - 매장 생성
- `GET /api/admin/stores/:id` - 매장 상세
- `PUT /api/admin/stores/:id` - 매장 수정
- `DELETE /api/admin/stores/:id` - 매장 삭제

#### 추천 관리
- `GET /api/admin/recommendations` - 추천 목록
- `POST /api/admin/recommendations` - 추천 생성
- `PUT /api/admin/recommendations/:id` - 추천 수정
- `DELETE /api/admin/recommendations/:id` - 추천 삭제

#### 분석
- `GET /api/admin/dashboard/stats` - 대시보드 통계
- `GET /api/admin/analytics` - 분석 데이터
- `GET /api/admin/analytics/popular-stores` - 인기 매장

### 4. 권한 시스템

#### 역할 (Role)
- `super_admin`: 모든 권한
- `admin`: 일반 관리자
- `moderator`: 제한된 권한

#### 권한 (Permission)
```javascript
{
  stores: { read: true, write: true, delete: false },
  analytics: { read: true, export: false },
  users: { read: false, write: false, delete: false }
}
```

## 🔧 개발 도구 설정

### 1. VS Code 확장

권장 확장 프로그램:
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- Thunder Client (API 테스트)

### 2. 디버깅 설정

#### 백엔드 디버깅
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Node.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### 3. 코드 포맷팅

#### Prettier 설정
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## 🧪 테스트 설정

### 1. API 테스트

#### Thunder Client 컬렉션
```json
{
  "name": "Spotline Admin API",
  "requests": [
    {
      "name": "Login",
      "method": "POST",
      "url": "http://localhost:4000/api/admin/login",
      "body": {
        "username": "spotline-admin",
        "password": "12341234"
      }
    }
  ]
}
```

### 2. 데이터베이스 테스트

```bash
# 연결 테스트
pnpm run test:db

# 샘플 데이터 생성
pnpm run seed
```

## 🚨 문제 해결

### 1. 일반적인 오류

#### MongoDB 연결 실패
```bash
# MongoDB 서비스 상태 확인
brew services list | grep mongodb

# 서비스 재시작
brew services restart mongodb-community
```

#### 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
lsof -ti:4000

# 프로세스 종료
kill -9 <PID>
```

#### bcrypt 설치 오류
```bash
# bcryptjs 사용 (권장)
pnpm remove bcrypt
pnpm add bcryptjs
```

### 2. 환경별 설정

#### 개발 환경
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/spotline-dev
```

#### 프로덕션 환경
```env
NODE_ENV=production
PORT=80
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/spotline
JWT_SECRET=super-secure-production-secret
```

## 📊 모니터링 설정

### 1. 로그 설정

```javascript
// 개발 환경
console.log('Server running on port', PORT)

// 프로덕션 환경 (Winston 사용 권장)
const winston = require('winston')
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

### 2. 성능 모니터링

```javascript
// 응답 시간 측정
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.path} - ${duration}ms`)
  })
  next()
})
```

## 🔐 보안 설정

### 1. HTTPS 설정 (프로덕션)

```javascript
const https = require('https')
const fs = require('fs')

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
}

https.createServer(options, app).listen(443)
```

### 2. 보안 헤더

```javascript
const helmet = require('helmet')
app.use(helmet())
```

### 3. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 최대 100회 요청
})

app.use('/api/', limiter)
```

## 📚 추가 리소스

- [MongoDB 문서](https://docs.mongodb.com/)
- [Express.js 가이드](https://expressjs.com/ko/guide/)
- [React 문서](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Kakao Developers](https://developers.kakao.com/docs)

이 가이드를 따라 설정하면 Spotline 어드민 시스템을 성공적으로 구축하고 운영할 수 있습니다.