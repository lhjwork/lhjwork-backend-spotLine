const express = require('express');
const router = express.Router();
const Analytics = require('../../models/Analytics');
const Store = require('../../models/Store');
const Recommendation = require('../../models/Recommendation');
const { authenticateAdmin, requirePermission } = require('../../middleware/adminAuth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateAdmin);

// 전체 개요 통계
router.get('/overview', requirePermission('analytics:read'), async (req, res) => {
  try {
    const { startDate, endDate, storeId } = req.query;
    
    // 날짜 필터 구성
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // 매장 필터
    if (storeId) {
      dateFilter.store = storeId;
    }

    // 기본 통계 조회
    const [
      totalScans,
      totalStores,
      totalRecommendations,
      scanTrends,
      popularStores
    ] = await Promise.all([
      // 총 QR 스캔 수
      Analytics.countDocuments({ 
        ...dateFilter, 
        eventType: 'qr_scan' 
      }),
      
      // 총 매장 수
      Store.countDocuments({ isActive: true }),
      
      // 총 추천 관계 수
      Recommendation.countDocuments({ isActive: true }),
      
      // 스캔 트렌드 (일별)
      Analytics.aggregate([
        { $match: { ...dateFilter, eventType: 'qr_scan' } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } },
        { $limit: 30 }
      ]),
      
      // 인기 매장 (스캔 수 기준)
      Analytics.aggregate([
        { $match: { ...dateFilter, eventType: 'qr_scan' } },
        {
          $group: {
            _id: '$store',
            scanCount: { $sum: 1 },
            uniqueSessions: { $addToSet: '$sessionId' }
          }
        },
        {
          $lookup: {
            from: 'stores',
            localField: '_id',
            foreignField: '_id',
            as: 'store'
          }
        },
        { $unwind: '$store' },
        {
          $project: {
            storeId: '$_id',
            storeName: '$store.name',
            category: '$store.category',
            scanCount: 1,
            uniqueVisitors: { $size: '$uniqueSessions' }
          }
        },
        { $sort: { scanCount: -1 } },
        { $limit: 10 }
      ])
    ]);

    // 추천 통계
    const recommendationStats = await Analytics.aggregate([
      { $match: { ...dateFilter, eventType: 'recommendation_click' } },
      {
        $group: {
          _id: '$metadata.category',
          clickCount: { $sum: 1 }
        }
      },
      { $sort: { clickCount: -1 } }
    ]);

    res.json({
      overview: {
        totalScans,
        totalStores,
        totalRecommendations,
        totalRecommendationClicks: recommendationStats.reduce((sum, stat) => sum + stat.clickCount, 0)
      },
      scanTrends: scanTrends.map(trend => ({
        date: trend._id.date,
        count: trend.count
      })),
      popularStores,
      recommendationStats
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      error: '분석 개요 조회 중 오류가 발생했습니다',
      code: 'ANALYTICS_OVERVIEW_ERROR'
    });
  }
});

