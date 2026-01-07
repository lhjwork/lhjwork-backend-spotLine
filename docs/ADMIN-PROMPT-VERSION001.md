# SpotLine 관리자 시스템 프롬프트 Version001

## 📌 SpotLine 관리자의 역할

SpotLine 관리자는 **큐레이션의 신뢰를 축적**하는 핵심 역할을 담당합니다.

### 🎯 관리자 목표

- ✅ 자연스러운 경험 흐름 설계
- ✅ 장소 간 연결의 논리성 확보
- ✅ SpotLine 정체성 유지
- ❌ 광고성 콘텐츠 배제

---

## 🏗️ 관리자 시스템 구조

### 1. 간소화된 관리자 기능

```typescript
// 관리자가 할 수 있는 핵심 작업만
interface AdminCapabilities {
  // 장소 관리
  createPlace: (data: SpotlinePlace) => Promise<Place>;
  updatePlace: (id: string, data: Partial<SpotlinePlace>) => Promise<Place>;

  // 연결 관리 (핵심 기능)
  connectSpots: (fromId: string, toSpots: SpotConnection[]) => Promise<void>;
  updateConnections: (fromId: string, connections: SpotConnection[]) => Promise<void>;

  // 외부 링크 관리
  updateExternalLinks: (placeId: string, links: ExternalLinks) => Promise<void>;

  // 간단한 분석
  viewBasicAnalytics: (placeId: string) => Promise<BasicAnalytics>;
}

// ❌ 복잡한 권한 관리는 하지 않음
interface ForbiddenFeatures {
  userManagement: never;
  complexPermissions: never;
  detailedLogging: never;
  advancedAnalytics: never;
}
```

### 2. SpotLine 전용 데이터 구조

```typescript
interface SpotlinePlace {
  // 기본 정보
  name: string;
  category: PlaceCategory;
  location: {
    address: string;
    coordinates: [number, number];
  };

  // SpotLine 정체성 필드들
  shortDescription: string; // 최대 100자, 한 문장
  representativeImage: string; // 1장만
  spotlineStory?: string; // 최대 500자, 접힘 UI용

  // 외부 링크 (아이콘 형태로만 노출)
  externalLinks: {
    instagram?: string;
    blog?: string;
    notion?: string;
    website?: string;
  };

  // QR 코드
  qrCode: {
    id: string;
    isActive: boolean;
  };
}

interface SpotConnection {
  toPlaceId: string;
  category: "next_meal" | "dessert" | "activity" | "shopping" | "culture" | "rest";
  priority: number; // 1-10
  shortReason: string; // 연결 이유 (한 문장)
  walkingTime?: number; // 분
  distance?: number; // 미터
}
```

---

## 🎨 관리자 UI 설계

### 1. 장소 등록/수정 폼

```jsx
const PlaceForm = ({ place, onSave }) => (
  <Form onSubmit={onSave}>
    <Section title="기본 정보">
      <Input label="장소명" value={place.name} required maxLength={50} />
      <Select label="카테고리" value={place.category} options={PLACE_CATEGORIES} required />
      <AddressInput label="주소" value={place.location.address} onCoordinatesChange={handleCoordinatesChange} required />
    </Section>

    <Section title="SpotLine 정보">
      <TextArea label="한 문장 설명" value={place.shortDescription} placeholder="이 장소를 한 문장으로 설명해주세요" maxLength={100} required helperText="QR 스캔 시 첫 화면에 표시됩니다" />

      <ImageUpload label="대표 이미지" value={place.representativeImage} maxFiles={1} required helperText="1장만 업로드 가능합니다" />

      <TextArea
        label="SpotLine 스토리 (선택사항)"
        value={place.spotlineStory}
        placeholder="이 장소가 SpotLine에 포함된 이유를 설명해주세요"
        maxLength={500}
        helperText="접힘 UI로 표시됩니다. 광고성 문구는 피해주세요."
      />
    </Section>

    <Section title="외부 링크">
      <Input label="Instagram" value={place.externalLinks.instagram} placeholder="https://instagram.com/..." type="url" />
      <Input label="블로그" value={place.externalLinks.blog} placeholder="https://blog.naver.com/..." type="url" />
      <Input label="Notion" value={place.externalLinks.notion} placeholder="https://notion.so/..." type="url" />
      <Input label="웹사이트" value={place.externalLinks.website} placeholder="https://..." type="url" />
      <HelperText>아이콘 형태로만 표시됩니다. 클릭 유도 문구는 사용하지 않습니다.</HelperText>
    </Section>

    <Section title="QR 코드">
      <QRCodeGenerator value={place.qrCode.id} onGenerate={handleQRGenerate} />
      <Switch label="QR 코드 활성화" checked={place.qrCode.isActive} onChange={handleQRToggle} />
    </Section>
  </Form>
);
```

