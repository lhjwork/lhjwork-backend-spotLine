import { Request, Response } from "express";
import DemoStore from "../models/DemoStore";
import DemoRecommendation from "../models/DemoRecommendation";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";
import mongoose from "mongoose";

/**
 * GET /api/demo/experience
 * 랜덤 데모 매장 선택
 */
export const getDemoExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    // 활성화된 데모 매장 중 랜덤 선택
    const demoStores = await DemoStore.find({
      isActive: true,
      "qrCode.isActive": true,
    });

    if (demoStores.length === 0) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "사용 가능한 데모 매장이 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    // 랜덤 선택
    const randomIndex = Math.floor(Math.random() * demoStores.length);
    const selectedStore = demoStores[randomIndex];

    // 프론트엔드 URL 생성
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = `${frontendUrl}/spotline/${selectedStore._id}`;

    res.json(
      formatResponse(true, "데모 체험 매장 선택 성공", {
        qrId: selectedStore.qrCode.id,
        storeId: selectedStore._id.toString(),
        storeName: selectedStore.name,
        area: "데모 지역", // 데모용 고정값
        redirectUrl,
        isDemoMode: true,
      })
    );
  } catch (error) {
    console.error("데모 체험 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "데모 체험 중 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

/**
 * GET /api/demo/stores
 * 모든 데모 매장 목록 조회
 */
export const getDemoStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const demoStores = await DemoStore.find({
      isActive: true,
      "qrCode.isActive": true,
    }).sort({ createdAt: 1 });

    const formattedStores = demoStores.map((store) => ({
      id: store._id.toString(),
      name: store.name,
      shortDescription: store.shortDescription,
      representativeImage: store.representativeImage,
      location: store.location,
      externalLinks: store.externalLinks,
      spotlineStory: store.spotlineStory,
      qrCode: store.qrCode,
      isDemoMode: store.isDemoOnly,
      demoNotice: "이것은 업주 소개용 데모 페이지입니다.",
    }));

    res.json(formatResponse(true, "데모 매장 목록 조회 성공", formattedStores));
  } catch (error) {
    console.error("데모 매장 목록 조회 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "데모 매장 목록을 불러올 수 없습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

/**
 * GET /api/demo/stores/:qrId
 * 특정 데모 매장 상세 정보 조회
 */
export const getDemoStoreByQR = async (req: Request<{ qrId: string }>, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;

    // QR ID 형식 검증
    if (!qrId.startsWith("demo_")) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "유효하지 않은 데모 QR 코드입니다", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    const demoStore = await DemoStore.findOne({
      "qrCode.id": qrId,
      isActive: true,
      "qrCode.isActive": true,
    });

    if (!demoStore) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "데모 매장을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    const formattedStore = {
      id: demoStore._id.toString(),
      name: demoStore.name,
      shortDescription: demoStore.shortDescription,
      representativeImage: demoStore.representativeImage,
      location: demoStore.location,
      externalLinks: demoStore.externalLinks,
      spotlineStory: demoStore.spotlineStory,
      qrCode: demoStore.qrCode,
      isDemoMode: demoStore.isDemoOnly,
      demoNotice: "이것은 업주 소개용 데모 페이지입니다.",
    };

    res.json(formatResponse(true, "데모 매장 조회 성공", formattedStore));
  } catch (error) {
    console.error("데모 매장 조회 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "데모 매장 정보를 불러올 수 없습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

/**
 * GET /api/demo/next-spots/:storeId
 * 데모 매장의 다음 추천 Spot 조회
 */
export const getDemoNextSpots = async (req: Request<{ storeId: string }, {}, {}, { limit?: string }>, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const limit = parseInt(req.query.limit || "4");

    // 매장 ID 유효성 검증
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "유효하지 않은 매장 ID입니다", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    // 추천 매장 조회 (문자열과 ObjectId 둘 다 시도)
    let recommendations = await DemoRecommendation.find({
      fromStoreId: storeId,
      isActive: true,
    })
      .populate("toStoreId")
      .sort({ priority: -1, createdAt: 1 })
      .limit(limit);

    // 문자열로 조회가 안 되면 ObjectId로 시도
    if (recommendations.length === 0) {
      recommendations = await DemoRecommendation.find({
        fromStoreId: new mongoose.Types.ObjectId(storeId),
        isActive: true,
      })
        .populate("toStoreId")
        .sort({ priority: -1, createdAt: 1 })
        .limit(limit);
    }

    console.log(`Found ${recommendations.length} recommendations for store ${storeId}`);
    recommendations.forEach((rec: any, index) => {
      console.log(`${index + 1}. ${rec.fromStoreId} → ${rec.toStoreId?.name || "No name"} (populated: ${!!rec.toStoreId})`);
    });

    const nextSpots = recommendations
      .filter((rec: any) => {
        const hasToStore = rec.toStoreId && rec.toStoreId.isActive;
        console.log(`Filtering rec ${rec._id}: hasToStore=${hasToStore}, toStoreId=${!!rec.toStoreId}, isActive=${rec.toStoreId?.isActive}`);
        return hasToStore;
      })
      .map((rec: any) => ({
        id: rec.toStoreId._id.toString(),
        name: rec.toStoreId.name,
        shortDescription: rec.toStoreId.shortDescription,
        representativeImage: rec.toStoreId.representativeImage,
        mapLink: rec.toStoreId.location?.address || "",
        category: rec.category,
        walkingTime: rec.walkingTime,
        distance: rec.distance,
      }));

    res.json(formatResponse(true, "데모 다음 Spot 조회 성공", nextSpots));
  } catch (error) {
    console.error("데모 다음 Spot 조회 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "데모 다음 Spot을 불러올 수 없습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

/**
 * GET /api/demo/stores/id/:storeId
 * 매장 ID로 데모 매장 상세 정보 조회
 */
export const getDemoStoreById = async (req: Request<{ storeId: string }>, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    // 매장 ID 유효성 검증
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "유효하지 않은 매장 ID입니다", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    const demoStore = await DemoStore.findOne({
      _id: storeId,
      isActive: true,
      "qrCode.isActive": true,
    });

    if (!demoStore) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "데모 매장을 찾을 수 없습니다", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    // 다음 추천 Spot 조회 (문자열과 ObjectId 둘 다 시도)
    let recommendations = await DemoRecommendation.find({
      fromStoreId: storeId,
      isActive: true,
    })
      .populate("toStoreId")
      .sort({ priority: -1, createdAt: 1 })
      .limit(4);

    // 문자열로 조회가 안 되면 ObjectId로 시도
    if (recommendations.length === 0) {
      recommendations = await DemoRecommendation.find({
        fromStoreId: new mongoose.Types.ObjectId(storeId),
        isActive: true,
      })
        .populate("toStoreId")
        .sort({ priority: -1, createdAt: 1 })
        .limit(4);
    }

    const nextSpots = recommendations
      .filter((rec: any) => rec.toStoreId && rec.toStoreId.isActive)
      .map((rec: any) => ({
        id: rec.toStoreId._id.toString(),
        name: rec.toStoreId.name,
        shortDescription: rec.toStoreId.shortDescription,
        representativeImage: rec.toStoreId.representativeImage,
        mapLink: rec.toStoreId.location?.address || "",
        category: rec.category,
        walkingTime: rec.walkingTime,
        distance: rec.distance,
      }));

    const formattedStore = {
      id: demoStore._id.toString(),
      name: demoStore.name,
      shortDescription: demoStore.shortDescription,
      representativeImage: demoStore.representativeImage,
      location: {
        address: demoStore.location.address,
        coordinates: demoStore.location.coordinates,
        mapLink: `https://maps.google.com/?q=${encodeURIComponent(demoStore.location.address)}`,
      },
      externalLinks: demoStore.externalLinks,
      spotlineStory: demoStore.spotlineStory,
      nextSpots: nextSpots,
      qrCode: demoStore.qrCode,
      isDemoMode: demoStore.isDemoOnly,
      demoNotice: "이것은 업주 소개용 데모 페이지입니다.",
    };

    res.json(formatResponse(true, "데모 매장 조회 성공", formattedStore));
  } catch (error) {
    console.error("데모 매장 조회 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "데모 매장 정보를 불러올 수 없습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};
