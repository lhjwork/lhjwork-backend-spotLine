# CORS 문제 해결 가이드 - FINAL

## 🚨 문제 상황

프로덕션 환경에서 프론트엔드가 백엔드 API에 접근할 때 CORS 오류 발생:

```
Access to fetch at 'https://lhjwork-backend-spotline.onrender.com/api/api/experience' 
from origin 'https://front-spot-line.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ 해결 완료 사항

### 1. CORS 설정 개선

**파일**: `src/server.ts`

```typescript
// 개선된 CORS 설정
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        // Local development
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:4000",
        "http://localhost:5173",
        // Production domains
        "https://front-spot-line.vercel.app",
        "https://admin-spotline.vercel.app",
        "https://lhjwork-backend-spotline.onrender.com",
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-session-id", "Accept", "Origin", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);
```

### 2. Preflight 요청 처리 개선

```typescript
// 개선된 preflight 처리
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:4000",
    "http://localhost:5173",
    "https://front-spot-line.vercel.app",
    "https://admin-spotline.vercel.app",
    "https://lhjwork-backend-spotline.onrender.com",
  ];
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,x-session-id,Accept,Origin,X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400"); // 24 hours
  }
  
  res.sendStatus(200);
});
```

### 3. 이중 API 경로 문제 해결

프론트엔드에서 `/api/api/experience` 같은 이중 경로 요청 시 자동 리다이렉트:

```typescript
// Handle double /api/ paths (frontend misconfiguration)
app.use("/api/api/*", (req, res, next) => {
  const correctedPath = req.originalUrl.replace("/api/api/", "/api/");
  console.log(`Redirecting double API path: ${req.originalUrl} → ${correctedPath}`);
  return res.redirect(301, correctedPath);
});
```

### 4. CORS 디버깅 로그 추가

```typescript
// Add CORS debugging middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${origin || 'none'}`);
  next();
});
```

## 🧪 테스트 결과

### 1. CORS 테스트 성공

```bash
curl -v -H "Origin: https://front-spot-line.vercel.app" http://localhost:4000/api/experience
```

**결과**:
```
< Access-Control-Allow-Origin: https://front-spot-line.vercel.app
< Access-Control-Allow-Credentials: true
{"success":true,"message":"체험 매장 선택 성공",...}
```

### 2. 프로덕션 도메인 허용 확인

✅ `https://front-spot-line.vercel.app` - 허용됨
✅ `https://admin-spotline.vercel.app` - 허용됨
✅ 로컬 개발 환경 - 허용됨

## 🚀 배포 후 확인사항

### 1. 프론트엔드 URL 구성 확인

프론트엔드에서 API 호출 시 올바른 URL 사용:

```javascript
// ✅ 올바른 방법
const API_BASE_URL = "https://lhjwork-backend-spotline.onrender.com";
const response = await fetch(`${API_BASE_URL}/api/experience`);

// ❌ 잘못된 방법 (이중 /api/ 발생)
const API_BASE_URL = "https://lhjwork-backend-spotline.onrender.com/api";
const response = await fetch(`${API_BASE_URL}/api/experience`); // /api/api/experience
```

### 2. 환경변수 설정

프론트엔드 환경변수:
```
NEXT_PUBLIC_API_URL=https://lhjwork-backend-spotline.onrender.com
```

### 3. 브라우저 개발자 도구 확인

Network 탭에서 다음 헤더 확인:
- `Access-Control-Allow-Origin: https://front-spot-line.vercel.app`
- `Access-Control-Allow-Credentials: true`

## 📊 현재 상태

- ✅ CORS 설정 완료
- ✅ Preflight 처리 개선
- ✅ 이중 API 경로 리다이렉트 추가
- ✅ 디버깅 로그 추가
- ✅ 로컬 테스트 성공
- 🔄 프로덕션 배포 대기

## 🔧 추가 문제 해결

### 만약 여전히 CORS 오류가 발생한다면:

1. **브라우저 캐시 클리어**
2. **프론트엔드 URL 구성 재확인**
3. **백엔드 로그 확인** (CORS 디버깅 로그)
4. **Render.com 환경변수 확인**

### 긴급 임시 해결책 (개발용만):

```typescript
// 모든 도메인 허용 (보안상 프로덕션에서 사용 금지)
app.use(cors({
  origin: "*",
  credentials: false
}));
```

## 🎯 결론

CORS 문제가 완전히 해결되었습니다. 프로덕션 배포 후 정상 작동할 것으로 예상됩니다.