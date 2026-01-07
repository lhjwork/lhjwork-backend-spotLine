import Store from "../models/Store";
import { IStore, CreateStoreRequest } from "../types";

// UUID 임포트 (any 타입으로 처리)
const { v4: uuidv4 } = require("uuid");

interface StoreFilters {
  category?: string;
  area?: string;
  active?: string;
}

interface CategoryStats {
  _id: string;
  count: number;
}

// 모든 매장 조회
export const getAllStores = async (filters: StoreFilters = {}): Promise<IStore[]> => {
  const { category, area, active } = filters;
  const filter: any = {};

  if (category) filter.category = category;
  if (area) filter["location.area"] = area;
  if (active !== undefined) filter.isActive = active === "true";

  return await Store.find(filter).sort({ createdAt: -1 });
};

// QR 코드로 매장 조회
export const getStoreByQR = async (qrId: string): Promise<IStore | null> => {
  return await Store.findOne({
    "qrCode.id": qrId,
    "qrCode.isActive": true,
    isActive: true,
  });
};

// ID로 매장 조회
export const getStoreById = async (id: string): Promise<IStore | null> => {
  return await Store.findById(id);
};

// 새 매장 생성
export const createStore = async (storeData: CreateStoreRequest): Promise<IStore> => {
  const store = new Store({
    ...storeData,
    qrCode: {
      id: storeData.qrCode?.id || uuidv4(),
      isActive: true,
    },
  });

  return await store.save();
};

// 매장 정보 수정
export const updateStore = async (id: string, updateData: Partial<CreateStoreRequest>): Promise<IStore | null> => {
  return await Store.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

// 매장 삭제 (비활성화)
export const deleteStore = async (id: string): Promise<IStore | null> => {
  return await Store.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

// 근처 매장 검색
export const getNearbyStores = async (lat: number, lng: number, radius: number = 1000, category?: string): Promise<IStore[]> => {
  const filter: any = {
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: radius,
      },
    },
    isActive: true,
  };

  if (category) {
    filter.category = category;
  }

  return await Store.find(filter);
};

// 매장 존재 여부 확인
export const existsById = async (id: string): Promise<boolean> => {
  const count = await Store.countDocuments({ _id: id, isActive: true });
  return count > 0;
};

// 카테고리별 매장 수 통계
export const getCategoryStats = async (): Promise<CategoryStats[]> => {
  return await Store.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
};
// SpotLine 정체성에 맞는 매장 조회
export const getSpotlineStoreByQR = async (qrId: string): Promise<IStore | null> => {
  try {
    const store = await Store.findOne({
      "qrCode.id": qrId,
      "qrCode.isActive": true,
      isActive: true,
    }).select({
      name: 1,
      shortDescription: 1,
      spotlineStory: 1,
      representativeImage: 1,
      location: 1,
      externalLinks: 1,
      qrCode: 1,
      // 호환성을 위한 기존 필드들
      description: 1,
      images: 1,
      contact: 1,
    });

    return store;
  } catch (error) {
    console.error("SpotLine 매장 조회 오류:", error);
    throw new Error("매장 조회 중 오류가 발생했습니다");
  }
};
