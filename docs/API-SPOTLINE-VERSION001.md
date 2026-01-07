# SpotLine API 문서 Version001

## 📌 SpotLine 정체성 반영 API

SpotLine은 **광고 플랫폼이 아닌**, **현재 장소를 기준으로 다음 경험을 자연스럽게 제안**하는 서비스입니다.

### 🎯 핵심 원칙

- 과도한 정보 제공 금지
- 광고성 콘텐츠 배제
- 자연스러운 경험 흐름 중심
- 개인 식별 데이터 수집 금지

---

## 🔗 주요 엔드포인트

### 1. SpotLine QR 스캔 전용 매장 조회

**QR 스캔 시 첫 화면에 최적화된 API**

```http
GET /api/stores/spotline/{qrId}
```

#### 응답 예시

```json
{
  "success": true,
  "message": "SpotLine 매장 조회 성공",
  "data": {
    "id": "store_id_123",
    "name": "카페 스팟라인",
    "shortDescription": "조용한 분위기에서 책과 함께하는 시간",
    "representativeImage": "https://example.com/image.jpg",
    "location": {
      "address": "서울시 강남구 테헤란로 123",
      "mapLink": "https://maps.google.com/?q=37.5665,126.9780"
    },
    "externalLinks": {
      "instagram": "https://instagram.com/cafe_spotline",
      "blog": "https://blog.naver.com/cafe_spotline",
      "website": "https://cafe-spotline.com"
    },
    "spotlineStory": "이 카페는 개발자들이 조용히 작업할 수 있도록 설계된 공간입니다. 오후 2시부터 5시까지는 특히 집중하기 좋은 시간대입니다.",
    "qrCode": {
      "id": "qr_123",
      "isActive": true
    }
  }
}
```

#### 특징

- **한 문장 설명만** 제공 (`shortDescription`)
- **대표 이미지 1장만** 노출
- **외부 링크는 아이콘 형태**로만 제공
- **SpotLine 스토리는 접힘 UI**용

---

### 2. 다음으로 이어지는 Spot 조회

**"이 장소 다음엔" 영역을 위한 핵심 API**

```http
GET /api/recommendations/next-spots/{storeId}?limit=4
```

#### 응답 예시

```json
{
  "success": true,
  "message": "다음 Spot 조회 성공",
  "data": [
    {
      "id": "store_456",
      "name": "북카페 리딩룸",
      "shortDescription": "커피와 함께 책을 읽기 좋은 곳",
      "representativeImage": "https://example.com/book-cafe.jpg",
      "mapLink": "https://maps.google.com/?q=37.5670,126.9785",
      "category": "culture",
      "walkingTime": 5,
      "distance": 300
    },
    {
      "id": "store_789",
      "name": "디저트 하우스",
      "shortDescription": "수제 케이크와 마카롱 전문점",
      "representativeImage": "https://example.com/dessert.jpg",
      "mapLink": "https://maps.google.com/?q=37.5668,126.9790",
      "category": "dessert",
      "walkingTime": 3,
      "distance": 200
    }
  ]
}
```

#### 특징

- **최대 4개로 제한**
- **한 줄 설명만** 허용
- **지도 링크 필수 포함**
- **우선순위 기반 정렬**

---

### 3. SpotLine 전용 이벤트 로깅

**개인 식별 데이터 없이 간접 지표만 수집**

```http
POST /api/analytics/spotline-event
```

#### 요청 예시

```json
{
  "qrCode": "qr_123",
  "store": "store_id_123",
  "eventType": "spot_click",
  "targetStore": "store_456",
  "sessionId": "session_abc123",
  "metadata": {
    "spotPosition": 1,
    "stayDuration": 45,
    "nextSpotId": "store_456"
  }
}
```

#### 수집 가능한 이벤트 타입

- `page_enter`: 페이지 진입
- `spot_click`: spot 클릭
- `map_link_click`: 지도 링크 클릭
- `page_exit`: 페이지 이탈 (체류 시간 계산)
- `external_link_click`: 외부 링크 클릭

#### 수집 금지 데이터

- ❌ IP 주소
- ❌ User Agent
- ❌ 개인 식별 정보
- ❌ 위치 정보 (GPS)

---

## 🚫 제거된 기능들

### 기존 API에서 숨겨야 할 데이터

- 별점/평점 정보
- 후기/댓글 데이터
- 좋아요/북마크 수
- 가격 정보
- 광고성 배너 데이터

### 비활성화된 엔드포인트

- 회원가입/로그인 관련
- 사용자 추천 등록
- 결제 관련
- 광고 관련

---

## 📱 프론트엔드 연동 가이드

### QR 스캔 → 페이지 진입 플로우

1. **QR 스캔** → `/api/stores/spotline/{qrId}` 호출
2. **매장 정보 표시** (간소화된 형태)
3. **다음 Spot 조회** → `/api/recommendations/next-spots/{storeId}` 호출
4. **이벤트 로깅** → `/api/analytics/spotline-event` 호출

### 권장 UI 구조

```
┌─────────────────────────┐
│ 대표 이미지 (1장)        │
├─────────────────────────┤
│ 매장명                  │
│ 한 문장 설명            │
│ [아이콘] [아이콘] [아이콘] │ ← 외부 링크
├─────────────────────────┤
│ "이 장소 다음엔"         │ ← 핵심 영역
│ ┌─────┐ ┌─────┐        │
│ │Spot1│ │Spot2│        │
│ └─────┘ └─────┘        │
│ ┌─────┐ ┌─────┐        │
│ │Spot3│ │Spot4│        │
│ └─────┘ └─────┘        │
├─────────────────────────┤
│ [접힘] SpotLine 스토리   │ ← 선택적 표시
└─────────────────────────┘
```

---

## 🔧 관리자 API

### 간소화된 관리자 기능

```http
# 매장 등록/수정 (SpotLine 필드 포함)
POST /api/admin/stores
PUT /api/admin/stores/{id}

# 다음 Spot 연결 관리
POST /api/admin/recommendations
PUT /api/admin/recommendations/{id}
```

### 관리자가 설정할 수 있는 항목

- ✅ 매장 기본 정보
- ✅ 한 문장 설명 (`shortDescription`)
- ✅ 대표 이미지 (`representativeImage`)
- ✅ 외부 링크 (`externalLinks`)
- ✅ SpotLine 스토리 (`spotlineStory`)
- ✅ 다음 Spot 연결 (2-4개)

---

## 📊 SEO 최적화

### Meta 태그 형식

```html
<title>{매장명} 다음엔 어디 갈까 | SpotLine</title> <meta name="description" content="{한 문장 설명} - 자연스럽게 이어지는 다음 경험을 찾아보세요" />
```

### 권장 URL 구조

```
https://spotline.com/spot/{qrId}
https://spotline.com/spot/{qrId}/next
```

---

## 🔒 보안 및 개인정보

### 수집하는 데이터

- ✅ 세션 기반 익명 추적
- ✅ 페이지 진입/이탈 시간
- ✅ 클릭 패턴 (위치별)
- ✅ 참조 페이지 (referrer)

### 수집하지 않는 데이터

- ❌ 개인 식별 정보
- ❌ IP 주소
- ❌ 디바이스 정보
- ❌ 위치 정보 (GPS)

---

## 📈 버전 관리

**Version001 특징:**

- SpotLine 정체성 반영 완료
- 기존 API 호환성 유지
- 새로운 SpotLine 전용 엔드포인트 추가
- 개인정보 수집 최소화

**다음 버전 예정:**

- 사용자 추천 기능 (최소 위험 구조)
- 고급 분석 기능
- 다국어 지원