### 2. 다음 Spot 연결 관리 (핵심 기능)

```jsx
const SpotConnectionManager = ({ fromPlace, connections, onUpdate }) => (
  <div className="connection-manager">
    <Header>
      <h2>{fromPlace.name} → 다음 Spot 연결</h2>
      <p>이 장소에서 자연스럽게 이어질 수 있는 곳들을 연결해주세요 (최대 4개)</p>
    </Header>

    <ConnectionList>
      {connections.map((connection, index) => (
        <ConnectionCard key={index}>
          <PlaceSelector
            label={`다음 Spot ${index + 1}`}
            value={connection.toPlaceId}
            onChange={(placeId) => updateConnection(index, { toPlaceId: placeId })}
            excludeIds={[fromPlace.id, ...connections.map((c) => c.toPlaceId)]}
          />

          <Select label="연결 카테고리" value={connection.category} options={CONNECTION_CATEGORIES} onChange={(category) => updateConnection(index, { category })} />

          <Slider label="우선순위" value={connection.priority} min={1} max={10} onChange={(priority) => updateConnection(index, { priority })} helperText="높을수록 먼저 표시됩니다" />

          <Input
            label="연결 이유 (한 문장)"
            value={connection.shortReason}
            placeholder="왜 이 장소가 다음에 좋을까요?"
            maxLength={100}
            onChange={(shortReason) => updateConnection(index, { shortReason })}
          />

          <div className="distance-info">
            <Input label="도보 시간 (분)" type="number" value={connection.walkingTime} onChange={(walkingTime) => updateConnection(index, { walkingTime })} />
            <Input label="거리 (미터)" type="number" value={connection.distance} onChange={(distance) => updateConnection(index, { distance })} />
          </div>

          <Button variant="danger" onClick={() => removeConnection(index)}>
            연결 제거
          </Button>
        </ConnectionCard>
      ))}
    </ConnectionList>

    {connections.length < 4 && <Button onClick={addConnection}>+ 다음 Spot 추가</Button>}

    <PreviewSection>
      <h3>사용자 화면 미리보기</h3>
      <SpotPreview place={fromPlace} nextSpots={connections} />
    </PreviewSection>
  </div>
);
```

### 3. 간단한 분석 대시보드

```jsx
const BasicAnalyticsDashboard = ({ placeId }) => {
  const analytics = useBasicAnalytics(placeId);

  return (
    <Dashboard>
      <MetricCard title="페이지 진입" value={analytics.pageEnters} period="최근 7일" icon={<EnterIcon />} />

      <MetricCard title="다음 Spot 클릭" value={analytics.spotClicks} period="최근 7일" icon={<ClickIcon />} />

      <MetricCard title="평균 체류 시간" value={`${analytics.avgStayDuration}초`} period="최근 7일" icon={<TimeIcon />} />

      <MetricCard title="지도 링크 클릭" value={analytics.mapClicks} period="최근 7일" icon={<MapIcon />} />

      <ChartSection>
        <h3>다음 Spot 클릭 분포</h3>
        <BarChart data={analytics.spotClickDistribution} xAxis="spot" yAxis="clicks" />
      </ChartSection>

      <TableSection>
        <h3>외부 링크 클릭</h3>
        <Table>
          <thead>
            <tr>
              <th>링크 타입</th>
              <th>클릭 수</th>
              <th>비율</th>
            </tr>
          </thead>
          <tbody>
            {analytics.externalLinkClicks.map((link) => (
              <tr key={link.type}>
                <td>{link.type}</td>
                <td>{link.clicks}</td>
                <td>{link.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableSection>
    </Dashboard>
  );
};
```

---

## 🔧 관리자 API 엔드포인트

### 1. 장소 관리

```typescript
// 장소 등록 (SpotLine 필드 포함)
POST /api/admin/places
{
  "name": "카페 스팟라인",
  "category": "cafe",
  "location": {
    "address": "서울시 강남구 테헤란로 123",
    "coordinates": [126.9780, 37.5665]
  },
  "shortDescription": "조용한 분위기에서 책과 함께하는 시간",
  "representativeImage": "https://example.com/image.jpg",
  "spotlineStory": "개발자들이 조용히 작업할 수 있도록 설계된 공간입니다.",
  "externalLinks": {
    "instagram": "https://instagram.com/cafe_spotline",
    "website": "https://cafe-spotline.com"
  },
  "qrCode": {
    "id": "qr_cafe_spotline_123",
    "isActive": true
  }
}

// 장소 수정
PUT /api/admin/places/{id}

// 장소 목록 조회 (관리자용)
GET /api/admin/places?page=1&limit=20&category=cafe
```

### 2. 다음 Spot 연결 관리

