import express, { Router } from "express";
import * as storeController from "../controllers/storeController"; // 기존 Store 컨트롤러 재사용

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Production
 *   description: 실제 운영 매장 관리 API (고객 데이터)
 */

/**
 * @swagger
 * /api/production/stores:
 *   get:
 *     summary: 실제 운영 매장 목록 조회
 *     tags: [Production]
 *     description: 실제 고객 데이터로 운영되는 매장들의 목록을 조회합니다.
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
 *         description: 실제 운영 매장 목록 조회 성공
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
router.get("/stores", storeController.getAllStores);

/**
 * @swagger
 * /api/production/stores/qr/{qrId}:
 *   get:
 *     summary: QR 코드로 실제 운영 매장 조회
 *     tags: [Production]
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *         description: QR 코드 ID (prod_ 접두사 또는 기존 형식)
 *     responses:
 *       200:
 *         description: 실제 운영 매장 조회 성공
 */
router.get("/stores/qr/:qrId", storeController.getStoreByQR);

/**
 * @swagger
 * /api/production/stores/spotline/{qrId}:
 *   get:
 *     summary: SpotLine QR 스캔 전용 실제 매장 조회
 *     tags: [Production]
 *     description: 실제 고객이 QR 코드를 스캔했을 때 사용하는 API
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *         description: QR 코드 ID
 *     responses:
 *       200:
 *         description: SpotLine 실제 매장 조회 성공
 */
/**
 * @swagger
 * /api/production/stores/spotline/{storeId}:
 *   get:
 *     summary: SpotLine 실제 매장 상세 조회 (매장 ID 기반)
 *     tags: [Production]
 *     description: 매장 ID로 실제 고객이 QR 코드를 스캔했을 때 사용하는 API (새로운 구조)
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 매장 ID
 *       - in: query
 *         name: qr
 *         schema:
 *           type: string
 *         description: QR 코드 ID (선택적)
 *     responses:
 *       200:
 *         description: SpotLine 실제 매장 조회 성공
 */
router.get("/stores/spotline/store/:storeId", storeController.getSpotlineStoreById);

/**
 * @swagger
 * /api/production/stores/spotline/{qrId}:
 *   get:
 *     summary: SpotLine QR 스캔 전용 실제 매장 조회 (호환성 유지)
 *     tags: [Production]
 *     description: 실제 고객이 QR 코드를 스캔했을 때 사용하는 API (기존 구조)
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: string
 *         description: QR 코드 ID
 *     responses:
 *       200:
 *         description: SpotLine 실제 매장 조회 성공
 */
router.get("/stores/spotline/:qrId", storeController.getSpotlineStoreByQR);

/**
 * @swagger
 * /api/production/stores/nearby/{lat}/{lng}:
 *   get:
 *     summary: 근처 실제 운영 매장 검색
 *     tags: [Production]
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
 *     responses:
 *       200:
 *         description: 근처 실제 운영 매장 목록
 */
router.get("/stores/nearby/:lat/:lng", storeController.getNearbyStores);

/**
 * @swagger
 * /api/production/stores/{id}:
 *   get:
 *     summary: 특정 실제 운영 매장 조회
 *     tags: [Production]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 매장 ID
 *     responses:
 *       200:
 *         description: 실제 운영 매장 조회 성공
 */
router.get("/stores/:id", storeController.getStoreById);

/**
 * @swagger
 * /api/production/stores:
 *   post:
 *     summary: 새 실제 운영 매장 등록
 *     tags: [Production]
 *     description: 실제 고객의 매장을 시스템에 등록합니다.
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
 *                     description: QR 코드 ID (prod_ 접두사 권장)
 *     responses:
 *       201:
 *         description: 실제 운영 매장 등록 성공
 */
router.post("/stores", storeController.createStore);

/**
 * @swagger
 * /api/production/stores/{id}:
 *   put:
 *     summary: 실제 운영 매장 정보 수정
 *     tags: [Production]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 실제 운영 매장 수정 성공
 */
router.put("/stores/:id", storeController.updateStore);

/**
 * @swagger
 * /api/production/stores/{id}:
 *   delete:
 *     summary: 실제 운영 매장 삭제 (비활성화)
 *     tags: [Production]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 실제 운영 매장 삭제 성공
 */
router.delete("/stores/:id", storeController.deleteStore);

export default router;
