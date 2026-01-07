# SpotLine 프론트엔드 개발 가이드 VERSION002

## 📌 SpotLine 정체성 (중요 - 반드시 준수)

SpotLine은:

- **광고 플랫폼이 아닙니다**
- **리뷰 서비스가 아닙니다**
- **사용자 참여형 커뮤니티가 아닙니다**

SpotLine의 목적:

- **현재 장소를 기준으로 다음 경험을 자연스럽게 제안**
- **사용자 이동 흐름을 관찰**
- **큐레이션의 신뢰를 축적**

## 🆕 VERSION002 주요 변경사항

### 1. 체험하기 버튼 개선

- **새로운 Experience API 도입**: `/api/experience`
- **관리자 설정 기반 동작**: 관리자가 설정한 체험 방식에 따라 매장 선택
- **QR 코드 ID 표준화**: UUID 대신 의미있는 ID 사용

### 2. TypeScript 완전 지원

- 모든 API에 대한 완전한 타입 정의 제공
- React/Next.js 컴포넌트 예시 포함
- 커스텀 훅 및 유틸리티 함수 제공

### 3. 관리자 연동 강화

- 체험 설정을 통한 동적 매장 선택
- 실시간 설정 변경 반영
- 사용 통계 자동 수집

## 🎯 "SpotLine 체험하기" 버튼 구현

### 기본 구현 (추천)

```typescript
interface ExperienceResult {
  qrId: string;
  storeName: string;
  storeId: string;
  area: string;
  configUsed: {
    id: string;
    name: string;
    type: string;
  };
  redirectUrl: string;
}

const handleSpotlineExperience = async (): Promise<void> => {
  try {
    const response = await fetch("http://localhost:4000/api/experience");
    const data: { success: boolean; data: ExperienceResult } = await response.json();

    if (data.success) {
      // 관리자 설정에 따라 선택된 매장으로 이동
      window.location.href = data.data.redirectUrl;
    }
  } catch (error) {
    console.error("SpotLine 체험 중 오류:", error);
    // 폴백: 기본 매장으로 이동
    window.location.href = "http://localhost:4000/api/stores/spotline/cafe_gangnam_001";
  }
};
```

### React 컴포넌트 구현

```typescript
import React, { useState } from "react";

interface SpotlineExperienceButtonProps {
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error) => void;
  loadingText?: string;
}

const SpotlineExperienceButton: React.FC<SpotlineExperienceButtonProps> = ({ className = "spotline-experience-btn", style = {}, onError, loadingText = "체험 준비 중..." }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/experience");
      const data = await response.json();

      if (data.success) {
        window.location.href = data.data.redirectUrl;
      } else {
        throw new Error(data.message || "체험을 시작할 수 없습니다.");
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error("알 수 없는 오류가 발생했습니다.");
      onError?.(errorObj);

      // 폴백 처리
      window.location.href = "http://localhost:4000/api/stores/spotline/cafe_gangnam_001";
    } finally {
      setIsLoading(false);
    }
  };

  const defaultStyle: React.CSSProperties = {
    backgroundColor: "#4285f4",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: isLoading ? "not-allowed" : "pointer",
    fontWeight: "bold",
    opacity: isLoading ? 0.7 : 1,
    ...style,
  };

  return (
    <button onClick={handleClick} className={className} style={defaultStyle} disabled={isLoading}>
      {isLoading ? loadingText : "🎯 SpotLine 체험하기"}
    </button>
  );
};

export default SpotlineExperienceButton;
```

### Next.js 커스텀 훅

