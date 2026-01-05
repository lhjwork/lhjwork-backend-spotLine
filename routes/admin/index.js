const express = require('express');
const router = express.Router();

// 어드민 라우터들 import
const authRouter = require('./auth');
const storesRouter = require('./stores');
const analyticsRouter = require('./analytics');

// 라우터 연결
router.use('/auth', authRouter);
router.use('/stores', storesRouter);
router.use('/analytics', analyticsRouter);

// 어드민 API 정보
router.get('/', (req, res) => {
  res.json({
    name: 'Spotline Admin API',
    version: '1.0.0',
    description: 'Spotline 관리자 대시보드 API',
    endpoints: {
      auth: '/api/admin/auth',
      stores: '/api/admin/stores',
      analytics: '/api/admin/analytics'
    },
    documentation: 'https://docs.spotline.app/admin-api'
  });
});

module.exports = router;