import { Request, Response } from "express";
import * as recommendationService from "../services/recommendationService";
import { formatResponse } from "../utils/responseFormatter";
import { RecommendationQueryParams, CreateRecommendationRequest } from "../types";
import { HTTP_STATUS } from "../utils/constants";

// QR 코드 기반 추천 조회 (핵심 기능)
export const getRecommendationsByQR = async (req: Request<{ qrId: string }, {}, {}, RecommendationQueryParams>, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;
    const { category, limit } = req.query;

    const recommendations = await recommendationService.getRecommendationsByQR(qrId, { category, limit: parseInt(limit || "10") });

    if (!recommendations) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "QR 기반 추천 조회 성공", recommendations));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 매장별 추천 조회
export const getRecommendationsByStore = async (req: Request<{ storeId: string }, {}, {}, RecommendationQueryParams>, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { category, limit } = req.query;

    const recommendations = await recommendationService.getRecommendationsByStore(storeId, { category, limit: parseInt(limit || "10") });

    res.json(formatResponse(true, "매장별 추천 조회 성공", recommendations));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 새 추천 관계 생성
export const createRecommendation = async (req: Request<{}, {}, CreateRecommendationRequest>, res: Response): Promise<void> => {
  try {
    const recommendation = await recommendationService.createRecommendation(req.body);
    res.status(HTTP_STATUS.CREATED).json(formatResponse(true, "추천 관계가 성공적으로 생성되었습니다", recommendation));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, errorMessage, null, HTTP_STATUS.BAD_REQUEST));
  }
};

// 추천 관계 수정
export const updateRecommendation = async (req: Request<{ id: string }, {}, Partial<CreateRecommendationRequest>>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const recommendation = await recommendationService.updateRecommendation(id, req.body);

    if (!recommendation) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "추천을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "추천 관계가 성공적으로 수정되었습니다", recommendation));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, errorMessage, null, HTTP_STATUS.BAD_REQUEST));
  }
};

// 추천 관계 삭제
export const deleteRecommendation = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
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

// 카테고리별 추천 통계
export const getCategoryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await recommendationService.getCategoryStats();
    res.json(formatResponse(true, "카테고리별 통계 조회 성공", stats));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};
