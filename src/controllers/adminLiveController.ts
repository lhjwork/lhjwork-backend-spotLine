import { Response } from "express";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";
import { AuthenticatedRequest } from "../types";

// 임시 Live 데이터 (실제 구현에서는 MongoDB에서 조회)
const SAMPLE_LIVE_STORES = [
  {
    storeId: "live_store_001",
    name: "강남 브런치 카페",
    description: "신선한 재료로 만든 건강한 브런치와 스페셜티 커피",
    category: "cafe",
    status: "active",
    ownerId: "owner_001",
    analytics: {
      totalViews: 1247,
      monthlyViews: 89,
      qrScans: 156,
      recommendations: 23
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-08")
  },
  {
    storeId: "live_store_002",
    name: "홍대 수제 베이커리",
    description: "매일 구워내는 신선한 빵과 디저트",
    category: "bakery",
    status: "pending",
    ownerId: "owner_002",
    analytics: {
      totalViews: 892,
      monthlyViews: 67,
      qrScans: 134,
      recommendations: 18
    },
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-07")
  }
];

/**
 * GET /api/admin/live/stores
 * 실제 매장 목록 조회 (어드민)
 */
export const getLiveStores = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      category,
      search 
    } = req.query;

    // 필터링 로직 (실제 구현에서는 MongoDB 쿼리)
    let filteredStores = SAMPLE_LIVE_STORES;
    
    if (status) {
      filteredStores = filteredStores.filter(store => store.status === status);
    }
    
    if (category) {
      filteredStores = filteredStores.filter(store => store.category === category);
    }
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredStores = filteredStores.filter(store => 
        store.name.toLowerCase().includes(searchTerm) ||
        store.description.toLowerCase().includes(searchTerm)
      );
    }

    // 페이지네이션
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedStores = filteredStores.slice(startIndex, endIndex);

    res.json(
      formatResponse(
        true,
        "실제 매장 목록을 성공적으로 가져왔습니다.",
        {
          stores: paginatedStores,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: filteredStores.length,
            pages: Math.ceil(filteredStores.length / Number(limit))
          },
          filters: { status, category, search },
          summary: {
            total: SAMPLE_LIVE_STORES.length,
            active: SAMPLE_LIVE_STORES.filter(s => s.status === 'active').length,
            pending: SAMPLE_LIVE_STORES.filter(s => s.status === 'pending').length,
            suspended: SAMPLE_LIVE_STORES.filter(s => s.status === 'suspended').length
          }
        },
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "live",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Live stores list requested by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin live stores get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "실제 매장 목록을 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/admin/live/stores/:storeId
 * 특정 실제 매장 조회 (어드민)
 */
export const getLiveStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    // 실제 구현에서는 stores 컬렉션에서 조회
    const store = SAMPLE_LIVE_STORES.find(s => s.storeId === storeId);

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    res.json(
      formatResponse(
        true,
        "매장 정보를 성공적으로 가져왔습니다.",
        {
          ...store,
          adminView: true,
          lastAccessedBy: req.admin?.adminId,
          lastAccessedAt: new Date().toISOString()
        },
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "live",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Live store ${storeId} requested by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin live store get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 정보를 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * POST /api/admin/live/stores/:storeId/approve
 * 매장 승인 (어드민 전용)
 */
export const approveStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { approvalNote } = req.body;

    // 실제 구현에서는 stores 컬렉션 업데이트
    const storeIndex = SAMPLE_LIVE_STORES.findIndex(s => s.storeId === storeId);
    
    if (storeIndex === -1) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // 매장 상태를 active로 변경
    SAMPLE_LIVE_STORES[storeIndex].status = "active";
    SAMPLE_LIVE_STORES[storeIndex].updatedAt = new Date();

    res.json(
      formatResponse(
        true,
        "매장이 성공적으로 승인되었습니다.",
        {
          storeId,
          status: "active",
          approvedBy: req.admin?.adminId,
          approvedAt: new Date().toISOString(),
          approvalNote: approvalNote || null
        },
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "live",
          adminId: req.admin?.adminId,
          action: "approve",
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Store ${storeId} approved by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin store approve error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 승인에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * POST /api/admin/live/stores/:storeId/suspend
 * 매장 정지 (어드민 전용)
 */
export const suspendStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { suspensionReason } = req.body;

    // 실제 구현에서는 stores 컬렉션 업데이트
    const storeIndex = SAMPLE_LIVE_STORES.findIndex(s => s.storeId === storeId);
    
    if (storeIndex === -1) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // 매장 상태를 suspended로 변경
    SAMPLE_LIVE_STORES[storeIndex].status = "suspended";
    SAMPLE_LIVE_STORES[storeIndex].updatedAt = new Date();

    res.json(
      formatResponse(
        true,
        "매장이 성공적으로 정지되었습니다.",
        {
          storeId,
          status: "suspended",
          suspendedBy: req.admin?.adminId,
          suspendedAt: new Date().toISOString(),
          suspensionReason: suspensionReason || "관리자 판단"
        },
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "live",
          adminId: req.admin?.adminId,
          action: "suspend",
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Store ${storeId} suspended by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin store suspend error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 정지에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/admin/live/recommendations
 * Live 추천 목록 조회 (어드민)
 */
export const getLiveRecommendations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // 실제 구현에서는 recommendations 컬렉션에서 조회
    const recommendations = [
      {
        id: "rec_001",
        fromStoreId: "live_store_001",
        toStoreId: "live_store_002",
        priority: 9,
        isActive: true,
        analytics: {
          views: 45,
          clicks: 12,
          conversions: 3
        },
        createdAt: new Date("2024-01-01")
      }
    ];

    res.json(
      formatResponse(
        true,
        "Live 추천 목록을 성공적으로 가져왔습니다.",
        {
          recommendations,
          total: recommendations.length,
          summary: {
            active: recommendations.filter(r => r.isActive).length,
            inactive: recommendations.filter(r => !r.isActive).length
          }
        },
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "live",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Live recommendations requested by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin live recommendations get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "Live 추천 목록을 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * POST /api/admin/live/recommendations
 * 새 Live 추천 생성 (어드민)
 */
export const createLiveRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const recommendationData = req.body;

    // 실제 구현에서는 recommendations 컬렉션에 저장
    const newRecommendation = {
      id: `rec_${Date.now()}`,
      ...recommendationData,
      analytics: {
        views: 0,
        clicks: 0,
        conversions: 0
      },
      createdAt: new Date().toISOString(),
      createdBy: req.admin?.adminId
    };

    res.status(HTTP_STATUS.CREATED).json(
      formatResponse(
        true,
        "Live 추천이 성공적으로 생성되었습니다.",
        newRecommendation,
        HTTP_STATUS.CREATED,
        {
          system: "admin",
          subsystem: "live",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Live recommendation created by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin live recommendation create error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "Live 추천 생성에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * PUT /api/admin/live/recommendations/:id
 * Live 추천 수정 (어드민)
 */
export const updateLiveRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 실제 구현에서는 recommendations 컬렉션 업데이트
    res.json(
      formatResponse(
        true,
        "Live 추천이 성공적으로 수정되었습니다.",
        { id, ...updateData },
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "live",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Live recommendation ${id} updated by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin live recommendation update error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "Live 추천 수정에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * DELETE /api/admin/live/recommendations/:id
 * Live 추천 삭제 (어드민)
 */
export const deleteLiveRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 실제 구현에서는 recommendations 컬렉션에서 삭제
    res.json(
      formatResponse(
        true,
        "Live 추천이 성공적으로 삭제되었습니다.",
        { deletedRecommendationId: id },
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "live",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Live recommendation ${id} deleted by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin live recommendation delete error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "Live 추천 삭제에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/admin/live/analytics
 * Live 시스템 전체 분석 데이터 (어드민)
 */
export const getLiveAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // 실제 구현에서는 여러 컬렉션에서 집계 데이터 조회
    const analytics = {
      overview: {
        totalStores: SAMPLE_LIVE_STORES.length,
        activeStores: SAMPLE_LIVE_STORES.filter(s => s.status === 'active').length,
        pendingStores: SAMPLE_LIVE_STORES.filter(s => s.status === 'pending').length,
        totalViews: SAMPLE_LIVE_STORES.reduce((sum, store) => sum + store.analytics.totalViews, 0),
        totalQRScans: SAMPLE_LIVE_STORES.reduce((sum, store) => sum + store.analytics.qrScans, 0)
      },
      trends: {
        dailyViews: [120, 135, 98, 156, 189, 167, 145], // 최근 7일
        dailyScans: [23, 28, 19, 31, 35, 29, 26], // 최근 7일
        topCategories: [
          { category: "cafe", count: 1, percentage: 50 },
          { category: "bakery", count: 1, percentage: 50 }
        ]
      },
      performance: {
        averageViewsPerStore: Math.round(SAMPLE_LIVE_STORES.reduce((sum, store) => sum + store.analytics.totalViews, 0) / SAMPLE_LIVE_STORES.length),
        averageScansPerStore: Math.round(SAMPLE_LIVE_STORES.reduce((sum, store) => sum + store.analytics.qrScans, 0) / SAMPLE_LIVE_STORES.length),
        conversionRate: 12.5 // 예시 값
      }
    };

    res.json(
      formatResponse(
        true,
        "Live 시스템 분석 데이터를 성공적으로 가져왔습니다.",
        analytics,
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "live",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Live analytics requested by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin live analytics get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "Live 시스템 분석 데이터를 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/admin/live/analytics/stores/:storeId
 * 특정 매장 분석 데이터 (어드민)
 */
export const getStoreAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    // 실제 구현에서는 해당 매장의 상세 분석 데이터 조회
    const store = SAMPLE_LIVE_STORES.find(s => s.storeId === storeId);
    
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    const storeAnalytics = {
      store: {
        storeId: store.storeId,
        name: store.name,
        category: store.category,
        status: store.status
      },
      analytics: store.analytics,
      trends: {
        dailyViews: [15, 18, 12, 22, 25, 19, 16], // 최근 7일
        dailyScans: [3, 4, 2, 5, 6, 4, 3], // 최근 7일
        peakHours: [
          { hour: 9, views: 45 },
          { hour: 12, views: 67 },
          { hour: 18, views: 52 }
        ]
      },
      recommendations: {
        given: 23,
        received: 18,
        clickRate: 15.2
      }
    };

    res.json(
      formatResponse(
        true,
        "매장 분석 데이터를 성공적으로 가져왔습니다.",
        storeAnalytics,
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "live",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Store ${storeId} analytics requested by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin store analytics get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 분석 데이터를 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/admin/live/settings
 * Live 시스템 설정 조회 (어드민)
 */
export const getLiveSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const settings = {
      isEnabled: true,
      requireApproval: true,
      maxStoresPerOwner: 5,
      analyticsRetentionDays: 365,
      version: "1.0",
      lastUpdated: new Date().toISOString()
    };

    res.json(
      formatResponse(
        true,
        "Live 시스템 설정을 성공적으로 가져왔습니다.",
        settings,
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "live",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Live settings requested by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin live settings get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "Live 시스템 설정을 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * PUT /api/admin/live/settings
 * Live 시스템 설정 수정 (어드민)
 */
export const updateLiveSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updateData = req.body;

    const updatedSettings = {
      isEnabled: updateData.isEnabled ?? true,
      requireApproval: updateData.requireApproval ?? true,
      maxStoresPerOwner: updateData.maxStoresPerOwner ?? 5,
      analyticsRetentionDays: updateData.analyticsRetentionDays ?? 365,
      version: "1.0",
      lastUpdated: new Date().toISOString(),
      updatedBy: req.admin?.adminId
    };

    res.json(
      formatResponse(
        true,
        "Live 시스템 설정이 성공적으로 수정되었습니다.",
        updatedSettings,
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "live",
          adminId: req.admin?.adminId,
          updatedFields: Object.keys(updateData),
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Live settings updated by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin live settings update error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "Live 시스템 설정 수정에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};