```typescript
// 다음 Spot 연결 설정
POST /api/admin/connections
{
  "fromPlaceId": "place_123",
  "connections": [
    {
      "toPlaceId": "place_456",
      "category": "dessert",
      "priority": 8,
      "shortReason": "커피 후 달콤한 디저트로 마무리",
      "walkingTime": 3,
      "distance": 200
    },
    {
      "toPlaceId": "place_789",
      "category": "culture",
      "priority": 6,
      "shortReason": "책과 함께 조용한 시간을 보내기 좋은 곳",
      "walkingTime": 5,
      "distance": 350
    }
  ]
}

// 연결 수정
PUT /api/admin/connections/{fromPlaceId}

// 연결 조회
GET /api/admin/connections/{fromPlaceId}
```

### 3. 간단한 분석

```typescript
// 기본 분석 데이터
GET /api/admin/analytics/{placeId}?period=7d
{
  "success": true,
  "data": {
    "pageEnters": 245,
    "spotClicks": 89,
    "avgStayDuration": 67,
    "mapClicks": 34,
    "spotClickDistribution": [
      { "spotName": "디저트 하우스", "clicks": 45 },
      { "spotName": "북카페 리딩룸", "clicks": 28 },
      { "spotName": "아트 갤러리", "clicks": 16 }
    ],
    "externalLinkClicks": [
      { "type": "instagram", "clicks": 23, "percentage": 68 },
      { "type": "website", "clicks": 11, "percentage": 32 }
    ]
  }
}
```

---

## 📋 관리자 가이드라인

### 1. 장소 등록 시 주의사항

```markdown
✅ 해야 할 것:

- 한 문장 설명은 간결하고 명확하게
- 대표 이미지는 장소의 분위기를 잘 보여주는 것
- SpotLine 스토리는 광고가 아닌 큐레이션 관점에서
- 외부 링크는 공식 계정만

❌ 하지 말아야 할 것:

- "최고의", "인기 급상승" 같은 광고성 표현
- 가격, 할인 정보 언급
- 과도한 형용사 사용
- 개인 SNS 계정 링크
```

### 2. 다음 Spot 연결 원칙

```markdown
연결 기준:

1. 지리적 접근성 (도보 10분 이내 권장)
2. 시간적 자연스러움 (식사 → 디저트 → 산책)
3. 분위기의 조화 (조용한 카페 → 조용한 서점)
4. 목적의 연계성 (업무 → 휴식 → 문화)

연결 금지:

- 경쟁 관계인 동일 카테고리 장소
- 지나치게 먼 거리 (도보 15분 초과)
- 시간대가 맞지 않는 장소
- 분위기가 상반되는 장소
```

### 3. 콘텐츠 작성 가이드

```markdown
한 문장 설명 예시:
✅ "조용한 분위기에서 책과 함께하는 시간"
✅ "신선한 재료로 만든 수제 파스타 전문점"
✅ "현대 미술 작품을 감상할 수 있는 작은 갤러리"

❌ "최고의 맛집! 인스타 핫플레이스!"
❌ "할인 중! 지금 방문하세요!"
❌ "5성급 서비스를 경험해보세요!"

SpotLine 스토리 예시:
✅ "이 카페는 오후 2시부터 5시까지 특히 집중하기 좋은 환경을 제공합니다. 창가 자리에서는 자연광이 충분히 들어와 독서나 작업에 적합합니다."

❌ "SNS에서 화제가 된 핫한 카페입니다! 사진 찍기 좋은 인테리어로 유명해요!"
```

---

## 🔒 관리자 권한 및 보안

### 1. 간단한 권한 구조

```typescript
interface AdminRole {
  admin: {
    canCreatePlace: true;
    canUpdatePlace: true;
    canManageConnections: true;
    canViewAnalytics: true;
    canManageQR: true;
  };

  super_admin: {
    canCreatePlace: true;
    canUpdatePlace: true;
    canManageConnections: true;
    canViewAnalytics: true;
    canManageQR: true;
    canManageAdmins: true;
  };
}

// 복잡한 권한 관리는 하지 않음
// 필요시 나중에 확장 가능하도록 설계만
```

### 2. 보안 고려사항

```typescript
// JWT 기반 인증 (기존 유지)
const adminAuth = {
  login: async (username: string, password: string) => {
    // 기존 로직 유지
  },

  validateToken: (token: string) => {
    // 기존 로직 유지
  },
};

// 입력 데이터 검증
const validatePlaceData = (data: SpotlinePlace) => {
  // XSS 방지
  const sanitizedData = sanitizeHtml(data);

  // 길이 제한 검증
  if (data.shortDescription.length > 100) {
    throw new Error("한 문장 설명은 100자를 초과할 수 없습니다");
  }

  // URL 검증
  if (data.externalLinks.instagram && !isValidUrl(data.externalLinks.instagram)) {
    throw new Error("올바른 Instagram URL을 입력해주세요");
  }

  return sanitizedData;
};
```

