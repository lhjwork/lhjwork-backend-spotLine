# 관리자용 추천 관리 시스템 API 문서

## 개요

관리자 화면에서 사용할 추천 관리 관련 API 엔드포인트들을 정리한 문서입니다. 오늘 개발된 이중 검색 API와 기존 추천 관리 API를 포함합니다.

## 베이스 URL

```
Production: https://api.spotline.co.kr
Development: http://localhost:4000
```

## 인증

모든 API 요청에는 JWT 토큰이 필요합니다.

```
Authorization: Bearer {jwt_token}
```

---

## 1. 매장 목록 조회 (추천 개수 포함)

### `GET /api/admin/stores`

매장 목록을 조회하며, 각 매장의 추천 개수 정보를 포함합니다.

**쿼리 파라미터:**

- `page` (선택): 페이지 번호 (기본값: 1)
- `limit` (선택): 페이지당 결과 수 (기본값: 20)
- `category` (선택): 매장 카테고리 필터
- `area` (선택): 지역 필터
- `search` (선택): 매장 이름 검색

**응답 예시:**

```json
{
  "success": true,
  "message": "매장 목록 조회 성공",
  "data": {
    "stores": [
      {
        "id": "store123",
        "name": "카페 스팟라인",
        "category": "cafe",
        "location": {
          "address": "서울시 서대문구 성산로 325",
          "area": "연희동"
        },
        "recommendationCount": 3,
        "isActive": true,
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ],
    "totalCount": 150,
    "totalPages": 8,
    "currentPage": 1
  }
}
```

---

## 2. 근처 매장 목록 조회 (이중 검색)

### `GET /api/recommendations/nearby-stores/{storeId}`

특정 매장 기준으로 거리 기반(10km)과 지역 기반 매장 목록을 조회합니다.

**경로 파라미터:**

- `storeId` (필수): 기준 매장 ID

**쿼리 파라미터:**

- `category` (선택): 매장 카테고리 필터
- `limit` (선택): 결과 개수 제한 (기본값: 50)
- `radius` (선택): 검색 반경 미터 (기본값: 10000)

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
      "address": "서울시 서대문구 성산로 325",
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
      }
    ],
    "sameAreaStores": [
      {
        "id": "store789",
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
      {
        "id": "rec123",
        "toStore": {
          "id": "store999",
          "name": "기존 연결 매장",
          "category": "culture"
        },
        "category": "culture",
        "priority": 7,
        "description": "문화 체험 추천",
        "isActive": true,
        "createdAt": "2024-01-10T14:30:00Z"
      }
    ]
  }
}
```

---

## 3. 선택한 매장들과 추천 관계 생성

### `POST /api/recommendations/selected/{storeId}`

관리자가 선택한 매장들과의 추천 관계를 일괄 생성합니다.

**경로 파라미터:**

- `storeId` (필수): 기준 매장 ID

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
      "description": "같은 동네 맛있는 베이커리"
    }
  ]
}
```

**응답 예시:**

```json
{
  "success": true,
  "message": "2개의 추천 관계가 생성되었습니다",
  "data": [
    {
      "id": "rec456",
      "fromStore": "store123",
      "toStore": "store456",
      "category": "next_meal",
      "priority": 8,
      "description": "카페 후 식사하기 좋은 레스토랑",
      "isActive": true,
      "createdAt": "2024-01-21T10:15:00Z"
    },
    {
      "id": "rec789",
      "fromStore": "store123",
      "toStore": "store789",
      "category": "dessert",
      "priority": 6,
      "description": "같은 동네 맛있는 베이커리",
      "isActive": true,
      "createdAt": "2024-01-21T10:15:00Z"
    }
  ]
}
```

---

## 4. 매장별 기존 추천 목록 조회

### `GET /api/recommendations/store/{storeId}`

특정 매장의 기존 추천 관계 목록을 조회합니다.

**경로 파라미터:**

- `storeId` (필수): 매장 ID

**쿼리 파라미터:**

- `category` (선택): 추천 카테고리 필터
- `limit` (선택): 결과 개수 제한 (기본값: 10)

**응답 예시:**

```json
{
  "success": true,
  "message": "매장별 추천 조회 성공",
  "data": [
    {
      "id": "rec123",
      "fromStore": "store123",
      "toStore": {
        "id": "store456",
        "name": "맛집 레스토랑",
        "category": "restaurant",
        "representativeImage": "restaurant-image.jpg",
        "location": {
          "address": "서울시 서대문구 연희로 150",
          "area": "연희동"
        }
      },
      "category": "next_meal",
      "priority": 8,
      "description": "카페 후 식사하기 좋은 레스토랑",
      "distance": 150,
      "walkingTime": 2,
      "isActive": true,
      "createdAt": "2024-01-15T14:30:00Z"
    }
  ]
}
```

