# Spotline Admin - Daum 주소 API 연동 가이드

## 개요

Spotline 어드민 시스템에서 매장 등록 시 Daum 주소 검색 API와 Kakao 좌표 변환 API를 사용하여 정확한 주소와 좌표 정보를 자동으로 입력하는 시스템입니다.

## 🔧 설정 방법

### 1. Kakao Developers 설정

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. **플랫폼 설정**:
   - Web 플랫폼 추가
   - 사이트 도메인: `http://localhost:3002` (개발환경)
4. **API 키 확인**:
   - REST API 키 복사

### 2. 환경 변수 설정

```bash
# admin-frontend/.env
VITE_API_URL=http://localhost:4000
VITE_KAKAO_REST_API_KEY=YOUR_KAKAO_REST_API_KEY
```

### 3. HTML 스크립트 추가

```html
<!-- admin-frontend/index.html -->
<script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
```

## 🏗️ 구현 구조

### 1. AddressSearch 컴포넌트

**파일**: `admin-frontend/src/components/AddressSearch.jsx`

**기능**:
- Daum 주소 검색 팝업 호출
- 선택된 주소를 Kakao API로 좌표 변환
- 주소 및 좌표 정보 표시

**Props**:
```javascript
{
  onAddressSelect: (data) => void,  // 주소 선택 시 콜백
  initialAddress: string,           // 초기 주소값
  initialCoordinates: object        // 초기 좌표값 {lat, lng}
}
```

**반환 데이터**:
```javascript
{
  address: "서울 마포구 홍익로 39",
  coordinates: { lat: 37.5511694, lng: 126.9229004 },
  addressData: {
    zonecode: "04039",
    roadAddress: "서울 마포구 홍익로 39",
    jibunAddress: "서울 마포구 상수동 72-1",
    buildingName: "카카오 판교아지트",
    sido: "서울",
    sigungu: "마포구",
    bname: "상수동"
  }
}
```

### 2. StoreFormModal 컴포넌트

**파일**: `admin-frontend/src/components/StoreFormModal.jsx`

**기능**:
- 매장 생성/수정 모달
- AddressSearch 컴포넌트 통합
- 자동 지역 정보 입력

## 📡 API 연동

### 1. Daum 주소 검색 API

```javascript
new window.daum.Postcode({
  oncomplete: function(data) {
    // 주소 선택 완료 시 실행
    const fullAddress = data.address
    const roadAddress = data.roadAddress
    const jibunAddress = data.jibunAddress
    
    // 처리 로직...
  },
  onclose: function() {
    // 팝업 닫힐 때 실행
  },
  width: '100%',
  height: '100%'
}).open()
```

### 2. Kakao 좌표 변환 API

```javascript
const getCoordinatesFromAddress = async (address) => {
  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
    {
      headers: {
        'Authorization': `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`
      }
    }
  )
  
  const data = await response.json()
  if (data.documents && data.documents.length > 0) {
    const { x: lng, y: lat } = data.documents[0]
    return { lat: parseFloat(lat), lng: parseFloat(lng) }
  }
  return null
}
```

## 🔄 백엔드 API 수정

### 매장 생성 API

**Endpoint**: `POST /api/admin/stores`

**Request Body**:
```json
{
  "name": "카페 스팟라인",
  "category": "cafe",
  "location": {
    "address": "서울 마포구 홍익로 39",
    "coordinates": {
      "type": "Point",
      "coordinates": [126.9229004, 37.5511694]
    },
    "area": "홍대",
    "district": "마포구"
  },
  "contact": {
    "phone": "02-1234-5678",
    "website": "https://example.com"
  },
  "description": "홍대 근처 분위기 좋은 카페"
}
```

**Response**:
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "카페 스팟라인",
  "category": "cafe",
  "location": {
    "address": "서울 마포구 홍익로 39",
    "coordinates": {
      "type": "Point",
      "coordinates": [126.9229004, 37.5511694]
    },
    "area": "홍대",
    "district": "마포구"
  },
  "qrCode": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "isActive": true
  },
  "isActive": true,
  "createdAt": "2024-01-05T10:30:00.000Z",
  "updatedAt": "2024-01-05T10:30:00.000Z"
}
```

### 매장 수정 API

**Endpoint**: `PUT /api/admin/stores/:id`

**Request Body**: 생성 API와 동일

## 🎨 UI/UX 개선사항

### 1. 주소 검색 버튼

```jsx
<button
  type="button"
  onClick={openAddressSearch}
  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
