# CORS 문제 해결 가이드

## 문제 상황
프로덕션 환경에서 CORS 오류가 발생하여 프론트엔드에서 백엔드 API에 접근할 수 없는 상황

### 오류 메시지
```
Access to fetch at 'https://lhjwork-backend-spotline.onrender.com/api/api/experience' 
from origin 'https://front-spot-line.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 해결 방법

### 1. CORS 설정 업데이트 (src/server.ts)

```typescript
app.use(
  cors({
    origin: [
      // Local development
      "http://localhost:3000", 
      "http://localhost:3001", 
      "http://localhost:3002", 
      "http://localhost:3003", 
      "http://localhost:4000",
      "http://localhost:5173",
      // Production domains
      "https://front-spot-line.vercel.app",
      "https://admin-spotline.vercel.app",  // 추가된 어드민 도메인
      "https://lhjwork-backend-spotline.onrender.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "x-session-id",
      "Accept",
      "Origin",
      "X-Requested-With"
    ],
    preflightContinue: false,
    optionsSuccessStatus: 200
  })
);
```

### 2. Preflight 요청 처리

```typescript
// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-session-id,Accept,Origin,X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});
```

## 주요 변경사항

1. **어드민 도메인 추가**: `https://admin-spotline.vercel.app` 추가
2. **로컬 개발 포트 추가**: `http://localhost:4000` 추가
3. **모든 필요한 HTTP 메서드 허용**: GET, POST, PUT, DELETE, OPTIONS, PATCH
4. **필요한 헤더 모두 허용**: Content-Type, Authorization, x-session-id 등

## 프론트엔드 URL 중복 문제

오류 로그에서 `/api/api/experience`로 요청이 가는 것을 확인했습니다. 
이는 프론트엔드에서 base URL에 이미 `/api`가 포함되어 있는데 
추가로 `/api/experience`를 붙여서 발생하는 문제입니다.

### 프론트엔드 수정 필요사항
- base URL: `https://lhjwork-backend-spotline.onrender.com`
- API 경로: `/api/experience` (올바름)
- 최종 URL: `https://lhjwork-backend-spotline.onrender.com/api/experience`

## 배포 후 확인사항

1. **CORS 헤더 확인**
   ```bash
   curl -H "Origin: https://front-spot-line.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://lhjwork-backend-spotline.onrender.com/api/experience
   ```

2. **실제 API 요청 테스트**
   ```bash
   curl -H "Origin: https://front-spot-line.vercel.app" \
        https://lhjwork-backend-spotline.onrender.com/api/experience
   ```

## 추가 도메인 추가 방법

새로운 프론트엔드 도메인이 생기면 `src/server.ts`의 `origin` 배열에 추가:

```typescript
origin: [
  // 기존 도메인들...
  "https://새로운-도메인.vercel.app"  // 새 도메인 추가
]
```

## 보안 고려사항

- 프로덕션에서는 와일드카드(`*`) 사용 금지
- 실제 사용하는 도메인만 허용 목록에 추가
- credentials: true 사용 시 origin을 명시적으로 지정 필요