// 애플리케이션 상수 정의

const STORE_CATEGORIES = [
  'cafe',
  'restaurant', 
  'exhibition',
  'hotel',
  'retail',
  'culture',
  'other'
];

const RECOMMENDATION_CATEGORIES = [
  'next_meal',    // 다음 식사
  'dessert',      // 디저트
  'activity',     // 활동
  'shopping',     // 쇼핑
  'culture',      // 문화
  'rest'          // 휴식
];

const EVENT_TYPES = [
  'qr_scan',              // QR 코드 스캔
  'page_view',            // 페이지 조회
  'recommendation_click', // 추천 클릭
  'map_click',           // 지도 클릭
  'store_visit'          // 매장 방문
];

const DEFAULT_SEARCH_RADIUS = 1000; // 1km
const MAX_SEARCH_RADIUS = 5000;     // 5km
const DEFAULT_RECOMMENDATION_LIMIT = 10;
const MAX_RECOMMENDATION_LIMIT = 50;

const BUSINESS_HOURS_FORMAT = {
  CLOSED: 'closed',
  OPEN_24H: '24h',
  TIME_FORMAT: 'HH:mm' // 예: '09:00', '18:30'
};

const PRIORITY_LEVELS = {
  LOW: 1,
  MEDIUM: 5,
  HIGH: 10
};

module.exports = {
  STORE_CATEGORIES,
  RECOMMENDATION_CATEGORIES,
  EVENT_TYPES,
  DEFAULT_SEARCH_RADIUS,
  MAX_SEARCH_RADIUS,
  DEFAULT_RECOMMENDATION_LIMIT,
  MAX_RECOMMENDATION_LIMIT,
  BUSINESS_HOURS_FORMAT,
  PRIORITY_LEVELS
};