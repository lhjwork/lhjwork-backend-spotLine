/**
 * 한국 시간대 관련 유틸리티 함수들
 */

// 한국 시간대 (KST, UTC+9)
export const KOREA_TIMEZONE = "Asia/Seoul";

/**
 * 현재 한국 시간 반환
 */
export const getKoreanTime = (): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: KOREA_TIMEZONE }));
};

/**
 * UTC 시간을 한국 시간으로 변환
 */
export const utcToKoreanTime = (utcDate: Date): Date => {
  return new Date(utcDate.toLocaleString("en-US", { timeZone: KOREA_TIMEZONE }));
};

/**
 * 한국 시간을 UTC로 변환
 */
export const koreanTimeToUtc = (koreanDate: Date): Date => {
  const koreanTime = new Date(koreanDate.toLocaleString("en-US", { timeZone: KOREA_TIMEZONE }));
  const utcTime = new Date(koreanDate.getTime() - (koreanTime.getTime() - koreanDate.getTime()));
  return utcTime;
};

/**
 * 한국 시간 문자열 포맷 (YYYY-MM-DD HH:mm:ss)
 */
export const formatKoreanTime = (date: Date = new Date()): string => {
  const koreanTime = new Date(date.toLocaleString("en-US", { timeZone: KOREA_TIMEZONE }));

  const year = koreanTime.getFullYear();
  const month = String(koreanTime.getMonth() + 1).padStart(2, "0");
  const day = String(koreanTime.getDate()).padStart(2, "0");
  const hours = String(koreanTime.getHours()).padStart(2, "0");
  const minutes = String(koreanTime.getMinutes()).padStart(2, "0");
  const seconds = String(koreanTime.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 한국 날짜 문자열 포맷 (YYYY-MM-DD)
 */
export const formatKoreanDate = (date: Date = new Date()): string => {
  const koreanTime = new Date(date.toLocaleString("en-US", { timeZone: KOREA_TIMEZONE }));

  const year = koreanTime.getFullYear();
  const month = String(koreanTime.getMonth() + 1).padStart(2, "0");
  const day = String(koreanTime.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * 오늘 한국 시간 기준 시작/끝 시간 반환
 */
export const getTodayKoreanRange = (): { start: Date; end: Date } => {
  const now = getKoreanTime();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * 이번 주 한국 시간 기준 시작/끝 시간 반환 (월요일 시작)
 */
export const getThisWeekKoreanRange = (): { start: Date; end: Date } => {
  const now = getKoreanTime();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 일요일이면 6, 아니면 dayOfWeek - 1

  const start = new Date(now);
  start.setDate(now.getDate() - daysToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * 이번 달 한국 시간 기준 시작/끝 시간 반환
 */
export const getThisMonthKoreanRange = (): { start: Date; end: Date } => {
  const now = getKoreanTime();

  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return { start, end };
};

/**
 * 날짜 범위 검증 (한국 시간 기준)
 */
export const validateDateRange = (startDate: string, endDate: string): { start: Date; end: Date } | null => {
  try {
    const start = new Date(startDate + "T00:00:00+09:00"); // KST 시간대 명시
    const end = new Date(endDate + "T23:59:59+09:00");

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }

    if (start > end) {
      return null;
    }

    return { start, end };
  } catch (error) {
    return null;
  }
};

/**
 * 상대적 시간 표시 (한국어)
 */
export const getRelativeTimeKorean = (date: Date): string => {
  const now = getKoreanTime();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "방금 전";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return formatKoreanDate(date);
  }
};

/**
 * 영업시간 검증 (한국 시간 기준)
 */
export const isBusinessHours = (businessHours: Record<string, { open?: string; close?: string }>): boolean => {
  const now = getKoreanTime();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = dayNames[now.getDay()];

  const todayHours = businessHours[today];
  if (!todayHours || !todayHours.open || !todayHours.close) {
    return false; // 영업시간 정보가 없으면 영업 중이 아님
  }

  const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM 형식
  const openTime = parseInt(todayHours.open.replace(":", ""));
  const closeTime = parseInt(todayHours.close.replace(":", ""));

  return currentTime >= openTime && currentTime <= closeTime;
};

export default {
  getKoreanTime,
  utcToKoreanTime,
  koreanTimeToUtc,
  formatKoreanTime,
  formatKoreanDate,
  getTodayKoreanRange,
  getThisWeekKoreanRange,
  getThisMonthKoreanRange,
  validateDateRange,
  getRelativeTimeKorean,
  isBusinessHours,
  KOREA_TIMEZONE,
};
