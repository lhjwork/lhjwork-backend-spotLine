# SpotLine 프론트엔드 개발 프롬프트 Version001

## 📌 SpotLine 정체성 (반드시 준수)

**SpotLine은:**

- ❌ 광고 플랫폼이 아니다
- ❌ 리뷰 서비스가 아니다
- ❌ 사용자 참여형 커뮤니티가 아니다

**SpotLine의 목적:**

- ✅ 현재 장소를 기준으로 다음 경험을 자연스럽게 제안
- ✅ 사용자 이동 흐름을 관찰
- ✅ 큐레이션의 신뢰를 축적

---

## 🎨 UI/UX 설계 원칙

### 1. 장소 상세 페이지 구조

```jsx
// 권장 컴포넌트 구조
<SpotDetailPage>
  <HeroSection>
    <RepresentativeImage /> {/* 1장만 */}
    <PlaceTitle />
    <ShortDescription /> {/* 한 문장만 */}
    <ExternalLinks /> {/* 아이콘 형태만 */}
  </HeroSection>

  <NextSpotsSection>
    {" "}
    {/* 가장 중요한 영역 */}
    <SectionTitle>이 장소 다음엔</SectionTitle>
    <SpotGrid maxItems={4}>
      <SpotCard />
      <SpotCard />
      <SpotCard />
      <SpotCard />
    </SpotGrid>
  </NextSpotsSection>

  <CollapsibleStory>
    {" "}
    {/* 선택적 */}
    <CollapseButton>SpotLine의 관점</CollapseButton>
    <StoryContent />
  </CollapsibleStory>
</SpotDetailPage>
```

### 2. 금지된 UI 요소들

```jsx
// ❌ 절대 사용하지 말 것
<StarRating />
<ReviewSection />
<LikeButton />
<BookmarkButton />
<ShareButton />
<PriceDisplay />
<PromotionBanner />
<CallToActionButton />

// ❌ 금지된 텍스트
"지금 방문하세요!"
"최고의 맛집"
"인기 급상승"
"할인 중"
"리뷰 남기기"
```

### 3. 권장 UI 패턴

```jsx
// ✅ SpotLine 스타일 컴포넌트
const SpotCard = ({ spot }) => (
  <Card className="minimal-card">
    <Image src={spot.representativeImage} />
    <Title>{spot.name}</Title>
    <Description>{spot.shortDescription}</Description>
    <MapLink href={spot.mapLink}>
      <MapIcon />
    </MapLink>
  </Card>
);

const ExternalLinks = ({ links }) => (
  <LinkContainer>
    {links.instagram && (
      <IconLink href={links.instagram}>
        <InstagramIcon />
      </IconLink>
    )}
    {links.blog && (
      <IconLink href={links.blog}>
        <BlogIcon />
      </IconLink>
    )}
    {links.notion && (
      <IconLink href={links.notion}>
        <NotionIcon />
      </IconLink>
    )}
    {links.website && (
      <IconLink href={links.website}>
        <WebIcon />
      </IconLink>
    )}
  </LinkContainer>
);
```

---

## 🔌 API 연동 가이드

### 1. QR 스캔 플로우

```typescript
// QR 스캔 후 첫 화면 로딩
const loadSpotlinePlace = async (qrId: string) => {
  try {
    // 1. 매장 정보 조회
    const placeResponse = await fetch(`/api/stores/spotline/${qrId}`);
    const placeData = await placeResponse.json();

    // 2. 다음 Spot 조회
    const spotsResponse = await fetch(`/api/recommendations/next-spots/${placeData.data.id}?limit=4`);
    const spotsData = await spotsResponse.json();

    // 3. 페이지 진입 이벤트 로깅
    await logEvent({
      qrCode: qrId,
      store: placeData.data.id,
      eventType: "page_enter",
      sessionId: getSessionId(),
    });

    return {
      place: placeData.data,
      nextSpots: spotsData.data,
    };
  } catch (error) {
    console.error("SpotLine 데이터 로딩 실패:", error);
  }
};
```

### 2. 이벤트 로깅 시스템

