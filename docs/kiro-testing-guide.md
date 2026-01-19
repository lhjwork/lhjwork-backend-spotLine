# Kiro AI 테스트 가이드

## 🧪 API 테스트 순서

### 1단계: 서버 연결 확인
```bash
curl http://localhost:4002/api
```
응답: 서버 정보 JSON

### 2단계: 관리자 로그인
```bash
curl -X POST http://localhost:4002/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```
응답에서 `data.token` 값을 복사하여 저장

### 3단계: 상점 목록 조회
```bash
curl -X GET http://localhost:4002/api/admin/stores \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
응답에서 `data.stores[0]._id` 값을 복사하여 storeId로 사용

### 4단계: 이미지 업로드 테스트
```bash
# 대표 이미지 업로드
curl -X POST http://localhost:4002/api/admin/stores/STORE_ID/representative-image \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@/path/to/your/image.jpg"

# 갤러리 이미지 업로드
curl -X POST http://localhost:4002/api/admin/stores/STORE_ID/images \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### 5단계: 상점 정보 확인 (이미지 URL 포함)
```bash
curl -X GET http://localhost:4002/api/admin/stores/STORE_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
응답에서 `representativeImageUrl`, `imageUrls` 확인

## 🌐 브라우저 테스트

### JavaScript 콘솔에서 테스트
```javascript
// 1. 로그인 테스트
const login = async () => {
  const response = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const result = await response.json();
  console.log('Token:', result.data.token);
  return result.data.token;
};

// 2. 파일 업로드 테스트
const testUpload = async (token, storeId) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`/api/admin/stores/${storeId}/representative-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const result = await response.json();
    console.log('Upload result:', result);
  };
  
  input.click();
};

// 사용법
const token = await login();
const storeId = 'YOUR_STORE_ID'; // 상점 목록에서 획득
await testUpload(token, storeId);
```

## 📋 테스트 체크리스트

### ✅ 기본 기능 테스트
- [ ] 서버 연결 확인 (GET /)
- [ ] 관리자 로그인 성공
- [ ] JWT 토큰 획득
- [ ] 상점 목록 조회
- [ ] 대표 이미지 업로드
- [ ] 갤러리 이미지 업로드 (다중)
- [ ] 이미지 삭제 (대표/갤러리)
- [ ] 상점 정보에 이미지 URL 포함 확인

### ⚠️ 에러 케이스 테스트
- [ ] 잘못된 로그인 정보 → 401 에러
- [ ] 토큰 없이 API 호출 → 401 에러
- [ ] 5MB 초과 파일 업로드 → 400 에러
- [ ] 지원하지 않는 파일 형식 → 400 에러
- [ ] 존재하지 않는 상점 ID → 404 에러
- [ ] 6개 이상 갤러리 이미지 → 400 에러

### 🎨 UI/UX 테스트
- [ ] 드래그 앤 드롭 동작
- [ ] 파일 선택 버튼 동작
- [ ] 업로드 진행률 표시
- [ ] 이미지 미리보기
- [ ] 에러 메시지 표시
- [ ] 성공 알림 표시
- [ ] 반응형 디자인 (모바일/태블릿)

## 🔍 디버깅 가이드

### 네트워크 탭에서 확인할 것
1. **요청 URL**: 올바른 엔드포인트인지
2. **요청 헤더**: Authorization 헤더 포함 여부
3. **요청 바디**: FormData 구조 확인
4. **응답 상태**: 200, 400, 401, 500 등
5. **응답 바디**: success 필드와 에러 메시지

### 자주 발생하는 문제
1. **CORS 오류**: 서버에서 이미 해결됨, 새로고침 시도
2. **401 Unauthorized**: 토큰 만료 또는 누락
3. **400 Bad Request**: 파일 크기/형식 문제
4. **FormData 오류**: Content-Type 헤더 수동 설정 시

### 콘솔 디버깅 코드
```javascript
// FormData 내용 확인
const formData = new FormData();
formData.append('image', file);
console.log('FormData entries:', [...formData.entries()]);

// 파일 정보 확인
console.log('File info:', {
  name: file.name,
  size: file.size,
  type: file.type,
  lastModified: file.lastModified
});

// API 응답 상세 확인
const response = await fetch(url, options);
console.log('Response status:', response.status);
console.log('Response headers:', [...response.headers.entries()]);
const result = await response.json();
console.log('Response body:', result);
```

## 📊 성능 테스트

### 파일 크기별 테스트
- [ ] 100KB 이미지 업로드
- [ ] 1MB 이미지 업로드
- [ ] 5MB 이미지 업로드 (한계)
- [ ] 5MB 초과 이미지 → 에러 확인

### 동시 업로드 테스트
- [ ] 대표 이미지 + 갤러리 이미지 동시 업로드
- [ ] 5개 갤러리 이미지 한 번에 업로드
- [ ] 네트워크 속도에 따른 진행률 표시

## 🎯 완료 기준

모든 체크리스트 항목이 ✅ 상태가 되면 구현 완료:

### 필수 기능 (100% 완료 필요)
- 로그인 및 인증
- 대표 이미지 업로드/삭제
- 갤러리 이미지 업로드/삭제
- 파일 검증 및 에러 처리

### 권장 기능 (80% 이상 완료)
- 드래그 앤 드롭
- 업로드 진행률
- 이미지 미리보기
- 반응형 디자인

### 선택 기능 (필요시 구현)
- 이미지 크롭
- 클라이언트 압축
- 이미지 순서 변경

## 🚀 다음 단계

테스트 완료 후:
1. 실제 사용자 시나리오 테스트
2. 다양한 브라우저에서 호환성 확인
3. 모바일 디바이스에서 테스트
4. 성능 최적화 적용
5. 사용자 피드백 수집 및 개선

이 가이드를 따라 체계적으로 테스트하면 안정적인 이미지 업로드 기능을 구현할 수 있습니다!