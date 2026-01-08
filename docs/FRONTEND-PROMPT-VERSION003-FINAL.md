# SpotLine 프론트엔드 구현 가이드 - VERSION003 FINAL

## 📋 개요

SpotLine 백엔드 API와 완전히 호환되는 프론트엔드 구현을 위한 최종 가이드입니다.
모든 A

- **광고 플랫폼이 아닙니다**
- **리뷰 서비스가 아닙니다**
- **사용자 참여형 커뮤니티가 아닙니다**

SpotLine의 목적:

- **현재 장소를 기준으로 다음 경험을 자연스럽게 제안**
- **사용자 이동 흐름을 관찰**
- **큐레이션의 신뢰를 축적**

## 🆕 VERSION003 주요 변경사항

### 1. 시스템 구조 명확화

- **데모 시스템**: 업주 소개용 ("이런 서비스입니다")
- **운영 시스템**: 실제 서비스 ("실제로 사용하세요")

### 2. 버튼 구분 명확화

- **데모보기 버튼**: 업주에게 서비스 소개할 때 사용
- **SpotLine 시작**: 사용자가 실제 서비스 체험

## 🎭 "데모보기" 버튼 구현 (업주 소개용)

### 기본 구현

```typescript
interface DemoResult {
  qrId: string;
  storeName: string;
  storeId: string;
  area: string;
  redirectUrl: string;
  isDemoMode: true;
}

const handleDemoView = async (): Promise<void> => {
  try {
    const response = await fetch("http://localhost:4000/api/demo/experience");
    const data: { success: boolean; data: DemoResult } = await response.json();

    if (data.success) {
      // 업주 소개용 데모 매장으로 이동 (통계 수집 없음)
      window.location.href = data.data.redirectUrl;
    }
  } catch (error) {
    console.error("데모 중 오류:", error);
    // 폴백: 기본 데모 매장으로 이동
    window.location.href = "http://localhost:4000/api/demo/stores/demo_cafe_001";
  }
};
```

### React 컴포넌트 구현

```typescript
import React, { useState } from "react";

interface DemoViewButtonProps {
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error) => void;
  loadingText?: string;
}

const DemoViewButton: React.FC<DemoViewButtonProps> = ({ className = "demo-view-btn", style = {}, onError, loadingText = "데모 준비 중..." }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/demo/experience");
      const data = await response.json();

      if (data.success) {
        window.location.href = data.data.redirectUrl;
      } else {
        throw new Error(data.message || "데모를 시작할 수 없습니다.");
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error("알 수 없는 오류가 발생했습니다.");

      if (onError) {
        onError(errorObj);
      } else {
        console.error("데모 오류:", errorObj);
        // 폴백 처리
        window.location.href = "http://localhost:4000/api/demo/stores/demo_cafe_001";
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={isLoading} className={className} style={style}>
      {isLoading ? loadingText : "🎭 데모보기"}
    </button>
  );
};

export default DemoViewButton;
```

## 🎯 "SpotLine 시작" 버튼 구현 (사용자용)

### 기본 구현

```typescript
interface SpotlineStartResult {
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
  timestamp: string;
}

const handleSpotlineStart = async (): Promise<void> => {
  try {
    const response = await fetch("http://localhost:4000/api/experience", {
      headers: {
        "x-session-id": generateSessionId(), // 통계용 세션 ID
      },
    });
    const data: { success: boolean; data: SpotlineStartResult } = await response.json();

    if (data.success) {
      // 실제 운영 매장으로 이동 (통계 수집 있음)
      window.location.href = data.data.redirectUrl;
    }
  } catch (error) {
    console.error("SpotLine 시작 중 오류:", error);
    // 폴백: 기본 운영 매장으로 이동
    window.location.href = "http://localhost:4000/api/stores/spotline/real_cafe_001";
  }
};

// 세션 ID 생성 함수
const generateSessionId = (): string => {
  return `spotline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
```

### React 컴포넌트 구현

```typescript
import React, { useState } from "react";

interface SpotlineStartButtonProps {
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error) => void;
  loadingText?: string;
}

