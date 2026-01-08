import express, { Router } from "express";
import * as qrController from "../controllers/qrController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: QR
 *   description: QR 코드 관리 API
 */

/**
 * @swagger
 * /api/qr/{qrId}/store:
 *   get:
 *     summary: QR 코드로 매장 ID 조회
 *     tags: [QR]
 *     description: QR 코드를 스캔했을 때 해당하는 매장 ID를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *         description: QR 코드 ID
 *     responses:
 *       200:
 *         description: QR 코드 조회 성공
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
 *                         qrId:
 *                           type: string
 *                           description: QR 코드 ID
 *                         storeId:
 *                           type: string
 *                           description: 매장 ID
 *                         storeName:
 *                           type: string
 *                           description: 매장명
 *                         scanCount:
 *                           type: number
 *                           description: 스캔 횟수
 *       404:
 *         description: 유효하지 않거나 만료된 QR 코드
 */
router.get("/:qrId/store", qrController.getStoreByQRCode);

/**
 * @swagger
 * /api/qr/{qrId}/stats:
 *   get:
 *     summary: QR 코드 통계 조회
 *     tags: [QR]
 *     description: QR 코드의 스캔 통계 및 상세 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *         description: QR 코드 ID
 *     responses:
 *       200:
 *         description: QR 코드 통계 조회 성공
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
 *                         qrId:
 *                           type: string
 *                         storeId:
 *                           type: string
 *                         scanCount:
 *                           type: number
 *                         lastScannedAt:
 *                           type: string
 *                           format: date-time
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         isActive:
 *                           type: boolean
 *                         isExpired:
 *                           type: boolean
 *       404:
 *         description: QR 코드를 찾을 수 없음
 */
router.get("/:qrId/stats", qrController.getQRCodeStats);

/**
 * @swagger
 * /api/qr/store/{storeId}:
 *   get:
 *     summary: 매장별 QR 코드 목록 조회
 *     tags: [QR]
 *     description: 특정 매장에 연결된 모든 QR 코드 목록을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 매장 ID
 *     responses:
 *       200:
 *         description: 매장 QR 코드 목록 조회 성공
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
 *                         storeName:
 *                           type: string
 *                         qrCodes:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               qrId:
 *                                 type: string
 *                               isActive:
 *                                 type: boolean
 *                               scanCount:
 *                                 type: number
 *                               lastScannedAt:
 *                                 type: string
 *                                 format: date-time
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.get("/store/:storeId", qrController.getQRCodesByStore);

/**
 * @swagger
 * /api/qr:
 *   post:
 *     summary: 새 QR 코드 생성 (관리자 전용)
 *     tags: [QR]
 *     security:
 *       - bearerAuth: []
 *     description: 매장에 연결된 새로운 QR 코드를 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrId
 *               - storeId
 *             properties:
 *               qrId:
 *                 type: string
 *                 description: QR 코드 고유 ID
 *                 example: qr_cafe_gangnam_002
 *               storeId:
 *                 type: string
 *                 description: 매장 ID
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: QR 코드 만료일 (선택적)
 *               metadata:
 *                 type: object
 *                 description: 추가 메타데이터 (선택적)
 *                 properties:
 *                   campaign:
 *                     type: string
 *                   location:
 *                     type: string
 *                   purpose:
 *                     type: string
 *     responses:
 *       201:
 *         description: QR 코드 생성 성공
 *       400:
 *         description: 잘못된 요청
 *       409:
 *         description: 이미 존재하는 QR 코드 ID
 */
router.post("/", authenticateAdmin, qrController.createQRCode);

/**
 * @swagger
 * /api/qr/{qrId}/deactivate:
 *   patch:
 *     summary: QR 코드 비활성화 (관리자 전용)
 *     tags: [QR]
 *     security:
 *       - bearerAuth: []
 *     description: QR 코드를 비활성화합니다.
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *         description: QR 코드 ID
 *     responses:
 *       200:
 *         description: QR 코드 비활성화 성공
 *       404:
 *         description: QR 코드를 찾을 수 없음
 */
router.patch("/:qrId/deactivate", authenticateAdmin, qrController.deactivateQRCode);

export default router;
