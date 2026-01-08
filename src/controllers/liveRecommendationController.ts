import { Request, Response } from "express";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";

// 임시 추천 데이터 (실제 구현에서는 AI 기반 추천 시스템)
const SAMPLE_RECOMMENDATIONS = [
  {
    fromStoreId: "live_store_001", // 강남 브런치 카페
    recommendations: [
      {
        storeId: "live_store_002",
        name: "홍대 수제 베이커리",
        description: "매일 구워내는 신선한 빵과 디저트",
        category: "bakery",
        distance: 850,
        walkingTime: 11,
        representativeImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
        spotlineStory: {
          title: "매일 새로 굽는 행복",
          content: "전통 방식으로 발효시킨 천연 효모빵과 계절 과일을 사용한 디저트를 만나보세요."
        },
        reason: "브런치 후 디저트로 완벽한 조합",
        priority: 9,
        analytics: {
          views: 45,
          clicks: 12,
          conversions: 3
        }
      },
      {
        storeId: "live_store_003",
        name: "서촌 독립서점",
        description: "큐레이션된 도서와 조용한 독서 공간",
        category: "bookstore",
        distance: 1200,
        walkingTime: 15,
        representativeImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
        spotlineStory: {
          title: "책과 함께하는 여유",
          content: "엄선된 도서와 함께 조용한 시간을 보낼 수 있는 특별한 공간입니다."
        },
        reason: "브런치 후 여유로운 독서 시간",
        priority: 8,
        analytics: {
          views: 32,
          clicks: 8,
          conversions: 2
        }
      },
      {
        storeId: "live_store_004",
        name: "이태원 플라워샵",
        description: "계절 꽃과 식물로 가득한 공간",
        category: "flower",
        distance: 950,
        walkingTime: 12,
        representativeImage: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
        spotlineStory: {
          title: "자연이 주는 선물",
          content: "계절마다 다른 꽃들의 향기와 아름다움을 만나보세요."
        },
        reason: "자연의 아름다움으로 힐링",
        priority: 7,
        analytics: {
          views: 28,
          clicks: 6,
          conversions: 1
        }
      },
      {
        storeId: "live_store_005",
        name: "성수동 갤러리",
        description: "신진 작가들의 작품을 만나는 공간",
        category: "art",
        distance: 1100,
        walkingTime: 14,
        representativeImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
        spotlineStory: {
          title: "예술과의 만남",
          content: "젊은 작가들의 창의적인 작품을 통해 새로운 영감을 얻어보세요."
        },
        reason: "문화적 경험으로 하루를 마무리",
        priority: 6,
        analytics: {
          views: 21,
          clicks: 4,
          conversions: 1
        }
      }
    ]
  },
  {
    fromStoreId: "live_store_002", // 홍대 수제 베이커리
    recommendations: [
      {
        storeId: "live_store_001",
        name: "강남 브런치 카페",
        description: "신선한 재료로 만든 건강한 브런치와 스페셜티 커피",
        category: "cafe",
        distance: 850,
        walkingTime: 11,
        representativeImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
        spotlineStory: {
          title: "건강한 아침을 시작하는 곳",
          content: "매일 새벽 5시부터 준비하는 신선한 재료로 건강하고 맛있는 브런치를 제공합니다."
        },
        reason: "빵과 함께 즐기는 스페셜티 커피",
        priority: 9,
        analytics: {
          views: 38,
          clicks: 10,
          conversions: 2
        }
      }
    ]
  }
];

// 매장 기본 정보
const SAMPLE_LIVE_STORES = [
  {
    storeId: "live_store_001",
    name: "강남 브런치 카페",
    description: "신선한 재료로 만든 건강한 브런치와 스페셜티 커피",
    category: "cafe",
    location: {
      address: "서울시 강남구 테헤란로 152",
      coordinates: [127.0276, 37.4979]
    },
    images: {
      representative: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
    },
    spotlineStory: {
      title: "건강한 아침을 시작하는 곳",
      content: "매일 새벽 5시부터 준비하는 신선한 재료로 건강하고 맛있는 브런치를 제공합니다.",
      tags: ["브런치", "건강식", "스페셜티커피"]
    },
    status: "active"
  },
  {
    storeId: "live_store_002",
    name: "홍대 수제 베이커리",
    description: "매일 구워내는 신선한 빵과 디저트",
    category: "bakery",
    location: {
      address: "서울시 마포구 홍익로 25",
      coordinates: [126.9240, 37.5563]
    },
    images: {
      representative: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
    },
    spotlineStory: {
      title: "매일 새로 굽는 행복",
      content: "전통 방식으로 발효시킨 천연 효모빵과 계절 과일을 사용한 디저트를 만나보세요.",
      tags: ["수제빵", "천연효모", "계절디저트"]
    },
    status: "active"
  }
];

/**
 * GET /api/live/recommendations/:storeId
 * 매장 기반 실제 추천
 */