---

## 5. 개별 추천 관계 수정

### `PUT /api/recommendations/{recommendationId}`

기존 추천 관계의 정보를 수정합니다.

**경로 파라미터:**

- `recommendationId` (필수): 추천 관계 ID

**요청 본문:**

```json
{
  "category": "culture",
  "priority": 9,
  "description": "수정된 추천 설명"
}
```

**응답 예시:**

```json
{
  "success": true,
  "message": "추천 관계가 성공적으로 수정되었습니다",
  "data": {
    "id": "rec123",
    "fromStore": "store123",
    "toStore": "store456",
    "category": "culture",
    "priority": 9,
    "description": "수정된 추천 설명",
    "isActive": true,
    "updatedAt": "2024-01-21T11:00:00Z"
  }
}
```

---

## 6. 개별 추천 관계 삭제

### `DELETE /api/recommendations/{recommendationId}`

기존 추천 관계를 비활성화(소프트 삭제)합니다.

**경로 파라미터:**

- `recommendationId` (필수): 추천 관계 ID

**응답 예시:**

```json
{
  "success": true,
  "message": "추천이 비활성화되었습니다",
  "data": null
}
```

---

## 7. 추천 카테고리 목록 조회

### `GET /api/recommendations/categories`

사용 가능한 추천 카테고리 목록을 조회합니다.

**응답 예시:**

```json
{
  "success": true,
  "message": "추천 카테고리 목록 조회 성공",
  "data": [
    {
      "value": "next_meal",
      "label": "다음 식사",
      "description": "카페 → 레스토랑"
    },
    {
      "value": "dessert",
      "label": "디저트",
      "description": "레스토랑 → 카페/베이커리"
    },
    {
      "value": "activity",
      "label": "활동",
      "description": "식사 → 전시/문화공간"
    },
    {
      "value": "shopping",
      "label": "쇼핑",
      "description": "카페 → 리테일"
    },
    {
      "value": "culture",
      "label": "문화",
      "description": "식사 → 전시/갤러리"
    },
    {
      "value": "rest",
      "label": "휴식",
      "description": "활동 → 카페"
    }
  ]
}
```

---

## 8. 추천 통계 조회

### `GET /api/recommendations/stats`

전체 추천 관계에 대한 통계 정보를 조회합니다.

**응답 예시:**

```json
{
  "success": true,
  "message": "추천 통계 조회 성공",
  "data": {
    "totalRecommendations": 245,
    "activeRecommendations": 230,
    "inactiveRecommendations": 15,
    "categoryStats": [
      {
        "_id": "next_meal",
        "count": 85
      },
      {
        "_id": "culture",
        "count": 62
      },
      {
        "_id": "dessert",
        "count": 48
      }
    ],
    "topStores": [
      {
        "storeName": "카페 스팟라인",
        "count": 8
      },
      {
        "storeName": "맛집 레스토랑",
        "count": 6
      }
    ]
  }
}
```

---

## 에러 응답

모든 API는 다음과 같은 형태의 에러 응답을 반환합니다:

```json
{
  "success": false,
  "message": "에러 메시지",
  "data": null,
  "status": 400
}
```

### 주요 에러 코드

- `400 Bad Request`: 잘못된 요청 파라미터
- `401 Unauthorized`: 인증 토큰 없음 또는 만료
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 내부 오류

---

## 사용 예시

### JavaScript/TypeScript 예시

```typescript
// 1. 근처 매장 목록 조회
const getNearbyStores = async (storeId: string) => {
  const response = await fetch(`/api/recommendations/nearby-stores/${storeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

// 2. 선택한 매장들로 추천 생성
const createRecommendations = async (storeId: string, selectedStores: any[]) => {
  const response = await fetch(`/api/recommendations/selected/${storeId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ selectedStores }),
  });
  return response.json();
};

// 3. 기존 추천 수정
const updateRecommendation = async (recommendationId: string, updateData: any) => {
  const response = await fetch(`/api/recommendations/${recommendationId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });
  return response.json();
};
```

### React Hook 예시

```typescript
// 커스텀 훅 예시
const useRecommendationManagement = (storeId: string) => {
  const [nearbyStores, setNearbyStores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNearbyStores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNearbyStores(storeId);
      setNearbyStores(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const saveRecommendations = useCallback(
    async (selectedStores) => {
      setLoading(true);
      try {
        const result = await createRecommendations(storeId, selectedStores);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeId],
  );

  return {
    nearbyStores,
    loading,
    error,
    fetchNearbyStores,
    saveRecommendations,
  };
};
```

이 API 문서를 참고하여 관리자 화면을 개발하시면 됩니다!
