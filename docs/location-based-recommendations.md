# 지역 기반 추천 시스템 API 가이드

## 개요

SpotLine의 새로운 지역 기반 추천 시스템은 매장 상세 화면에서 주변 매장들을 자동으로 분석하여 추천 관계를 쉽게 설정할 수 있도록 도와줍니다.

## 주요 기능

### 1. 지역 기반 추천 후보 조회

현재 매장 주변의 다른 매장들을 거리와 카테고리 기반으로 분석하여 추천 후보를 제안합니다.

**API 엔드포인트:**

```
GET /api/recommendations/location-based/{storeId}
```

**쿼리 파라미터:**

- `category` (선택): 매장 카테고리 필터 (cafe, restaurant, exhibition, hotel, retail, culture, other)
- `limit` (선택): 결과 개수 제한 (기본값: 10)
- `radius` (선택): 검색 반경 미터 (기본값: 1000m)

**응답 예시:**

```json
{
  "success": true,
  "message": "지역 기반 추천 후보 조회 성공",
  "data": {
    "currentStore": {
      "id": "store123",
      "name": "카페 스팟라인",
      "category": "cafe",
      "address": "서울시 강남구 테헤란로 123"
    },
    "nearbyStores": [
      {
        "id": "store456",
        "name": "맛집 레스토랑",
        "category": "restaurant",
        "distance": 150
      }
    ],
    "existingRecommendations": [
      // 이미 설정된 추천 관계들
    ],
    "suggestedRecommendations": [
      {
        "store": {
          "id": "store456",
          "name": "맛집 레스토랑",
          "category": "restaurant",
          "shortDescription": "현지 맛집으로 유명한 레스토랑",
          "address": "서울시 강남구 테헤란로 150",
          "representativeImage": "restaurant-image.jpg"
        },
        "distance": 150,
        "walkingTime": 2,
        "suggestedCategory": "next_meal",
        "priority": 8
      }
    ]
  }
}
```

### 2. 지역 기반 추천 관계 일괄 생성

선택된 근처 매장들과의 추천 관계를 한 번에 생성합니다.

**API 엔드포인트:**

```
POST /api/recommendations/location-based/{storeId}
```

**요청 본문:**

```json
{
  "selectedStores": [
    {
      "toStoreId": "store456",
      "category": "next_meal",
      "priority": 8,
      "description": "카페 후 식사하기 좋은 레스토랑"
    },
    {
      "toStoreId": "store789",
      "category": "dessert",
      "priority": 6,
      "description": "디저트로 유명한 베이커리"
    }
  ]
}
```

## 추천 카테고리 가이드

### 카테고리별 의미

- `next_meal`: 다음 식사 (카페 → 레스토랑)
- `dessert`: 디저트 (레스토랑 → 카페/베이커리)
- `activity`: 활동 (식사 → 전시/문화공간)
- `shopping`: 쇼핑 (카페 → 리테일)
- `culture`: 문화 (식사 → 전시/갤러리)
- `rest`: 휴식 (활동 → 카페)

### 자동 카테고리 제안 로직

시스템이 매장 카테고리 조합을 분석하여 적절한 추천 카테고리를 자동 제안합니다:

- **카페 → 레스토랑**: `next_meal`
- **레스토랑 → 카페**: `dessert`
- **레스토랑 → 문화공간**: `culture`
- **카페 → 리테일**: `shopping`
- **전시 → 카페**: `rest`

## 우선순위 계산 방식

시스템이 자동으로 계산하는 우선순위 요소:

1. **거리 기반 점수**
   - 100m 이내: +3점
   - 300m 이내: +2점
   - 500m 이내: +1점

2. **카테고리 조합 점수**
   - 좋은 조합 (카페↔레스토랑, 레스토랑↔문화): +2점

3. **기본 점수**: 5점

최종 점수는 1-10점 범위로 제한됩니다.

## 사용 시나리오

### 1. 매장 관리자 화면에서

```javascript
// 1. 추천 후보 조회
const response = await fetch(`/api/recommendations/location-based/${storeId}?radius=500&limit=8`);
const data = await response.json();

// 2. 사용자가 원하는 매장들 선택 후 추천 관계 생성
const selectedStores = [
  { toStoreId: "store456", category: "next_meal", priority: 8 },
  { toStoreId: "store789", category: "dessert", priority: 6 },
];

await fetch(`/api/recommendations/location-based/${storeId}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ selectedStores }),
});
```

### 2. 관리 대시보드에서

- 매장별로 근처 추천 후보 확인
- 일괄 추천 관계 설정
- 기존 추천과 중복 방지

## 장점

1. **자동화된 추천**: 수동으로 매장을 찾아서 연결할 필요 없음
2. **지역 기반**: 실제 도보 거리를 고려한 현실적인 추천
3. **카테고리 지능**: 매장 유형에 따른 자동 카테고리 제안
4. **중복 방지**: 기존 추천 관계와 겹치지 않는 새로운 후보만 제안
5. **우선순위 자동 계산**: 거리와 카테고리 조합을 고려한 스마트한 우선순위

이 시스템을 통해 매장 운영자들이 더 쉽고 효율적으로 지역 내 다른 매장들과 연결될 수 있습니다.
