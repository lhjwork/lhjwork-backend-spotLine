# SpotLine 체험하기 - 관리자 연동 API 가이드 (TypeScript)

## 🎯 새로운 체험 시스템

이제 "SpotLine 체험하기" 기능이 관리자 설정에 따라 동적으로 작동합니다. 관리자가 설정한 체험 설정(고정, 랜덤, 지역별, 가중치 등)에 따라 자동으로 적절한 매장이 선택됩니다.

## 📡 새로운 API 엔드포인트

### 1. 체험 매장 선택 API

```typescript
GET / api / experience / select;
```

**응답 예시:**

```json
{
  "success": true,
  "message": "체험 매장 선택 성공",
  "data": {
    "qrId": "cafe_gangnam_001",
    "storeName": "카페 스팟라인",
    "storeId": "695dc59e914a0496da641266",
    "area": "강남",
    "configUsed": {
      "id": "674a1b2c3d4e5f6789012345",
      "name": "기본 체험 (카페 스팟라인)",
      "type": "fixed"
    },
    "redirectUrl": "/api/stores/spotline/cafe_gangnam_001",
    "timestamp": "2026-01-07T03:00:00.000Z"
  }
}
```

## 🔧 TypeScript 구현

### 1. 타입 정의

```typescript
interface ExperienceResult {
  qrId: string;
  storeName: string;
  storeId: string;
  area: string;
  configUsed: {
    id: string;
    name: string;
    type: "fixed" | "random" | "area_based" | "weighted";
  };
  redirectUrl: string;
  timestamp: string;
}

interface ExperienceApiResponse {
  success: boolean;
  message: string;
  data: ExperienceResult;
}
```

### 2. 새로운 체험 함수 (권장)

```typescript
/**
 * 관리자 설정에 따른 SpotLine 체험하기 (권장 방법)
 */
const handleSpotlineExperienceWithAdmin = async (): Promise<void> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

    // 세션 ID 생성 (분석용)
    const sessionId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response = await fetch(`${baseUrl}/api/experience/select`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ExperienceApiResponse = await response.json();

    if (result.success && result.data.redirectUrl) {
      // 선택된 매장으로 리다이렉트
      window.location.href = `${baseUrl}${result.data.redirectUrl}`;
    } else {
      throw new Error(result.message || "체험 매장 선택에 실패했습니다.");
    }
  } catch (error: unknown) {
    console.error("SpotLine 체험 오류:", error);

    // 에러 발생 시 기본 매장으로 폴백
    const fallbackUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/api/stores/spotline/cafe_gangnam_001`;
    window.location.href = fallbackUrl;
  }
};
```

### 3. React 컴포넌트 구현

```typescript
import React, { useState } from "react";

interface SpotlineExperienceButtonProps {
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error) => void;
  onSuccess?: (result: ExperienceResult) => void;
  showLoadingState?: boolean;
}

const SpotlineExperienceButton: React.FC<SpotlineExperienceButtonProps> = ({ className = "spotline-experience-btn", style = {}, onError, onSuccess, showLoadingState = true }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
      const sessionId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch(`${baseUrl}/api/experience/select`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ExperienceApiResponse = await response.json();

      if (result.success && result.data.redirectUrl) {
        onSuccess?.(result.data);
        window.location.href = `${baseUrl}${result.data.redirectUrl}`;
      } else {
        throw new Error(result.message || "체험 매장 선택에 실패했습니다.");
      }
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error("알 수 없는 오류가 발생했습니다.");
      console.error("SpotLine 체험 오류:", errorObj);

      onError?.(errorObj);

      // 폴백 처리
      const fallbackUrl = `${baseUrl}/api/stores/spotline/cafe_gangnam_001`;
      window.location.href = fallbackUrl;
    } finally {
      setIsLoading(false);
    }
  };

  const defaultStyle: React.CSSProperties = {
    backgroundColor: isLoading ? "#cccccc" : "#4285f4",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: isLoading ? "not-allowed" : "pointer",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    ...style,
  };

  return (
    <button onClick={handleClick} className={className} style={defaultStyle} disabled={isLoading}>
      {showLoadingState && isLoading ? "체험 준비 중..." : "🎯 SpotLine 체험하기"}
    </button>
  );
};

export default SpotlineExperienceButton;
```

### 4. Next.js 커스텀 훅

```typescript
import { useState, useCallback } from "react";

interface UseSpotlineExperienceReturn {
  isLoading: boolean;
  error: string | null;
  lastResult: ExperienceResult | null;
  startExperience: () => Promise<void>;
  clearError: () => void;
}

