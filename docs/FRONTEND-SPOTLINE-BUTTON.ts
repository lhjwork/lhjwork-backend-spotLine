// SpotLine 체험하기 버튼 TypeScript 구현 코드

// // 타입 정의
// interface SpotlineStore {
//   id: string;
//   name: string;
//   shortDescription: string;
//   representativeImage: string;
//   location: {
//     address: string;
//     mapLink: string;
//   };
//   externalLinks: {
//     instagram?: string;
//     blog?: string;
//     notion?: string;
//     website?: string;
//   };
//   spotlineStory: string;
// }

// interface SpotlineApiResponse {
//   success: boolean;
//   message: string;
//   data: SpotlineStore;
// }

// type AreaType = "gangnam" | "hongdae" | "random";
// type QRCodeId = string;

// // 상수 정의
// const AVAILABLE_STORES: Record<string, QRCodeId[]> = {
//   gangnam: [
//     "cafe_gangnam_001", // 카페 스팟라인
//     "dessert_gangnam_001", // 디저트 하우스
//     "culture_gangnam_001", // 북카페 리딩룸
//     "gallery_gangnam_001", // 아트 갤러리 모던
//     "brunch_gangnam_001", // 브런치 스팟
//   ],
//   hongdae: [
//     "cafe_hongdae_001", // 바이닐 카페
//     "food_hongdae_001", // 스트리트 푸드 마켓
//     "record_hongdae_001", // 인디 레코드샵
//   ],
// } as const;

// const DEFAULT_QR_CODE: QRCodeId = "cafe_gangnam_001";

// // 환경별 URL 설정
// const getBaseUrl = (): string => {
//   if (typeof window !== "undefined") {
//     const hostname = window.location.hostname;

//     if (hostname === "localhost" || hostname === "127.0.0.1") {
//       return "http://localhost:4000";
//     } else {
//       return "https://your-production-domain.com"; // 실제 프로덕션 URL로 변경
//     }
//   }

//   return "http://localhost:4000"; // 기본값
// };

// // 1. 기본 구현 (추천) - 대표 매장으로 고정
// const handleSpotlineExperience = (): void => {
//   const qrCodeId: QRCodeId = DEFAULT_QR_CODE;
//   const baseUrl: string = getBaseUrl();

//   window.location.href = `${baseUrl}/api/stores/spotline/${qrCodeId}`;
// };

// // 2. 랜덤 매장 선택 구현
// const handleSpotlineExperienceRandom = (): void => {
//   const allStores: QRCodeId[] = [...AVAILABLE_STORES.gangnam, ...AVAILABLE_STORES.hongdae];

//   const randomIndex: number = Math.floor(Math.random() * allStores.length);
//   const selectedQrId: QRCodeId = allStores[randomIndex];
//   const baseUrl: string = getBaseUrl();

//   window.location.href = `${baseUrl}/api/stores/spotline/${selectedQrId}`;
// };

// // 3. 지역별 선택 구현
// const handleSpotlineExperienceByArea = (area: AreaType = "random"): void => {
//   let selectedStores: QRCodeId[];

//   if (area === "random") {
//     selectedStores = [...AVAILABLE_STORES.gangnam, ...AVAILABLE_STORES.hongdae];
//   } else {
//     selectedStores = AVAILABLE_STORES[area] || AVAILABLE_STORES.gangnam;
//   }

//   const randomIndex: number = Math.floor(Math.random() * selectedStores.length);
//   const selectedQrId: QRCodeId = selectedStores[randomIndex];
//   const baseUrl: string = getBaseUrl();

//   window.location.href = `${baseUrl}/api/stores/spotline/${selectedQrId}`;
// };

// // 4. 에러 처리가 포함된 고급 구현
// const handleSpotlineExperienceWithErrorHandling = async (): Promise<void> => {
//   try {
//     const qrCodeId: QRCodeId = DEFAULT_QR_CODE;
//     const baseUrl: string = getBaseUrl();
//     const url: string = `${baseUrl}/api/stores/spotline/${qrCodeId}`;

