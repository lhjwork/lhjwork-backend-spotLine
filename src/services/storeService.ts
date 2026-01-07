import Store from "../models/Store";
import Recommendation from "../models/Recommendation";
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

// 매장의 추천 목록 조회
export const getRecommendationsForStore = async (storeId: string): Promise<any[]> => {
  try {
    const recommendations = await Recommendation.find({
      fromStore: storeId,
      isActive: true,
    })
      .populate("toStore", "name shortDescription representativeImage qrCode location.area")
      .sort({ priority: -1 })
      .limit(6); // 최대 6개까지

    return recommendations.map((rec: any) => ({
      id: rec.toStore._id,
      name: rec.toStore.name,
      shortDescription: rec.toStore.shortDescription,
      image: rec.toStore.representativeImage,
      qrId: rec.toStore.qrCode.id,
      area: rec.toStore.location.area,
      category: rec.category,
      description: rec.description,
      walkingTime: rec.walkingTime,
      distance: rec.distance,
      tags: rec.tags,
    }));
  } catch (error) {
    console.error("추천 목록 조회 오류:", error);
    return [];
  }
};

// 관리자용 매장 목록 조회 (페이지네이션 포함)
interface AdminStoreFilters extends StoreFilters {
  page?: number;
  limit?: number;
}

export const getAdminStores = async (filters: AdminStoreFilters = {}): Promise<{
  stores: IStore[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> => {
  const { category, area, active, page = 1, limit = 20 } = filters;
  const filter: any = {};

  if (category) filter.category = category;
  if (area) filter["location.area"] = area;
  if (active !== undefined) filter.isActive = active === "true";

  const skip = (page - 1) * limit;
  
  const [stores, totalCount] = await Promise.all([
    Store.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Store.countDocuments(filter)
  ]);

  return {
    stores,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};

// 매장 통계 조회
export const getStoreStats = async (): Promise<{
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
  categoryStats: CategoryStats[];
  recentStores: IStore[];
}> => {
  const [totalStores, activeStores, categoryStats, recentStores] = await Promise.all([
    Store.countDocuments(),
    Store.countDocuments({ isActive: true }),
    getCategoryStats(),
    Store.find().sort({ createdAt: -1 }).limit(5)
  ]);

  return {
    totalStores,
    activeStores,
    inactiveStores: totalStores - activeStores,
    categoryStats,
    recentStores
  };
};