```typescript
import { useState, useCallback } from "react";

interface UseSpotlineExperienceReturn {
  isLoading: boolean;
  error: string | null;
  startExperience: () => Promise<void>;
  getExperiencePreview: () => Promise<ExperienceResult | null>;
}

const useSpotlineExperience = (): UseSpotlineExperienceReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBaseUrl = useCallback((): string => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  }, []);

  const startExperience = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/experience`);
      const data = await response.json();

      if (data.success) {
        window.location.href = data.data.redirectUrl;
      } else {
        throw new Error(data.message || "체험을 시작할 수 없습니다.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);

      // 폴백 처리
      const baseUrl = getBaseUrl();
      window.location.href = `${baseUrl}/api/stores/spotline/cafe_gangnam_001`;
    } finally {
      setIsLoading(false);
    }
  }, [getBaseUrl]);

  const getExperiencePreview = useCallback(async (): Promise<ExperienceResult | null> => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/experience`);
      const data = await response.json();

      return data.success ? data.data : null;
    } catch (error) {
      console.error("체험 미리보기 실패:", error);
      return null;
    }
  }, [getBaseUrl]);

  return {
    isLoading,
    error,
    startExperience,
    getExperiencePreview,
  };
};

export default useSpotlineExperience;
```

## 🏪 매장 상세 페이지 UX 가이드

### 1. 상단 영역 (필수)

```typescript
interface StoreHeaderProps {
  store: SpotlineStore;
}

const StoreHeader: React.FC<StoreHeaderProps> = ({ store }) => {
  return (
    <div className="store-header">
      {/* 대표 이미지 1장만 */}
      <img src={store.representativeImage} alt={store.name} className="representative-image" />

      {/* 장소 이름 + 한 문장 설명만 */}
      <div className="store-info">
        <h1 className="store-name">{store.name}</h1>
        <p className="store-description">{store.shortDescription}</p>
      </div>

      {/* 외부 링크 - 아이콘 형태로만 */}
      <div className="external-links">
        {store.externalLinks.instagram && (
          <a href={store.externalLinks.instagram} target="_blank" rel="noopener noreferrer">
            <InstagramIcon />
          </a>
        )}
        {store.externalLinks.website && (
          <a href={store.externalLinks.website} target="_blank" rel="noopener noreferrer">
            <WebsiteIcon />
          </a>
        )}
      </div>
    </div>
  );
};
```

### 2. "다음으로 이어지는 Spot" 영역 (핵심)

```typescript
interface NextSpotsProps {
  currentStoreId: string;
}

const NextSpots: React.FC<NextSpotsProps> = ({ currentStoreId }) => {
  const [nextSpots, setNextSpots] = useState<SpotlineStore[]>([]);

  useEffect(() => {
    // 추천 매장 조회
    fetch(`http://localhost:4000/api/recommendations/${currentStoreId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNextSpots(data.data.slice(0, 4)); // 최대 4개
        }
      });
  }, [currentStoreId]);

  return (
    <section className="next-spots">
      <h2>이 장소 다음엔</h2>
      <div className="spots-grid">
        {nextSpots.map((spot) => (
          <div key={spot.id} className="spot-card">
            <img src={spot.representativeImage} alt={spot.name} />
            <div className="spot-info">
              <h3>{spot.name}</h3>
              <p>{spot.shortDescription}</p>
              <a href={spot.location.mapLink} target="_blank" rel="noopener noreferrer" className="map-link">
                지도 보기
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
```

### 3. 장소 이야기 영역 (접힘 UI)

```typescript
const StoreStory: React.FC<{ story: string }> = ({ story }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!story) return null;

  return (
    <section className="store-story">
      <button onClick={() => setIsExpanded(!isExpanded)} className="story-toggle">
        SpotLine의 관점 {isExpanded ? "▲" : "▼"}
      </button>

      {isExpanded && (
        <div className="story-content">
          <p>{story}</p>
        </div>
      )}
    </section>
  );
};
```

## 🚫 금지된 기능들

다음 기능들은 **절대 구현하지 마세요**:

```typescript
// ❌ 금지된 컴포넌트들
const ForbiddenComponents = {
  // 별점/평점 시스템
  StarRating: () => null,

  // 후기/댓글 시스템
  ReviewSection: () => null,

  // 좋아요/북마크
  LikeButton: () => null,
  BookmarkButton: () => null,

  // 공유 CTA 강조
  ShareButton: () => null,

  // 가격 정보 (데이터가 있어도 숨김)
  PriceInfo: () => null,

  // 회원가입/로그인 (현재는 금지)
  SignUpForm: () => null,
  LoginForm: () => null,
};
```

## 📊 데이터 수집 (간접 지표만)

```typescript
// 허용된 분석 데이터만 수집
interface AnalyticsEvent {
  qrCode: string;
  eventType: "page_enter" | "spot_click" | "map_link_click" | "external_link_click" | "page_exit";
  sessionId: string;
  timestamp: Date;
  metadata?: {
    spotPosition?: number;
    stayDuration?: number;
    linkType?: string;
  };
}

const trackEvent = async (event: Omit<AnalyticsEvent, "timestamp">): Promise<void> => {
  try {
    await fetch("http://localhost:4000/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,
        timestamp: new Date(),
      }),
    });
  } catch (error) {
    console.error("Analytics tracking failed:", error);
  }
};