---

## 📊 관리자 대시보드 구성

### 1. 메인 대시보드

```jsx
const AdminDashboard = () => (
  <Layout>
    <Sidebar>
      <NavItem href="/admin/places" icon={<PlaceIcon />}>
        장소 관리
      </NavItem>
      <NavItem href="/admin/connections" icon={<ConnectionIcon />}>
        연결 관리
      </NavItem>
      <NavItem href="/admin/analytics" icon={<AnalyticsIcon />}>
        간단한 분석
      </NavItem>
      <NavItem href="/admin/qr" icon={<QRIcon />}>
        QR 코드 관리
      </NavItem>
    </Sidebar>

    <MainContent>
      <Header>
        <h1>SpotLine 관리자</h1>
        <UserMenu />
      </Header>

      <QuickStats>
        <StatCard title="등록된 장소" value={totalPlaces} />
        <StatCard title="활성 연결" value={activeConnections} />
        <StatCard title="오늘 QR 스캔" value={todayScans} />
      </QuickStats>

      <RecentActivity>
        <h2>최근 활동</h2>
        <ActivityList />
      </RecentActivity>
    </MainContent>
  </Layout>
);
```

### 2. 장소 관리 페이지

```jsx
const PlaceManagement = () => (
  <div>
    <PageHeader>
      <h1>장소 관리</h1>
      <Button href="/admin/places/new">+ 새 장소 등록</Button>
    </PageHeader>

    <FilterBar>
      <Select placeholder="카테고리 선택" options={PLACE_CATEGORIES} onChange={handleCategoryFilter} />
      <Input placeholder="장소명 검색" onChange={handleSearch} />
      <Switch label="활성 장소만" checked={showActiveOnly} onChange={setShowActiveOnly} />
    </FilterBar>

    <PlaceTable>
      <thead>
        <tr>
          <th>장소명</th>
          <th>카테고리</th>
          <th>QR 스캔 수</th>
          <th>연결된 Spot</th>
          <th>상태</th>
          <th>작업</th>
        </tr>
      </thead>
      <tbody>
        {places.map((place) => (
          <PlaceRow key={place.id} place={place} />
        ))}
      </tbody>
    </PlaceTable>

    <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
  </div>
);
```

---

## 🧪 관리자 시스템 테스트

### 1. 핵심 기능 테스트

```typescript
describe("SpotLine 관리자 시스템", () => {
  test("장소 등록 시 SpotLine 필드 검증", async () => {
    const placeData = {
      name: "테스트 카페",
      shortDescription: "테스트용 한 문장 설명",
      representativeImage: "https://example.com/image.jpg",
      // ... 기타 필드
    };

    const response = await createPlace(placeData);
    expect(response.success).toBe(true);
    expect(response.data.shortDescription).toBe(placeData.shortDescription);
  });

  test("다음 Spot 연결 최대 4개 제한", async () => {
    const connections = Array(5)
      .fill(null)
      .map((_, i) => ({
        toPlaceId: `place_${i}`,
        category: "culture",
        priority: 5,
      }));

    await expect(updateConnections("place_123", connections)).rejects.toThrow("최대 4개까지만 연결할 수 있습니다");
  });

  test("광고성 표현 필터링", () => {
    const description = "최고의 맛집! 지금 방문하세요!";
    expect(() => validateDescription(description)).toThrow("광고성 표현은 사용할 수 없습니다");
  });
});
```

---

## 📋 Version001 체크리스트

### 관리자 시스템 완성도 확인

- [ ] 장소 등록/수정 폼 완성
- [ ] SpotLine 전용 필드 모두 포함
- [ ] 다음 Spot 연결 관리 기능
- [ ] 최대 4개 연결 제한 적용
- [ ] 외부 링크 관리 기능
- [ ] QR 코드 생성/관리 기능
- [ ] 간단한 분석 대시보드
- [ ] 광고성 표현 필터링
- [ ] 입력 데이터 검증
- [ ] 관리자 인증 시스템
- [ ] 반응형 관리자 UI
- [ ] 장소 미리보기 기능

### 금지 기능 제거 확인

- [ ] 복잡한 권한 관리 시스템 없음
- [ ] 상세한 로그 기록 시스템 없음
- [ ] 사용자 관리 기능 없음
- [ ] 광고 관리 기능 없음
- [ ] 결제 관련 기능 없음

---

## 🔄 다음 버전 계획

**Version002 예정 기능:**

- 일괄 장소 등록 (CSV 업로드)
- 연결 추천 AI 도구
- 고급 분석 기능
- 다국어 콘텐츠 관리
- 모바일 관리자 앱

**장기 계획:**

- 사용자 추천 승인 시스템
- 자동 QR 코드 배치 관리
- 실시간 알림 시스템
