import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";
import * as s3Service from "../services/s3Service";
import Store from "../models/Store";

/**
 * 메인 배너 이미지 업로드 (최대 5개)
 */
export const uploadMainBannerImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log("=== MAIN BANNER IMAGE UPLOAD STARTED ===");
  
  try {
    if (!req.admin) {
      console.log("[ERROR] No admin authentication");
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED)
      );
      return;
    }

    const { storeId } = req.params;
    const file = req.file;

    console.log("[DEBUG] Main banner upload params:", { storeId, hasFile: !!file, fileName: file?.originalname });

    if (!file) {
      console.log("[ERROR] No file provided");
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, "업로드할 이미지 파일이 없습니다.", null, HTTP_STATUS.BAD_REQUEST)
      );
      return;
    }

    // 상점 존재 확인
    console.log("[DEBUG] Finding store with ID:", storeId);
    const store = await Store.findById(storeId);
    if (!store) {
      console.log("[ERROR] Store not found:", storeId);
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(false, "상점을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND)
      );
      return;
    }

    console.log("[DEBUG] Store found:", store.name);

    // 현재 메인 배너 이미지 수가 5개를 초과하는지 확인
    const currentImageCount = store.mainBannerImages ? store.mainBannerImages.length : 0;
    console.log("[DEBUG] Current main banner image count:", currentImageCount);
    
    if (currentImageCount >= 5) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, "메인 배너 이미지는 최대 5개까지만 업로드 가능합니다.", null, HTTP_STATUS.BAD_REQUEST)
      );
      return;
    }

    // 새 이미지 업로드
    console.log("[DEBUG] Uploading new main banner image to S3...");
    const uploadResult = await s3Service.uploadImage(file, storeId, "main-banner");
    console.log("[DEBUG] S3 upload successful:", uploadResult);

    // 상점 정보 업데이트 - 기존 이미지들에 새 이미지 추가
    const existingImages = store.mainBannerImages || [];
    store.mainBannerImages = [...existingImages, uploadResult.imageKey];
    store.updatedAt = new Date();
    await store.save();
    console.log("[DEBUG] Store updated with new main banner image. Total images:", store.mainBannerImages.length);

    const responseData = {
      imageKey: uploadResult.imageKey,
      imageUrl: uploadResult.imageUrl,
      uploadedAt: uploadResult.uploadedAt,
      totalMainBannerImages: store.mainBannerImages.length
    };

    res.json(formatResponse(true, "메인 배너 이미지가 성공적으로 업로드되었습니다", responseData));
  } catch (error) {
    console.error("=== MAIN BANNER IMAGE UPLOAD ERROR ===");
    console.error("Error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    const errorMessage = error instanceof Error ? error.message : "이미지 업로드에 실패했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};

/**
 * 메인 배너 이미지 삭제
 */
export const deleteMainBannerImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // 이미지가 상점의 메인 배너에 있는지 확인
    if (!store.mainBannerImages || !store.mainBannerImages.includes(decodedImageKey)) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(false, "삭제할 이미지를 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND)
      );
      return;
    }

    // S3에서 이미지 삭제
    await s3Service.deleteImage(decodedImageKey);

    // 상점 정보에서 이미지 제거
    store.mainBannerImages = store.mainBannerImages.filter(img => img !== decodedImageKey);
    store.updatedAt = new Date();
    await store.save();

    res.json(formatResponse(true, "메인 배너 이미지가 성공적으로 삭제되었습니다"));
  } catch (error) {
    console.error("메인 배너 이미지 삭제 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "이미지 삭제에 실패했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
};