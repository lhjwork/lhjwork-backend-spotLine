# Spotline Admin System

Spotline QR 기반 로컬 연결 서비스의 관리자 시스템입니다.

## 시스템 구성

### 백엔드 (Node.js + Express)
- **어드민 인증**: JWT 기반 로그인 시스템
- **권한 관리**: 역할 기반 접근 제어 (RBAC)
- **대시보드 API**: 실시간 통계 및 분석 데이터
- **매장 관리 API**: 매장 CRUD 및 상태 관리
- **분석 API**: 사용자 행동 분석 및 성과 측정

### 프론트엔드 (Vite + React)
- **대시보드**: 서비스 현황 한눈에 보기
- **매장 관리**: 매장 목록, 검색, 필터링, 상태 변경
- **분석**: 차트와 그래프로 데이터 시각화
- **어드민 관리**: 관리자 계정 생성 및 권한 설정

## 설치 및 실행

### 1. 백엔드 설정

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 JWT_SECRET 등 설정

# Super Admin 계정 생성
pnpm run create:admin

# 서버 실행
pnpm dev
```

### 2. 프론트엔드 설정

```bash
# admin-frontend 폴더로 이동
cd admin-frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env

# 개발 서버 실행
npm run dev
```

## 기본 계정 정보

Super Admin 계정이 자동으로 생성됩니다:
- **사용자명**: admin
- **비밀번호**: admin123!
- **이메일**: admin@spotline.com

## 주요 기능

### 1. 대시보드
- 실시간 서비스 통계
- 매장 현황 및 QR 스캔 수
- 카테고리별 매장 분포
- 최근 활동 로그

### 2. 매장 관리
- 매장 목록 조회 (페이지네이션)
- 검색 및 필터링 (카테고리, 지역, 상태)
- 매장 활성화/비활성화
- 매장 완전 삭제
- 월간 스캔 수 통계

### 3. 분석
- 일별 활동 차트 (QR 스캔, 추천 클릭)
- 인기 매장 순위
- QR 코드 성과 분석
- 추천 시스템 성과 측정
- 데이터 내보내기 (CSV, JSON)

### 4. 어드민 관리 (Super Admin만)
- 새 관리자 계정 생성
- 권한 설정 (매장 관리, 분석 조회 등)
- 로그인 기록 확인

## API 엔드포인트

### 인증
- `POST /api/admin/login` - 로그인

### 대시보드
- `GET /api/admin/dashboard/stats` - 대시보드 통계

### 매장 관리
- `GET /api/admin/stores` - 매장 목록 (페이지네이션)
- `PATCH /api/admin/stores/:id/status` - 매장 상태 변경
- `DELETE /api/admin/stores/:id` - 매장 삭제

### 분석
- `GET /api/admin/analytics` - 분석 데이터
- `GET /api/admin/analytics/popular-stores` - 인기 매장
- `GET /api/admin/analytics/qr-performance` - QR 성과
- `GET /api/admin/analytics/recommendation-performance` - 추천 성과

### 어드민 관리
- `GET /api/admin/admins` - 어드민 목록
- `POST /api/admin/admins` - 어드민 생성
- `PATCH /api/admin/admins/:id/permissions` - 권한 수정

### 데이터 내보내기
- `GET /api/admin/export` - 데이터 내보내기

## 권한 시스템

### 역할 (Role)
- **super_admin**: 모든 권한 보유
- **admin**: 일반 관리자 권한
- **moderator**: 제한된 권한

### 권한 (Permission)
- **stores**: 매장 관리 권한
  - `read`: 조회
  - `write`: 수정
  - `delete`: 삭제
- **analytics**: 분석 권한
  - `read`: 조회
  - `export`: 내보내기
- **users**: 사용자 관리 권한
  - `read`: 조회
  - `write`: 수정
  - `delete`: 삭제

## 보안 기능

- JWT 토큰 기반 인증
- 비밀번호 해싱 (bcrypt)
- 역할 기반 접근 제어
- API 요청 시 권한 검증
- 토큰 만료 시 자동 로그아웃

## 기술 스택

### 백엔드
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcrypt (비밀번호 해싱)

### 프론트엔드
- Vite + React 18
- React Router (라우팅)
- React Query (데이터 페칭)
- React Hook Form (폼 관리)
- Tailwind CSS (스타일링)
- Recharts (차트)
- Lucide React (아이콘)

## 개발 가이드

### 새로운 API 추가
1. `controllers/adminController.js`에 컨트롤러 메서드 추가
2. `services/adminService.js`에 비즈니스 로직 추가
3. `routes/admin.js`에 라우트 등록
4. 필요시 권한 미들웨어 적용

### 새로운 페이지 추가
1. `admin-frontend/src/pages/`에 컴포넌트 생성
2. `App.jsx`에 라우트 추가
3. `Layout.jsx`에 네비게이션 메뉴 추가
4. `services/api.js`에 API 함수 추가

### 권한 추가
1. `models/Admin.js`에서 permissions 스키마 수정
2. `middleware/adminAuth.js`에서 권한 검증 로직 추가
3. 프론트엔드에서 권한에 따른 UI 조건부 렌더링

## 배포

### 백엔드 배포
```bash
# 프로덕션 빌드
pnpm install --production

# 환경 변수 설정
export NODE_ENV=production
export JWT_SECRET=your-production-secret

# 서버 실행
pnpm start
```

### 프론트엔드 배포
```bash
cd admin-frontend

# 프로덕션 빌드
npm run build

# dist 폴더를 웹 서버에 배포
```

## 모니터링

- 실시간 대시보드로 서비스 상태 모니터링
- 에러 로그 및 성능 지표 추적
- 사용자 행동 분석을 통한 서비스 개선

## 문제 해결

### 로그인 실패
- JWT_SECRET 환경 변수 확인
- MongoDB 연결 상태 확인
- 계정 활성화 상태 확인

### 권한 오류
- 사용자 역할 및 권한 설정 확인
- 토큰 유효성 검증
- API 엔드포인트 권한 설정 확인

### 데이터 로딩 실패
- 백엔드 서버 상태 확인
- API 엔드포인트 응답 확인
- 네트워크 연결 상태 확인