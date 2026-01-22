import Recommendation from "../models/Recommendation";
import Store from "../models/Store";
import { IRecommendation, CreateRecommendationRequest } from "../types";

interface RecommendationFilters {
  category?: string;
  limit?: number;
}

interface LocationBasedFilters {
  category?: string;
  limit?: number;
  radius?: number; // 반경 (미터)
  excludeCurrentStore?: boolean;
}

// QR 코드 기반 추천 조회
export const getRecommendationsByQR = async (qrId: string, filters: RecommendationFilters = {}): Promise<IRecommendation[] | null> => {
  // QR 코드로 매장 찾기
  const store = await Store.findOne({
    "qrCode.id": qrId,
    "qrCode.isActive": true,
    isActive: true,
  });

  if (!store) {
    return null;
  }

  return getRecommendationsByStore(store._id.toString(), filters);
};

// 매장별 추천 조회
export const getRecommendationsByStore = async (storeId: string, filters: RecommendationFilters = {}): Promise<IRecommendation[]> => {
  const { category, limit = 10 } = filters;
  const filter: any = { fromStore: storeId, isActive: true };

  if (category) {
    filter.category = category;
  }

  return await Recommendation.find(filter).populate("toStore").sort({ priority: -1 }).limit(limit);
};

// 🆕 관리자용 - 매장 근처 선택 가능한 매장 목록 조회
export const getNearbyStoresForSelection = async (
  storeId: string,
  filters: LocationBasedFilters = {},
): Promise<{
  currentStore: any;
  nearbyStores: any[];
  sameAreaStores: any[];
  existingRecommendations: IRecommendation[];
}> => {
  const { category, limit = 50, radius = 10000, excludeCurrentStore = true } = filters; // 기본 10km

  // 현재 매장 정보 조회
  const currentStore = await Store.findById(storeId);
  if (!currentStore) {
    throw new Error("매장을 찾을 수 없습니다");
  }

  const [longitude, latitude] = currentStore.location.coordinates.coordinates;
  const currentArea = currentStore.location.area;

  // 1. 거리 기반 근처 매장들 조회 (10km 반경)
  const nearbyQuery: any = {
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: radius,
      },
    },
    isActive: true,
  };

  if (excludeCurrentStore) {
    nearbyQuery._id = { $ne: storeId };
  }

  if (category) {
    nearbyQuery.category = category;
  }

  // 2. 같은 지역(area) 매장들 조회
  const sameAreaQuery: any = {
    "location.area": currentArea,
    isActive: true,
  };

  if (excludeCurrentStore) {
    sameAreaQuery._id = { $ne: storeId };
  }

  if (category) {
    sameAreaQuery.category = category;
  }

  // 병렬로 두 쿼리 실행
  const [nearbyStores, sameAreaStores] = await Promise.all([
    Store.find(nearbyQuery).limit(limit).select("name category location shortDescription mainBannerImages externalLinks").lean(),
    currentArea ? Store.find(sameAreaQuery).limit(limit).select("name category location shortDescription mainBannerImages externalLinks").lean() : [],
  ]);

  // 기존 추천 관계 조회 (이미 연결된 매장들 표시용)
  const existingRecommendations = await Recommendation.find({
    fromStore: storeId,
    isActive: true,
  }).populate("toStore", "name category");

  // 기존 추천에 연결된 매장 ID들
  const existingToStoreIds = existingRecommendations.map((rec) => rec.toStore._id.toString());

  // 거리 기반 매장들에 정보 추가
  const nearbyStoresWithInfo = nearbyStores
    .map((store) => {
      const distance = calculateDistance(latitude, longitude, store.location.coordinates.coordinates[1], store.location.coordinates.coordinates[0]);

      return {
        id: store._id,
        name: store.name,
        category: store.category,
        shortDescription: store.shortDescription,
        address: store.location.address,
        area: store.location.area,
        representativeImage: store.mainBannerImages?.[0] || null,
        externalLinks: store.externalLinks,
        distance: Math.round(distance),
        walkingTime: Math.round(distance / 80), // 평균 도보 속도 80m/분
        isAlreadyConnected: existingToStoreIds.includes(store._id.toString()),
        suggestedCategories: getSuggestedCategories(currentStore.category, store.category),
        matchType: "distance", // 거리 기반 매칭
      };
    })
    .sort((a, b) => a.distance - b.distance); // 거리순 정렬

  // 같은 지역 매장들에 정보 추가
  const sameAreaStoresWithInfo = sameAreaStores
    .map((store) => {
      const distance = calculateDistance(latitude, longitude, store.location.coordinates.coordinates[1], store.location.coordinates.coordinates[0]);

      return {
        id: store._id,
        name: store.name,
        category: store.category,
        shortDescription: store.shortDescription,
        address: store.location.address,
        area: store.location.area,
        representativeImage: store.mainBannerImages?.[0] || null,
        externalLinks: store.externalLinks,
        distance: Math.round(distance),
        walkingTime: Math.round(distance / 80),
        isAlreadyConnected: existingToStoreIds.includes(store._id.toString()),
        suggestedCategories: getSuggestedCategories(currentStore.category, store.category),
        matchType: "area", // 지역 기반 매칭
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // 이름순 정렬

  // 중복 제거 (거리 기반과 지역 기반에서 겹치는 매장들)
  const nearbyStoreIds = new Set(nearbyStoresWithInfo.map((store) => store.id.toString()));
  const uniqueSameAreaStores = sameAreaStoresWithInfo.filter((store) => !nearbyStoreIds.has(store.id.toString()));

  return {
    currentStore: {
      id: currentStore._id,
      name: currentStore.name,
      category: currentStore.category,
      address: currentStore.location.address,
      area: currentStore.location.area,
      shortDescription: currentStore.shortDescription,
    },
    nearbyStores: nearbyStoresWithInfo,
    sameAreaStores: uniqueSameAreaStores,
    existingRecommendations,
  };
};

// 🆕 관리자가 선택한 매장들과 추천 관계 생성
export const createSelectedRecommendations = async (
  storeId: string,
  selectedStores: Array<{
    toStoreId: string;
    category: string;
    priority?: number;
    description?: string;
  }>,
): Promise<IRecommendation[]> => {
  const recommendations = [];

  for (const selection of selectedStores) {
    // 이미 존재하는 추천인지 확인
    const existingRecommendation = await Recommendation.findOne({
      fromStore: storeId,
      toStore: selection.toStoreId,
      isActive: true,
    });

    if (existingRecommendation) {
      // 이미 존재하면 업데이트
      existingRecommendation.category = selection.category as any;
      existingRecommendation.priority = selection.priority || 5;
      existingRecommendation.description = selection.description || "";
      await existingRecommendation.save();
      recommendations.push(existingRecommendation);
    } else {
      // 새로 생성
      const recommendationData: CreateRecommendationRequest = {
        fromStore: storeId,
        toStore: selection.toStoreId,
        category: selection.category as IRecommendation["category"],
        priority: selection.priority || 5,
        description: selection.description || "",
        isActive: true,
      };

      const recommendation = await createRecommendation(recommendationData);
      recommendations.push(recommendation);
    }
  }

  return recommendations;
};

// 새 추천 관계 생성
export const createRecommendation = async (recommendationData: CreateRecommendationRequest): Promise<IRecommendation> => {
  const recommendation = new Recommendation(recommendationData);
  return await recommendation.save();
};

// 추천 관계 수정
export const updateRecommendation = async (id: string, updateData: Partial<CreateRecommendationRequest>): Promise<IRecommendation | null> => {
  return await Recommendation.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

// 추천 관계 삭제
export const deleteRecommendation = async (id: string): Promise<IRecommendation | null> => {
  return await Recommendation.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

// 카테고리별 추천 통계
export const getCategoryStats = async (): Promise<any[]> => {
  return await Recommendation.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
};

// SpotLine 정체성에 맞는 다음 Spot 조회 (2-4개 제한)
export const getNextSpots = async (fromStoreId: string, limit: number = 4): Promise<any[]> => {
  try {
    const recommendations = await Recommendation.find({
      fromStore: fromStoreId,
      isActive: true,
    })
      .populate({
        path: "toStore",
        select: "name shortDescription representativeImage location.address location.coordinates images description",
        match: { isActive: true },
      })
      .sort({ priority: -1 })
      .limit(Math.min(limit, 4)); // 최대 4개로 제한

    const nextSpots = recommendations
      .filter((rec) => rec.toStore) // populate된 데이터가 있는 것만
      .map((rec) => {
        const toStore = rec.toStore as any; // 타입 단언으로 해결
        return {
          id: toStore._id,
          name: toStore.name,
          shortDescription: toStore.shortDescription || toStore.description?.substring(0, 100) || rec.description,
          representativeImage: toStore.mainBannerImages?.[0] || null,
          mapLink: `https://maps.google.com/?q=${toStore.location.coordinates.coordinates[1]},${toStore.location.coordinates.coordinates[0]}`,
          category: rec.category,
          walkingTime: rec.walkingTime,
          distance: rec.distance,
        };
      });

    return nextSpots;
  } catch (error) {
    console.error("다음 Spot 조회 오류:", error);
    throw new Error("다음 Spot 조회 중 오류가 발생했습니다");
  }
};

// 거리 계산 함수 (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 관리자가 참고할 수 있는 추천 카테고리들 제안 (복수형)
function getSuggestedCategories(fromCategory: string, toCategory: string): string[] {
  const categoryMapping: { [key: string]: { [key: string]: string[] } } = {
    cafe: {
      restaurant: ["next_meal"],
      retail: ["shopping"],
      culture: ["culture", "activity"],
      exhibition: ["culture", "activity"],
    },
    restaurant: {
      cafe: ["dessert", "rest"],
      culture: ["culture", "activity"],
      retail: ["shopping"],
      exhibition: ["activity", "culture"],
    },
    retail: {
      cafe: ["rest", "dessert"],
      restaurant: ["next_meal"],
      culture: ["culture"],
    },
    culture: {
      cafe: ["rest", "dessert"],
      restaurant: ["next_meal"],
      retail: ["shopping"],
    },
    exhibition: {
      cafe: ["rest", "dessert"],
      restaurant: ["next_meal"],
      retail: ["shopping"],
    },
  };

  return categoryMapping[fromCategory]?.[toCategory] || ["activity"];
}

// 관리자용 추천 목록 조회 (페이지네이션 포함)
interface AdminRecommendationFilters {
  fromStore?: string;
  toStore?: string;
  category?: string;
  active?: string;
  page?: number;
  limit?: number;
}

export const getAdminRecommendations = async (
  filters: AdminRecommendationFilters = {},
): Promise<{
  recommendations: IRecommendation[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> => {
  const { fromStore, toStore, category, active, page = 1, limit = 20 } = filters;
  const filter: any = {};

  if (fromStore) filter.fromStore = fromStore;
  if (toStore) filter.toStore = toStore;
  if (category) filter.category = category;
  if (active !== undefined) filter.isActive = active === "true";

  const skip = (page - 1) * limit;

  const [recommendations, totalCount] = await Promise.all([
    Recommendation.find(filter).populate("fromStore", "name").populate("toStore", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Recommendation.countDocuments(filter),
  ]);

  return {
    recommendations,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
};

// 추천 통계 조회
export const getRecommendationStats = async (): Promise<{
  totalRecommendations: number;
  activeRecommendations: number;
  inactiveRecommendations: number;
  categoryStats: any[];
  topStores: any[];
}> => {
  const [totalRecommendations, activeRecommendations, categoryStats, topStores] = await Promise.all([
    Recommendation.countDocuments(),
    Recommendation.countDocuments({ isActive: true }),
    getCategoryStats(),
    Recommendation.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$fromStore", count: { $sum: 1 } } },
      { $lookup: { from: "stores", localField: "_id", foreignField: "_id", as: "store" } },
      { $unwind: "$store" },
      { $project: { storeName: "$store.name", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return {
    totalRecommendations,
    activeRecommendations,
    inactiveRecommendations: totalRecommendations - activeRecommendations,
    categoryStats,
    topStores,
  };
};
