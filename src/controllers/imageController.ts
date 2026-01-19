import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";
import * as s3Service from "../services/s3Service";
import Store from "../models/Store";

/**
 * 대표 이미지 업로드
 */
export const uploadRepresentativeImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED)
      );
      return;
    }

    const { storeId } = req.params;
    const file = req.file;

    if (!file) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, "업로드할 이미지 파일이 없습니다.", null, HTTP_STATUS.BAD_REQUEST)
      );
      return;
    }

    // 상점 존재 확인
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(false, "상점을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND)
      );
      return;
    }

    // 기존 대표 이미지 삭제
    if (store.representativeImage) {
      try {
        await s3Service.deleteImage(store.representativeImage);
      } catch (error) {
        console.warn("기존 이미지 삭제 실패:", error);
      }
    }

    // 새 이미지 업로드
    const uploadResult = await s3Service.uploadImage(file, storeId, "representative");

    // 상점 정보 업데이트
    store.representativeImage = uploadResult.imageKey;
    store.updatedAt = new Date();
    await store.save();

    res.json(formatResponse(true, "대표 이미지가 성공적으로 업로드되었습니다", uploadResult));
  } catch (error) {
    console.error("대표 이미지 업로드 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "이미지 업로드에 실패했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

/**
 * 추가 이미지 업로드 (다중)
 */
export const uploadGalleryImages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED)
      );
      return;
    }

    const { storeId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, "업로드할 이미지 파일이 없습니다.", null, HTTP_STATUS.BAD_REQUEST)
      );
      return;
    }

    // 상점 존재 확인
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(false, "상점을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND)
      );
      return;
    }

    // 현재 이미지 수 + 새 이미지 수가 5개를 초과하는지 확인
    const currentImageCount = store.images ? store.images.length : 0;
    if (currentImageCount + files.length > 5) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, "갤러리 이미지는 최대 5개까지만 업로드 가능합니다.", null, HTTP_STATUS.BAD_REQUEST)
      );
      return;
    }

    // 모든 파일 업로드
    const uploadPromises = files.map(file => s3Service.uploadImage(file, storeId, "gallery"));
    const uploadResults = await Promise.all(uploadPromises);

    // 상점 정보 업데이트
    const newImageKeys = uploadResults.map(result => result.imageKey);
    store.images = [...(store.images || []), ...newImageKeys];
    store.updatedAt = new Date();
    await store.save();

    const responseData = {
      uploadedImages: uploadResults.map(result => ({
        imageKey: result.imageKey,
        imageUrl: result.imageUrl,
      })),
      uploadedAt: new Date(),
    };

    res.json(formatResponse(true, "이미지가 성공적으로 업로드되었습니다", responseData));
  } catch (error) {
    console.error("갤러리 이미지 업로드 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "이미지 업로드에 실패했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

/**
 * 대표 이미지 삭제
 */
export const deleteRepresentativeImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED)
      );
      return;
    }

    const { storeId } = req.params;

    // 상점 존재 확인
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(false, "상점을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND)
      );
      return;
    }

    if (!store.representativeImage) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(false, "삭제할 대표 이미지가 없습니다.", null, HTTP_STATUS.NOT_FOUND)
      );
      return;
    }

    // S3에서 이미지 삭제
    await s3Service.deleteImage(store.representativeImage);

    // 상점 정보 업데이트
    store.representativeImage = undefined;
    store.updatedAt = new Date();
    await store.save();

    res.json(formatResponse(true, "대표 이미지가 성공적으로 삭제되었습니다"));
  } catch (error) {
    console.error("대표 이미지 삭제 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "이미지 삭제에 실패했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

/**
 * 특정 갤러리 이미지 삭제
 */
export const deleteGalleryImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED)
      );
      return;
    }

    const { storeId, imageKey } = req.params;
    const decodedImageKey = decodeURIComponent(imageKey);

    // 상점 존재 확인
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(false, "상점을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND)
      );
      return;
    }

    // 이미지가 상점의 갤러리에 있는지 확인
    if (!store.images || !store.images.includes(decodedImageKey)) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(false, "삭제할 이미지를 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND)
      );
      return;
    }

    // S3에서 이미지 삭제
    await s3Service.deleteImage(decodedImageKey);

    // 상점 정보에서 이미지 제거
    store.images = store.images.filter(img => img !== decodedImageKey);
    store.updatedAt = new Date();
    await store.save();

    res.json(formatResponse(true, "이미지가 성공적으로 삭제되었습니다"));
  } catch (error) {
    console.error("갤러리 이미지 삭제 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "이미지 삭제에 실패했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};