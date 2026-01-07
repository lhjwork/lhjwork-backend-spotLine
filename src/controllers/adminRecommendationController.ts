import { Request, Response } from "express";
import * as recommendationService from "../services/recommendationService";
import { formatResponse } from "../utils/responseFormatter";
import { AuthenticatedRequest, CreateRecommendationRequest } from "../types";
import { HTTP_STATUS } from "../utils/constants";

// 관리자용 추천 목록 조회
export const getAdminRecommendations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fromStore, toStore, category, active, page = 1, limit = 20 } = req.query;
    
    const recommendations = await recommendationService.getAdminRecommendations({
      fromStore: fromStore as string,
      toStore: toStore as string,
      category: category as string,
      active: active as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    res.json(formatResponse(true, "관리자 추천 목록 조회 성공", recommendations));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 관리자용 추천 생성
export const createAdminRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const recommendationData = {
      ...req.body,
      createdBy: req.admin.adminId
    };

    const recommendation = await recommendationService.createRecommendation(recommendationData);
    res.status(HTTP_STATUS.CREATED).json(formatResponse(true, "추천이 성공적으로 생성되었습니다", recommendation));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, errorMessage, null, HTTP_STATUS.BAD_REQUEST));
  }
};

// 관리자용 추천 수정
export const updateAdminRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const recommendation = await recommendationService.updateRecommendation(id, updateData);

    if (!recommendation) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "추천을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "추천이 성공적으로 수정되었습니다", recommendation));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, errorMessage, null, HTTP_STATUS.BAD_REQUEST));
  }
};

// 관리자용 추천 삭제
export const deleteAdminRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const { id } = req.params;
    const result = await recommendationService.deleteRecommendation(id);

    if (!result) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "추천을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "추천이 비활성화되었습니다"));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 관리자용 추천 상태 변경
export const toggleRecommendationStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const { id } = req.params;
    const { active } = req.body;

    const recommendation = await recommendationService.updateRecommendation(id, { 
      isActive: active,
      updatedBy: req.admin.adminId,
      updatedAt: new Date()
    });

    if (!recommendation) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "추천을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    const statusText = active ? "활성화" : "비활성화";
    res.json(formatResponse(true, `추천이 ${statusText}되었습니다`, recommendation));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 관리자용 추천 통계
export const getRecommendationStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stats = await recommendationService.getRecommendationStats();
    res.json(formatResponse(true, "추천 통계 조회 성공", stats));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 매장별 추천 관리
export const getStoreRecommendations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const recommendations = await recommendationService.getRecommendationsByStore(storeId);
    res.json(formatResponse(true, "매장별 추천 조회 성공", recommendations));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};