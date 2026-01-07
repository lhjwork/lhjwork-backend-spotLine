# 프론트엔드 시스템 분리 구현 가이드

## 🎯 시스템 구분 (정확한 이해)

### 1. 데모 시스템 (업주 소개용)

- **API**: `/api/demo/*`
- **용도**: 업주에게 서비스 소개할 때
- **특징**: 통계 수집 없음, 고정 데모 데이터

### 2. 체험하기 시스템 (사용자 체험용)

- **API**: `/api/experience`
- **용도**: 실제 사용자들의 SpotLine 체험
- **특징**: 통계 수집 있음, 관리자 설정 기반

### 3. 실제 운영 시스템

- **API**: `/api/stores/spotline/*`
- **용도**: 정식 서비스 운영
- **특징**: 완전한 서비스 기능

## 🔧 프론트엔드 구현

### 1. 데모 버튼 (업주 소개용)

```typescript
const handleDemoExperience = async (): Promise<void> => {
  try {
    const response = await fetch("http://localhost:4000/api/demo/experience");
    const data = await response.json();

    if (data.success) {
      // 데모 매장으로 이동 (통계 수집 없음)
      window.location.href = data.data.redirectUrl;
      // 예: http://localhost:4000/api/demo/stores/demo_cafe_001
    }
  } catch (error) {
    console.error("데모 체험 오류:", error);
  }
};

// React 컴포넌트
const DemoButton: React.FC = () => (
  <button onClick={handleDemoExperience} className="demo-button">
    🎭 데모 체험하기 (업주용)
  </button>
);
```

### 2. 실제 체험하기 버튼 (사용자용)

```typescript
const handleSpotlineExperience = async (): Promise<void> => {
  try {
    const response = await fetch("http://localhost:4000/api/experience", {
      headers: {
        "x-session-id": generateSessionId(), // 통계용 세션 ID
      },
    });
    const data = await response.json();

    if (data.success) {
      // 실제 매장으로 이동 (통계 수집 있음)
      window.location.href = data.data.redirectUrl;
      // 예: http://localhost:4000/api/stores/spotline/cafe_gangnam_001
    }
  } catch (error) {
    console.error("SpotLine 체험 오류:", error);
  }
};

// React 컴포넌트
const ExperienceButton: React.FC = () => (
  <button onClick={handleSpotlineExperience} className="experience-button">
    🎯 SpotLine 체험하기
  </button>
);
```

### 3. 조건부 버튼 렌더링

```typescript
interface SpotlineButtonProps {
  mode: 'demo' | 'experience';
  className?: string;
}

const SpotlineButton: React.FC<SpotlineButtonProps> = ({ mode, className }) => {
  if (mode === 'demo') {
    return (
      <button
        onClick={handleDemoExperience}
        className={`${className} demo-mode`}
      >
        🎭 데모 체험하기 (업주 소개용)
      </button>
    );
  }

  return (
    <button
      onClick={handleSpotlineExperience}
      className={`${className} experience-mode`}
    >
      🎯 SpotLine 체험하기
    </button>
  );
};

// 사용 예시
<SpotlineButton mode="demo" />      {/* 업주 소개용 */}
<SpotlineButton mode="experience" /> {/* 실제 사용자용 */}
```

### 4. 환경별 설정

```typescript
// config.ts
export const API_CONFIG = {
  demo: {
    baseUrl: "http://localhost:4000/api/demo",
    trackAnalytics: false,
    buttonText: "🎭 데모 체험하기 (업주용)",
    description: "업주에게 서비스를 소개하기 위한 데모입니다.",
  },
  experience: {
    baseUrl: "http://localhost:4000/api/experience",
    trackAnalytics: true,
    buttonText: "🎯 SpotLine 체험하기",
    description: "SpotLine 서비스를 직접 체험해보세요.",
  },
};
```

## 🎨 UI/UX 구분

### 데모 모드 스타일링

```css
.demo-mode {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  border: 2px dashed #ff6b9d;
}

.demo-mode::before {
  content: "🎭 DEMO";
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b9d;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}
```

### 체험 모드 스타일링

```css
.experience-mode {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #667eea;
}
```

## 📊 분석 및 추적

### 데모 모드

- 통계 수집 **없음**
- 사용자 행동 추적 **없음**
- 단순 기능 시연만

### 체험 모드

- 완전한 통계 수집
- 사용자 세션 추적
- Analytics 데이터 기록

## 🔄 API 응답 차이점

### 데모 API 응답

```json
{
  "success": true,
  "message": "데모 체험 매장 선택 성공",
  "data": {
    "qrId": "demo_cafe_001",
    "storeName": "카페 데모",
    "redirectUrl": "http://localhost:4000/api/demo/stores/demo_cafe_001",
    "isDemoMode": true, // 데모 모드 플래그
    "demoNotice": "이것은 업주 소개용 데모입니다."
  }
}
```

### 체험 API 응답

```json
{
  "success": true,
  "message": "체험 매장 선택 성공",
  "data": {
    "qrId": "cafe_gangnam_001",
    "storeName": "카페 스팟라인",
    "redirectUrl": "/api/stores/spotline/cafe_gangnam_001",
    "configUsed": {
      "id": "...",
      "name": "기본 체험 설정",
      "type": "random"
    },
    "timestamp": "2026-01-07T..."
  }
}
```

## ✅ 구현 체크리스트

- [ ] 데모 버튼과 체험 버튼 분리 구현
- [ ] 각각 다른 API 엔드포인트 호출
- [ ] 데모 모드에서는 통계 수집 비활성화
- [ ] 체험 모드에서는 세션 ID 전송
- [ ] UI에서 모드 구분 표시
- [ ] 에러 처리 각각 구현
- [ ] 환경별 설정 분리