//     // API 호출하여 매장 존재 여부 확인 (선택사항)
//     const response: Response = await fetch(url);

//     if (response.ok) {
//       window.location.href = url;
//     } else {
//       console.error("매장 정보를 찾을 수 없습니다.");
//       alert("죄송합니다. 현재 서비스를 이용할 수 없습니다.");
//     }
//   } catch (error: unknown) {
//     console.error("SpotLine 체험 중 오류 발생:", error);
//     alert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
//   }
// };

// // 5. API 데이터를 가져와서 처리하는 구현
// const fetchSpotlineStore = async (qrCodeId: QRCodeId): Promise<SpotlineStore | null> => {
//   try {
//     const baseUrl: string = getBaseUrl();
//     const response: Response = await fetch(`${baseUrl}/api/stores/spotline/${qrCodeId}`);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data: SpotlineApiResponse = await response.json();

//     if (data.success) {
//       return data.data;
//     } else {
//       throw new Error(data.message);
//     }
//   } catch (error: unknown) {
//     console.error("매장 정보 조회 실패:", error);
//     return null;
//   }
// };

// // 6. React 컴포넌트 예시 (TypeScript)
// import React from "react";

// interface SpotlineExperienceButtonProps {
//   area?: AreaType;
//   className?: string;
//   style?: React.CSSProperties;
//   onError?: (error: Error) => void;
// }

// const SpotlineExperienceButton: React.FC<SpotlineExperienceButtonProps> = ({ area = "random", className = "spotline-experience-btn", style = {}, onError }) => {
//   const handleClick = async (): Promise<void> => {
//     try {
//       if (area === "random") {
//         handleSpotlineExperienceRandom();
//       } else {
//         handleSpotlineExperienceByArea(area);
//       }
//     } catch (error: unknown) {
//       const errorObj = error instanceof Error ? error : new Error("알 수 없는 오류가 발생했습니다.");
//       onError?.(errorObj);
//     }
//   };

//   const defaultStyle: React.CSSProperties = {
//     backgroundColor: "#4285f4",
//     color: "white",
//     padding: "12px 24px",
//     border: "none",
//     borderRadius: "8px",
//     fontSize: "16px",
//     cursor: "pointer",
//     fontWeight: "bold",
//     ...style,
//   };

// //   return (
// //     <button onClick={handleClick} className={className} style={defaultStyle}>
// //       🎯 SpotLine 체험하기
// //     </button>
// //   );
// };

// // // 7. Next.js용 구현
// // import { useRouter } from "next/router";

// const useSpotlineExperience = () => {
//   const router = useRouter();

//   const goToSpotlineExperience = (area: AreaType = "random"): void => {
//     let selectedStores: QRCodeId[];

//     if (area === "random") {
//       selectedStores = [...AVAILABLE_STORES.gangnam, ...AVAILABLE_STORES.hongdae];
//     } else {
//       selectedStores = AVAILABLE_STORES[area] || AVAILABLE_STORES.gangnam;
//     }

//     const randomIndex: number = Math.floor(Math.random() * selectedStores.length);
//     const selectedQrId: QRCodeId = selectedStores[randomIndex];
//     const baseUrl: string = getBaseUrl();

//     // Next.js router 사용
//     window.location.href = `${baseUrl}/api/stores/spotline/${selectedQrId}`;
//     // 또는 router.push() 사용 (SPA 방식)
//     // router.push(`${baseUrl}/api/stores/spotline/${selectedQrId}`);
//   };

//   return { goToSpotlineExperience };
// };

// // 8. 커스텀 훅 예시
// import { useState, useCallback } from "react";

// interface UseSpotlineExperienceReturn {
//   isLoading: boolean;
//   error: string | null;
//   goToExperience: (area?: AreaType) => Promise<void>;
//   getStoreInfo: (qrCodeId: QRCodeId) => Promise<SpotlineStore | null>;
// }