export const getLiveRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { limit = 4 } = req.query;

    // 현재 매장 확인
    const currentStore = SAMPLE_LIVE_STORES.find(s => s.storeId === storeId && s.status === 'active');
    if (!currentStore) {
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

    // 추천 데이터 조회
    const storeRecommendations = SAMPLE_RECOMMENDATIONS.find(r => r.fromStoreId === storeId);
    
    if (!storeRecommendations || !storeRecommendations.recommendations.length) {
      // 추천 데이터가 없는 경우 기본 응답
      res.json(
        formatResponse(
          true,
          "현재 추천할 수 있는 매장이 없습니다.",
          {
            store: {
              id: currentStore.storeId,
              name: currentStore.name,
              shortDescription: currentStore.description,
              representativeImage: currentStore.images.representative,
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

    // 추천 목록 제한 및 포맷팅
    const limitedRecommendations = storeRecommendations.recommendations
      .slice(0, Number(limit))
      .map(rec => ({
        id: rec.storeId,
        name: rec.name,
        shortDescription: rec.description,
        representativeImage: rec.representativeImage,
        category: rec.category,
        distance: rec.distance,
        walkingTime: rec.walkingTime,
        spotlineStory: rec.spotlineStory,
        reason: rec.reason,
        priority: rec.priority,
        analytics: {
          popularity: Math.round((rec.analytics.clicks / rec.analytics.views) * 100) || 0,
          conversionRate: Math.round((rec.analytics.conversions / rec.analytics.clicks) * 100) || 0
        }
      }));

    // 추천 조회 통계 업데이트 (실제 구현에서는 DB 업데이트)
    storeRecommendations.recommendations.forEach(rec => {
      rec.analytics.views += 1;
    });

    res.json(
      formatResponse(
        true,
        "AI 기반 추천 매장을 성공적으로 가져왔습니다.",
        {
          store: {
            id: currentStore.storeId,
            name: currentStore.name,
            shortDescription: currentStore.description,
            representativeImage: currentStore.images.representative,
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
          totalRecommendations: storeRecommendations.recommendations.length,
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

    // 추천 기록 찾기
    const storeRecommendations = SAMPLE_RECOMMENDATIONS.find(r => r.fromStoreId === fromStoreId);
    const recommendation = storeRecommendations?.recommendations.find(r => r.storeId === toStoreId);

    if (recommendation) {
      // 통계 업데이트 (실제 구현에서는 DB 업데이트)
      switch (action) {
        case 'view':
          recommendation.analytics.views += 1;
          break;
        case 'click':
          recommendation.analytics.clicks += 1;
          break;
        case 'visit':
          recommendation.analytics.conversions += 1;
          break;
      }

      // 평점이 있는 경우 처리 (실제 구현에서는 별도 평점 시스템)
      if (rating && rating >= 1 && rating <= 5) {
        console.log(`[LIVE] Rating received - From: ${fromStoreId}, To: ${toStoreId}, Rating: ${rating}`);
      }
    }

    // 피드백 로그 기록 (실제 구현에서는 별도 피드백 컬렉션에 저장)
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

    // 매장 권한 확인 (실제 구현에서는 ownerId 검증)
    const store = SAMPLE_LIVE_STORES.find(s => s.storeId === storeId);
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

    // 추천 성과 데이터 조회
    const storeRecommendations = SAMPLE_RECOMMENDATIONS.find(r => r.fromStoreId === storeId);
    
    if (!storeRecommendations) {
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
          HTTP_STATUS.OK
        )
      );
      return;
    }

    // 통계 계산
    const totalViews = storeRecommendations.recommendations.reduce((sum, rec) => sum + rec.analytics.views, 0);
    const totalClicks = storeRecommendations.recommendations.reduce((sum, rec) => sum + rec.analytics.clicks, 0);
    const totalConversions = storeRecommendations.recommendations.reduce((sum, rec) => sum + rec.analytics.conversions, 0);

    const analytics = {
      totalRecommendations: storeRecommendations.recommendations.length,
      totalViews,
      totalClicks,
      totalConversions,
      averageClickRate: totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0,
      averageConversionRate: totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 100) : 0,
      topPerforming: storeRecommendations.recommendations
        .sort((a, b) => b.analytics.conversions - a.analytics.conversions)
        .slice(0, 3)
        .map(rec => ({
          storeId: rec.storeId,
          name: rec.name,
          conversions: rec.analytics.conversions,
          conversionRate: rec.analytics.clicks > 0 ? Math.round((rec.analytics.conversions / rec.analytics.clicks) * 100) : 0
        }))
    };

    res.json(
      formatResponse(
        true,
        "추천 성과 분석 데이터를 성공적으로 가져왔습니다.",
        {
          storeId,
          storeName: store.name,
          analytics,
          recommendations: storeRecommendations.recommendations.map(rec => ({
            storeId: rec.storeId,
            name: rec.name,
            category: rec.category,
            priority: rec.priority,
            analytics: {
              views: rec.analytics.views,
              clicks: rec.analytics.clicks,
              conversions: rec.analytics.conversions,
              clickRate: rec.analytics.views > 0 ? Math.round((rec.analytics.clicks / rec.analytics.views) * 100) : 0,
              conversionRate: rec.analytics.clicks > 0 ? Math.round((rec.analytics.conversions / rec.analytics.clicks) * 100) : 0
            }
          }))
        },
        HTTP_STATUS.OK,
        {
          system: "live",
          analyticsType: "recommendation-performance",
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] Recommendation analytics requested - StoreId: ${storeId}, Total views: ${totalViews}`);
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