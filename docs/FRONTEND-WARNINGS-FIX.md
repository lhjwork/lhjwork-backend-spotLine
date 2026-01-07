# 프론트엔드 경고 메시지 해결 가이드

## React Router Future Flag 경고 해결

### 1. v7_startTransition 경고

```
React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early.
```

**해결 방법**: BrowserRouter에 future flag 추가

```jsx
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
      }}
    >
      {/* 앱 컴포넌트들 */}
    </BrowserRouter>
  );
}
```

### 2. v7_relativeSplatPath 경고

```
Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early.
```

**해결 방법**: BrowserRouter에 future flag 추가

```jsx
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {/* 앱 컴포넌트들 */}
    </BrowserRouter>
  );
}
```

## DOM 경고 해결

### 3. Input autocomplete 경고

```
Input elements should have autocomplete attributes (suggested: "current-password")
```

**해결 방법**: 비밀번호 입력 필드에 autocomplete 속성 추가

```jsx
<input
  name="password"
  type="password"
  autoComplete="current-password"
  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
  placeholder="비밀번호"
/>

// 사용자명 입력 필드의 경우
<input
  name="username"
  type="text"
  autoComplete="username"
  className="..."
  placeholder="사용자명"
/>
```

## 리소스 404 오류 해결

### 4. vite.svg 404 오류

```
Failed to load resource: the server responded with a status of 404 (Not Found) vite.svg:1
```

**해결 방법**:

1. `public/vite.svg` 파일이 존재하는지 확인
2. 없다면 파일 생성 또는 HTML에서 해당 참조 제거
3. `index.html`에서 favicon 링크 확인:

```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

## 완전한 수정 예시

```jsx
// App.jsx 또는 main.jsx
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {/* 라우터 설정 */}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// 로그인 폼 컴포넌트
function LoginForm() {
  return (
    <form>
      <input name="username" type="text" autoComplete="username" placeholder="사용자명" />
      <input name="password" type="password" autoComplete="current-password" placeholder="비밀번호" />
    </form>
  );
}
```

## 추가 권장사항

- React Router v6.8+ 사용 시 future flags 적용 권장
- 모든 form input에 적절한 autocomplete 속성 추가
- 개발 도구에서 경고 메시지 정기적으로 확인 및 해결
