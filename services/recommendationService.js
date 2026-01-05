const Recommendation = require('../models/Recommendation');
const storeService = require('./storeService');

class RecommendationService {
  // QR 코드 기반 추천 조회 (핵심 기능)
  async getRecommendationsByQR(qrId, options = {}) {
    const { category, limit = 10 } = options;
    
    // QR 코드로 현재 매장 찾기
    const currentStore = await storeService.getStoreByQR(qrId);
    if (!currentStore) {
      return null;
    }
    
    // 추천 필터 설정
    const filter = {
      fromStore: currentStore._id,
      isActive: true
    };
    
    if (category) {
      filter.category = category;
    }
    
    // 추천 매장 조회 (우선순위 순)
    const recommendations = await Recommendation.find(filter)
      .populate('toStore')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit);
    
    // 응답 데이터 구성
    return {
      currentStore: {
        id: currentStore._id,
        name: currentStore.name,
        category: currentStore.category,
        location: currentStore.location
      },
      recommendations: recommendations.map(rec => ({
        id: rec._id,
        store: rec.toStore,
        category: rec.category,
        priority: rec.priority,
        distance: rec.distance,
        walkingTime: rec.walkingTime,
        description: rec.description,
        tags: rec.tags
      }))
    };
  }

  // 매장별 추천 조회
  async getRecommendationsByStore(storeId, options = {}) {
    const { category, limit = 10 } = options;
    
    const filter = {
      fromStore: storeId,
      isActive: true
    };
    
    if (category) {
      filter.category = category;
    }
    
    return await Recommendation.find(filter)
      .populate('toStore')
      .sort({ priority: -1 })
      .limit(limit);
  }

  // 새 추천 관계 생성
  async createRecommendation(recommendationData) {
    // 매장 존재 여부 확인
    const fromStoreExists = await storeService.existsById(recommendationData.fromStore);
    const toStoreExists = await storeService.existsById(recommendationData.toStore);
    
    if (!fromStoreExists || !toStoreExists) {
      throw new Error('존재하지 않는 매장입니다');
    }
    
    const recommendation = new Recommendation(recommendationData);
    await recommendation.save();
    
    return await Recommendation.findById(recommendation._id)
      .populate('fromStore toStore');
  }

  // 추천 관계 수정
  async updateRecommendation(id, updateData) {
    return await Recommendation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('fromStore toStore');
  }

  // 추천 관계 삭제 (비활성화)
  async deleteRecommendation(id) {
    return await Recommendation.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  // 카테고리별 추천 통계
  async getCategoryStats() {
    return await Recommendation.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }

  // 매장의 인기 추천 목적지 조회
  async getPopularDestinations(storeId, limit = 5) {
    return await Recommendation.find({
      fromStore: storeId,
      isActive: true
    })
    .populate('toStore')
    .sort({ priority: -1 })
    .limit(limit);
  }

  // 특정 매장을 추천하는 출발지 조회
  async getRecommendingSources(storeId, limit = 5) {
    return await Recommendation.find({
      toStore: storeId,
      isActive: true
    })
    .populate('fromStore')
    .sort({ priority: -1 })
    .limit(limit);
  }
}

module.exports = new RecommendationService();