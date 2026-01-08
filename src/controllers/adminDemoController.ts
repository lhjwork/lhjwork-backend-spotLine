import { Response } from "express";
import { DEMO_STORE, DEMO_NEXT_SPOTS } from "../data/demo";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";
import { AuthenticatedRequest } from "../types";

/**
 * GET /api/admin/demo/stores
 * 데모 매장 목록 조회 (어드민)
 */
export const getDemoStores = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // 실제 구현에서는 demostores 컬렉션에서 조회
    const stores = [DEMO_STORE]; // 현재는 하나만 있음

    res.json(
      formatResponse(
        true,
        "데모 매장 목록을 성공적으로 가져왔습니다.",
        {
          stores,
          total: stores.length,
          system: "demo"
        },
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "demo",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Demo stores list requested by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin demo stores get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 매장 목록을 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/admin/demo/stores/:storeId
 * 특정 데모 매장 조회 (어드민)
 */
export const getDemoStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    // 실제 구현에서는 demostores 컬렉션에서 조회
    if (storeId !== DEMO_STORE.id) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "데모 매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    res.json(
      formatResponse(
        true,
        "데모 매장 정보를 성공적으로 가져왔습니다.",
        DEMO_STORE,
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "demo",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Demo store ${storeId} requested by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin demo store get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 매장 정보를 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * POST /api/admin/demo/stores
 * 새 데모 매장 생성 (어드민)
 */
export const createDemoStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const storeData = req.body;

    // 실제 구현에서는 demostores 컬렉션에 저장
    const newStore = {
      id: `demo-store-${Date.now()}`,
      ...storeData,
      createdAt: new Date().toISOString(),
      createdBy: req.admin?.adminId
    };

    res.status(HTTP_STATUS.CREATED).json(
      formatResponse(
        true,
        "데모 매장이 성공적으로 생성되었습니다.",
        newStore,
        HTTP_STATUS.CREATED,
        {
          system: "admin",
          subsystem: "demo",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Demo store created by admin: ${req.admin?.adminId}, StoreId: ${newStore.id}`);
  } catch (error) {
    console.error("Admin demo store create error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 매장 생성에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * PUT /api/admin/demo/stores/:storeId
 * 데모 매장 수정 (어드민)
 */
export const updateDemoStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const updateData = req.body;

    // 실제 구현에서는 demostores 컬렉션 업데이트
    if (storeId !== DEMO_STORE.id) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "데모 매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    const updatedStore = {
      ...DEMO_STORE,
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: req.admin?.adminId
    };

    res.json(
      formatResponse(
        true,
        "데모 매장이 성공적으로 수정되었습니다.",
        updatedStore,
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "demo",
          adminId: req.admin?.adminId,
          updatedFields: Object.keys(updateData),
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Demo store ${storeId} updated by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin demo store update error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 매장 수정에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * DELETE /api/admin/demo/stores/:storeId
 * 데모 매장 삭제 (어드민)
 */
export const deleteDemoStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    // 실제 구현에서는 demostores 컬렉션에서 삭제
    if (storeId !== DEMO_STORE.id) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "데모 매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    res.json(
      formatResponse(
        true,
        "데모 매장이 성공적으로 삭제되었습니다.",
        { deletedStoreId: storeId },
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "demo",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Demo store ${storeId} deleted by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin demo store delete error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 매장 삭제에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/admin/demo/recommendations
 * 데모 추천 목록 조회 (어드민)
 */
export const getDemoRecommendations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // 실제 구현에서는 demorecommendations 컬렉션에서 조회
    const recommendations = DEMO_NEXT_SPOTS;

    res.json(
      formatResponse(
        true,
        "데모 추천 목록을 성공적으로 가져왔습니다.",
        {
          recommendations,
          total: recommendations.length,
          system: "demo"
        },
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "demo",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Demo recommendations list requested by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin demo recommendations get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 추천 목록을 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * POST /api/admin/demo/recommendations
 * 새 데모 추천 생성 (어드민)
 */
export const createDemoRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const recommendationData = req.body;

    // 실제 구현에서는 demorecommendations 컬렉션에 저장
    const newRecommendation = {
      id: `demo_rec_${Date.now()}`,
      ...recommendationData,
      createdAt: new Date().toISOString(),
      createdBy: req.admin?.adminId
    };

    res.status(HTTP_STATUS.CREATED).json(
      formatResponse(
        true,
        "데모 추천이 성공적으로 생성되었습니다.",
        newRecommendation,
        HTTP_STATUS.CREATED,
        {
          system: "admin",
          subsystem: "demo",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Demo recommendation created by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin demo recommendation create error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 추천 생성에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * PUT /api/admin/demo/recommendations/:id
 * 데모 추천 수정 (어드민)
 */
export const updateDemoRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 실제 구현에서는 demorecommendations 컬렉션 업데이트
    res.json(
      formatResponse(
        true,
        "데모 추천이 성공적으로 수정되었습니다.",
        { id, ...updateData },
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "demo",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Demo recommendation ${id} updated by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin demo recommendation update error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 추천 수정에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * DELETE /api/admin/demo/recommendations/:id
 * 데모 추천 삭제 (어드민)
 */
export const deleteDemoRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 실제 구현에서는 demorecommendations 컬렉션에서 삭제
    res.json(
      formatResponse(
        true,
        "데모 추천이 성공적으로 삭제되었습니다.",
        { deletedRecommendationId: id },
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "demo",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Demo recommendation ${id} deleted by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin demo recommendation delete error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 추천 삭제에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/admin/demo/settings
 * 데모 시스템 설정 조회 (어드민)
 */
export const getDemoSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const settings = {
      isEnabled: true,
      loadingSimulationMs: 500,
      version: "2.0",
      lastUpdated: new Date().toISOString()
    };

    res.json(
      formatResponse(
        true,
        "데모 시스템 설정을 성공적으로 가져왔습니다.",
        settings,
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "demo",
          adminId: req.admin?.adminId,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Demo settings requested by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin demo settings get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 시스템 설정을 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * PUT /api/admin/demo/settings
 * 데모 시스템 설정 수정 (어드민)
 */
export const updateDemoSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updateData = req.body;

    const updatedSettings = {
      isEnabled: updateData.isEnabled ?? true,
      loadingSimulationMs: updateData.loadingSimulationMs ?? 500,
      version: "2.0",
      lastUpdated: new Date().toISOString(),
      updatedBy: req.admin?.adminId
    };

    res.json(
      formatResponse(
        true,
        "데모 시스템 설정이 성공적으로 수정되었습니다.",
        updatedSettings,
        HTTP_STATUS.OK,
        {
          system: "admin",
          subsystem: "demo",
          adminId: req.admin?.adminId,
          updatedFields: Object.keys(updateData),
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[ADMIN] Demo settings updated by admin: ${req.admin?.adminId}`);
  } catch (error) {
    console.error("Admin demo settings update error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 시스템 설정 수정에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};