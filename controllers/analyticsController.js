const analyticsService = require('../services/analyticsService');

class AnalyticsController {
  // 이벤트 로깅
  async logEvent(req, res) {
    try {
      const eventData = {
        ...req.body,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        referrer: req.headers.referer
      };
      
      const result = await analyticsService.logEvent(eventData);
      
      if (!result) {
        return res.status(404).json({ error: '매장을 찾을 수 없습니다' });
      }
      
      res.status(201).json({ 
        message: '이벤트가 기록되었습니다', 
        id: result.id 
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // QR 코드별 통계 조회
  async getQRStats(req, res) {
    try {
      const { qrId } = req.params;
      const { startDate, endDate, eventType } = req.query;
      
      const stats = await analyticsService.getQRStats(qrId, {
        startDate,
        endDate,
        eventType
      });
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 매장별 통계 조회
  async getStoreStats(req, res) {
    try {
      const { storeId } = req.params;
      const { startDate, endDate } = req.query;
      
      const stats = await analyticsService.getStoreStats(storeId, {
        startDate,
        endDate
      });
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 추천 클릭률 분석
  async getRecommendationPerformance(req, res) {
    try {
      const { qrCode, startDate, endDate } = req.query;
      
      const performance = await analyticsService.getRecommendationPerformance({
        qrCode,
        startDate,
        endDate
      });
      
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 일별 트래픽 통계
  async getDailyTraffic(req, res) {
    try {
      const { startDate, endDate, qrCode } = req.query;
      
      const dailyStats = await analyticsService.getDailyTraffic({
        startDate,
        endDate,
        qrCode
      });
      
      res.json(dailyStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AnalyticsController();