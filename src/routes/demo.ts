import express, { Router } from "express";
import * as demoController from "../controllers/demoController";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Demo
 *   description: 데모 시스템 API (업주 소개용)
 */

/**
 * @swagger
 * /api/demo/experience:
 *   get:
 *     summary: 랜덤 데모 체험
 *     tags: [Demo]
 *     description: 랜덤하게 데모 매장을 선택하여 체험할 수 있도록 합니다
 *     responses:
 *       200:
 *         description: 데모 체험 매장 선택 성공
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
 *                           example: "demo_cafe_001"
 *                         storeId:
 *                           type: string
 *                           example: "675a1b2c3d4e5f6789012346"
 *                         storeName:
 *                           type: string
 *                           example: "카페 데모"
 *                         area:
 *                           type: string
 *                           example: "데모 지역"
 *                         redirectUrl:
 *                           type: string
 *                           example: "http://localhost:3000/spotline/675a1b2c3d4e5f6789012346"
 *                         isDemoMode:
 *                           type: boolean
 *                           example: true
 *       404:
 *         description: 사용 가능한 데모 매장이 없음
 */
router.get("/experience", demoController.getDemoExperience);

/**
 * @swagger
 * /api/demo/stores:
 *   get:
 *     summary: 데모 매장 목록 조회
 *     tags: [Demo]
 *     description: 모든 데모 매장 목록을 반환합니다
 *     responses:
 *       200:
 *         description: 데모 매장 목록 조회 성공
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
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           shortDescription:
 *                             type: string
 *                           representativeImage:
 *                             type: string
 *                           location:
 *                             type: object
 *                           externalLinks:
 *                             type: object
 *                           spotlineStory:
 *                             type: string
 *                           qrCode:
 *                             type: object
 *                           isDemoMode:
 *                             type: boolean
 *                           demoNotice:
 *                             type: string
 */
router.get("/stores", demoController.getDemoStores);

/**
 * @swagger
 * /api/demo/stores/{qrId}:
 *   get:
 *     summary: 데모 매장 상세 조회 (QR ID)
 *     tags: [Demo]
 *     description: QR ID로 특정 데모 매장의 상세 정보를 조회합니다
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *           example: "demo_cafe_001"
 *         description: 데모 QR 코드 ID
 *     responses:
 *       200:
 *         description: 데모 매장 조회 성공
 *       400:
 *         description: 유효하지 않은 데모 QR 코드
 *       404:
 *         description: 데모 매장을 찾을 수 없음
 */
router.get("/stores/:qrId", demoController.getDemoStoreByQR);

/**
 * @swagger
 * /api/demo/stores/id/{storeId}:
 *   get:
 *     summary: 데모 매장 상세 조회 (매장 ID)
 *     tags: [Demo]
 *     description: 매장 ID로 특정 데모 매장의 상세 정보를 조회합니다
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *           example: "675a1b2c3d4e5f6789012346"
 *         description: 데모 매장 ID
 *     responses:
 *       200:
 *         description: 데모 매장 조회 성공
 *       400:
 *         description: 유효하지 않은 매장 ID
 *       404:
 *         description: 데모 매장을 찾을 수 없음
 */
router.get("/stores/id/:storeId", demoController.getDemoStoreById);

/**
 * @swagger
 * /api/demo/next-spots/{storeId}:
 *   get:
 *     summary: 데모 다음 Spot 조회
 *     tags: [Demo]
 *     description: 데모 매장의 다음 추천 Spot들을 조회합니다
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *           example: "675a1b2c3d4e5f6789012346"
 *         description: 데모 매장 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *         description: 결과 개수 제한
 *     responses:
 *       200:
 *         description: 데모 다음 Spot 조회 성공
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
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           shortDescription:
 *                             type: string
 *                           representativeImage:
 *                             type: string
 *                           mapLink:
 *                             type: string
 *                           category:
 *                             type: string
 *                           walkingTime:
 *                             type: number
 *                           distance:
 *                             type: number
 *       400:
 *         description: 유효하지 않은 매장 ID
 */
router.get("/next-spots/:storeId", demoController.getDemoNextSpots);

export default router;
