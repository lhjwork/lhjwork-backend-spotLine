import express, { Router } from "express";
import * as demoController from "../controllers/demoController";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Demo
 *   description: 업주 소개용 데모 API (통계 수집 없음)
 */

/**
 * @swagger
 * /api/demo/experience:
 *   get:
 *     summary: 데모 체험하기 (업주 소개용)
 *     tags: [Demo]
 *     description: 업주에게 서비스를 소개할 때 사용하는 데모 체험. 통계 수집하지 않음.
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
 *                           description: QR 코드 ID
 *                         storeName:
 *                           type: string
 *                           description: 매장명
 *                         storeId:
 *                           type: string
 *                           description: 매장 ID
 *                         area:
 *                           type: string
 *                           description: 지역
 *                         redirectUrl:
 *                           type: string
 *                           description: 리다이렉트 URL
 *                         isDemoMode:
 *                           type: boolean
 *                           description: 데모 모드 여부
 */
router.get("/experience", demoController.getDemoExperience);

/**
 * @swagger
 * /api/demo/stores:
 *   get:
 *     summary: 데모 매장 목록 조회
 *     tags: [Demo]
 *     description: 업주 소개용 데모 매장들의 목록을 조회합니다.
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
 *                           name:
 *                             type: string
 *                           shortDescription:
 *                             type: string
 *                           representativeImage:
 *                             type: string
 *                           area:
 *                             type: string
 *                           qrId:
 *                             type: string
 */
router.get("/stores", demoController.getDemoStores);

/**
 * @swagger
 * /api/demo/stores/{qrId}:
 *   get:
 *     summary: 데모 매장 상세 조회
 *     tags: [Demo]
 *     description: QR 코드 ID로 데모 매장의 상세 정보를 조회합니다. (업주 소개용)
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *         description: QR 코드 ID
 *     responses:
 *       200:
 *         description: 데모 매장 조회 성공
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
 *                         name:
 *                           type: string
 *                         shortDescription:
 *                           type: string
 *                         representativeImage:
 *                           type: string
 *                         location:
 *                           type: object
 *                           properties:
 *                             address:
 *                               type: string
 *                             mapLink:
 *                               type: string
 *                         externalLinks:
 *                           type: object
 *                         spotlineStory:
 *                           type: string
 *                         isDemoMode:
 *                           type: boolean
 *                         demoNotice:
 *                           type: string
 *       404:
 *         description: 데모 매장을 찾을 수 없음
 */
router.get("/stores/:qrId", demoController.getDemoStoreByQR);

/**
 * @swagger
 * /api/demo/stores/{qrId}/recommendations:
 *   get:
 *     summary: 데모 추천 매장 조회
 *     tags: [Demo]
 *     description: 현재 데모 매장 기준으로 다음 추천 매장들을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *         description: 현재 매장의 QR 코드 ID
 *     responses:
 *       200:
 *         description: 데모 추천 매장 조회 성공
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
 *                           qrId:
 *                             type: string
 *                           area:
 *                             type: string
 *                           mapLink:
 *                             type: string
 */
router.get("/stores/:qrId/recommendations", demoController.getDemoRecommendations);

export default router;
