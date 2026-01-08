import { Request, Response } from "express";
import Store from "../models/Store";
import Analytics from "../models/Analytics";
import Recommendation from "../models/Recommendation";
import { formatResponse } from "../utils/responseFormatter";
import { AuthenticatedRequest } from "../types";
import { HTTP_STATUS } from "../utils/constants";

// 대시보드 통계 조회
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // 오늘 날짜 범위 설정 (한국 시간 기준)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 병렬로 모든 통계 데이터 조회
    const [totalStores, activeStores, totalRecommendations, totalQRScans, todayScans, uniqueVisitors] = await Promise.all([
      // 전체 매장 수
      Store.countDocuments(),

      // 활성 매장 수
      Store.countDocuments({ isActive: true }),

      // 전체 추천 수
      Recommendation.countDocuments(),

      // 전체 QR 스캔 수 (page_enter, qr_scan 이벤트)
      Analytics.countDocuments({
        eventType: { $in: ["page_enter", "qr_scan"] },
      }),

      // 오늘 스캔 수
      Analytics.countDocuments({
        eventType: { $in: ["page_enter", "qr_scan"] },
        timestamp: { $gte: today, $lt: tomorrow },
      }),

      // 고유 방문자 수 (세션 기준)
      Analytics.distinct("sessionId", {
        eventType: { $in: ["page_enter", "qr_scan"] },
      }).then((sessions) => sessions.length),
    ]);

    // 전환율 계산 (추천 클릭 / 전체 스캔)
    const recommendationClicks = await Analytics.countDocuments({
      eventType: { $in: ["spot_click", "recommendation_click"] },
    });

    const conversionRate = totalQRScans > 0 ? Number(((recommendationClicks / totalQRScans) * 100).toFixed(1)) : 0;

    const stats = {
      totalStores,
      activeStores,
      totalRecommendations,
      totalQRScans,
      todayScans,
      uniqueVisitors,
      conversionRate,
      // 추가 유용한 통계
      inactiveStores: totalStores - activeStores,
      avgScansPerStore: totalStores > 0 ? Math.round(totalQRScans / totalStores) : 0,
      todayConversionRate:
        todayScans > 0
          ? Number(
              (
                ((await Analytics.countDocuments({
                  eventType: { $in: ["spot_click", "recommendation_click"] },
                  timestamp: { $gte: today, $lt: tomorrow },
                })) /
                  todayScans) *
                100
              ).toFixed(1)
            )
          : 0,
    };

    res.json(formatResponse(true, "대시보드 통계 조회 성공", stats));
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 일별 트래픽 통계
export const getDailyTraffic = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { days = 7 } = req.query;
    const daysCount = parseInt(days as string);

    // 지난 N일간의 데이터 조회
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    startDate.setHours(0, 0, 0, 0);

    const dailyStats = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          eventType: { $in: ["page_enter", "qr_scan"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          scans: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$sessionId" },
        },
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          scans: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    res.json(formatResponse(true, "일별 트래픽 통계 조회 성공", dailyStats));
  } catch (error) {
    console.error("Daily traffic error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 매장별 성과 통계
export const getStorePerformance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const limitCount = parseInt(limit as string);

    const storeStats = await Analytics.aggregate([
      {
        $match: {
          eventType: { $in: ["page_enter", "qr_scan"] },
        },
      },
      {
        $group: {
          _id: "$store",
          totalScans: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$sessionId" },
          recommendationClicks: {
            $sum: {
              $cond: [{ $in: ["$eventType", ["spot_click", "recommendation_click"]] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "stores",
          localField: "_id",
          foreignField: "_id",
          as: "store",
        },
      },
      {
        $unwind: "$store",
      },
      {
        $project: {
          storeName: "$store.name",
          category: "$store.category",
          qrCodeId: "$store.qrCode.id",
          totalScans: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" },
          recommendationClicks: 1,
          conversionRate: {
            $cond: [{ $gt: ["$totalScans", 0] }, { $multiply: [{ $divide: ["$recommendationClicks", "$totalScans"] }, 100] }, 0],
          },
        },
      },
      {
        $sort: { totalScans: -1 },
      },
      {
        $limit: limitCount,
      },
    ]);

    res.json(formatResponse(true, "매장별 성과 통계 조회 성공", storeStats));
  } catch (error) {
    console.error("Store performance error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};