const useSpotlineExperience = (): UseSpotlineExperienceReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ExperienceResult | null>(null);

  const startExperience = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
      const sessionId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch(`${baseUrl}/api/experience/select`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ExperienceApiResponse = await response.json();

      if (result.success && result.data.redirectUrl) {
        setLastResult(result.data);

        // 분석 데이터 기록 (선택사항)
        console.log("체험 시작:", {
          store: result.data.storeName,
          area: result.data.area,
          config: result.data.configUsed.name,
        });

        window.location.href = `${baseUrl}${result.data.redirectUrl}`;
      } else {
        throw new Error(result.message || "체험 매장 선택에 실패했습니다.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);

      // 폴백 처리
      const fallbackUrl = `${baseUrl}/api/stores/spotline/cafe_gangnam_001`;
      window.location.href = fallbackUrl;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    lastResult,
    startExperience,
    clearError,
  };
};

export default useSpotlineExperience;
```

### 5. 사용 예시

```typescript
// 1. 기본 사용 (가장 간단)
const handleSpotlineClick = async () => {
  await handleSpotlineExperienceWithAdmin();
};

// 2. React 컴포넌트 사용
const MyPage: React.FC = () => {
  const handleSuccess = (result: ExperienceResult) => {
    console.log("체험 시작:", result.storeName);
  };

  const handleError = (error: Error) => {
    console.error("체험 오류:", error.message);
  };

  return (
    <div>
      <SpotlineExperienceButton onSuccess={handleSuccess} onError={handleError} showLoadingState={true} />
    </div>
  );
};

// 3. 커스텀 훅 사용
const ExperiencePage: React.FC = () => {
  const { isLoading, error, startExperience, clearError } = useSpotlineExperience();

  return (
    <div>
      <button
        onClick={startExperience}
        disabled={isLoading}
        style={{
          backgroundColor: "#4285f4",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "체험 준비 중..." : "SpotLine 체험하기"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          {error}
          <button onClick={clearError} style={{ marginLeft: "10px" }}>
            오류 지우기
          </button>
        </div>
      )}
    </div>
  );
};
```

## 🔄 기존 코드에서 마이그레이션

### Before (기존 방식)

```typescript
// ❌ 기존 방식 (고정된 QR 코드)
const handleSpotlineExperience = (): void => {
  window.location.href = "http://localhost:4000/api/stores/spotline/cafe_gangnam_001";
};
```

### After (새로운 방식)

```typescript
// ✅ 새로운 방식 (관리자 설정 연동)
const handleSpotlineExperience = async (): Promise<void> => {
  await handleSpotlineExperienceWithAdmin();
};
```

## 📊 추가 기능

### 1. 사용 가능한 매장 목록 조회

```typescript
const getAvailableStores = async (): Promise<string[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    const response = await fetch(`${baseUrl}/api/experience/available-stores`);
    const result = await response.json();

    return result.success ? result.data.allStores : [];
  } catch (error) {
    console.error("매장 목록 조회 실패:", error);
    return [];
  }
};
```

### 2. 체험 통계 조회 (관리자용)

```typescript
const getExperienceStats = async (days: number = 7) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    const response = await fetch(`${baseUrl}/api/experience/stats?days=${days}`);
    const result = await response.json();

    return result.success ? result.data : null;
  } catch (error) {
    console.error("체험 통계 조회 실패:", error);
    return null;
  }
};
```

## 🎯 장점

1. **관리자 제어**: 관리자가 체험 설정을 실시간으로 변경 가능
2. **다양한 전략**: 고정, 랜덤, 지역별, 가중치, 시간대별 설정 지원
3. **분석 데이터**: 체험 사용 패턴 자동 수집
4. **폴백 처리**: 오류 시 기본 매장으로 안전하게 처리
5. **확장성**: 새로운 체험 타입 쉽게 추가 가능

## 🔧 환경 설정

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# 프로덕션
# NEXT_PUBLIC_API_BASE_URL=https://your-production-domain.com
```

## 📝 주의사항

1. **세션 ID**: 분석을 위해 고유한 세션 ID 전송 권장
2. **에러 처리**: 네트워크 오류 시 기본 매장으로 폴백
3. **로딩 상태**: 사용자 경험을 위한 로딩 인디케이터 표시
4. **CORS**: 백엔드에서 프론트엔드 도메인 허용 확인

이제 "SpotLine 체험하기" 기능이 관리자의 전략에 따라 동적으로 작동하며, 더 나은 사용자 경험을 제공할 수 있습니다!
