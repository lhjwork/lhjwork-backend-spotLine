import express, { Router } from "express";
import * as analyticsController from "@/controllers/analyticsController";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: 분석 및 통계 API
 */

/**
 * @swagger
 * /api/analytics/event:
 *   post:
 *     summary: 이벤트 로깅 (QR 스캔, 클릭 등)
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrCode
 *               - store
 *               - eventType
 *             properties:
 *               qrCode:
 *                 type: string
 *                 description: QR 코드 ID
 *               store:
 *                 type: string
 *                 description: 매장 ID
 *               eventType:
 *                 type: string
 *                 enum: [qr_scan, page_view, recommendation_click, map_click, store_visit]
 *                 description: 이벤트 타입
 *               targetStore:
 *                 type: string
 *                 description: 클릭한 대상 매장 ID (선택사항)
 *               sessionId:
 *                 type: string
 *                 description: 세션 ID
 *               metadata:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   position:
 *                     type: number
 *                   duration:
 *                     type: number
 *     responses:
 *       201:
 *         description: 이벤트 로깅 성공
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
 *                         id:
 *                           type: string
 *       400:
 *         description: 잘못된 요청
 */
router.post("/event", analyticsController.logEvent);

/**
 * @swagger
 * /api/analytics/qr/{qrId}:
 *   get:
 *     summary: QR 코드별 통계 조회
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *         description: QR 코드 ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 시작 날짜 (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 종료 날짜 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: QR 코드 통계 데이터
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
 *                         qrCode:
 *                           type: string
 *                         totalScans:
 *                           type: number
 *                         uniqueVisitors:
 *                           type: number
 *                         eventBreakdown:
 *                           type: object
 */
router.get("/qr/:qrId", analyticsController.getQRStats);

/**
 * @swagger
 * /api/analytics/store/{storeId}:
 *   get:
 *     summary: 매장별 통계 조회
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 매장 ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *         description: 통계 기간
 *     responses:
 *       200:
 *         description: 매장 통계 데이터
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
 *                         storeId:
 *                           type: string
 *                         totalVisits:
 *                           type: number
 *                         recommendationClicks:
 *                           type: number
 *                         conversionRate:
 *                           type: number
 */
router.get("/store/:storeId", analyticsController.getStoreStats);

/**
 * @swagger
 * /api/analytics/recommendations/performance:
 *   get:
 *     summary: 추천 클릭률 분석
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 결과 개수 제한
 *     responses:
 *       200:
 *         description: 추천 성과 분석 데이터
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
 *                           recommendationId:
 *                             type: string
 *                           clicks:
 *                             type: number
 *                           impressions:
 *                             type: number
 *                           clickRate:
 *                             type: number
 */
router.get("/recommendations/performance", analyticsController.getRecommendationPerformance);

/**
 * @swagger
 * /api/analytics/traffic/daily:
 *   get:
 *     summary: 일별 트래픽 통계
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: 조회할 일수
 *     responses:
 *       200:
 *         description: 일별 트래픽 데이터
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
 *                           totalEvents:
 *                             type: number
 *                           uniqueUsers:
 *                             type: number
 *                           qrScans:
 *                             type: number
 */
router.get("/traffic/daily", analyticsController.getDailyTraffic);

export default router;
