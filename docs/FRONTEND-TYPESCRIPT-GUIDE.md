# 프론트엔드 수정 가이드 - SpotLine 체험하기 버튼 (TypeScript)

## 문제 상황

현재 프론트엔드에서 "SpotLine 체험하기" 버튼 클릭 시 UUID 형태의 ID(`6ccbb682-df55-4566-ac30-703ddb5cfb7f`)로 요청하고 있어 404 에러가 발생합니다.

## 해결 방법

백엔드에서 사용하는 올바른 QR 코드 ID로 수정해야 합니다.

## TypeScript 타입 정의

```typescript
interface SpotlineStore {
  id: string;
  name: string;
  shortDescription: string;
  representativeImage: string;
  location: {
    address: string;
    mapLink: string;
  };
  externalLinks: {
    instagram?: string;
    blog?: string;
    notion?: string;
    website?: string;
  };
  spotlineStory: string;
}

interface SpotlineApiResponse {
  success: boolean;
  message: string;
  data: SpotlineStore;
}

type AreaType = "gangnam" | "hongdae" | "random";
type QRCodeId = string;
```

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

## TypeScript 프론트엔드 수정 코드

### 1. 기본 구현 (가장 간단)

```typescript
const handleSpotlineExperience = (): void => {
  const qrCodeId: string = "cafe_gangnam_001"; // 대표 매장
  const baseUrl: string = "http://localhost:4000"; // 프로덕션에서는 실제 URL로 변경

  window.location.href = `${baseUrl}/api/stores/spotline/${qrCodeId}`;
};
```

### 2. React 컴포넌트 구현

```typescript
import React from "react";

interface SpotlineButtonProps {
  area?: "gangnam" | "hongdae" | "random";
  className?: string;
  style?: React.CSSProperties;
}

const SpotlineExperienceButton: React.FC<SpotlineButtonProps> = ({ area = "random", className = "spotline-btn", style = {} }) => {
  const availableStores = {
    gangnam: ["cafe_gangnam_001", "culture_gangnam_001", "gallery_gangnam_001"],
    hongdae: ["cafe_hongdae_001", "food_hongdae_001", "record_hongdae_001"],
  };

  const handleClick = (): void => {
    let selectedStores: string[];

    if (area === "random") {
      selectedStores = [...availableStores.gangnam, ...availableStores.hongdae];
    } else {
      selectedStores = availableStores[area];
    }

    const randomIndex = Math.floor(Math.random() * selectedStores.length);
    const selectedQrId = selectedStores[randomIndex];
    const baseUrl = "http://localhost:4000";

    window.location.href = `${baseUrl}/api/stores/spotline/${selectedQrId}`;
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={{
        backgroundColor: "#4285f4",
        color: "white",
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        cursor: "pointer",
        fontWeight: "bold",
        ...style,
      }}
    >
      🎯 SpotLine 체험하기
    </button>
  );
};

export default SpotlineExperienceButton;
```

### 3. Next.js 구현

```typescript
import { useRouter } from "next/router";

const useSpotlineExperience = () => {
  const router = useRouter();

  const goToSpotlineExperience = (area: "gangnam" | "hongdae" | "random" = "random"): void => {
    const availableStores = {
      gangnam: ["cafe_gangnam_001", "culture_gangnam_001", "gallery_gangnam_001"],
      hongdae: ["cafe_hongdae_001", "food_hongdae_001", "record_hongdae_001"],
    };

    let selectedStores: string[];

    if (area === "random") {
      selectedStores = [...availableStores.gangnam, ...availableStores.hongdae];
    } else {
      selectedStores = availableStores[area];
    }

    const randomIndex = Math.floor(Math.random() * selectedStores.length);
    const selectedQrId = selectedStores[randomIndex];
    const baseUrl = process.env.NODE_ENV === "production" ? "https://your-production-domain.com" : "http://localhost:4000";

    window.location.href = `${baseUrl}/api/stores/spotline/${selectedQrId}`;
  };

  return { goToSpotlineExperience };
};

// 사용 예시
const MyPage: React.FC = () => {
  const { goToSpotlineExperience } = useSpotlineExperience();

  return <button onClick={() => goToSpotlineExperience("random")}>SpotLine 체험하기</button>;
};
```

### 4. 에러 처리가 포함된 고급 구현

```typescript
import { useState, useCallback } from "react";

interface UseSpotlineReturn {
  isLoading: boolean;
  error: string | null;
  goToExperience: (area?: "gangnam" | "hongdae" | "random") => Promise<void>;
}

const useSpotlineExperienceAdvanced = (): UseSpotlineReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const goToExperience = useCallback(async (area: "gangnam" | "hongdae" | "random" = "random"): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const availableStores = {
        gangnam: ["cafe_gangnam_001", "culture_gangnam_001", "gallery_gangnam_001"],
        hongdae: ["cafe_hongdae_001", "food_hongdae_001", "record_hongdae_001"],
      };

      let selectedStores: string[];

      if (area === "random") {
        selectedStores = [...availableStores.gangnam, ...availableStores.hongdae];
      } else {
        selectedStores = availableStores[area];
      }

      const randomIndex = Math.floor(Math.random() * selectedStores.length);
      const selectedQrId = selectedStores[randomIndex];
      const baseUrl = "http://localhost:4000";
      const url = `${baseUrl}/api/stores/spotline/${selectedQrId}`;

      // API 호출하여 매장 존재 여부 확인
      const response = await fetch(url);

      if (response.ok) {
        window.location.href = url;
      } else {
        throw new Error("매장 정보를 찾을 수 없습니다.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, goToExperience };
};

// 사용 예시
const SpotlineButton: React.FC = () => {
  const { isLoading, error, goToExperience } = useSpotlineExperienceAdvanced();

  return (
    <div>
      <button onClick={() => goToExperience("random")} disabled={isLoading}>
        {isLoading ? "로딩 중..." : "SpotLine 체험하기"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
```

## API 엔드포인트 정보

### SpotLine 전용 매장 조회

- **URL**: `GET /api/stores/spotline/{qrId}`
- **설명**: SpotLine 정체성에 맞는 간소화된 매장 정보 제공
- **TypeScript 응답 타입**:

```typescript
interface SpotlineApiResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    shortDescription: string;
    representativeImage: string;
    location: {
      address: string;
      mapLink: string;
    };
    externalLinks: {
      instagram?: string;
      blog?: string;
      notion?: string;
      website?: string;
    };
    spotlineStory: string;
  };
}
```

## 환경 설정

### 환경변수 설정 (.env.local)

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
# 프로덕션
# NEXT_PUBLIC_API_BASE_URL=https://your-production-domain.com
```

### 환경별 URL 처리

```typescript
const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
};
```

## 테스트 URL

개발 환경에서 테스트할 수 있는 URL들:

- 카페 스팟라인: `http://localhost:4000/api/stores/spotline/cafe_gangnam_001`
- 바이닐 카페: `http://localhost:4000/api/stores/spotline/cafe_hongdae_001`
- 북카페 리딩룸: `http://localhost:4000/api/stores/spotline/culture_gangnam_001`

## 권장 구현 (가장 간단)

```typescript
// 가장 간단하고 효과적인 방법
const handleSpotlineExperience = (): void => {
  window.location.href = "http://localhost:4000/api/stores/spotline/cafe_gangnam_001";
};

// JSX에서 사용
<button onClick={handleSpotlineExperience}>SpotLine 체험하기</button>;
```

이렇게 수정하면 "SpotLine 체험하기" 버튼이 TypeScript 환경에서 정상적으로 작동합니다.
