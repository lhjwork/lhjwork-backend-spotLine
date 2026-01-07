import Recommendation from "../models/Recommendation";
import Store from "../models/Store";
import { IRecommendation, CreateRecommendationRequest } from "../types";

interface RecommendationFilters {
  category?: string;
  limit?: number;
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
          representativeImage: toStore.representativeImage || toStore.images?.[0],
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
