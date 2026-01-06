import { Request, Response } from "express";
import * as analyticsService from "../services/analyticsService";
import { formatResponse } from "../utils/responseFormatter";
import { LogEventRequest, AnalyticsQueryParams } from "../types";
import { HTTP_STATUS } from "../utils/constants";

// 이벤트 로깅
export const logEvent = async (req: Request<{}, {}, LogEventRequest>, res: Response): Promise<void> => {
  try {
    const eventData = {
      ...req.body,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      referrer: req.headers.referer,
    };

    const result = await analyticsService.logEvent(eventData);

    if (!result) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.status(HTTP_STATUS.CREATED).json(formatResponse(true, "이벤트가 기록되었습니다", { id: result.id }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, errorMessage, null, HTTP_STATUS.BAD_REQUEST));
  }
};

// QR 코드별 통계 조회
export const getQRStats = async (req: Request<{ qrId: string }, {}, {}, AnalyticsQueryParams>, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;
    const { startDate, endDate, period } = req.query;

    const stats = await analyticsService.getQRStats(qrId, {
      startDate,
      endDate,
      period,
    });

    res.json(formatResponse(true, "QR 코드 통계 조회 성공", stats));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 매장별 통계 조회
export const getStoreStats = async (req: Request<{ storeId: string }, {}, {}, AnalyticsQueryParams>, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { startDate, endDate, period } = req.query;

    const stats = await analyticsService.getStoreStats(storeId, {
      startDate,
      endDate,
      period,
    });

    res.json(formatResponse(true, "매장별 통계 조회 성공", stats));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 추천 클릭률 분석
export const getRecommendationPerformance = async (req: Request<{}, {}, {}, AnalyticsQueryParams & { qrCode?: string; category?: string; limit?: string }>, res: Response): Promise<void> => {
  try {
    const { qrCode, startDate, endDate, category, limit } = req.query;

    const performance = await analyticsService.getRecommendationPerformance({
      qrCode,
      startDate,
      endDate,
      category,
      limit: parseInt(limit || "20"),
    });

    res.json(formatResponse(true, "추천 성과 분석 조회 성공", performance));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 일별 트래픽 통계
export const getDailyTraffic = async (req: Request<{}, {}, {}, AnalyticsQueryParams & { qrCode?: string }>, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, qrCode, days } = req.query;

    const dailyStats = await analyticsService.getDailyTraffic({
      startDate,
      endDate,
      qrCode,
      days: parseInt(days || "30"),
    });

    res.json(formatResponse(true, "일별 트래픽 통계 조회 성공", dailyStats));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};
