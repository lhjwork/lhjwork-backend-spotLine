# 관리자용 수동 추천 설정 시스템 API 가이드 (거리 + 지역 기반)

## 개요

SpotLine의 관리자용 추천 설정 시스템은 매장 관리자가 상점 상세 화면에서 주변 매장들을 확인하고 **수동으로 선택**하여 추천 관계를 설정할 수 있도록 도와줍니다.

## 주요 특징

- **수동 선택 방식**: 자동 추천이 아닌 관리자가 직접 선택하는 방식
- **이중 검색 방식**: 거리 기반(10km 반경) + 같은 지역(area) 기반 매장 제공
- **연결 상태 표시**: 이미 연결된 매장과 새로운 후보 매장 구분
- **카테고리 힌트**: 매장 유형에 따른 추천 카테고리 제안
- **중복 제거**: 거리 기반과 지역 기반에서 겹치는 매장 자동 제거

## API 엔드포인트

### 1. 근처 매장 목록 조회 (선택 후보) - 이중 검색

관리자가 선택할 수 있는 근처 매장들을 **두 가지 방식**으로 제공합니다.

**API 엔드포인트:**

```
GET /api/recommendations/nearby-stores/{storeId}
```

**쿼리 파라미터:**

- `category` (선택): 매장 카테고리 필터 (cafe, restaurant, exhibition, hotel, retail, culture, other)
- `limit` (선택): 결과 개수 제한 (기본값: 50)
- `radius` (선택): 검색 반경 미터 (기본값: 10000m = 10km)

**응답 예시:**

```json
{
  "success": true,
  "message": "근처 매장 목록 조회 성공",
  "data": {
    "currentStore": {
      "id": "store123",
      "name": "카페 스팟라인",
      "category": "cafe",
      "address": "서울시 서대문구 성산로 325 2층 202호",
      "area": "연희동",
      "shortDescription": "아늑한 분위기의 카페"
    },
    "nearbyStores": [
      {
        "id": "store456",
        "name": "맛집 레스토랑",
        "category": "restaurant",
        "shortDescription": "현지 맛집으로 유명한 레스토랑",
        "address": "서울시 서대문구 연희로 150",
        "area": "연희동",
        "representativeImage": "restaurant-image.jpg",
        "distance": 150,
        "walkingTime": 2,
        "isAlreadyConnected": false,
        "suggestedCategories": ["next_meal"],
        "matchType": "distance"
      },
      {
        "id": "store789",
        "name": "홍대 갤러리",
        "category": "culture",
        "shortDescription": "현대 미술 전시 공간",
        "address": "서울시 마포구 홍익로 200",
        "area": "홍대",
        "representativeImage": "gallery-image.jpg",
        "distance": 2500,
        "walkingTime": 31,
        "isAlreadyConnected": false,
        "suggestedCategories": ["culture", "activity"],
        "matchType": "distance"
      }
    ],
    "sameAreaStores": [
      {
        "id": "store101",
        "name": "연희동 베이커리",
        "category": "cafe",
        "shortDescription": "수제 빵으로 유명한 베이커리",
        "address": "서울시 서대문구 연희로 300",
        "area": "연희동",
        "representativeImage": "bakery-image.jpg",
        "distance": 800,
        "walkingTime": 10,
        "isAlreadyConnected": false,
        "suggestedCategories": ["dessert"],
        "matchType": "area"
      }
    ],
    "existingRecommendations": [
      // 이미 설정된 추천 관계들
    ]
  }
}
```

### 2. 검색 방식 설명

#### 🎯 **거리 기반 검색 (nearbyStores)**

- **반경**: 10km (기본값, 조정 가능)
- **정렬**: 거리순 (가까운 순서)
- **특징**: 실제 물리적 거리를 고려한 현실적인 추천
- **matchType**: `"distance"`

#### 🏘️ **지역 기반 검색 (sameAreaStores)**

- **기준**: 현재 매장과 같은 `location.area` 값
- **정렬**: 이름순 (가나다순)
- **특징**: 같은 동네/지역 내 매장들로 지역 특성 반영
- **matchType**: `"area"`
- **중복 제거**: 거리 기반 결과와 겹치는 매장은 제외

### 3. 선택한 매장들과 추천 관계 생성

관리자가 선택한 매장들과의 추천 관계를 일괄 생성합니다.

**API 엔드포인트:**

```
POST /api/recommendations/selected/{storeId}
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
      "toStoreId": "store101",
      "category": "dessert",
      "priority": 6,
      "description": "같은 동네 맛있는 베이커리"
    }
  ]
}
```

## 관리자 화면 사용 시나리오

### 1. 매장 상세 화면에서 추천 설정

```javascript
// 1. 근처 매장 목록 조회 (거리 + 지역 기반)
const response = await fetch(`/api/recommendations/nearby-stores/${storeId}?radius=8000&limit=30`);
const data = await response.json();

// 2. UI에서 두 가지 탭으로 표시
// - "근처 매장" 탭: data.nearbyStores (거리순)
// - "같은 지역" 탭: data.sameAreaStores (이름순)

// 3. 관리자가 각 탭에서 원하는 매장들 선택
const selectedFromNearby = [{ toStoreId: "store456", category: "next_meal", priority: 8 }];
const selectedFromSameArea = [{ toStoreId: "store101", category: "dessert", priority: 6 }];

// 4. 선택한 매장들 합쳐서 추천 관계 생성
const allSelected = [...selectedFromNearby, ...selectedFromSameArea];
await fetch(`/api/recommendations/selected/${storeId}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ selectedStores: allSelected }),
});
```

### 2. 관리 대시보드 UI 구성 예시

```
┌─────────────────────────────────────────┐
│ 현재 매장: 카페 스팟라인 (연희동)        │
├─────────────────────────────────────────┤
│ [근처 매장 (10km)] [같은 지역 (연희동)]  │
├─────────────────────────────────────────┤
│ 근처 매장 탭:                           │
│ ☐ 맛집 레스토랑 (150m) - next_meal      │
│ ☐ 홍대 갤러리 (2.5km) - culture         │
│                                         │
│ 같은 지역 탭:                           │
│ ☐ 연희동 베이커리 (800m) - dessert      │
│ ☐ 연희동 서점 (1.2km) - culture         │
└─────────────────────────────────────────┘
```

## 시스템 특징

### 1. **이중 검색 시스템**

- **거리 우선**: 물리적 접근성을 고려한 현실적 추천
- **지역 우선**: 같은 동네 특성을 살린 지역 기반 추천
- **선택의 폭**: 관리자가 두 가지 관점에서 매장 선택 가능

### 2. **스마트 중복 제거**

- 거리 기반과 지역 기반에서 겹치는 매장 자동 제거
- 각 매장이 어떤 방식으로 매칭되었는지 `matchType`으로 표시

### 3. **확장된 검색 범위**

- 기본 10km 반경으로 더 넓은 선택권 제공
- 지역 기반으로 거리와 상관없이 같은 동네 매장 발견

### 4. **유연한 필터링**

- 카테고리별 필터링 지원
- 검색 반경 조정 가능
- 결과 개수 제한 조정 가능

이 시스템을 통해 매장 운영자들이 **거리적 접근성**과 **지역적 특성** 두 가지 관점에서 최적의 추천 관계를 설정할 수 있습니다!
