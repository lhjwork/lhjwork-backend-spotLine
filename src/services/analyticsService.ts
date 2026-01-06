import Analytics from "../models/Analytics";
import Store from "../models/Store";
import { IAnalytics, LogEventRequest } from "../types";

interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  period?: "day" | "week" | "month";
}

interface RecommendationPerformanceFilters extends AnalyticsFilters {
  qrCode?: string;
  category?: string;
  limit?: number;
}

interface DailyTrafficFilters extends AnalyticsFilters {
  qrCode?: string;
  days?: number;
}

// 이벤트 로깅
export const logEvent = async (
  eventData: LogEventRequest & {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  }
): Promise<{ id: string } | null> => {
  // 매장 존재 여부 확인
  const store = await Store.findById(eventData.store);
  if (!store) {
    return null;
  }

  const analytics = new Analytics(eventData);
  const saved = await analytics.save();

  return { id: saved._id.toString() };
};

// QR 코드별 통계 조회
export const getQRStats = async (qrId: string, filters: AnalyticsFilters = {}): Promise<any> => {
  const { startDate, endDate } = filters;
  const matchFilter: any = { qrCode: qrId };

  if (startDate || endDate) {
    matchFilter.timestamp = {};
    if (startDate) matchFilter.timestamp.$gte = new Date(startDate);
    if (endDate) matchFilter.timestamp.$lte = new Date(endDate);
  }

  const stats = await Analytics.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        eventBreakdown: {
          $push: {
            eventType: "$eventType",
            count: 1,
          },
        },
      },
    },
  ]);

  return stats[0] || { totalEvents: 0, eventBreakdown: [] };
};

// 매장별 통계 조회
export const getStoreStats = async (storeId: string, filters: AnalyticsFilters = {}): Promise<any> => {
  const { startDate, endDate } = filters;
  const matchFilter: any = { store: storeId };

  if (startDate || endDate) {
    matchFilter.timestamp = {};
    if (startDate) matchFilter.timestamp.$gte = new Date(startDate);
    if (endDate) matchFilter.timestamp.$lte = new Date(endDate);
  }

  const stats = await Analytics.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$eventType",
        count: { $sum: 1 },
      },
    },
  ]);

  return stats;
};

// 추천 클릭률 분석
export const getRecommendationPerformance = async (filters: RecommendationPerformanceFilters = {}): Promise<any[]> => {
  const { qrCode, startDate, endDate, limit = 20 } = filters;
  const matchFilter: any = { eventType: "recommendation_click" };

  if (qrCode) matchFilter.qrCode = qrCode;
  if (startDate || endDate) {
    matchFilter.timestamp = {};
    if (startDate) matchFilter.timestamp.$gte = new Date(startDate);
    if (endDate) matchFilter.timestamp.$lte = new Date(endDate);
  }

  return await Analytics.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$targetStore",
        clicks: { $sum: 1 },
      },
    },
    { $sort: { clicks: -1 } },
    { $limit: limit },
  ]);
};

// 일별 트래픽 통계
export const getDailyTraffic = async (filters: DailyTrafficFilters = {}): Promise<any[]> => {
  const { startDate, endDate, qrCode, days = 30 } = filters;
  const matchFilter: any = {};

  if (qrCode) matchFilter.qrCode = qrCode;

  // 날짜 범위 설정
  const endDateObj = endDate ? new Date(endDate) : new Date();
  const startDateObj = startDate ? new Date(startDate) : new Date(endDateObj.getTime() - days * 24 * 60 * 60 * 1000);

  matchFilter.timestamp = {
    $gte: startDateObj,
    $lte: endDateObj,
  };

  return await Analytics.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$timestamp",
          },
        },
        totalEvents: { $sum: 1 },
        qrScans: {
          $sum: {
            $cond: [{ $eq: ["$eventType", "qr_scan"] }, 1, 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};
