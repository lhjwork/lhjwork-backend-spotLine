const Analytics = require('../models/Analytics');
const storeService = require('./storeService');

class AnalyticsService {
  // 이벤트 로깅
  async logEvent(eventData) {
    const {
      qrCode,
      eventType,
      targetStore,
      sessionId,
      metadata,
      userAgent,
      ipAddress,
      referrer
    } = eventData;
    
    // QR 코드로 매장 찾기
    const store = await storeService.getStoreByQR(qrCode);
    if (!store) {
      return null;
    }
    
    const analytics = new Analytics({
      qrCode,
      store: store._id,
      eventType,
      targetStore,
      sessionId,
      userAgent,
      ipAddress,
      referrer,
      metadata
    });
    
    await analytics.save();
    return { id: analytics._id };
  }

  // QR 코드별 통계 조회
  async getQRStats(qrId, options = {}) {
    const { startDate, endDate, eventType } = options;
    
    const filter = { qrCode: qrId };
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    if (eventType) {
      filter.eventType = eventType;
    }
    
    return await Analytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          eventType: '$_id',
          count: 1,
          uniqueSessionCount: { $size: '$uniqueSessions' }
        }
      }
    ]);
  }

  // 매장별 통계 조회
  async getStoreStats(storeId, options = {}) {
    const { startDate, endDate } = options;
    
    const filter = { store: storeId };
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    return await Analytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            eventType: '$eventType',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.eventType',
          dailyStats: {
            $push: {
              date: '$_id.date',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      }
    ]);
  }

  // 추천 클릭률 분석
  async getRecommendationPerformance(options = {}) {
    const { qrCode, startDate, endDate } = options;
    
    const matchFilter = {
      eventType: { $in: ['page_view', 'recommendation_click'] }
    };
    
    if (qrCode) matchFilter.qrCode = qrCode;
    if (startDate || endDate) {
      matchFilter.timestamp = {};
      if (startDate) matchFilter.timestamp.$gte = new Date(startDate);
      if (endDate) matchFilter.timestamp.$lte = new Date(endDate);
    }
    
    return await Analytics.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            qrCode: '$qrCode',
            targetStore: '$targetStore',
            category: '$metadata.category'
          },
          views: {
            $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] }
          },
          clicks: {
            $sum: { $cond: [{ $eq: ['$eventType', 'recommendation_click'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          qrCode: '$_id.qrCode',
          targetStore: '$_id.targetStore',
          category: '$_id.category',
          views: 1,
          clicks: 1,
          clickRate: {
            $cond: [
              { $gt: ['$views', 0] },
              { $multiply: [{ $divide: ['$clicks', '$views'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { clickRate: -1 } }
    ]);
  }

  // 일별 트래픽 통계
  async getDailyTraffic(options = {}) {
    const { startDate, endDate, qrCode } = options;
    
    const filter = {};
    
    if (qrCode) filter.qrCode = qrCode;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    return await Analytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            eventType: '$eventType'
          },
          count: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          events: {
            $push: {
              eventType: '$_id.eventType',
              count: '$count',
              uniqueSessionCount: { $size: '$uniqueSessions' }
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  // 실시간 활동 조회
  async getRealtimeActivity(minutes = 30) {
    const timeThreshold = new Date(Date.now() - minutes * 60 * 1000);
    
    return await Analytics.aggregate([
      { $match: { timestamp: { $gte: timeThreshold } } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          recentEvents: { $push: { timestamp: '$timestamp', qrCode: '$qrCode' } }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  // 세션별 사용자 여정 분석
  async getUserJourney(sessionId) {
    return await Analytics.find({ sessionId })
      .populate('store targetStore')
      .sort({ timestamp: 1 });
  }
}

module.exports = new AnalyticsService();