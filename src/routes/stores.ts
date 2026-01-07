import express, { Router } from "express";
import * as storeController from "../controllers/storeController";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: 매장 관리 API
 */

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: 모든 매장 조회
 *     tags: [Stores]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [cafe, restaurant, exhibition, hotel, retail, culture, other]
 *         description: 매장 카테고리 필터
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         description: 상권 필터
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 결과 개수 제한
 *     responses:
 *       200:
 *         description: 매장 목록 조회 성공
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
 *                         $ref: '#/components/schemas/Store'
 *       500:
 *         description: 서버 에러
 */
router.get("/", storeController.getAllStores);

/**
 * @swagger
 * /api/stores/qr/{qrId}:
 *   get:
 *     summary: QR 코드로 매장 조회
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *         description: QR 코드 ID
 *     responses:
 *       200:
 *         description: 매장 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Store'
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.get("/qr/:qrId", storeController.getStoreByQR);

/**
 * @swagger
 * /api/stores/spotline/{qrId}:
 *   get:
 *     summary: SpotLine QR 스캔 전용 매장 조회
 *     tags: [Stores]
 *     description: SpotLine 정체성에 맞는 간소화된 매장 정보 제공
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *         description: QR 코드 ID
 *     responses:
 *       200:
 *         description: SpotLine 매장 조회 성공
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
 *                           properties:
 *                             instagram:
 *                               type: string
 *                             blog:
 *                               type: string
 *                             notion:
 *                               type: string
 *                             website:
 *                               type: string
 *                         spotlineStory:
 *                           type: string
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.get("/spotline/:qrId", storeController.getSpotlineStoreByQR);

/**
 * @swagger
 * /api/stores/nearby/{lat}/{lng}:
 *   get:
 *     summary: 근처 매장 검색
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: 위도
 *       - in: path
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: 경도
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 1000
 *         description: 검색 반경 (미터)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *     responses:
 *       200:
 *         description: 근처 매장 목록
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
 *                         $ref: '#/components/schemas/Store'
 */
router.get("/nearby/:lat/:lng", storeController.getNearbyStores);

/**
 * @swagger
 * /api/stores/{id}:
 *   get:
 *     summary: 특정 매장 조회
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 매장 ID
 *     responses:
 *       200:
 *         description: 매장 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Store'
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.get("/:id", storeController.getStoreById);

/**
 * @swagger
 * /api/stores:
 *   post:
 *     summary: 새 매장 등록
 *     tags: [Stores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - location
 *               - qrCode
 *             properties:
 *               name:
 *                 type: string
 *                 description: 매장명
 *               category:
 *                 type: string
 *                 enum: [cafe, restaurant, exhibition, hotel, retail, culture, other]
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       coordinates:
 *                         type: array
 *                         items:
 *                           type: number
 *               qrCode:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *     responses:
 *       201:
 *         description: 매장 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Store'
 *       400:
 *         description: 잘못된 요청
 */
router.post("/", storeController.createStore);

/**
 * @swagger
 * /api/stores/{id}:
 *   put:
 *     summary: 매장 정보 수정
 *     tags: [Stores]
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
 *             $ref: '#/components/schemas/Store'
 *     responses:
 *       200:
 *         description: 매장 수정 성공
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.put("/:id", storeController.updateStore);

/**
 * @swagger
 * /api/stores/{id}:
 *   delete:
 *     summary: 매장 삭제 (비활성화)
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 매장 삭제 성공
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.delete("/:id", storeController.deleteStore);

export default router;
