const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin, checkPermission, requireRole } = require('../middleware/adminAuth');

// 공개 라우트 (인증 불필요)
router.post('/login', adminController.login);

// 인증이 필요한 라우트들
router.use(authenticateAdmin);

// 대시보드
router.get('/dashboard/stats', adminController.getDashboardStats);

// 매장 관리
router.get('/stores', checkPermission('stores', 'read'), adminController.getStoresForAdmin);
router.get('/stores/:id', checkPermission('stores', 'read'), adminController.getStoreDetail);
router.post('/stores', checkPermission('stores', 'write'), adminController.createStore);
router.put('/stores/:id', checkPermission('stores', 'write'), adminController.updateStore);
router.patch('/stores/:id/status', checkPermission('stores', 'write'), adminController.toggleStoreStatus);
router.delete('/stores/:id', checkPermission('stores', 'delete'), adminController.deleteStorePermanently);

// 추천 관계 관리
router.get('/recommendations', checkPermission('stores', 'read'), adminController.getRecommendations);
router.post('/recommendations', checkPermission('stores', 'write'), adminController.createRecommendation);
router.put('/recommendations/:id', checkPermission('stores', 'write'), adminController.updateRecommendation);
router.delete('/recommendations/:id', checkPermission('stores', 'write'), adminController.deleteRecommendation);

// 분석 데이터
router.get('/analytics', checkPermission('analytics', 'read'), adminController.getAnalyticsData);
router.get('/analytics/popular-stores', checkPermission('analytics', 'read'), adminController.getPopularStores);
router.get('/analytics/qr-performance', checkPermission('analytics', 'read'), adminController.getQRPerformance);
router.get('/analytics/recommendation-performance', checkPermission('analytics', 'read'), adminController.getRecommendationPerformance);

// 데이터 내보내기
router.get('/export', checkPermission('analytics', 'export'), adminController.exportData);

// 어드민 계정 관리 (super_admin만)
router.get('/admins', requireRole(['super_admin']), adminController.getAdmins);
router.post('/admins', requireRole(['super_admin']), adminController.createAdmin);
router.patch('/admins/:id/permissions', requireRole(['super_admin']), adminController.updateAdminPermissions);

module.exports = router;