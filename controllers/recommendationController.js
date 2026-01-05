const recommendationService = require('../services/recommendationService');

class RecommendationController {
  // QR 코드 기반 추천 조회 (핵심 기능)
  async getRecommendationsByQR(req, res) {
    try {
      const { qrId } = req.params;
      const { category, limit } = req.query;
      
      const recommendations = await recommendationService.getRecommendationsByQR(
        qrId, 
        { category, limit: parseInt(limit) || 10 }
      );
      
      if (!recommendations) {
        return res.status(404).json({ error: '매장을 찾을 수 없습니다' });
      }
      
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 매장별 추천 조회
  async getRecommendationsByStore(req, res) {
    try {
      const { storeId } = req.params;
      const { category, limit } = req.query;
      
      const recommendations = await recommendationService.getRecommendationsByStore(
        storeId,
        { category, limit: parseInt(limit) || 10 }
      );
      
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 새 추천 관계 생성
  async createRecommendation(req, res) {
    try {
      const recommendation = await recommendationService.createRecommendation(req.body);
      res.status(201).json(recommendation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 추천 관계 수정
  async updateRecommendation(req, res) {
    try {
      const { id } = req.params;
      const recommendation = await recommendationService.updateRecommendation(id, req.body);
      
      if (!recommendation) {
        return res.status(404).json({ error: '추천을 찾을 수 없습니다' });
      }
      
      res.json(recommendation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 추천 관계 삭제
  async deleteRecommendation(req, res) {
    try {
      const { id } = req.params;
      const result = await recommendationService.deleteRecommendation(id);
      
      if (!result) {
        return res.status(404).json({ error: '추천을 찾을 수 없습니다' });
      }
      
      res.json({ message: '추천이 비활성화되었습니다' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 카테고리별 추천 통계
  async getCategoryStats(req, res) {
    try {
      const stats = await recommendationService.getCategoryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new RecommendationController();