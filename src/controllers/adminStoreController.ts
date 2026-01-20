import { Request, Response } from "express";
import * as storeService from "../services/storeService";
import { formatResponse } from "../utils/responseFormatter";
import { AuthenticatedRequest, CreateStoreRequest } from "../types";
import { HTTP_STATUS } from "../utils/constants";

// 관리자용 매장 목록 조회 (모든 상태 포함)
export const getAdminStores = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category, area, active, page = 1, limit = 20 } = req.query;
    
    const stores = await storeService.getAdminStores({
      category: category as string,
      area: area as string,
      active: active as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    res.json(formatResponse(true, "관리자 매장 목록 조회 성공", stores));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 관리자용 매장 생성
export const createAdminStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    // 클라이언트에서 보낸 coordinates 배열을 GeoJSON 형식으로 변환
    const storeData = {
      ...req.body,
      createdBy: req.admin.adminId
    };

    // location.coordinates가 배열 형태로 온 경우 GeoJSON 형식으로 변환
    if (storeData.location && Array.isArray(storeData.location.coordinates)) {
      storeData.location.coordinates = {
        type: "Point",
        coordinates: storeData.location.coordinates
      };
    }

    // contact 필드 정리 (전화번호에서 불필요한 텍스트 제거)
    if (storeData.contact && storeData.contact.phone) {
      storeData.contact.phone = storeData.contact.phone.replace(/[^0-9-]/g, '');
    }

    // businessHours가 빈 객체인 경우 undefined로 설정
    if (storeData.businessHours && Object.keys(storeData.businessHours).length === 0) {
      delete storeData.businessHours;
    }

    const store = await storeService.createStore(storeData);
    res.status(HTTP_STATUS.CREATED).json(formatResponse(true, "매장이 성공적으로 등록되었습니다", store));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    console.error("매장 생성 오류:", error);
    res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, errorMessage, null, HTTP_STATUS.BAD_REQUEST));
  }
};

// 관리자용 매장 수정
export const updateAdminStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.admin.adminId,
      updatedAt: new Date()
    };

    const store = await storeService.updateStore(id, updateData);

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "매장 정보가 성공적으로 수정되었습니다", store));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, errorMessage, null, HTTP_STATUS.BAD_REQUEST));
  }
};

// 관리자용 매장 삭제
export const deleteAdminStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const { id } = req.params;
    const result = await storeService.deleteStore(id);

    if (!result) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "매장이 비활성화되었습니다"));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 관리자용 매장 상태 변경 (활성화/비활성화)
export const toggleStoreStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const { id } = req.params;
    const { active } = req.body;

    const store = await storeService.updateStore(id, { 
      active,
      updatedBy: req.admin.adminId,
      updatedAt: new Date()
    });

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    const statusText = active ? "활성화" : "비활성화";
    res.json(formatResponse(true, `매장이 ${statusText}되었습니다`, store));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 관리자용 매장 통계
export const getStoreStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stats = await storeService.getStoreStats();
    res.json(formatResponse(true, "매장 통계 조회 성공", stats));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};