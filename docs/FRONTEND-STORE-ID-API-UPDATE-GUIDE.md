# 프론트엔드 매장 ID 기반 API 업데이트 가이드

## 📋 개요

SpotLine 백엔드가 QR ID 기반에서 **매장 ID 기반 구조**로 변경되었습니다. 프론트엔드에서 API 호출 방식을 업데이트해야 합니다.

## 🔄 변경된 API 플로우

### 기존 플로우 (변경 전)

```
QR 스캔 → /api/stores/spotline/{qrId} → 매장 정보 표시
```

### 새로운 플로우 (변경 후)

```
QR 스캔 → /api/qr/{qrId}/store → storeId 획득 → /api/stores/spotline/store/{storeId} → 매장 정보 표시
```

## 🛠️ 프론트엔드 수정 사항

### 1. QR 스캔 처리 함수 수정

**기존 코드:**

```javascript
// 기존 방식 - QR ID로 직접 매장 정보 조회
const getStoreByQR = async (qrId) => {
  const response = await fetch(`/api/stores/spotline/${qrId}`);
  return response.json();
};
```

**새로운 코드:**

```javascript
// 새로운 방식 - 2단계 조회
const getStoreByQR = async (qrId) => {
  try {
    // 1단계: QR ID로 매장 ID 조회
    const qrResponse = await fetch(`/api/qr/${qrId}/store`);
    const qrData = await qrResponse.json();

    if (!qrData.success) {
      throw new Error(qrData.message);
    }

    const { storeId, isDemo } = qrData.data;

    // 2단계: 매장 ID로 매장 상세 정보 조회
    const storeResponse = await fetch(`/api/stores/spotline/store/${storeId}`);
    const storeData = await storeResponse.json();

    return {
      ...storeData,
      isDemo, // 데모 여부 정보 추가
    };
  } catch (error) {
    console.error("QR 스캔 처리 오류:", error);
    throw error;
  }
};
```

### 2. 데모 소개 페이지 처리

**데모 매장 목록 조회:**

```javascript
const getDemoStores = async () => {
  const response = await fetch("/api/demo/stores");
  const data = await response.json();

  if (data.success) {
    return data.data.map((store) => ({
      id: store._id,
      name: store.name,
      qrId: store.qrCode.id,
      shortDescription: store.shortDescription,
      representativeImage: store.representativeImage,
    }));
  }

  throw new Error(data.message);
};
```

**데모 보기 버튼 클릭 처리:**

```javascript
const handleDemoView = async (storeId) => {
  try {
    // 매장 ID로 직접 매장 상세 정보 조회
    const response = await fetch(`/api/stores/spotline/store/${storeId}`);
    const data = await response.json();

    if (data.success) {
      // 매장 상세 페이지로 이동 또는 모달 표시
      showStoreDetail(data.data);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("데모 매장 조회 오류:", error);
    alert("데모 매장 정보를 불러올 수 없습니다.");
  }
};
```

### 3. 통합된 매장 조회 함수

```javascript
// QR ID 또는 매장 ID로 매장 정보 조회하는 통합 함수
const getStoreInfo = async (identifier, isStoreId = false) => {
  try {
    if (isStoreId) {
      // 매장 ID로 직접 조회
      const response = await fetch(`/api/stores/spotline/store/${identifier}`);
      return response.json();
    } else {
      // QR ID로 2단계 조회
      return await getStoreByQR(identifier);
    }
  } catch (error) {
    console.error("매장 정보 조회 오류:", error);
    throw error;
  }
};
```

## 📱 사용 시나리오별 구현

### 시나리오 1: QR 코드 스캔

```javascript
// QR 스캔 결과 처리
const handleQRScan = async (qrId) => {
  try {
    const storeData = await getStoreByQR(qrId);

    if (storeData.isDemo) {
      // 데모 매장인 경우
      showDemoStore(storeData.data);
    } else {
      // 실제 매장인 경우
      showProductionStore(storeData.data);
    }
  } catch (error) {
    showErrorMessage("QR 코드를 인식할 수 없습니다.");
  }
};
```

### 시나리오 2: 데모 소개 페이지

