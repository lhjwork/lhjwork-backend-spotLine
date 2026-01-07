# CORS 문제 해결 가이드

## 문제 상황

프론트엔드에서 `credentials: 'include'` 모드로 API 요청 시 CORS 오류 발생:

```
Access to XMLHttpRequest at 'http://localhost:4000/api/admin/login' from origin 'http://localhost:3003' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

## 해결 방법

### 1. 백엔드 CORS 설정 수정 (완료)

`src/server.ts`에서 CORS 설정을 다음과 같이 수정:

```typescript
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
  })
);
```

### 2. 프론트엔드 요청 설정

프론트엔드에서 API 요청 시 다음과 같이 설정:

```javascript
// fetch 사용 시
fetch("http://localhost:4000/api/admin/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // 쿠키 포함
  body: JSON.stringify({
    username: "spotline-admin",
    password: "12341234",
  }),
});

// axios 사용 시
axios.post(
  "http://localhost:4000/api/admin/login",
  {
    username: "spotline-admin",
    password: "12341234",
  },
  {
    withCredentials: true, // 쿠키 포함
  }
);
```

### 3. 표준 관리자 계정

- **Username**: `spotline-admin`
- **Password**: `12341234`

## 테스트 결과

✅ CORS 설정 적용 완료
✅ `Access-Control-Allow-Credentials: true` 헤더 포함
✅ Admin 로그인 API 정상 작동 (200 OK)
✅ JWT 토큰 정상 발급

## 추가 참고사항

- 프로덕션 환경에서는 `origin` 배열에 실제 도메인 추가 필요
- 보안을 위해 필요한 origin만 허용하는 것이 좋음
- `credentials: true` 설정 시 반드시 구체적인 origin 지정 필요 (와일드카드 \* 사용 불가)