```typescript
// 이벤트 로깅 유틸리티
const logEvent = async (eventData: {
  qrCode: string;
  store: string;
  eventType: "page_enter" | "spot_click" | "map_link_click" | "page_exit" | "external_link_click";
  targetStore?: string;
  sessionId: string;
  metadata?: {
    spotPosition?: number;
    stayDuration?: number;
    linkType?: string;
    nextSpotId?: string;
  };
}) => {
  try {
    await fetch("/api/analytics/spotline-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });
  } catch (error) {
    // 로깅 실패는 사용자 경험에 영향 주지 않음
    console.warn("이벤트 로깅 실패:", error);
  }
};

// Spot 클릭 이벤트
const handleSpotClick = (spot: Spot, position: number) => {
  logEvent({
    qrCode: currentQrId,
    store: currentStoreId,
    eventType: "spot_click",
    targetStore: spot.id,
    sessionId: getSessionId(),
    metadata: {
      spotPosition: position,
      nextSpotId: spot.id,
    },
  });

  // 다음 페이지로 이동
  router.push(`/spot/${spot.qrCode}`);
};
```

### 3. 체류 시간 측정

```typescript
// 페이지 체류 시간 추적
const useStayDuration = (qrId: string, storeId: string) => {
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const handleBeforeUnload = () => {
      const stayDuration = Math.floor((Date.now() - startTime) / 1000);

      // 페이지 이탈 이벤트 로깅
      logEvent({
        qrCode: qrId,
        store: storeId,
        eventType: "page_exit",
        sessionId: getSessionId(),
        metadata: { stayDuration },
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [qrId, storeId, startTime]);
};
```

---

## 📱 반응형 디자인

### 1. 모바일 우선 설계

```scss
// SpotLine 모바일 스타일
.spot-detail-page {
  padding: 0;

  .hero-section {
    .representative-image {
      width: 100%;
      height: 40vh;
      object-fit: cover;
    }

    .place-info {
      padding: 20px;

      .place-title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .short-description {
        font-size: 16px;
        color: #666;
        line-height: 1.5;
        margin-bottom: 16px;
      }

      .external-links {
        display: flex;
        gap: 16px;

        .icon-link {
          width: 32px;
          height: 32px;
          opacity: 0.7;
          transition: opacity 0.2s;

          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }

  .next-spots-section {
    padding: 32px 20px;
    background: #f8f9fa;

    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      text-align: center;
    }

    .spot-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }
  }
}
```

### 2. Spot 카드 디자인

```scss
.spot-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  .spot-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }

  .spot-info {
    padding: 16px;

    .spot-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .spot-description {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .map-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #007bff;
      text-decoration: none;

      .map-icon {
        width: 16px;
        height: 16px;
      }
    }
  }
}
```

---

## 🔍 SEO 최적화

### 1. Next.js 메타데이터

```typescript
// pages/spot/[qrId].tsx
export async function getServerSideProps({ params }) {
  const { qrId } = params;

  try {
    const response = await fetch(`${API_BASE_URL}/api/stores/spotline/${qrId}`);
    const data = await response.json();

    if (!data.success) {
      return { notFound: true };
    }

    return {
      props: {
        place: data.data,
        meta: {
          title: `${data.data.name} 다음엔 어디 갈까 | SpotLine`,
          description: `${data.data.shortDescription} - 자연스럽게 이어지는 다음 경험을 찾아보세요`,
          image: data.data.representativeImage,
          url: `https://spotline.com/spot/${qrId}`,
        },
      },
    };
  } catch (error) {
    return { notFound: true };
  }
}

const SpotPage = ({ place, meta }) => (
  <>
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:url" content={meta.url} />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
    <SpotDetailPage place={place} />
  </>
);
```

### 2. 구조화된 데이터

```typescript
const generateStructuredData = (place) => ({
  "@context": "https://schema.org",
  "@type": "Place",
  name: place.name,
  description: place.shortDescription,
  image: place.representativeImage,
  address: {
    "@type": "PostalAddress",
    streetAddress: place.location.address,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: place.location.coordinates.coordinates[1],
    longitude: place.location.coordinates.coordinates[0],
  },
});
```

---

## 🚫 개발 시 주의사항

### 1. 절대 구현하지 말 것

```typescript
// ❌ 금지된 기능들
const ForbiddenFeatures = {
  // 사용자 인증
  login: () => {
    throw new Error("로그인 기능 금지");
  },
  signup: () => {
    throw new Error("회원가입 기능 금지");
  },

  // 사용자 생성 콘텐츠
  writeReview: () => {
    throw new Error("리뷰 작성 금지");
  },
  addRating: () => {
    throw new Error("평점 기능 금지");
  },
  bookmark: () => {
    throw new Error("북마크 기능 금지");
  },

  // 광고성 기능
  showPromotion: () => {
    throw new Error("프로모션 표시 금지");
  },
  trackPersonalData: () => {
    throw new Error("개인정보 수집 금지");
  },

  // 결제 관련
  payment: () => {
    throw new Error("결제 기능 금지");
  },
  subscription: () => {
    throw new Error("구독 기능 금지");
  },
};
```

### 2. 데이터 수집 제한

```typescript
// ✅ 허용된 데이터 수집
const allowedTracking = {
  sessionId: generateSessionId(), // 익명 세션만
  pageViews: true,
  clickPatterns: true,
  stayDuration: true,
};