// const useSpotlineExperienceAdvanced = (): UseSpotlineExperienceReturn => {
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const goToExperience = useCallback(async (area: AreaType = "random"): Promise<void> => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       let selectedStores: QRCodeId[];

//       if (area === "random") {
//         selectedStores = [...AVAILABLE_STORES.gangnam, ...AVAILABLE_STORES.hongdae];
//       } else {
//         selectedStores = AVAILABLE_STORES[area] || AVAILABLE_STORES.gangnam;
//       }

//       const randomIndex: number = Math.floor(Math.random() * selectedStores.length);
//       const selectedQrId: QRCodeId = selectedStores[randomIndex];

//       // 매장 정보 확인
//       const storeInfo = await fetchSpotlineStore(selectedQrId);

//       if (storeInfo) {
//         const baseUrl: string = getBaseUrl();
//         window.location.href = `${baseUrl}/api/stores/spotline/${selectedQrId}`;
//       } else {
//         throw new Error("매장 정보를 찾을 수 없습니다.");
//       }
//     } catch (err: unknown) {
//       const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const getStoreInfo = useCallback(async (qrCodeId: QRCodeId): Promise<SpotlineStore | null> => {
//     return await fetchSpotlineStore(qrCodeId);
//   }, []);

//   return {
//     isLoading,
//     error,
//     goToExperience,
//     getStoreInfo,
//   };
// };

// // 9. 유틸리티 함수들
// const getRandomQRCode = (area?: AreaType): QRCodeId => {
//   let selectedStores: QRCodeId[];

//   if (!area || area === "random") {
//     selectedStores = [...AVAILABLE_STORES.gangnam, ...AVAILABLE_STORES.hongdae];
//   } else {
//     selectedStores = AVAILABLE_STORES[area] || AVAILABLE_STORES.gangnam;
//   }

//   const randomIndex: number = Math.floor(Math.random() * selectedStores.length);
//   return selectedStores[randomIndex];
// };

// const buildSpotlineUrl = (qrCodeId: QRCodeId): string => {
//   const baseUrl: string = getBaseUrl();
//   return `${baseUrl}/api/stores/spotline/${qrCodeId}`;
// };

// // Export 타입들
// export type { SpotlineStore, SpotlineApiResponse, AreaType, QRCodeId, SpotlineExperienceButtonProps, UseSpotlineExperienceReturn };

// // Export 함수들
// export {
//   handleSpotlineExperience,
//   handleSpotlineExperienceRandom,
//   handleSpotlineExperienceByArea,
//   handleSpotlineExperienceWithErrorHandling,
//   fetchSpotlineStore,
//   SpotlineExperienceButton,
//   useSpotlineExperience,
//   useSpotlineExperienceAdvanced,
//   getRandomQRCode,
//   buildSpotlineUrl,
//   AVAILABLE_STORES,
//   DEFAULT_QR_CODE,
// };

// // 사용 예시:
// /*
// // 1. 기본 사용
// <button onClick={handleSpotlineExperience}>SpotLine 체험하기</button>

// // 2. React 컴포넌트 사용
// <SpotlineExperienceButton area="gangnam" />

// // 3. 커스텀 훅 사용
// const MyComponent = () => {
//   const { isLoading, error, goToExperience } = useSpotlineExperienceAdvanced();

//   return (
//     <div>
//       <button
//         onClick={() => goToExperience('hongdae')}
//         disabled={isLoading}
//       >
//         {isLoading ? '로딩 중...' : 'SpotLine 체험하기'}
//       </button>
//       {error && <p style={{color: 'red'}}>{error}</p>}
//     </div>
//   );
// };

// // 4. Next.js 사용
// const MyPage = () => {
//   const { goToSpotlineExperience } = useSpotlineExperience();

//   return (
//     <button onClick={() => goToSpotlineExperience('random')}>
//       SpotLine 체험하기
//     </button>
//   );
// };
// */
