# Kiro AI 빠른 참조 가이드

## 🚀 즉시 시작하기

### 1. 서버 정보
- **Base URL**: `http://localhost:4001/api`
- **인증**: `Authorization: Bearer {jwt_token}`
- **로그인**: `POST /admin/auth/login` (username: "admin", password: "admin123")

### 2. 핵심 API 엔드포인트

```javascript
// 1. 관리자 로그인
POST /api/admin/auth/login
Body: { "username": "admin", "password": "admin123" }

// 2. 상점 목록 조회 (storeId 획득용)
GET /api/admin/stores
Headers: { "Authorization": "Bearer {token}" }

// 3. 대표 이미지 업로드
POST /api/admin/stores/{storeId}/representative-image
Headers: { "Authorization": "Bearer {token}" }
Body: FormData { image: File }

// 4. 갤러리 이미지 업로드
POST /api/admin/stores/{storeId}/images
Headers: { "Authorization": "Bearer {token}" }
Body: FormData { images: File[] }

// 5. 이미지 삭제
DELETE /api/admin/stores/{storeId}/representative-image
DELETE /api/admin/stores/{storeId}/images/{encodedImageKey}
Headers: { "Authorization": "Bearer {token}" }
```

### 3. 파일 제약사항
- **형식**: JPG, PNG, WebP만 허용
- **크기**: 최대 5MB
- **갤러리**: 최대 5개 이미지

### 4. 필수 구현 기능
- [ ] 드래그 앤 드롭 업로드
- [ ] 파일 검증 (크기, 형식)
- [ ] 이미지 미리보기
- [ ] 업로드 진행률 표시
- [ ] 에러 처리 및 알림
- [ ] 이미지 삭제 기능

## 💻 핵심 코드 스니펫

### 파일 검증
```javascript
const validateFile = (file) => {
  if (file.size > 5 * 1024 * 1024) throw new Error('5MB 초과');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('JPG, PNG, WebP만 지원');
  }
};
```

### API 호출
```javascript
const uploadImage = async (storeId, file, token) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(`/api/admin/stores/${storeId}/representative-image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  return response.json();
};
```

### 드래그 앤 드롭
```javascript
const handleDrop = (e) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  files.forEach(validateFile);
  uploadFiles(files);
};
```

## 🎯 UI 요구사항

### 레이아웃
1. **대표 이미지 섹션**: 단일 이미지 표시/업로드/삭제
2. **갤러리 섹션**: 썸네일 그리드 (최대 5개)
3. **업로드 영역**: 드래그 앤 드롭 + 파일 선택 버튼
4. **진행률 표시**: 업로드 중 프로그레스 바

### 상태 표시
- 업로드 중: 로딩 스피너 + 진행률
- 성공: 녹색 체크 + 성공 메시지
- 실패: 빨간색 X + 에러 메시지

## 🧪 테스트 체크리스트

### 기본 기능
- [ ] 로그인 후 토큰 획득
- [ ] 상점 목록에서 storeId 선택
- [ ] 대표 이미지 업로드/삭제
- [ ] 갤러리 이미지 업로드/삭제

### 에러 케이스
- [ ] 5MB 초과 파일 업로드 → 에러 메시지
- [ ] 지원하지 않는 형식 → 에러 메시지
- [ ] 6개 이상 갤러리 이미지 → 제한 메시지
- [ ] 토큰 없이 요청 → 401 에러

### UX 테스트
- [ ] 드래그 앤 드롭 동작
- [ ] 업로드 진행률 표시
- [ ] 이미지 미리보기
- [ ] 반응형 디자인

## 🚨 주의사항

1. **FormData 사용**: Content-Type 헤더 수동 설정 금지
2. **이미지 키 인코딩**: 삭제 시 `encodeURIComponent()` 사용
3. **토큰 관리**: 401 응답 시 로그인 페이지 리다이렉트
4. **메모리 관리**: 미리보기 후 URL.revokeObjectURL() 호출

## 📋 응답 데이터 구조

### 업로드 성공
```json
{
  "success": true,
  "message": "업로드 성공",
  "data": {
    "imageKey": "stores/store-123/representative/uuid-filename.jpg",
    "imageUrl": "https://bucket.s3.amazonaws.com/...",
    "uploadedAt": "2026-01-20T10:30:00.000Z"
  }
}
```

### 상점 정보 (이미지 포함)
```json
{
  "success": true,
  "data": {
    "_id": "store-123",
    "name": "카페 스팟라인",
    "representativeImageUrl": "https://...",
    "imageUrls": ["https://...", "https://..."]
  }
}
```

이 가이드로 Spotline 어드민의 이미지 업로드 기능을 빠르게 구현할 수 있습니다!