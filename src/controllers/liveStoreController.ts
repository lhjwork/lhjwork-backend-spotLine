import { Request, Response } from "express";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";
import * as storeService from "../services/storeService";

/**
 * GET /api/live/stores
 * 실제 매장 목록 조회
 */
export const getLiveStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      city, 
      district,
      status = 'active'
    } = req.query;

    // 실제 DB에서 매장 목록 조회
    const result = await storeService.getAdminStores({
      page: Number(page),
      limit: Number(limit),
      category: category as string,
      active: status === 'active' ? 'true' : status === 'inactive' ? 'false' : undefined
    });

    // 추가 필터링 (city, district)
    let filteredStores = result.stores;
    if (city) {
      filteredStores = filteredStores.filter(store => 
        store.location?.area?.includes(city as string)
      );
    }
    if (district) {
      filteredStores = filteredStores.filter(store => 
        store.location?.area?.includes(district as string)
      );
    }

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
          filters: {
            category,
            city,
            district,
            status
          }
        },
        HTTP_STATUS.OK,
        {
          system: "live",
          dataSource: "database",
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] Stores list requested - Page: ${page}, Filters: ${JSON.stringify({ category, city, district, status })}`);
  } catch (error) {
    console.error("Live stores get error:", error);
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
 * GET /api/live/stores/:storeId
 * 특정 매장 상세 조회
 */
export const getLiveStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    // 실제 DB에서 매장 조회
    const store = await storeService.getStoreById(storeId);

    if (!store || !store.isActive) {
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

    // TODO: 조회수 증가 로직 (Analytics 모델 구현 후)
    // await analyticsService.incrementViews(storeId);

    res.json(
      formatResponse(
        true,
        "매장 정보를 성공적으로 가져왔습니다.",
        store,
        HTTP_STATUS.OK,
        {
          system: "live",
          viewIncremented: false, // Analytics 구현 후 true로 변경
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] Store detail requested - StoreId: ${storeId}`);
  } catch (error) {
    console.error("Live store get error:", error);
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
 * POST /api/live/stores
 * 새 매장 등록
 */
export const createLiveStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const storeData = req.body;

    // 실제 DB에 매장 저장
    const newStore = await storeService.createStore({
      ...storeData,
      isActive: true // Live 시스템에서는 바로 활성화
    });

    res.status(HTTP_STATUS.CREATED).json(
      formatResponse(
        true,
        "매장이 성공적으로 등록되었습니다.",
        { 
          storeId: newStore._id,
          status: newStore.isActive ? 'active' : 'inactive'
        },
        HTTP_STATUS.CREATED,
        {
          system: "live",
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] New store registered - StoreId: ${newStore._id}`);
  } catch (error) {
    console.error("Live store create error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 등록에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * PUT /api/live/stores/:storeId
 * 매장 정보 수정
 */
export const updateLiveStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const updateData = req.body;

    // 실제 DB에서 매장 업데이트
    const updatedStore = await storeService.updateStore(storeId, {
      ...updateData,
      updatedAt: new Date()
    });

    if (!updatedStore) {
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
        "매장 정보가 성공적으로 수정되었습니다.",
        { storeId },
        HTTP_STATUS.OK,
        {
          system: "live",
          updatedFields: Object.keys(updateData),
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] Store updated - StoreId: ${storeId}, Fields: ${Object.keys(updateData).join(', ')}`);
  } catch (error) {
    console.error("Live store update error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 정보 수정에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};