// ❌ 금지된 데이터 수집
const forbiddenTracking = {
  userId: null, // 개인 식별 금지
  email: null,
  phoneNumber: null,
  gpsLocation: null, // GPS 위치 금지
  deviceFingerprint: null,
  personalPreferences: null,
};
```

---

## 📊 성능 최적화

### 1. 이미지 최적화

```typescript
// Next.js Image 컴포넌트 사용
import Image from "next/image";

const RepresentativeImage = ({ src, alt }) => <Image src={src} alt={alt} width={400} height={300} priority placeholder="blur" blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..." />;
```

### 2. 코드 분할

```typescript
// 동적 임포트로 번들 크기 최적화
const CollapsibleStory = dynamic(() => import("../components/CollapsibleStory"), {
  loading: () => <div>로딩 중...</div>,
  ssr: false,
});

const MapModal = dynamic(() => import("../components/MapModal"), {
  ssr: false,
});
```

---

## 🧪 테스트 가이드

### 1. 핵심 사용자 플로우 테스트

```typescript
// QR 스캔 → 페이지 로딩 → Spot 클릭 플로우
describe("SpotLine 핵심 플로우", () => {
  test("QR 스캔 후 매장 정보 표시", async () => {
    const { getByText, getByRole } = render(<SpotPage qrId="test_qr" />);

    await waitFor(() => {
      expect(getByText("카페 스팟라인")).toBeInTheDocument();
      expect(getByText("조용한 분위기에서 책과 함께하는 시간")).toBeInTheDocument();
    });
  });

  test("다음 Spot 최대 4개 표시", async () => {
    const { getAllByTestId } = render(<NextSpotsSection storeId="test_store" />);

    await waitFor(() => {
      const spotCards = getAllByTestId("spot-card");
      expect(spotCards.length).toBeLessThanOrEqual(4);
    });
  });

  test("금지된 UI 요소 없음", () => {
    const { queryByText, queryByRole } = render(<SpotPage qrId="test_qr" />);

    expect(queryByText("리뷰")).not.toBeInTheDocument();
    expect(queryByText("평점")).not.toBeInTheDocument();
    expect(queryByRole("button", { name: /좋아요/ })).not.toBeInTheDocument();
  });
});
```

---

## 📋 체크리스트

### 개발 완료 전 확인사항

- [ ] 대표 이미지 1장만 표시
- [ ] 한 문장 설명만 표시
- [ ] 외부 링크는 아이콘 형태만
- [ ] "다음으로 이어지는 Spot" 영역이 가장 눈에 띔
- [ ] Spot 개수 2-4개로 제한
- [ ] 각 Spot에 지도 링크 포함
- [ ] SpotLine 스토리는 접힘 UI
- [ ] 별점/평점 UI 완전 제거
- [ ] 리뷰/댓글 UI 완전 제거
- [ ] 좋아요/북마크 버튼 제거
- [ ] 가격 정보 숨김
- [ ] 광고성 CTA 버튼 제거
- [ ] 개인 식별 데이터 수집 안 함
- [ ] 세션 기반 익명 추적만 사용
- [ ] 모바일 반응형 완벽 지원
- [ ] SEO 메타태그 최적화
- [ ] 페이지 로딩 속도 3초 이내

---

## 🔄 Version001 특징

**이번 버전의 핵심:**

- SpotLine 정체성 완전 반영
- 광고성 요소 완전 제거
- 자연스러운 경험 흐름 중심
- 개인정보 보호 강화

**다음 버전 예정:**

- 사용자 추천 기능 (최소 위험 구조)
- 다국어 지원
- 오프라인 지원
- PWA 기능
