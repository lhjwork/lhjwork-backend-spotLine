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

/**
 * @swagger
 * /api/recommendations/nearby-stores/{storeId}:
 *   get:
 *     summary: 관리자용 - 매장 근처 선택 가능한 매장 목록 조회 (거리 + 지역 기반)
 *     tags: [Recommendations]
 *     description: 관리자가 추천 관계를 설정할 수 있도록 현재 매장 주변의 다른 매장들을 거리 기반(10km)과 같은 지역(area) 기반으로 조회
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 기준 매장 ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [cafe, restaurant, exhibition, hotel, retail, culture, other]
 *         description: 매장 카테고리 필터
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: 결과 개수 제한
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 10000
 *         description: 검색 반경 (미터, 기본값 10km)
 *     responses:
 *       200:
 *         description: 근처 매장 목록 조회 성공
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
 *                         currentStore:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             category:
 *                               type: string
 *                             address:
 *                               type: string
 *                             area:
 *                               type: string
 *                             shortDescription:
 *                               type: string
 *                         nearbyStores:
 *                           type: array
 *                           description: 거리 기반 근처 매장들 (10km 반경, 거리순 정렬)
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               category:
 *                                 type: string
 *                               shortDescription:
 *                                 type: string
 *                               address:
 *                                 type: string
 *                               area:
 *                                 type: string
 *                               representativeImage:
 *                                 type: string
 *                               distance:
 *                                 type: number
 *                               walkingTime:
 *                                 type: number
 *                               isAlreadyConnected:
 *                                 type: boolean
 *                               suggestedCategories:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               matchType:
 *                                 type: string
 *                                 enum: [distance]
 *                         sameAreaStores:
 *                           type: array
 *                           description: 같은 지역(area) 매장들 (이름순 정렬, 거리 기반과 중복 제거)
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               category:
 *                                 type: string
 *                               shortDescription:
 *                                 type: string
 *                               address:
 *                                 type: string
 *                               area:
 *                                 type: string
 *                               representativeImage:
 *                                 type: string
 *                               distance:
 *                                 type: number
 *                               walkingTime:
 *                                 type: number
 *                               isAlreadyConnected:
 *                                 type: boolean
 *                               suggestedCategories:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               matchType:
 *                                 type: string
 *                                 enum: [area]
 *                         existingRecommendations:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Recommendation'
 */
router.get("/nearby-stores/:storeId", recommendationController.getNearbyStoresForSelection);

/**
 * @swagger
 * /api/recommendations/selected/{storeId}:
 *   post:
 *     summary: 관리자가 선택한 매장들과 추천 관계 생성
 *     tags: [Recommendations]
 *     description: 관리자가 선택한 근처 매장들과의 추천 관계를 일괄 생성 (수동 선택 방식)
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 기준 매장 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selectedStores
 *             properties:
 *               selectedStores:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - toStoreId
 *                     - category
 *                   properties:
 *                     toStoreId:
 *                       type: string
 *                       description: 추천 대상 매장 ID
 *                     category:
 *                       type: string
 *                       enum: [next_meal, dessert, activity, shopping, culture, rest]
 *                       description: 추천 카테고리
 *                     priority:
 *                       type: number
 *                       minimum: 1
 *                       maximum: 10
 *                       description: 우선순위 (선택사항, 기본값 5)
 *                     description:
 *                       type: string
 *                       description: 추천 설명 (선택사항)
 *     responses:
 *       201:
 *         description: 추천 관계 일괄 생성 성공
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
 *       400:
 *         description: 잘못된 요청 (선택된 매장이 없음)
 */
router.post("/selected/:storeId", recommendationController.createSelectedRecommendations);
