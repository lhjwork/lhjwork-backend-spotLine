# Kiro AI를 위한 어드민 프론트엔드 개발 프롬프트

## 🎯 개발 목표
Spotline 어드민 패널에 S3 이미지 업로드 기능을 구현해주세요. 상점 등록/수정 시 이미지를 업로드하고 관리할 수 있는 UI를 만들어야 합니다.

## 📋 요구사항 요약

### 핵심 기능
1. **대표 이미지 업로드**: 상점당 1개의 메인 이미지
2. **갤러리 이미지 업로드**: 최대 5개의 추가 이미지
3. **이미지 삭제**: 개별 이미지 삭제 기능
4. **드래그 앤 드롭**: 직관적인 파일 업로드 UX
5. **미리보기**: 업로드 전/후 이미지 미리보기
6. **진행률 표시**: 업로드 진행 상황 표시

### 기술 제약사항
- **지원 형식**: JPG, PNG, WebP만 허용
- **파일 크기**: 최대 5MB
- **갤러리 제한**: 최대 5개 이미지
- **인증**: JWT Bearer 토큰 필요

## 🔌 API 정보

### Base URL
```
http://localhost:4001/api
```

### 인증 헤더
```javascript
{
  "Authorization": "Bearer {jwt_token}"
}
```

### 주요 엔드포인트

#### 1. 대표 이미지 업로드
```
POST /admin/stores/{storeId}/representative-image
Content-Type: multipart/form-data
Body: { image: File }
```

#### 2. 갤러리 이미지 업로드
```
POST /admin/stores/{storeId}/images
Content-Type: multipart/form-data
Body: { images: File[] } // 최대 5개
```

#### 3. 이미지 삭제
```
DELETE /admin/stores/{storeId}/representative-image
DELETE /admin/stores/{storeId}/images/{encodedImageKey}
```

#### 4. 상점 정보 조회 (이미지 URL 포함)
```
GET /admin/stores/{storeId}
```

### 응답 형식
```javascript
// 성공 응답
{
  "success": true,
  "message": "업로드 성공",
  "data": {
    "imageKey": "stores/store-123/representative/uuid-filename.jpg",
    "imageUrl": "https://bucket.s3.amazonaws.com/stores/store-123/representative/uuid-filename.jpg",
    "uploadedAt": "2026-01-20T10:30:00.000Z"
  }
}

// 상점 조회 응답 (이미지 정보 포함)
{
  "success": true,
  "data": {
    "_id": "store-123",
    "name": "카페 스팟라인",
    "representativeImage": "stores/store-123/representative/uuid-filename.jpg",
    "representativeImageUrl": "https://bucket.s3.amazonaws.com/...",
    "images": ["stores/store-123/gallery/uuid-filename1.jpg"],
    "imageUrls": ["https://bucket.s3.amazonaws.com/..."]
  }
}
```

## 🎨 UI/UX 요구사항

### 1. 이미지 업로드 영역
- 드래그 앤 드롭 지원
- 클릭하여 파일 선택
- 업로드 가능한 형식 안내 표시
- 파일 크기 제한 안내

### 2. 대표 이미지 섹션
- 현재 대표 이미지 표시
- 교체/삭제 버튼
- 업로드 진행률 표시

### 3. 갤러리 이미지 섹션
- 썸네일 그리드 레이아웃
- 개별 삭제 버튼
- 이미지 순서 변경 (선택사항)
- 최대 5개 제한 표시

### 4. 에러 처리 UI
- 파일 형식 오류 메시지
- 파일 크기 초과 메시지
- 네트워크 오류 처리
- 성공/실패 토스트 알림

## 💻 구현 가이드

### 파일 검증 함수
```javascript
const validateFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (file.size > maxSize) {
    throw new Error('파일 크기가 5MB를 초과합니다.');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('JPG, PNG, WebP 형식만 지원합니다.');
  }
  
  return true;
};
```