// 사용 예시
const handleSpotClick = (spotId: string, position: number): void => {
  trackEvent({
    qrCode: currentQrCode,
    eventType: "spot_click",
    sessionId: getSessionId(),
    metadata: { spotPosition: position },
  });
};
```

## 🔧 환경 설정

### 환경변수 (.env.local)

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_SESSION_TIMEOUT=1800000
```

### TypeScript 설정

```json
// tsconfig.json에 추가
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/components/*": ["components/*"],
      "@/hooks/*": ["hooks/*"],
      "@/types/*": ["types/*"],
      "@/utils/*": ["utils/*"]
    }
  }
}
```

## 🎨 스타일링 가이드

### SpotLine 브랜드 컬러

```css
:root {
  --spotline-primary: #4285f4;
  --spotline-secondary: #34a853;
  --spotline-accent: #fbbc04;
  --spotline-error: #ea4335;
  --spotline-text: #202124;
  --spotline-text-secondary: #5f6368;
  --spotline-background: #ffffff;
  --spotline-surface: #f8f9fa;
}
```

### 컴포넌트 스타일 예시

```css
.spotline-experience-btn {
  background: var(--spotline-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.spotline-experience-btn:hover {
  background: #3367d6;
  transform: translateY(-1px);
}

.next-spots {
  margin: 32px 0;
  padding: 24px;
  background: var(--spotline-surface);
  border-radius: 12px;
}

.spots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
```

## 🧪 테스트 가이드

### 단위 테스트 예시

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SpotlineExperienceButton from "@/components/SpotlineExperienceButton";

describe("SpotlineExperienceButton", () => {
  it("should call experience API on click", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: { redirectUrl: "http://localhost:4000/api/stores/spotline/cafe_gangnam_001" },
        }),
    });

    global.fetch = mockFetch;
    delete (window as any).location;
    (window as any).location = { href: "" };

    render(<SpotlineExperienceButton />);

    const button = screen.getByText("🎯 SpotLine 체험하기");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:4000/api/experience");
    });
  });
});
```

## 📱 반응형 디자인

```css
/* 모바일 우선 디자인 */
.store-header {
  padding: 16px;
}

.representative-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

/* 태블릿 */
@media (min-width: 768px) {
  .store-header {
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .representative-image {
    width: 300px;
    height: 200px;
    flex-shrink: 0;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .spots-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## 🚀 배포 가이드

### Vercel 배포

```json
// vercel.json
{
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "https://your-api-domain.com"
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-api-domain.com/api/:path*"
    }
  ]
}
```

### 성능 최적화

```typescript
// 이미지 최적화
import Image from "next/image";

const OptimizedStoreImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={200}
      priority
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
};
```

이 가이드를 따라 구현하면 SpotLine의 정체성에 맞는 자연스럽고 효과적인 프론트엔드를 만들 수 있습니다.
