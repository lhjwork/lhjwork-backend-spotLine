import { Response } from "express";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";
import { AuthenticatedRequest } from "../types";
import * as storeService from "../services/storeService";

/**
 * GET /api/admin/live/stores
 * 실제 매장 목록 조회 (어드민)
 */
export const getLiveStores = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log("=== ADMIN LIVE CONTROLLER getLiveStores CALLED ===");
  
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      category,
      search 
    } = req.query;

    console.log(`[DEBUG] getLiveStores called with params:`, { page, limit, status, category, search });

    // 실제 DB에서 매장 목록 조회
    const result = await storeService.getAdminStores({
      page: Number(page),
      limit: Number(limit),
      category: category as string,
      active: status === 'active' ? 'true' : status === 'inactive' ? 'false' : undefined
    });

    console.log(`[DEBUG] storeService.getAdminStores result:`, {
      storeCount: result.stores.length,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      firstStoreName: result.stores[0]?.name || 'No stores found'
    });

    // 검색 필터링 (필요시)
    let filteredStores = result.stores;
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredStores = filteredStores.filter(store => 
        store.name.toLowerCase().includes(searchTerm) ||
        (store.description && store.description.toLowerCase().includes(searchTerm))
      );
    }

    console.log(`[DEBUG] Final filtered stores count:`, filteredStores.length);
    console.log(`[DEBUG] Final stores names:`, filteredStores.map(s => s.name));

    res.json(
      formatResponse(
        true,
        "실제 매장 목록을 성공적으로 가져왔습니다.",
        {
          stores: filteredStores,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: result.totalCount,
            pages: result.totalPages
          },
          filters: { status, category, search },
          summary: {
            total: result.totalCount,
            active: filteredStores.filter(s => s.isActive).length,
            inactive: filteredStores.filter(s => !s.isActive).length
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

    // 실제 DB에서 매장 조회
    const store = await storeService.getStoreById(storeId);

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
          ...store.toObject(),
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

    // 실제 DB에서 매장 상태 업데이트
    const store = await storeService.updateStore(storeId, { 
      isActive: true,
      updatedAt: new Date()
    });
    
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

    // 실제 DB에서 매장 상태 업데이트
    const store = await storeService.updateStore(storeId, { 
      isActive: false,
      updatedAt: new Date()
    });
    
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
    // 실제 DB에서 추천 목록 조회
    const Recommendation = require("../models/Recommendation").default;
    const recommendations = await Recommendation.find({})
      .populate('fromStore', 'name category')
      .populate('toStore', 'name category')
      .sort({ createdAt: -1 });

    res.json(
      formatResponse(
        true,
        "Live 추천 목록을 성공적으로 가져왔습니다.",
        {
          recommendations,
          total: recommendations.length,
          summary: {
            active: recommendations.filter((r: any) => r.isActive).length,
            inactive: recommendations.filter((r: any) => !r.isActive).length
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

    // 실제 DB에 추천 저장
    const Recommendation = require("../models/Recommendation").default;
    const newRecommendation = new Recommendation({
      ...recommendationData,
      createdBy: req.admin?.adminId,
      createdAt: new Date()
    });

    const savedRecommendation = await newRecommendation.save();

    res.status(HTTP_STATUS.CREATED).json(
      formatResponse(
        true,
        "Live 추천이 성공적으로 생성되었습니다.",
        savedRecommendation,
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

    // 실제 DB에서 추천 업데이트
    const Recommendation = require("../models/Recommendation").default;
    const updatedRecommendation = await Recommendation.findByIdAndUpdate(
      id, 
      { 
        ...updateData, 
        updatedBy: req.admin?.adminId,
        updatedAt: new Date()
      }, 
      { new: true }
    );

    if (!updatedRecommendation) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "추천을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    res.json(
      formatResponse(
        true,
        "Live 추천이 성공적으로 수정되었습니다.",
        updatedRecommendation,
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

    // 실제 DB에서 추천 삭제
    const Recommendation = require("../models/Recommendation").default;
    const deletedRecommendation = await Recommendation.findByIdAndDelete(id);

    if (!deletedRecommendation) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "추천을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

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
    // 실제 DB에서 통계 데이터 조회
    const stats = await storeService.getStoreStats();
    
    const analytics = {
      overview: {
        totalStores: stats.totalStores,
        activeStores: stats.activeStores,
        inactiveStores: stats.inactiveStores,
        totalViews: 0, // 실제 구현시 Analytics 모델에서 조회
        totalQRScans: 0 // 실제 구현시 Analytics 모델에서 조회
      },
      trends: {
        dailyViews: [0, 0, 0, 0, 0, 0, 0], // 실제 구현시 Analytics 모델에서 조회
        dailyScans: [0, 0, 0, 0, 0, 0, 0], // 실제 구현시 Analytics 모델에서 조회
        topCategories: stats.categoryStats.map(cat => ({
          category: cat._id,
          count: cat.count,
          percentage: Math.round((cat.count / stats.totalStores) * 100)
        }))
      },
      performance: {
        averageViewsPerStore: 0, // 실제 구현시 계산
        averageScansPerStore: 0, // 실제 구현시 계산
        conversionRate: 0 // 실제 구현시 계산
      },
      recentStores: stats.recentStores
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

    // 실제 DB에서 매장 조회
    const store = await storeService.getStoreById(storeId);
    
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
        storeId: store._id,
        name: store.name,
        category: store.category,
        status: store.isActive ? 'active' : 'inactive'
      },
      analytics: {
        totalViews: 0, // 실제 구현시 Analytics 모델에서 조회
        monthlyViews: 0,
        qrScans: 0,
        recommendations: 0
      },
      trends: {
        dailyViews: [0, 0, 0, 0, 0, 0, 0], // 실제 구현시 Analytics 모델에서 조회
        dailyScans: [0, 0, 0, 0, 0, 0, 0],
        peakHours: []
      },
      recommendations: {
        given: 0, // 실제 구현시 Recommendation 모델에서 조회
        received: 0,
        clickRate: 0
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