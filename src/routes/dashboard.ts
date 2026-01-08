import express, { Router } from "express";
import * as dashboardController from "../controllers/dashboardController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: 관리자 대시보드 API
 */

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: 대시보드 통계 조회
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대시보드 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalStores:
 *                           type: number
 *                           description: 전체 매장 수
 *                         activeStores:
 *                           type: number
 *                           description: 활성 매장 수
 *                         totalRecommendations:
 *                           type: number
 *                           description: 전체 추천 수
 *                         totalQRScans:
 *                           type: number
 *                           description: 전체 QR 스캔 수
 *                         todayScans:
 *                           type: number
 *                           description: 오늘 스캔 수
 *                         uniqueVisitors:
 *                           type: number
 *                           description: 고유 방문자 수
 *                         conversionRate:
 *                           type: number
 *                           description: 전환율 (%)
 *       401:
 *         description: 인증 실패
 */
router.get("/stats", authenticateAdmin, dashboardController.getDashboardStats);

/**
 * @swagger
 * /api/admin/dashboard/traffic/daily:
 *   get:
 *     summary: 일별 트래픽 통계 조회
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: 조회할 일수
 *     responses:
 *       200:
 *         description: 일별 트래픽 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           scans:
 *                             type: number
 *                           uniqueVisitors:
 *                             type: number
 *       401:
 *         description: 인증 실패
 */
router.get("/traffic/daily", authenticateAdmin, dashboardController.getDailyTraffic);

/**
 * @swagger
 * /api/admin/dashboard/stores/performance:
 *   get:
 *     summary: 매장별 성과 통계 조회
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 조회할 매장 수
 *     responses:
 *       200:
 *         description: 매장별 성과 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           storeName:
 *                             type: string
 *                           category:
 *                             type: string
 *                           qrCodeId:
 *                             type: string
 *                           totalScans:
 *                             type: number
 *                           uniqueVisitors:
 *                             type: number
 *                           recommendationClicks:
 *                             type: number
 *                           conversionRate:
 *                             type: number
 *       401:
 *         description: 인증 실패
 */
router.get("/stores/performance", authenticateAdmin, dashboardController.getStorePerformance);

export default router;
