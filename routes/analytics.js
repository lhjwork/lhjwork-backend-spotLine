const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// 이벤트 로깅 (QR 스캔, 클릭 등)
router.post('/event', analyticsController.logEvent);

// QR 코드별 통계 조회
router.get('/qr/:qrId', analyticsController.getQRStats);

// 매장별 통계 조회
router.get('/store/:storeId', analyticsController.getStoreStats);

// 추천 클릭률 분석
router.get('/recommendations/performance', analyticsController.getRecommendationPerformance);

// 일별 트래픽 통계
router.get('/traffic/daily', analyticsController.getDailyTraffic);

module.exports = router;