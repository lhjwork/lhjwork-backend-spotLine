# 프론트엔드 수정 가이드 - SpotLine 체험하기 버튼

## 문제 상황

현재 프론트엔드에서 "SpotLine 체험하기" 버튼 클릭 시 UUID 형태의 ID(`6ccbb682-df55-4566-ac30-703ddb5cfb7f`)로 요청하고 있어 404 에러가 발생합니다.

## 해결 방법

백엔드에서 사용하는 올바른 QR 코드 ID로 수정해야 합니다.

## 사용 가능한 QR 코드 ID 목록

### 강남 지역 매장

- `cafe_gangnam_001` - 카페 스팟라인 (강남역)
- `dessert_gangnam_001` - 디저트 하우스 (강남역)
- `culture_gangnam_001` - 북카페 리딩룸 (강남역)
- `gallery_gangnam_001` - 아트 갤러리 모던 (논현동)
- `brunch_gangnam_001` - 브런치 스팟 (신사동)

### 홍대 지역 매장

- `cafe_hongdae_001` - 바이닐 카페 (홍대입구)
- `food_hongdae_001` - 스트리트 푸드 마켓 (홍대입구)
- `record_hongdae_001` - 인디 레코드샵 (홍대입구)

## 프론트엔드 수정 코드

### 1. "SpotLine 체험하기" 버튼 수정

**기존 코드 (수정 전):**

```javascript
// 잘못된 UUID 사용
const handleSpotlineExperience = () => {
  window.location.href = `/api/stores/spotline/6ccbb682-df55-4566-ac30-703ddb5cfb7f`;
};
```

**수정된 코드 (수정 후):**

```javascript
// 올바른 QR 코드 ID 사용
const handleSpotlineExperience = () => {
  // 대표 매장으로 카페 스팟라인 사용
  const qrCodeId = "cafe_gangnam_001";
  window.location.href = `http://localhost:4000/api/stores/spotline/${qrCodeId}`;
};
```

### 2. 랜덤 매장 체험 (추천)

여러 매장 중 랜덤하게 선택하여 더 다양한 체험을 제공:

```javascript
const handleSpotlineExperience = () => {
  // 사용 가능한 QR 코드 ID 목록
  const availableStores = [
    "cafe_gangnam_001", // 카페 스팟라인
    "cafe_hongdae_001", // 바이닐 카페
    "culture_gangnam_001", // 북카페 리딩룸
    "gallery_gangnam_001", // 아트 갤러리 모던
    "food_hongdae_001", // 스트리트 푸드 마켓
  ];

  // 랜덤 선택
  const randomIndex = Math.floor(Math.random() * availableStores.length);
  const selectedQrId = availableStores[randomIndex];

  // SpotLine 전용 엔드포인트로 이동
  window.location.href = `http://localhost:4000/api/stores/spotline/${selectedQrId}`;
};
```

### 3. 지역별 선택 옵션 (고급)

사용자가 지역을 선택할 수 있도록:

```javascript
const handleSpotlineExperience = (area = "random") => {
  const storesByArea = {
    gangnam: ["cafe_gangnam_001", "dessert_gangnam_001", "culture_gangnam_001", "gallery_gangnam_001", "brunch_gangnam_001"],
    hongdae: ["cafe_hongdae_001", "food_hongdae_001", "record_hongdae_001"],
  };

  let selectedStores;
  if (area === "random") {
    // 모든 매장에서 랜덤 선택
    selectedStores = [...storesByArea.gangnam, ...storesByArea.hongdae];
  } else {
    selectedStores = storesByArea[area] || storesByArea.gangnam;
  }

  const randomIndex = Math.floor(Math.random() * selectedStores.length);
  const selectedQrId = selectedStores[randomIndex];

  window.location.href = `http://localhost:4000/api/stores/spotline/${selectedQrId}`;
};
```

## API 엔드포인트 정보

### SpotLine 전용 매장 조회

- **URL**: `GET /api/stores/spotline/{qrId}`
- **설명**: SpotLine 정체성에 맞는 간소화된 매장 정보 제공
- **응답 예시**:

```json
{
  "success": true,
  "message": "SpotLine 매장 조회 성공",
  "data": {
    "id": "695dc59e914a0496da641266",
    "name": "카페 스팟라인",
    "shortDescription": "조용한 분위기에서 책과 함께하는 시간",
    "representativeImage": "https://images.unsplash.com/photo-1...",
    "location": {
      "address": "서울시 강남구 강남대로 123",
      "mapLink": "https://map.naver.com/..."
    },
    "externalLinks": {
      "instagram": "https://instagram.com/cafe_spotline",
      "website": "https://cafe-spotline.com"
    },
    "spotlineStory": "이 장소가 포함된 이유..."
  }
}
```

## 테스트 URL

개발 환경에서 테스트할 수 있는 URL들:

- 카페 스팟라인: `http://localhost:4000/api/stores/spotline/cafe_gangnam_001`
- 바이닐 카페: `http://localhost:4000/api/stores/spotline/cafe_hongdae_001`
- 북카페 리딩룸: `http://localhost:4000/api/stores/spotline/culture_gangnam_001`

## 주의사항

1. **프로덕션 환경**: `localhost:4000`을 실제 서버 URL로 변경
2. **CORS 설정**: 백엔드에서 프론트엔드 도메인 허용 확인
3. **에러 처리**: API 호출 실패 시 적절한 에러 메시지 표시
4. **로딩 상태**: API 응답 대기 중 로딩 인디케이터 표시

## 권장 구현

가장 간단하고 효과적인 방법:

```javascript
// 추천: 대표 매장으로 고정
const handleSpotlineExperience = () => {
  window.location.href = "http://localhost:4000/api/stores/spotline/cafe_gangnam_001";
};
```

이렇게 수정하면 "SpotLine 체험하기" 버튼이 정상적으로 작동합니다.
