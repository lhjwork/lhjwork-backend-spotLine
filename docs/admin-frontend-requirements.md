# SpotLine 관리자 페이지 프론트엔드 요구사항

## 📋 개요

SpotLine 관리자 페이지(`http://localhost:3004/admins`)를 위한 백엔드 API 연동 가이드입니다.

## 🔐 인증 정보

### 관리자 계정
- **Username**: `spotline-admin`
- **Password**: `admin123`
- **Email**: `admin@spotline.co.kr`
- **Role**: `super_admin`

### API 베이스 URL
- **개발 환경**: `http://localhost:4000/api`
- **프로덕션**: `https://lhjwork-backend-spotline.onrender.com/api`

## 🚀 주요 API 엔드포인트

### 1. 관리자 인증

#### 로그인
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "spotline-admin",
  "password": "admin123"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "admin": {
      "id": "695e539458b2929f55f353e1",
      "username": "spotline-admin",
      "email": "admin@spotline.co.kr",
      "role": "super_admin",
      "lastLogin": "2026-01-11T06:06:34.527Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

#### 토큰 검증
```http
GET /api/admin/verify
Authorization: Bearer {token}
```

### 2. 관리자 목록 관리

#### 관리자 목록 조회
```http
GET /api/admin/list?page=1&limit=20&role=admin&isActive=true
Authorization: Bearer {token}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "관리자 목록 조회 성공",
  "data": {
    "admins": [
      {
        "_id": "695e539458b2929f55f353e1",
        "username": "spotline-admin",
        "email": "admin@spotline.co.kr",
        "role": "super_admin",
        "isActive": true,
        "createdAt": "2026-01-07T12:37:40.368Z",
        "lastLogin": "2026-01-11T06:06:34.527Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### 새 관리자 생성
```http
POST /api/admin/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "new-admin",
  "email": "newadmin@spotline.co.kr",
  "password": "password123",
  "role": "admin"
}
```

#### 관리자 권한 업데이트
```http
PATCH /api/admin/{adminId}/permissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "super_admin",
  "isActive": false
}
```

### 3. 관리자 프로필

#### 프로필 조회
```http
GET /api/admin/profile
Authorization: Bearer {token}
```

## 🎨 프론트엔드 구현 가이드

### 1. 인증 상태 관리

```javascript
// 로그인 함수
async function login(username, password) {
  try {
    const response = await fetch('http://localhost:4000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 토큰 저장
      localStorage.setItem('adminToken', result.data.token);
      localStorage.setItem('adminInfo', JSON.stringify(result.data.admin));
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
}

// 인증된 API 요청 함수
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (response.status === 401) {
    // 토큰 만료 시 로그아웃 처리
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    window.location.href = '/login';
    return;
  }
  
  return response.json();
}
```

### 2. 관리자 목록 컴포넌트

```javascript
// 관리자 목록 조회
async function fetchAdminList(page = 1, filters = {}) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '20',
    ...filters
  });
  
  try {
    const result = await authenticatedFetch(
      `http://localhost:4000/api/admin/list?${queryParams}`
    );
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('관리자 목록 조회 실패:', error);
    throw error;
  }
}

// 새 관리자 생성
async function createAdmin(adminData) {
  try {
    const result = await authenticatedFetch('http://localhost:4000/api/admin/create', {
      method: 'POST',
      body: JSON.stringify(adminData)
    });
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('관리자 생성 실패:', error);
    throw error;
  }
}

