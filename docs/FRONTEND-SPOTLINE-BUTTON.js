// SpotLine 체험하기 버튼 구현 코드

// 1. 기본 구현 (추천) - 대표 매장으로 고정
const handleSpotlineExperience = () => {
  const qrCodeId = "cafe_gangnam_001"; // 카페 스팟라인 (대표 매장)
  const baseUrl = "http://localhost:4000"; // 프로덕션에서는 실제 서버 URL로 변경

  window.location.href = `${baseUrl}/api/stores/spotline/${qrCodeId}`;
};

// 2. 랜덤 매장 선택 구현
const handleSpotlineExperienceRandom = () => {
  const availableStores = [
    "cafe_gangnam_001", // 카페 스팟라인 (강남)
    "cafe_hongdae_001", // 바이닐 카페 (홍대)
    "culture_gangnam_001", // 북카페 리딩룸 (강남)
    "gallery_gangnam_001", // 아트 갤러리 모던 (강남)
    "food_hongdae_001", // 스트리트 푸드 마켓 (홍대)
  ];

  const randomIndex = Math.floor(Math.random() * availableStores.length);
  const selectedQrId = availableStores[randomIndex];
  const baseUrl = "http://localhost:4000";

  window.location.href = `${baseUrl}/api/stores/spotline/${selectedQrId}`;
};

// 3. 지역별 선택 구현
const handleSpotlineExperienceByArea = (area = "random") => {
  const storesByArea = {
    gangnam: [
      "cafe_gangnam_001", // 카페 스팟라인
      "dessert_gangnam_001", // 디저트 하우스
      "culture_gangnam_001", // 북카페 리딩룸
      "gallery_gangnam_001", // 아트 갤러리 모던
      "brunch_gangnam_001", // 브런치 스팟
    ],
    hongdae: [
      "cafe_hongdae_001", // 바이닐 카페
      "food_hongdae_001", // 스트리트 푸드 마켓
      "record_hongdae_001", // 인디 레코드샵
    ],
  };

  let selectedStores;
  if (area === "random") {
    selectedStores = [...storesByArea.gangnam, ...storesByArea.hongdae];
  } else {
    selectedStores = storesByArea[area] || storesByArea.gangnam;
  }

  const randomIndex = Math.floor(Math.random() * selectedStores.length);
  const selectedQrId = selectedStores[randomIndex];
  const baseUrl = "http://localhost:4000";

  window.location.href = `${baseUrl}/api/stores/spotline/${selectedQrId}`;
};

// 4. React 컴포넌트 예시
const SpotlineExperienceButton = () => {
  const handleClick = () => {
    // 기본 구현 사용
    handleSpotlineExperience();
  };

  return (
    <button
      onClick={handleClick}
      className="spotline-experience-btn"
      style={{
        backgroundColor: "#4285f4",
        color: "white",
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        cursor: "pointer",
      }}
    >
      🎯 SpotLine 체험하기
    </button>
  );
};

// 5. 에러 처리가 포함된 고급 구현
const handleSpotlineExperienceWithErrorHandling = async () => {
  try {
    const qrCodeId = "cafe_gangnam_001";
    const baseUrl = "http://localhost:4000";
    const url = `${baseUrl}/api/stores/spotline/${qrCodeId}`;

    // API 호출하여 매장 존재 여부 확인 (선택사항)
    const response = await fetch(url);

    if (response.ok) {
      window.location.href = url;
    } else {
      console.error("매장 정보를 찾을 수 없습니다.");
      alert("죄송합니다. 현재 서비스를 이용할 수 없습니다.");
    }
  } catch (error) {
    console.error("SpotLine 체험 중 오류 발생:", error);
    alert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
};

// 6. HTML에서 직접 사용하는 경우
/*
<button onclick="handleSpotlineExperience()">
  SpotLine 체험하기
</button>
*/

// 7. 환경별 URL 설정
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // 브라우저 환경
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:4000";
    } else {
      return "https://your-production-domain.com"; // 실제 프로덕션 URL로 변경
    }
  }

  return "http://localhost:4000"; // 기본값
};

// 환경을 고려한 최종 구현
const handleSpotlineExperienceFinal = () => {
  const qrCodeId = "cafe_gangnam_001";
  const baseUrl = getBaseUrl();

  window.location.href = `${baseUrl}/api/stores/spotline/${qrCodeId}`;
};

// 사용 방법:
// 1. 가장 간단한 방법: handleSpotlineExperience()
// 2. 랜덤 매장: handleSpotlineExperienceRandom()
// 3. 지역별 선택: handleSpotlineExperienceByArea('gangnam') 또는 handleSpotlineExperienceByArea('hongdae')
// 4. 에러 처리 포함: handleSpotlineExperienceWithErrorHandling()
// 5. 환경 고려: handleSpotlineExperienceFinal()

export { handleSpotlineExperience, handleSpotlineExperienceRandom, handleSpotlineExperienceByArea, handleSpotlineExperienceWithErrorHandling, handleSpotlineExperienceFinal, SpotlineExperienceButton };