### API 호출 함수
```javascript
const uploadRepresentativeImage = async (storeId, imageFile, token) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`/api/admin/stores/${storeId}/representative-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  return result.data;
};

const uploadGalleryImages = async (storeId, imageFiles, token) => {
  const formData = new FormData();
  imageFiles.forEach(file => {
    formData.append('images', file);
  });

  const response = await fetch(`/api/admin/stores/${storeId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  return result.data;
};

const deleteImage = async (storeId, imageKey, token, isRepresentative = false) => {
  const endpoint = isRepresentative 
    ? `/api/admin/stores/${storeId}/representative-image`
    : `/api/admin/stores/${storeId}/images/${encodeURIComponent(imageKey)}`;

  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  return true;
};
```

## 🧪 테스트 시나리오

### 필수 테스트 케이스
1. **정상 업로드**: JPG, PNG, WebP 파일 업로드 성공
2. **파일 크기 제한**: 5MB 초과 파일 업로드 시 에러 표시
3. **파일 형식 제한**: 지원하지 않는 형식 업로드 시 에러 표시
4. **갤러리 제한**: 5개 초과 업로드 시 제한 메시지
5. **이미지 삭제**: 대표 이미지 및 갤러리 이미지 삭제
6. **인증 오류**: 토큰 없이 요청 시 401 에러 처리
7. **네트워크 오류**: 서버 연결 실패 시 에러 처리

### 테스트 데이터
- **로그인 정보**: username: "admin", password: "admin123"
- **테스트 이미지**: 다양한 크기와 형식의 이미지 파일 준비
- **서버 URL**: http://localhost:4002/api

## 🎯 구현 우선순위

### Phase 1 (필수)
1. 기본 파일 업로드 UI
2. 대표 이미지 업로드/삭제
3. 파일 검증 및 에러 처리
4. 기본 미리보기 기능

### Phase 2 (권장)
1. 갤러리 이미지 업로드/삭제
2. 드래그 앤 드롭 기능
3. 업로드 진행률 표시
4. 향상된 UI/UX

### Phase 3 (선택)
1. 이미지 크롭 기능
2. 클라이언트 사이드 압축
3. 이미지 순서 변경
4. 썸네일 최적화

## 🚨 주의사항

### 보안
- JWT 토큰을 안전하게 저장하고 전송
- 파일 업로드 시 클라이언트 검증 필수
- XSS 방지를 위한 이미지 URL 검증

### 성능
- 대용량 이미지 업로드 시 진행률 표시
- 이미지 미리보기 시 메모리 관리
- 불필요한 API 호출 방지

### 사용성
- 명확한 에러 메시지 제공
- 업로드 상태 시각적 피드백
- 모바일 친화적 인터페이스

## 📞 문제 해결

### 자주 발생하는 이슈
1. **CORS 오류**: 서버에서 이미 설정됨, 로컬 개발 시 자동 허용
2. **FormData 오류**: Content-Type 헤더를 수동 설정하지 말 것
3. **토큰 만료**: 401 응답 시 로그인 페이지로 리다이렉트
4. **파일 크기**: 브라우저와 서버 양쪽에서 제한 확인

### 디버깅 팁
- 브라우저 개발자 도구 Network 탭에서 요청/응답 확인
- 콘솔에서 FormData 내용 확인: `console.log([...formData.entries()])`
- 서버 응답의 success 필드로 성공/실패 판단

## 🎉 완료 기준

다음 기능이 모두 동작하면 구현 완료:
- [ ] 대표 이미지 업로드/교체/삭제
- [ ] 갤러리 이미지 업로드/삭제 (최대 5개)
- [ ] 파일 형식/크기 검증 및 에러 표시
- [ ] 드래그 앤 드롭 업로드
- [ ] 업로드 진행률 표시
- [ ] 이미지 미리보기
- [ ] 반응형 디자인
- [ ] 에러 처리 및 사용자 피드백

이 프롬프트를 바탕으로 Spotline 어드민 패널의 이미지 업로드 기능을 구현해주세요!