```javascript
// 데모 소개 페이지 컴포넌트
const DemoIntroPage = () => {
  const [demoStores, setDemoStores] = useState([]);

  useEffect(() => {
    const loadDemoStores = async () => {
      try {
        const stores = await getDemoStores();
        setDemoStores(stores);
      } catch (error) {
        console.error("데모 매장 목록 로드 실패:", error);
      }
    };

    loadDemoStores();
  }, []);

  const handleDemoClick = (storeId) => {
    // 매장 ID를 사용하여 데모 보기
    handleDemoView(storeId);
  };

  return (
    <div>
      <h2>SpotLine 데모 체험</h2>
      {demoStores.map((store) => (
        <div key={store.id} className="demo-store-card">
          <img src={store.representativeImage} alt={store.name} />
          <h3>{store.name}</h3>
          <p>{store.shortDescription}</p>
          <button onClick={() => handleDemoClick(store.id)}>데모 보기</button>
        </div>
      ))}
    </div>
  );
};
```

### 시나리오 3: URL 라우팅 처리

```javascript
// React Router 또는 Next.js 라우팅
const StoreDetailPage = ({ params }) => {
  const [storeData, setStoreData] = useState(null);
  const { id } = params; // URL에서 매장 ID 또는 QR ID 추출

  useEffect(() => {
    const loadStore = async () => {
      try {
        // ID 형태로 매장 ID인지 QR ID인지 판단
        const isStoreId = id.length === 24; // MongoDB ObjectId 길이
        const data = await getStoreInfo(id, isStoreId);
        setStoreData(data.data);
      } catch (error) {
        console.error("매장 정보 로드 실패:", error);
      }
    };

    loadStore();
  }, [id]);

  return storeData ? <StoreDetail store={storeData} /> : <Loading />;
};
```

## 🔍 API 응답 형태

### QR → 매장 ID 조회 응답

```json
{
  "success": true,
  "message": "QR 코드 조회 성공",
  "data": {
    "qrId": "cafe_gangnam_001",
    "storeId": "675a1b2c3d4e5f6789012346",
    "storeName": "카페 스팟라인",
    "scanCount": 5,
    "isDemo": false
  }
}
```

### 매장 상세 정보 조회 응답

```json
{
  "success": true,
  "message": "SpotLine 매장 조회 성공",
  "data": {
    "id": "675a1b2c3d4e5f6789012346",
    "name": "카페 스팟라인",
    "shortDescription": "조용한 분위기의 프리미엄 카페",
    "representativeImage": "https://...",
    "location": {
      "address": "서울시 강남구 테헤란로 123",
      "mapLink": "https://maps.google.com/..."
    },
    "externalLinks": {
      "instagram": "https://instagram.com/cafe_spotline",
      "website": "https://cafe-spotline.com"
    },
    "spotlineStory": "이곳은 SpotLine이 엄선한...",
    "nextSpots": [
      {
        "id": "675a1b2c3d4e5f6789012347",
        "name": "갤러리 아트",
        "shortDescription": "현대 미술 전시 공간",
        "representativeImage": "https://...",
        "distance": 250
      }
    ],
    "qrCode": {
      "id": "cafe_gangnam_001",
      "isActive": true
    }
  }
}
```

## ⚠️ 주의사항

### 1. 에러 처리

- QR 코드가 존재하지 않는 경우
- 매장이 비활성화된 경우
- 네트워크 오류 처리

### 2. 로딩 상태 관리

- 2단계 API 호출로 인한 로딩 시간 증가
- 적절한 로딩 인디케이터 표시

### 3. 캐싱 고려

- QR → 매장 ID 매핑 결과 캐싱
- 매장 상세 정보 캐싱

## 🧪 테스트 데이터

### 데모 QR 코드

- `demo_cafe_001` → 카페 데모
- `demo_gallery_001` → 갤러리 데모
- `demo_restaurant_001` → 레스토랑 데모
- `demo_bookcafe_001` → 북카페 데모

### 프로덕션 QR 코드

- `cafe_gangnam_001` → 카페 스팟라인
- `restaurant_hongdae_001` → 레스토랑 홍대
- `gallery_itaewon_001` → 갤러리 이태원

## 🚀 배포 체크리스트

- [ ] QR 스캔 함수 업데이트
- [ ] 데모 소개 페이지 수정
- [ ] 매장 상세 페이지 라우팅 수정
- [ ] 에러 처리 로직 추가
- [ ] 로딩 상태 UI 개선
- [ ] 테스트 케이스 작성
- [ ] 기존 QR 코드 호환성 확인

이 가이드를 따라 프론트엔드를 수정하면 새로운 매장 ID 기반 API 구조와 완벽하게 호환됩니다!