// 관리자 권한 업데이트
async function updateAdminPermissions(adminId, permissions) {
  try {
    const result = await authenticatedFetch(
      `http://localhost:4000/api/admin/${adminId}/permissions`,
      {
        method: 'PATCH',
        body: JSON.stringify(permissions)
      }
    );
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('권한 업데이트 실패:', error);
    throw error;
  }
}
```

### 3. UI 컴포넌트 구조

```html
<!-- 관리자 목록 페이지 -->
<div class="admin-list-container">
  <!-- 헤더 -->
  <div class="admin-header">
    <h1>관리자 관리</h1>
    <button class="btn-create-admin">새 관리자 추가</button>
  </div>
  
  <!-- 필터 -->
  <div class="admin-filters">
    <select id="roleFilter">
      <option value="">모든 역할</option>
      <option value="admin">관리자</option>
      <option value="super_admin">슈퍼 관리자</option>
    </select>
    
    <select id="statusFilter">
      <option value="">모든 상태</option>
      <option value="true">활성</option>
      <option value="false">비활성</option>
    </select>
  </div>
  
  <!-- 관리자 목록 테이블 -->
  <table class="admin-table">
    <thead>
      <tr>
        <th>사용자명</th>
        <th>이메일</th>
        <th>역할</th>
        <th>상태</th>
        <th>마지막 로그인</th>
        <th>생성일</th>
        <th>작업</th>
      </tr>
    </thead>
    <tbody id="adminTableBody">
      <!-- 동적으로 생성 -->
    </tbody>
  </table>
  
  <!-- 페이지네이션 -->
  <div class="pagination" id="adminPagination">
    <!-- 동적으로 생성 -->
  </div>
</div>

<!-- 관리자 생성/수정 모달 -->
<div class="modal" id="adminModal">
  <div class="modal-content">
    <h2 id="modalTitle">새 관리자 추가</h2>
    <form id="adminForm">
      <input type="text" name="username" placeholder="사용자명" required>
      <input type="email" name="email" placeholder="이메일 (@spotline.co.kr)" required>
      <input type="password" name="password" placeholder="비밀번호" required>
      <select name="role">
        <option value="admin">관리자</option>
        <option value="super_admin">슈퍼 관리자</option>
      </select>
      <div class="modal-actions">
        <button type="button" class="btn-cancel">취소</button>
        <button type="submit" class="btn-save">저장</button>
      </div>
    </form>
  </div>
</div>
```

## 🔒 보안 고려사항

### 1. 토큰 관리
- JWT 토큰은 24시간 유효
- 토큰 만료 시 자동 로그아웃 처리
- 로그아웃 시 토큰 삭제

### 2. 권한 검증
- `super_admin`만 다른 관리자 관리 가능
- 자기 자신의 권한은 변경 불가
- 이메일은 `@spotline.co.kr` 또는 `@spotline.com` 도메인만 허용

### 3. 입력 검증
- 사용자명: 3-50자, 고유값
- 비밀번호: 최소 6자
- 이메일: 유효한 형식 + 도메인 검증

## 🎯 추가 기능 제안

### 1. 실시간 업데이트
- WebSocket 또는 Server-Sent Events로 실시간 관리자 상태 업데이트

### 2. 활동 로그
- 관리자별 로그인 기록, 작업 이력 추적

### 3. 대시보드 통계
- 전체 관리자 수, 활성 관리자 수, 최근 로그인 통계

### 4. 보안 강화
- 2FA (Two-Factor Authentication) 지원
- 비밀번호 정책 강화
- 로그인 시도 제한

## 🐛 문제 해결

### 1. CORS 오류
프론트엔드가 다른 포트에서 실행되는 경우, 백엔드 CORS 설정에 포트 추가 필요:

```javascript
// src/server.ts의 CORS 설정에 추가
const allowedOrigins = [
  "http://localhost:3004", // 관리자 페이지 포트 추가
  // ... 기존 포트들
];
```

### 2. 인증 실패
- 토큰이 올바르게 헤더에 포함되었는지 확인
- 토큰 만료 여부 확인
- 네트워크 요청 상태 코드 확인

### 3. 데이터 로딩 실패
- API 응답 형식 확인
- 에러 메시지 로깅
- 네트워크 연결 상태 확인

## 📞 지원

문제가 발생하거나 추가 기능이 필요한 경우:
1. 백엔드 로그 확인 (`pnpm run dev` 실행 중인 터미널)
2. 브라우저 개발자 도구 네트워크 탭 확인
3. API 문서 참조: `http://localhost:4000/api-docs`

---

이 문서를 참고하여 관리자 페이지를 구현하시면 됩니다. 추가 질문이나 도움이 필요하시면 언제든 말씀해주세요!