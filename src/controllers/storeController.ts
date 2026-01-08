import { Request, Response } from "express";
import * as storeService from "../services/storeService";
import { formatResponse } from "../utils/responseFormatter";
import { StoreQueryParams, CreateStoreRequest } from "../types";
import { HTTP_STATUS } from "../utils/constants";

// 모든 매장 조회
export const getAllStores = async (req: Request<{}, {}, {}, StoreQueryParams>, res: Response): Promise<void> => {
  try {
    const { category, area, active } = req.query;
    const stores = await storeService.getAllStores({ category, area, active });
    res.json(formatResponse(true, "매장 목록 조회 성공", stores));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// QR 코드로 매장 조회
export const getStoreByQR = async (req: Request<{ qrId: string }>, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;
    const store = await storeService.getStoreByQR(qrId);

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "매장 조회 성공", store));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 특정 매장 조회
export const getStoreById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const store = await storeService.getStoreById(id);

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "매장 조회 성공", store));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 새 매장 등록
export const createStore = async (req: Request<{}, {}, CreateStoreRequest>, res: Response): Promise<void> => {
  try {
    const store = await storeService.createStore(req.body);
    res.status(HTTP_STATUS.CREATED).json(formatResponse(true, "매장이 성공적으로 등록되었습니다", store));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, errorMessage, null, HTTP_STATUS.BAD_REQUEST));
  }
};

// 매장 정보 수정
export const updateStore = async (req: Request<{ id: string }, {}, Partial<CreateStoreRequest>>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const store = await storeService.updateStore(id, req.body);

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

// 매장 삭제 (비활성화)
export const deleteStore = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
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

// 근처 매장 검색
export const getNearbyStores = async (req: Request<{ lat: string; lng: string }, {}, {}, { radius?: string; category?: string }>, res: Response): Promise<void> => {
  try {
    const { lat, lng } = req.params;
    const { radius, category } = req.query;

    const stores = await storeService.getNearbyStores(parseFloat(lat), parseFloat(lng), parseInt(radius || "1000"), category);

    res.json(formatResponse(true, "근처 매장 검색 성공", stores));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// SpotLine 정체성에 맞는 매장 상세 조회 (매장 ID 기반) - 새로운 구조
export const getSpotlineStoreById = async (req: Request<{ storeId: string }, {}, {}, { qr?: string }>, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { qr } = req.query; // QR 코드 ID (선택적)

    const store = await storeService.getStoreById(storeId);

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    // 추천 매장 조회
    const nextSpots = await storeService.getRecommendationsForStore(store._id.toString());

    // SpotLine 정체성에 맞는 응답 형태
    const spotlineResponse = {
      id: store._id,
      name: store.name,
      shortDescription: store.shortDescription || store.description?.substring(0, 100),
      representativeImage: store.representativeImage || store.images?.[0],
      location: {
        address: store.location.address,
        coordinates: store.location.coordinates,
        mapLink: `https://maps.google.com/?q=${store.location.coordinates.coordinates[1]},${store.location.coordinates.coordinates[0]}`,
      },
      externalLinks: store.externalLinks || {
        instagram: store.contact?.instagram,
        website: store.contact?.website,
      },
      spotlineStory: store.spotlineStory,
      nextSpots: nextSpots,
      // QR 코드 정보 (선택적으로 포함)
      qrCode: qr ? { id: qr, isActive: true } : store.qrCode,
    };

    res.json(formatResponse(true, "SpotLine 매장 조회 성공", spotlineResponse));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// SpotLine 정체성에 맞는 매장 상세 조회 (QR 스캔용) - 호환성 유지
export const getSpotlineStoreByQR = async (req: Request<{ qrId: string }>, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;
    const store = await storeService.getSpotlineStoreByQR(qrId);

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    // 추천 매장 조회
    const nextSpots = await storeService.getRecommendationsForStore(store._id.toString());

    // SpotLine 정체성에 맞는 응답 형태
    const spotlineResponse = {
      id: store._id,
      name: store.name,
      shortDescription: store.shortDescription || store.description?.substring(0, 100),
      representativeImage: store.representativeImage || store.images?.[0],
      location: {
        address: store.location.address,
        coordinates: store.location.coordinates,
        mapLink: `https://maps.google.com/?q=${store.location.coordinates.coordinates[1]},${store.location.coordinates.coordinates[0]}`,
      },
      externalLinks: store.externalLinks || {
        instagram: store.contact?.instagram,
        website: store.contact?.website,
      },
      spotlineStory: store.spotlineStory,
      nextSpots: nextSpots,
      qrCode: store.qrCode,
    };

    res.json(formatResponse(true, "SpotLine 매장 조회 성공", spotlineResponse));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};
