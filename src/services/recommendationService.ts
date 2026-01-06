import Recommendation from "@/models/Recommendation";
import Store from "@/models/Store";
import { IRecommendation, CreateRecommendationRequest } from "@/types";

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
