import { Request, Response } from "express";
import DemoStore from "../models/DemoStore";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";

// 데모용 매장 목록 조회
export const getDemoStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const demoStores = await DemoStore.find({
      isActive: true,
      isDemoOnly: true,
    }).select("name shortDescription representativeImage location.area qrCode.id");

    res.json(formatResponse(true, "데모 매장 목록 조회 성공", demoStores));
  } catch (error) {
    console.error("Demo stores fetch error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 데모용 랜덤 매장 선택 (업주 소개용)
export const getDemoExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    // 활성화된 데모 매장들 조회
    const demoStores = await DemoStore.find({
      isActive: true,
      isDemoOnly: true,
    });

    if (demoStores.length === 0) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "사용 가능한 데모 매장이 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    // 랜덤 선택
    const randomIndex = Math.floor(Math.random() * demoStores.length);
    const selectedStore = demoStores[randomIndex];

    const result = {
      qrId: selectedStore.qrCode.id,
      storeName: selectedStore.name,
      storeId: selectedStore._id.toString(),
      area: selectedStore.location.area || "Unknown",
      redirectUrl: `${req.protocol}://${req.get("host")}/api/demo/stores/${selectedStore.qrCode.id}`,
      isDemoMode: true,
    };

    res.json(formatResponse(true, "데모 체험 매장 선택 성공", result));
  } catch (error) {
    console.error("Demo experience error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 데모용 매장 상세 조회 (QR 코드 ID로)
export const getDemoStoreByQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;

    const store = await DemoStore.findOne({
      "qrCode.id": qrId,
      isActive: true,
      isDemoOnly: true,
    });

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "데모 매장을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    // SpotLine 정체성에 맞는 간소화된 응답
    const storeData = {
      id: store._id.toString(),
      name: store.name,
      shortDescription: store.shortDescription,
      representativeImage: store.representativeImage,
      location: {
        address: store.location.address,
        mapLink: `https://map.naver.com/v5/search/${encodeURIComponent(store.location.address)}`,
      },
      externalLinks: store.externalLinks,
      spotlineStory: store.spotlineStory || "",
      isDemoMode: true,
      demoNotice: "이것은 업주 소개용 데모 페이지입니다.",
    };

    res.json(formatResponse(true, "데모 매장 조회 성공", storeData));
  } catch (error) {
    console.error("Demo store fetch error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 데모용 다음 매장 추천 (간단한 랜덤 추천)
export const getDemoRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;

    // 현재 매장 제외하고 다른 데모 매장들 조회
    const otherStores = await DemoStore.find({
      "qrCode.id": { $ne: qrId },
      isActive: true,
      isDemoOnly: true,
    }).limit(4); // 최대 4개

    const recommendations = otherStores.map((store) => ({
      id: store._id.toString(),
      name: store.name,
      shortDescription: store.shortDescription,
      representativeImage: store.representativeImage,
      qrId: store.qrCode.id,
      area: store.location.area,
      mapLink: `https://map.naver.com/v5/search/${encodeURIComponent(store.location.address)}`,
    }));

    res.json(formatResponse(true, "데모 추천 매장 조회 성공", recommendations));
  } catch (error) {
    console.error("Demo recommendations error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};
