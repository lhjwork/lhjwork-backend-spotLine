# 🤖 Kiro AI 전달 패키지

## 📦 개요
Spotline 어드민 패널에 S3 이미지 업로드 기능을 구현해주세요. 백엔드 API는 완전히 구현되어 있으며, 프론트엔드 UI만 개발하면 됩니다.

## 🎯 핵심 미션
**상점 등록/수정 시 이미지를 업로드하고 관리할 수 있는 직관적인 UI를 만들어주세요.**

## 📚 필수 문서 (읽는 순서대로)

### 1️⃣ 시작 가이드 (가장 먼저 읽기)
- **`kiro-admin-development-prompt.md`** - 전체 개발 요구사항과 구현 가이드
- **`kiro-quick-reference.md`** - 핵심 API와 코드 스니펫

### 2️⃣ 상세 참조 자료
- **`s3-image-upload-api-spec.md`** - 완전한 API 명세서
- **`admin-integration-guide.md`** - React 컴포넌트 예시와 실제 코드

### 3️⃣ 테스트 도구
- **`kiro-testing-guide.md`** - 체계적인 테스트 방법
- **`postman-collection.json`** - API 테스트용 Postman 컬렉션

## ⚡ 빠른 시작

### 서버 정보
```
Base URL: http://localhost:4002/api
로그인: POST /admin/auth/login
- username: "admin"
- password: "admin123"
```

### 핵심 API
```javascript
// 1. 로그인 → 토큰 획득
// 2. 상점 목록 조회 → storeId 획득
// 3. 이미지 업로드
POST /admin/stores/{storeId}/representative-image  // 대표 이미지
POST /admin/stores/{storeId}/images               // 갤러리 이미지 (최대 5개)
// 4. 이미지 삭제
DELETE /admin/stores/{storeId}/representative-image
DELETE /admin/stores/{storeId}/images/{imageKey}
```

### 파일 제약
- **형식**: JPG, PNG, WebP만
- **크기**: 최대 5MB
- **갤러리**: 최대 5개

## 🎨 구현해야 할 UI

### 필수 기능 ✅
- [ ] **드래그 앤 드롭** 파일 업로드
- [ ] **대표 이미지** 업로드/교체/삭제
- [ ] **갤러리 이미지** 업로드/삭제 (최대 5개)
- [ ] **파일 검증** (크기, 형식) 및 에러 메시지
- [ ] **업로드 진행률** 표시
- [ ] **이미지 미리보기**
- [ ] **반응형 디자인**

### 권장 기능 🌟
- [ ] 이미지 크롭 기능
- [ ] 클라이언트 사이드 압축
- [ ] 이미지 순서 변경
- [ ] 썸네일 최적화

## 🧪 테스트 체크리스트

### 기본 동작
- [ ] 로그인 후 토큰 획득
- [ ] 대표 이미지 업로드/삭제
- [ ] 갤러리 이미지 업로드/삭제
- [ ] 드래그 앤 드롭 동작

### 에러 처리
- [ ] 5MB 초과 파일 → 에러 메시지
- [ ] 지원하지 않는 형식 → 에러 메시지
- [ ] 6개 이상 갤러리 → 제한 메시지
- [ ] 네트워크 오류 처리

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

## 🚨 중요 주의사항

1. **FormData 사용 시**: Content-Type 헤더를 수동으로 설정하지 마세요
2. **이미지 삭제 시**: imageKey를 `encodeURIComponent()`로 인코딩하세요
3. **토큰 관리**: 401 응답 시 로그인 페이지로 리다이렉트하세요
4. **메모리 관리**: 미리보기 후 `URL.revokeObjectURL()` 호출하세요

## 🎯 완료 기준

다음 시나리오가 모두 동작하면 완료:

1. **기본 플로우**: 로그인 → 상점 선택 → 이미지 업로드 → 미리보기 확인
2. **에러 처리**: 큰 파일 업로드 시 에러 메시지 표시
3. **삭제 기능**: 업로드된 이미지 개별 삭제
4. **UX**: 드래그 앤 드롭으로 직관적 업로드

## 📞 지원

구현 중 문제 발생 시:
1. `kiro-testing-guide.md`의 디버깅 섹션 참조
2. 브라우저 개발자 도구 Network 탭에서 API 요청/응답 확인
3. 콘솔 에러 메시지와 함께 문의

---

**🚀 이제 시작하세요! 모든 필요한 정보가 준비되어 있습니다.**

**우선순위**: `kiro-admin-development-prompt.md` → `kiro-quick-reference.md` → 구현 시작!