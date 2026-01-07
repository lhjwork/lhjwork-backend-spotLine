import express, { Router } from "express";
import * as recommendationController from "../controllers/recommendationController";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: 추천 관리 API
 */

/**
 * @swagger
 * /api/recommendations/qr/{qrId}:
 *   get:
 *     summary: QR 코드 기반 추천 조회 (핵심 기능)
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *         description: QR 코드 ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [next_meal, dessert, activity, shopping, culture, rest]
 *         description: 추천 카테고리 필터
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 결과 개수 제한
 *     responses:
 *       200:
 *         description: 추천 목록 조회 성공
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
 *                         $ref: '#/components/schemas/Recommendation'
 *       404:
 *         description: QR 코드를 찾을 수 없음
 */
router.get("/qr/:qrId", recommendationController.getRecommendationsByQR);

/**
 * @swagger
 * /api/recommendations/store/{storeId}:
 *   get:
 *     summary: 매장별 추천 조회
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 매장 ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *     responses:
 *       200:
 *         description: 매장 추천 목록
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
 *                         $ref: '#/components/schemas/Recommendation'
 */
router.get("/store/:storeId", recommendationController.getRecommendationsByStore);

/**
 * @swagger
 * /api/recommendations/stats/categories:
 *   get:
 *     summary: 카테고리별 추천 통계
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: 카테고리별 통계 데이터
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
 *                         categories:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               category:
 *                                 type: string
 *                               count:
 *                                 type: number
 */
router.get("/stats/categories", recommendationController.getCategoryStats);

/**
 * @swagger
 * /api/recommendations:
 *   post:
 *     summary: 새 추천 관계 생성
 *     tags: [Recommendations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromStore
 *               - toStore
 *               - category
 *             properties:
 *               fromStore:
 *                 type: string
 *                 description: 출발 매장 ID
 *               toStore:
 *                 type: string
 *                 description: 추천 대상 매장 ID
 *               category:
 *                 type: string
 *                 enum: [next_meal, dessert, activity, shopping, culture, rest]
 *               priority:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: 추천 관계 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Recommendation'
 */
router.post("/", recommendationController.createRecommendation);

/**
 * @swagger
 * /api/recommendations/{id}:
 *   put:
 *     summary: 추천 관계 수정
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recommendation'
 *     responses:
 *       200:
 *         description: 추천 관계 수정 성공
 *       404:
 *         description: 추천 관계를 찾을 수 없음
 */
router.put("/:id", recommendationController.updateRecommendation);

/**
 * @swagger
 * /api/recommendations/{id}:
 *   delete:
 *     summary: 추천 관계 삭제
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 추천 관계 삭제 성공
 *       404:
 *         description: 추천 관계를 찾을 수 없음
 */
router.delete("/:id", recommendationController.deleteRecommendation);

export default router;
/**
 * @swagger
 * /api/recommendations/next-spots/{storeId}:
 *   get:
 *     summary: 다음으로 이어지는 Spot 조회 (SpotLine 전용)
 *     tags: [Recommendations]
 *     description: 현재 장소에서 자연스럽게 이어지는 2-4개의 Spot 제공
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 현재 매장 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *           maximum: 4
 *         description: 결과 개수 (최대 4개)
 *     responses:
 *       200:
 *         description: 다음 Spot 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       maxItems: 4
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
 */
router.get("/next-spots/:storeId", recommendationController.getNextSpots);
