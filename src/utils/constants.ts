// 애플리케이션 상수 정의

export const STORE_CATEGORIES = ["cafe", "restaurant", "exhibition", "hotel", "retail", "culture", "other"] as const;

export const RECOMMENDATION_CATEGORIES = [
  "next_meal", // 다음 식사
  "dessert", // 디저트
  "activity", // 활동
  "shopping", // 쇼핑
  "culture", // 문화
  "rest", // 휴식
] as const;

export const EVENT_TYPES = [
  "qr_scan", // QR 코드 스캔
  "page_view", // 페이지 조회
  "recommendation_click", // 추천 클릭
  "map_click", // 지도 클릭
  "store_visit", // 매장 방문
] as const;

export const ADMIN_ROLES = ["admin", "super_admin"] as const;

export const DEFAULT_SEARCH_RADIUS = 1000; // 1km
export const MAX_SEARCH_RADIUS = 5000; // 5km
export const DEFAULT_RECOMMENDATION_LIMIT = 10;
export const MAX_RECOMMENDATION_LIMIT = 50;

export const BUSINESS_HOURS_FORMAT = {
  CLOSED: "closed",
  OPEN_24H: "24h",
  TIME_FORMAT: "HH:mm", // 예: '09:00', '18:30'
} as const;

export const PRIORITY_LEVELS = {
  LOW: 1,
  MEDIUM: 5,
  HIGH: 10,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const JWT_CONFIG = {
  EXPIRES_IN: "24h",
  ALGORITHM: "HS256",
} as const;

// 타입 정의
export type StoreCategory = (typeof STORE_CATEGORIES)[number];
export type RecommendationCategory = (typeof RECOMMENDATION_CATEGORIES)[number];
export type EventType = (typeof EVENT_TYPES)[number];
export type AdminRole = (typeof ADMIN_ROLES)[number];