const SpotlineStartButton: React.FC<SpotlineStartButtonProps> = ({ className = "spotline-start-btn", style = {}, onError, loadingText = "SpotLine 준비 중..." }) => {
  const [isLoading, setIsLoading] = useState(false);

  const generateSessionId = (): string => {
    return `spotline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleClick = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/experience", {
        headers: {
          "x-session-id": generateSessionId(),
        },
      });
      const data = await response.json();

      if (data.success) {
        window.location.href = data.data.redirectUrl;
      } else {
        throw new Error(data.message || "SpotLine을 시작할 수 없습니다.");
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error("알 수 없는 오류가 발생했습니다.");

      if (onError) {
        onError(errorObj);
      } else {
        console.error("SpotLine 시작 오류:", errorObj);
        alert("SpotLine 시작 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={isLoading} className={className} style={style}>
      {isLoading ? loadingText : "🎯 SpotLine 시작"}
    </button>
  );
};

export default SpotlineStartButton;
```

## 🔄 조건부 버튼 렌더링

```typescript
interface SpotlineButtonProps {
  mode: 'demo' | 'start';
  className?: string;
  style?: React.CSSProperties;
}

const SpotlineButton: React.FC<SpotlineButtonProps> = ({ mode, className, style }) => {
  if (mode === 'demo') {
    return (
      <DemoViewButton
        className={`${className} demo-mode`}
        style={style}
      />
    );
  }

  return (
    <SpotlineStartButton
      className={`${className} start-mode`}
      style={style}
    />
  );
};

// 사용 예시
<SpotlineButton mode="demo" />   {/* 업주 소개용 */}
<SpotlineButton mode="start" />  {/* 사용자용 */}
```

## 🎨 UI/UX 구분

### 데모보기 버튼 스타일링 (업주 소개용)

```css
.demo-mode {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  border: 2px dashed #ff6b9d;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.demo-mode:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
}

.demo-mode::before {
  content: "🎭 업주 소개용";
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

### SpotLine 시작 버튼 스타일링 (사용자용)

```css
.start-mode {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #667eea;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-mode:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.start-mode::after {
  content: "실제 서비스";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: #667eea;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}
```

## 📊 분석 및 추적

### 데모보기 (업주 소개용)

- 통계 수집 **없음**
- 사용자 행동 추적 **없음**
- 단순 기능 시연만

### SpotLine 시작 (사용자용)

- 완전한 통계 수집
- 사용자 세션 추적
- Analytics 데이터 기록

## 🔧 환경별 설정

```typescript
// config.ts
export const API_CONFIG = {
  demo: {
    baseUrl: "http://localhost:4000/api/demo",
    trackAnalytics: false,
    buttonText: "🎭 데모보기",
    description: "업주에게 서비스를 소개하기 위한 데모입니다.",
    mode: "demo",
  },
  start: {
    baseUrl: "http://localhost:4000/api/experience",
    trackAnalytics: true,
    buttonText: "🎯 SpotLine 시작",
    description: "SpotLine 서비스를 직접 시작해보세요.",
    mode: "production",
  },
};
```

## 🚨 중요 주의사항

### ⚠️ 절대 하지 말아야 할 것

1. **두 시스템 혼동**: 데모용과 운영용 API를 섞어서 사용하지 말 것
2. **통계 수집 혼동**: 데모용에서는 절대 통계 수집하지 말 것
3. **QR 코드 혼용**: demo*\* 와 real*\* QR 코드를 구분해서 사용

### ✅ 반드시 해야 할 것

1. **명확한 구분**: UI에서 어떤 모드인지 명확히 표시
2. **에러 처리**: 각 모드별로 적절한 폴백 처리
3. **세션 관리**: SpotLine 시작에서만 세션 ID 전송

## 🔄 API 응답 차이점

### 데모보기 API 응답 (업주 소개용)

```json
{
  "success": true,
  "message": "데모 체험 매장 선택 성공",
  "data": {
    "qrId": "demo_cafe_001",
    "storeName": "카페 데모",
    "storeId": "...",
    "area": "강남역",
    "redirectUrl": "http://localhost:4000/api/demo/stores/demo_cafe_001",
    "isDemoMode": true
  }
}
```

### SpotLine 시작 API 응답 (사용자용)

```json
{
  "success": true,
  "message": "체험 매장 선택 성공",
  "data": {
    "qrId": "real_cafe_gangnam_001",
    "storeName": "실제 카페명",
    "storeId": "...",
    "area": "강남역",
    "configUsed": {
      "id": "...",
      "name": "기본 체험 설정",
      "type": "random"
    },
    "redirectUrl": "/api/stores/spotline/real_cafe_gangnam_001",
    "timestamp": "2026-01-07T..."
  }
}
```

## ✅ 구현 체크리스트

- [ ] 데모보기 버튼과 SpotLine 시작 버튼 분리 구현
- [ ] 각각 다른 API 엔드포인트 호출 (`/api/demo/*` vs `/api/experience`)
- [ ] 데모보기에서는 통계 수집 비활성화
- [ ] SpotLine 시작에서는 세션 ID 전송
- [ ] UI에서 모드 구분 명확히 표시
- [ ] 에러 처리 각각 구현
- [ ] 환경별 설정 분리
- [ ] 폴백 처리 구현

## 🎯 최종 목표

- **데모보기**: "이런 서비스입니다" (업주 소개용)
- **SpotLine 시작**: "실제로 사용하세요" (사용자용)

각각의 목적에 맞게 명확히 구분하여 구현해주세요!