>
  <Search className="h-4 w-4" />
  <span>주소 검색</span>
</button>
```

### 2. 좌표 정보 표시

```jsx
{coordinates && (
  <div className="bg-green-50 border border-green-200 rounded-md p-3">
    <div className="flex items-center space-x-2 text-green-800">
      <MapPin className="h-4 w-4" />
      <span className="text-sm font-medium">좌표 정보</span>
    </div>
    <div className="mt-1 text-sm text-green-700">
      위도: {coordinates.lat}, 경도: {coordinates.lng}
    </div>
  </div>
)}
```

### 3. 에러 처리

```jsx
{address && !coordinates && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
    <div className="text-yellow-800 text-sm">
      ⚠️ 좌표 변환에 실패했습니다. 수동으로 입력해주세요.
    </div>
  </div>
)}
```

## 🔍 사용 방법

### 1. 매장 등록 프로세스

1. **매장 관리** 페이지 접속
2. **새 매장 등록** 버튼 클릭
3. 기본 정보 입력 (매장명, 카테고리)
4. **주소 검색** 버튼 클릭
5. Daum 주소 검색 팝업에서 주소 선택
6. 자동으로 좌표 변환 및 지역 정보 입력
7. 추가 정보 입력 (설명, 연락처 등)
8. **등록** 버튼 클릭

### 2. 매장 수정 프로세스

1. 매장 목록에서 수정할 매장 선택
2. 수정 모달에서 기존 정보 확인
3. 주소 변경 시 **주소 검색** 버튼으로 재검색
4. 정보 수정 후 **수정** 버튼 클릭

## 🚨 주의사항

### 1. API 키 보안

- 환경 변수로 API 키 관리
- 프로덕션 환경에서는 도메인 제한 설정
- API 키 노출 방지

### 2. 에러 처리

- 네트워크 오류 시 사용자 안내
- 좌표 변환 실패 시 수동 입력 옵션 제공
- API 호출 제한 고려

### 3. 성능 최적화

- 주소 검색 결과 캐싱
- 불필요한 API 호출 방지
- 로딩 상태 표시

## 🔧 트러블슈팅

### 1. 주소 검색 팝업이 열리지 않는 경우

```javascript
// 스크립트 로드 확인
if (typeof window.daum === 'undefined') {
  console.error('Daum Postcode script not loaded')
  return
}
```

### 2. 좌표 변환 실패

```javascript
// API 키 확인
if (!import.meta.env.VITE_KAKAO_REST_API_KEY) {
  console.error('Kakao API key not found')
  return null
}
```

### 3. CORS 오류

- Kakao Developers에서 도메인 설정 확인
- 개발 환경: `http://localhost:3002`
- 프로덕션 환경: 실제 도메인 등록

## 📝 개발 체크리스트

- [ ] Kakao Developers 애플리케이션 생성
- [ ] REST API 키 발급
- [ ] 환경 변수 설정
- [ ] Daum 주소 검색 스크립트 추가
- [ ] AddressSearch 컴포넌트 구현
- [ ] StoreFormModal 업데이트
- [ ] 백엔드 API 테스트
- [ ] 에러 처리 구현
- [ ] UI/UX 개선
- [ ] 프로덕션 배포 설정

## 🎯 향후 개선사항

1. **지도 미리보기**: 선택된 주소의 지도 표시
2. **주변 매장 표시**: 등록하려는 매장 주변의 기존 매장 표시
3. **주소 자동완성**: 타이핑 시 주소 자동완성 기능
4. **GPS 위치**: 현재 위치 기반 주소 검색
5. **배치 등록**: 여러 매장 일괄 등록 기능

이 가이드를 따라 구현하면 사용자 친화적이고 정확한 매장 등록 시스템을 구축할 수 있습니다.