// 실시간 분석 데이터
router.get('/realtime', requirePermission('analytics:read'), async (req, res) => {
  try {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      recentScans,
      activeScans,
      hourlyActivity
    ] = await Promise.all([
      // 최근 스캔 (30분 이내)
      Analytics.find({
        eventType: 'qr_scan',
        timestamp: { $gte: thirtyMinutesAgo }
      })
      .populate('store', 'name category location.area')
      .sort({ timestamp: -1 })
      .limit(20),

      // 활성 스캔 수 (30분 이내)
      Analytics.countDocuments({
        eventType: 'qr_scan',
        timestamp: { $gte: thirtyMinutesAgo }
      }),

      // 시간별 활동 (24시간)
      Analytics.aggregate([
        { $match: { timestamp: { $gte: oneDayAgo } } },
        {
          $group: {
            _id: {
              hour: { $hour: '$timestamp' },
              eventType: '$eventType'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.hour': 1 } }
      ])
    ]);

    // 지역별 활동 지도 데이터
    const mapData = await Analytics.aggregate([
      { $match: { timestamp: { $gte: oneDayAgo } } },
      {
        $lookup: {
          from: 'stores',
          localField: 'store',
          foreignField: '_id',
          as: 'store'
        }
      },
      { $unwind: '$store' },
      {
        $group: {
          _id: {
            coordinates: '$store.location.coordinates.coordinates',
            area: '$store.location.area'
          },
          count: { $sum: 1 },
          storeName: { $first: '$store.name' }
        }
      },
      {
        $project: {
          coordinates: '$_id.coordinates',
          area: '$_id.area',
          storeName: 1,
          count: 1
        }
      }
    ]);

    res.json({
      activeScans,
      recentScans: recentScans.map(scan => ({
        id: scan._id,
        timestamp: scan.timestamp,
        store: scan.store,
        sessionId: scan.sessionId
      })),
      hourlyActivity,
      mapData
    });

  } catch (error) {
    console.error('Realtime analytics error:', error);
    res.status(500).json({
      error: '실시간 분석 데이터 조회 중 오류가 발생했습니다',
      code: 'REALTIME_ANALYTICS_ERROR'
    });
  }
});

// 추천 성과 분석
router.get('/recommendations/performance', requirePermission('analytics:read'), async (req, res) => {
  try {
    const { startDate, endDate, storeId, category } = req.query;
    
    const matchFilter = {
      eventType: { $in: ['page_view', 'recommendation_click'] }
    };
    
    if (startDate || endDate) {
      matchFilter.timestamp = {};
      if (startDate) matchFilter.timestamp.$gte = new Date(startDate);
      if (endDate) matchFilter.timestamp.$lte = new Date(endDate);
    }
    
    if (storeId) matchFilter.store = storeId;
    if (category) matchFilter['metadata.category'] = category;

    const performance = await Analytics.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            store: '$store',
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
        $lookup: {
          from: 'stores',
          localField: '_id.store',
          foreignField: '_id',
          as: 'sourceStore'
        }
      },
      {
        $lookup: {
          from: 'stores',
          localField: '_id.targetStore',
          foreignField: '_id',
          as: 'targetStore'
        }
      },
      {
        $project: {
          sourceStore: { $arrayElemAt: ['$sourceStore.name', 0] },
          targetStore: { $arrayElemAt: ['$targetStore.name', 0] },
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

    res.json(performance);

  } catch (error) {
    console.error('Recommendation performance error:', error);
    res.status(500).json({
      error: '추천 성과 분석 중 오류가 발생했습니다',
      code: 'RECOMMENDATION_PERFORMANCE_ERROR'
    });
  }
});

// 매장별 상세 분석
router.get('/stores/:storeId', requirePermission('analytics:read'), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { startDate, endDate } = req.query;
    
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        error: '매장을 찾을 수 없습니다',
        code: 'STORE_NOT_FOUND'
      });
    }

    const dateFilter = { store: storeId };
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    const [
      eventStats,
      dailyTrends,
      recommendationClicks
    ] = await Promise.all([
      // 이벤트별 통계
      Analytics.aggregate([
        { $match: dateFilter },
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
      ]),

      // 일별 트렌드
      Analytics.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              eventType: '$eventType'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),

      // 추천 클릭 분석
      Analytics.aggregate([
        { 
          $match: { 
            store: storeId, 
            eventType: 'recommendation_click',
            ...dateFilter
          } 
        },
        {
          $group: {
            _id: '$metadata.category',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      store: {
        id: store._id,
        name: store.name,
        category: store.category,
        location: store.location
      },
      eventStats,
      dailyTrends,
      recommendationClicks
    });

  } catch (error) {
    console.error('Store analytics error:', error);
    res.status(500).json({
      error: '매장 분석 데이터 조회 중 오류가 발생했습니다',
      code: 'STORE_ANALYTICS_ERROR'
    });
  }
});

module.exports = router;