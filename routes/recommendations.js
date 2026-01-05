const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// QR 코드 기반 추천 조회 (핵심 기능)
router.get('/qr/:qrId', recommendationController.getRecommendationsByQR);

// 매장별 추천 조회
router.get('/store/:storeId', recommendationController.getRecommendationsByStore);

// 카테고리별 추천 통계
router.get('/stats/categories', recommendationController.getCategoryStats);

// 새 추천 관계 생성
router.post('/', recommendationController.createRecommendation);

// 추천 관계 수정
router.put('/:id', recommendationController.updateRecommendation);

// 추천 관계 삭제
router.delete('/:id', recommendationController.deleteRecommendation);

module.exports = router;