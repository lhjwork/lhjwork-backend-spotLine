import express, { Router } from "express";
import * as experienceController from "../controllers/experienceController";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Experience
 *   description: SpotLine 체험하기 API
 */

/**
 * @swagger
 * /api/experience/select:
 *   get:
 *     summary: SpotLine 체험 매장 선택
 *     tags: [Experience]
 *     description: 관리자가 설정한 체험 설정에 따라 매장을 선택하고 리다이렉트 정보를 반환
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: 세션 ID (분석용)
 *     responses:
 *       200:
 *         description: 체험 매장 선택 성공
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
 *                           description: 선택된 매장의 QR 코드 ID
 *                         storeName:
 *                           type: string
 *                           description: 매장명
 *                         storeId:
 *                           type: string
 *                           description: 매장 MongoDB ID
 *                         area:
 *                           type: string
 *                           description: 지역
 *                         configUsed:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             type:
 *                               type: string
 *                         redirectUrl:
 *                           type: string
 *                           description: 리다이렉트할 URL
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 */
router.get("/select", experienceController.getExperienceStore);

/**
 * @swagger
 * /api/experience/available-stores:
 *   get:
 *     summary: 체험 가능한 매장 목록 조회
 *     tags: [Experience]
 *     description: 현재 활성화된 매장들의 QR 코드 ID 목록을 반환
 *     responses:
 *       200:
 *         description: 사용 가능한 매장 목록 조회 성공
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
 *                         totalCount:
 *                           type: number
 *                         allStores:
 *                           type: array
 *                           items:
 *                             type: string
 *                         byArea:
 *                           type: object
 *                           additionalProperties:
 *                             type: array
 *                             items:
 *                               type: string
 */
router.get("/available-stores", experienceController.getAvailableStores);

/**
 * @swagger
 * /api/experience/stats:
 *   get:
 *     summary: 체험 통계 조회
 *     tags: [Experience]
 *     description: SpotLine 체험하기 기능의 사용 통계를 조회
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: 조회할 일수
 *     responses:
 *       200:
 *         description: 체험 통계 조회 성공
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
 *                         period:
 *                           type: string
 *                         totalExperiences:
 *                           type: number
 *                         uniqueStores:
 *                           type: number
 *                         topStores:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               storeId:
 *                                 type: string
 *                               storeName:
 *                                 type: string
 *                               qrId:
 *                                 type: string
 *                               area:
 *                                 type: string
 *                               count:
 *                                 type: number
 *                         dailyStats:
 *                           type: object
 *                         averagePerDay:
 *                           type: string
 */
router.get("/stats", experienceController.getExperienceStats);

export default router;
