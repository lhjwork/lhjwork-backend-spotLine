import express, { Router } from "express";
import * as liveStoreController from "../controllers/liveStoreController";
import * as liveQrController from "../controllers/liveQrController";
import * as liveRecommendationController from "../controllers/liveRecommendationController";
import { liveAuth, createStoreOwnerAuth } from "../middleware/ownerAuth";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Live System
 *   description: 실제 서비스 운영 API (Live System)
 */

// ==========================================
// 매장 관리 API (Live Stores)
// ==========================================

/**
 * @swagger
 * /api/live/stores:
 *   get:
 *     summary: 실제 매장 목록 조회 (인증 불필요)
 *     tags: [Live System]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 매장 목록 조회 성공
 */
router.get("/stores", liveAuth.read, liveStoreController.getLiveStores);

/**
 * @swagger
 * /api/live/stores/{storeId}:
 *   get:
 *     summary: 특정 매장 상세 조회 (인증 불필요)
 *     tags: [Live System]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 매장 정보 조회 성공
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.get("/stores/:storeId", liveAuth.read, liveStoreController.getLiveStore);

/**
 * @swagger
 * /api/live/stores:
 *   post:
 *     summary: 새 매장 등록 (나중에 인증 필요)
 *     tags: [Live System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               location:
 *                 type: object
 *     responses:
 *       201:
 *         description: 매장 등록 성공
 *       401:
 *         description: 인증 실패 (나중에 활성화)
 */
router.post("/stores", liveAuth.create, liveStoreController.createLiveStore);

/**
 * @swagger
 * /api/live/stores/{storeId}:
 *   put:
 *     summary: 매장 정보 수정 (나중에 인증 필요)
 *     tags: [Live System]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 매장 정보 수정 성공
 *       401:
 *         description: 인증 실패 (나중에 활성화)
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.put("/stores/:storeId", liveAuth.update, createStoreOwnerAuth(), liveStoreController.updateLiveStore);

// ==========================================
// QR 코드 시스템 (Live QR)
// ==========================================

/**
 * @swagger
 * /api/live/qr/{qrId}:
 *   get:
 *     summary: QR 코드로 매장 조회 (인증 불필요)
 *     tags: [Live System]
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 매장 정보 조회 성공
 *       404:
 *         description: 유효하지 않은 QR 코드
 */
router.get("/qr/:qrId", liveAuth.read, liveQrController.getStoreByQR);

/**
 * @swagger
 * /api/live/qr/generate:
 *   post:
 *     summary: QR 코드 생성 (나중에 인증 필요)
 *     tags: [Live System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeId:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: QR 코드 생성 성공
 *       401:
 *         description: 인증 실패 (나중에 활성화)
 */
router.post("/qr/generate", liveAuth.create, liveQrController.generateQRCode);

// ==========================================
// 추천 시스템 (Live Recommendations)
// ==========================================

/**
 * @swagger
 * /api/live/recommendations/{storeId}:
 *   get:
 *     summary: 매장 기반 실제 추천 (인증 불필요)
 *     tags: [Live System]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *     responses:
 *       200:
 *         description: 추천 매장 조회 성공
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.get("/recommendations/:storeId", liveAuth.read, liveRecommendationController.getLiveRecommendations);

/**
 * @swagger
 * /api/live/recommendations/feedback:
 *   post:
 *     summary: 추천 피드백 수집 (인증 불필요)
 *     tags: [Live System]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromStoreId:
 *                 type: string
 *               toStoreId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [view, click, visit]
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: 피드백 기록 성공
 */
router.post("/recommendations/feedback", liveAuth.read, liveRecommendationController.submitRecommendationFeedback);

// ==========================================
// 시스템 상태 확인
// ==========================================

/**
 * @swagger
 * /api/live/health:
 *   get:
 *     summary: Live 시스템 상태 확인
 *     tags: [Live System]
 *     responses:
 *       200:
 *         description: Live 시스템 정상 작동
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Live 시스템이 정상 작동 중입니다.",
    data: {
      status: "healthy",
      version: "1.0",
      system: "live",
      timestamp: new Date().toISOString(),
      features: {
        stores: true,
        qr: true,
        recommendations: true,
        analytics: true,
        auth: true
      }
    }
  });
});

export default router;