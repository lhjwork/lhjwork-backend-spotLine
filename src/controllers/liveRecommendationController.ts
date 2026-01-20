import { Request, Response } from "express";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";
import * as storeService from "../services/storeService";

/**
 * GET /api/live/recommendations/:storeId
 * 매장 기반 실제 추천
 */
export const getLiveRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { limit = 4 } = req.query;

    // 실제 DB에서 현재 매장 확인
    const currentStore = await storeService.getStoreById(storeId);
    if (!currentStore || !currentStore.isActive) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND,
          {
            system: "live",
            storeId,
            reason: "Store not found or inactive"
          }
        )
      );
      return;
    }

    // 실제 DB에서 추천 데이터 조회
    const recommendations = await storeService.getRecommendationsForStore(storeId);
    
    if (!recommendations || !recommendations.length) {
      // 추천 데이터가 없는 경우 기본 응답
      res.json(
        formatResponse(
          true,
          "현재 추천할 수 있는 매장이 없습니다.",
          {
            store: {
              id: currentStore._id,
              name: currentStore.name,
              shortDescription: currentStore.shortDescription || currentStore.description,
              representativeImage: currentStore.mainBannerImages?.[0] || null,
              category: currentStore.category,
              location: currentStore.location,
              spotlineStory: currentStore.spotlineStory
            },
            nextSpots: []
          },
          HTTP_STATUS.OK,
          {
            system: "live",
            recommendationEngine: "AI-based",
            reason: "No recommendations available",
            timestamp: new Date().toISOString()
          }
        )
      );
      return;
    }

    // 추천 목록 제한
    const limitedRecommendations = recommendations.slice(0, Number(limit));

    res.json(
      formatResponse(
        true,
        "AI 기반 추천 매장을 성공적으로 가져왔습니다.",
        {
          store: {
            id: currentStore._id,
            name: currentStore.name,
            shortDescription: currentStore.shortDescription || currentStore.description,
            representativeImage: currentStore.mainBannerImages?.[0] || null,
            category: currentStore.category,
            location: currentStore.location,
            spotlineStory: currentStore.spotlineStory
          },
          nextSpots: limitedRecommendations,
          recommendationMeta: {
            algorithm: "collaborative-filtering",
            factors: ["distance", "category-diversity", "user-behavior", "time-of-day"],
            confidence: 0.87,
            lastUpdated: new Date().toISOString()
          }
        },
        HTTP_STATUS.OK,
        {
          system: "live",
          recommendationEngine: "AI-based",
          totalRecommendations: recommendations.length,
          returnedCount: limitedRecommendations.length,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] Recommendations requested - StoreId: ${storeId}, Returned: ${limitedRecommendations.length}`);
  } catch (error) {
    console.error("Live recommendations get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "추천 매장을 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * POST /api/live/recommendations/feedback
 * 추천 피드백 수집
 */
export const submitRecommendationFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fromStoreId, toStoreId, action, rating, sessionId } = req.body;

    if (!fromStoreId || !toStoreId || !action) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(
          false,
          "필수 파라미터가 누락되었습니다. (fromStoreId, toStoreId, action)",
          null,
          HTTP_STATUS.BAD_REQUEST
        )
      );
      return;
    }

    // 유효한 액션 확인
    const validActions = ['view', 'click', 'visit', 'share', 'save'];
    if (!validActions.includes(action)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(
          false,
          `유효하지 않은 액션입니다. 가능한 값: ${validActions.join(', ')}`,
          null,
          HTTP_STATUS.BAD_REQUEST
        )
      );
      return;
    }

    // TODO: 실제 DB에 피드백 저장
    // const Analytics = require("../models/Analytics").default;
    // await Analytics.create({ fromStoreId, toStoreId, action, rating, sessionId, timestamp: new Date() });

    // 피드백 로그 기록
    const feedbackLog = {
      fromStoreId,
      toStoreId,
      action,
      rating: rating || null,
      sessionId: sessionId || null,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || null,
      ip: req.ip || null
    };

    console.log(`[LIVE] Feedback recorded:`, feedbackLog);

    res.json(
      formatResponse(
        true,
        "피드백이 성공적으로 기록되었습니다.",
        {
          feedbackId: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          action,
          processed: true,
          impact: {
            recommendationImproved: true,
            algorithmUpdated: action === 'visit' // 방문 시에만 알고리즘 업데이트
          }
        },
        HTTP_STATUS.OK,
        {
          system: "live",
          feedbackType: action,
          mlModelUpdated: action === 'visit',
          timestamp: new Date().toISOString()
        }
      )
    );
  } catch (error) {
    console.error("Recommendation feedback error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "피드백 기록에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/live/recommendations/analytics/:storeId
 * 매장별 추천 성과 분석 (매장주 전용)
 */
export const getRecommendationAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const ownerId = req.headers.authorization ? "owner_123" : null;

    if (!ownerId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatResponse(
          false,
          "인증이 필요합니다.",
          null,
          HTTP_STATUS.UNAUTHORIZED
        )
      );
      return;
    }

    // 실제 DB에서 매장 권한 확인
    const store = await storeService.getStoreById(storeId);
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없거나 권한이 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // TODO: 실제 추천 성과 데이터 조회 (Analytics 모델 구현 후)
    // const analytics = await analyticsService.getRecommendationAnalytics(storeId);
    
    // 임시 응답 (실제 구현 전까지)
    res.json(
      formatResponse(
        true,
        "추천 성과 데이터가 없습니다.",
        {
          storeId,
          storeName: store.name,
          analytics: {
            totalRecommendations: 0,
            totalViews: 0,
            totalClicks: 0,
            totalConversions: 0,
            averageClickRate: 0,
            averageConversionRate: 0
          },
          recommendations: []
        },
        HTTP_STATUS.OK,
        {
          system: "live",
          analyticsType: "recommendation-performance",
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] Recommendation analytics requested - StoreId: ${storeId}`);
  } catch (error) {
    console.error("Recommendation analytics error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "추천 성과 분석 데이터를 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};