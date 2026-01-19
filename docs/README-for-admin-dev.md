# 어드민 개발자를 위한 S3 이미지 업로드 가이드

## 📋 개요
Spotline 백엔드에 S3 이미지 업로드 기능이 구현되었습니다. 이 문서는 어드민 프론트엔드 개발자가 해당 기능을 통합하는 데 필요한 모든 정보를 제공합니다.

## 🚀 빠른 시작

### 1. 필수 문서 확인
- **API 명세서**: `docs/s3-image-upload-api-spec.md` - 모든 API 엔드포인트와 응답 형식
- **통합 가이드**: `docs/admin-integration-guide.md` - 실제 코드 예시와 React 컴포넌트
- **Postman 컬렉션**: `docs/postman-collection.json` - API 테스트용

### 2. 서버 정보
- **Base URL**: `http://localhost:4002/api` (개발 환경)
- **인증**: Bearer Token (JWT)
- **Content-Type**: `multipart/form-data` (파일 업로드 시)

### 3. 지원 이미지 형식
- **형식**: JPG, PNG, WebP
- **최대 크기**: 5MB
- **최대 갤러리 이미지**: 5개

## 🔑 주요 API 엔드포인트

| 기능 | Method | Endpoint | 설명 |
|------|--------|----------|------|
| 대표 이미지 업로드 | POST | `/admin/stores/:storeId/representative-image` | 상점의 메인 이미지 업로드 |
| 갤러리 이미지 업로드 | POST | `/admin/stores/:storeId/images` | 추가 이미지들 업로드 (최대 5개) |
| 대표 이미지 삭제 | DELETE | `/admin/stores/:storeId/representative-image` | 메인 이미지 삭제 |
| 갤러리 이미지 삭제 | DELETE | `/admin/stores/:storeId/images/:imageKey` | 특정 갤러리 이미지 삭제 |
| 상점 정보 조회 | GET | `/admin/stores/:storeId` | 이미지 URL 포함된 상점 정보 |

## 💡 핵심 구현 포인트

### 1. 인증 헤더
```javascript
const headers = {
  'Authorization': `Bearer ${token}`
};
```

### 2. FormData 사용
```javascript
const formData = new FormData();
formData.append('image', imageFile); // 단일 이미지
formData.append('images', imageFile1); // 다중 이미지
formData.append('images', imageFile2);
```

### 3. 응답 데이터 구조
```javascript
// 성공 응답
{
  "success": true,
  "message": "업로드 성공 메시지",
  "data": {
    "imageKey": "S3 키",
    "imageUrl": "접근 가능한 URL",
    "uploadedAt": "업로드 시간"
  }
}

// 상점 조회 시 이미지 정보
{
  "representativeImage": "S3 키",
  "representativeImageUrl": "접근 가능한 URL",
  "images": ["S3 키1", "S3 키2"],
  "imageUrls": ["URL1", "URL2"]
}
```

## 🧪 테스트 방법

### 1. Postman 사용
1. `docs/postman-collection.json` 파일을 Postman에 import
2. Variables에서 `baseUrl` 확인 (http://localhost:4002/api)
3. "Admin Login" 요청으로 토큰 획득 (자동으로 저장됨)
4. "Get All Stores"로 storeId 획득 (자동으로 저장됨)
5. 이미지 업로드/삭제 테스트 진행

### 2. 브라우저 개발자 도구
```javascript
// 콘솔에서 직접 테스트
const testUpload = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/admin/stores/STORE_ID/representative-image', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer YOUR_TOKEN' },
      body: formData
    });
    
    console.log(await response.json());
  };
  
  input.click();
};

testUpload();
```

## ⚠️ 주의사항

### 1. 파일 검증
- 클라이언트에서 미리 파일 크기와 형식을 검증하세요
- 서버에서도 검증하지만 UX 향상을 위해 클라이언트 검증 필수

### 2. 에러 처리
- 401: 인증 만료 → 로그인 페이지로 리다이렉트
- 400: 파일 형식/크기 오류 → 사용자에게 명확한 메시지 표시
- 500: 서버 오류 → 재시도 옵션 제공

### 3. 이미지 키 처리
- 갤러리 이미지 삭제 시 imageKey를 URL 인코딩해야 함
- `encodeURIComponent(imageKey)` 사용

### 4. 성능 고려사항
- 대용량 이미지는 클라이언트에서 압축 후 업로드
- 업로드 진행률 표시로 UX 개선
- 이미지 미리보기 기능 구현

## 🔧 문제 해결

### 자주 발생하는 오류

1. **CORS 오류**
   - 서버에서 이미 설정됨
   - 로컬 개발 시 `http://localhost:3004` 허용됨

2. **파일 업로드 실패**
   - Content-Type 헤더를 수동으로 설정하지 마세요 (FormData가 자동 설정)
   - 파일 크기 확인 (5MB 제한)

3. **인증 오류**
   - JWT 토큰 만료 확인
   - Bearer 접두사 포함 확인

4. **이미지 URL 접근 불가**
   - S3 버킷 정책 확인 (백엔드 담당자 문의)
   - 이미지 키가 올바른지 확인

## 📞 지원

구현 중 문제가 발생하면 다음 정보와 함께 백엔드 개발자에게 문의:

1. **API 요청 정보**
   - 사용한 엔드포인트
   - 요청 헤더 (토큰 제외)
   - 요청 바디 구조

2. **응답 정보**
   - HTTP 상태 코드
   - 응답 메시지
   - 전체 응답 JSON

3. **환경 정보**
   - 브라우저 종류/버전
   - 파일 크기/형식
   - 콘솔 에러 메시지

## 📚 추가 자료

- [S3 설정 가이드](./s3-setup-guide.md) - AWS S3 버킷 설정 정보
- [백엔드 개발 프롬프트](./s3-image-upload-backend-prompt.md) - 백엔드 구현 상세 내용
- [어드민 프론트엔드 프롬프트](./s3-image-upload-admin-prompt.md) - 프론트엔드 구현 가이드

---

**Happy Coding! 🎉**