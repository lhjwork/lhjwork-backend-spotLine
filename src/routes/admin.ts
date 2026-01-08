import express, { Router } from "express";
import * as adminController from "../controllers/adminController";
import * as adminStoreController from "../controllers/adminStoreController";
import * as adminRecommendationController from "../controllers/adminRecommendationController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: 관리자 인증 및 관리 API
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: 관리자 로그인
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 사용자명 또는 이메일
 *               password:
 *                 type: string
 *                 description: 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공
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
 *                         admin:
 *                           $ref: '#/components/schemas/Admin'
 *                         token:
 *                           type: string
 *                         expiresIn:
 *                           type: string
 *       401:
 *         description: 잘못된 로그인 정보
 *       400:
 *         description: 필수 필드 누락
 */
router.post("/login", adminController.login);

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: 관리자 프로필 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Admin'
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 관리자를 찾을 수 없음
 */
router.get("/profile", authenticateAdmin, adminController.getProfile);

/**
 * @swagger
 * /api/admin/create:
 *   post:
 *     summary: 관리자 계정 생성 (초기 설정용)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *                 default: admin
 *     responses:
 *       201:
 *         description: 관리자 계정 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Admin'
 *       409:
 *         description: 중복된 사용자명 또는 이메일
 *       400:
 *         description: 필수 필드 누락
 */
router.post("/create", adminController.createAdmin);

/**
 * @swagger
 * /api/admin/verify:
 *   get:
 *     summary: 토큰 검증
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 토큰 유효
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
 *                         admin:
 *                           $ref: '#/components/schemas/Admin'
 *       401:
 *         description: 토큰 무효
 */
/**
 * @swagger
 * /api/admin/list:
 *   get:
 *     summary: 관리자 목록 조회 (super_admin만 가능)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 결과 수
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, super_admin]
 *         description: 역할 필터
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: 활성화 상태 필터
 *     responses:
 *       200:
 *         description: 관리자 목록 조회 성공
 *       403:
 *         description: 권한 없음
 */
router.get("/verify", authenticateAdmin, adminController.verifyToken);

router.get("/list", authenticateAdmin, adminController.getAdminList);

/**
 * @swagger
 * /api/admin/{adminId}/permissions:
 *   patch:
 *     summary: 관리자 권한 업데이트 (super_admin만 가능)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: 관리자 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 권한 업데이트 성공
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 관리자를 찾을 수 없음
 */
router.patch("/:adminId/permissions", authenticateAdmin, adminController.updatePermissions);

// 관리자용 매장 관리 API
/**
 * @swagger
 * /api/admin/stores:
 *   get:
 *     summary: 관리자용 매장 목록 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         description: 지역 필터
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: 활성화 상태 필터
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 결과 수
 *     responses:
 *       200:
 *         description: 매장 목록 조회 성공
 */
router.get("/stores", authenticateAdmin, adminStoreController.getAdminStores);

/**
 * @swagger
 * /api/admin/stores:
 *   post:
 *     summary: 관리자용 매장 생성
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *               category:
 *                 type: string
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
 *         description: 매장 생성 성공
 */
router.post("/stores", authenticateAdmin, adminStoreController.createAdminStore);

/**
 * @swagger
 * /api/admin/stores/{id}:
 *   put:
 *     summary: 관리자용 매장 수정
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 매장 수정 성공
 */
router.put("/stores/:id", authenticateAdmin, adminStoreController.updateAdminStore);

/**
 * @swagger
 * /api/admin/stores/{id}:
 *   delete:
 *     summary: 관리자용 매장 삭제
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 매장 삭제 성공
 */
router.delete("/stores/:id", authenticateAdmin, adminStoreController.deleteAdminStore);

/**
 * @swagger
 * /api/admin/stores/{id}/toggle:
 *   patch:
 *     summary: 매장 상태 변경 (활성화/비활성화)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 매장 상태 변경 성공
 */
router.patch("/stores/:id/toggle", authenticateAdmin, adminStoreController.toggleStoreStatus);

/**
 * @swagger
 * /api/admin/stores/stats:
 *   get:
 *     summary: 매장 통계 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 매장 통계 조회 성공
 */
router.get("/stores/stats", authenticateAdmin, adminStoreController.getStoreStats);

// 관리자용 추천 관리 API
/**
 * @swagger
 * /api/admin/recommendations:
 *   get:
 *     summary: 관리자용 추천 목록 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromStore
 *         schema:
 *           type: string
 *         description: 출발 매장 ID
 *       - in: query
 *         name: toStore
 *         schema:
 *           type: string
 *         description: 도착 매장 ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: 활성화 상태 필터
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 결과 수
 *     responses:
 *       200:
 *         description: 추천 목록 조회 성공
 */
router.get("/recommendations", authenticateAdmin, adminRecommendationController.getAdminRecommendations);

/**
 * @swagger
 * /api/admin/recommendations:
 *   post:
 *     summary: 관리자용 추천 생성
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *               toStore:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               walkingTime:
 *                 type: number
 *               distance:
 *                 type: number
 *               priority:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 추천 생성 성공
 */
router.post("/recommendations", authenticateAdmin, adminRecommendationController.createAdminRecommendation);

/**
 * @swagger
 * /api/admin/recommendations/{id}:
 *   put:
 *     summary: 관리자용 추천 수정
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 추천 수정 성공
 */
router.put("/recommendations/:id", authenticateAdmin, adminRecommendationController.updateAdminRecommendation);

/**
 * @swagger
 * /api/admin/recommendations/{id}:
 *   delete:
 *     summary: 관리자용 추천 삭제
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 추천 삭제 성공
 */
router.delete("/recommendations/:id", authenticateAdmin, adminRecommendationController.deleteAdminRecommendation);

/**
 * @swagger
 * /api/admin/recommendations/{id}/toggle:
 *   patch:
 *     summary: 추천 상태 변경 (활성화/비활성화)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 추천 상태 변경 성공
 */
router.patch("/recommendations/:id/toggle", authenticateAdmin, adminRecommendationController.toggleRecommendationStatus);

/**
 * @swagger
 * /api/admin/recommendations/stats:
 *   get:
 *     summary: 추천 통계 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 추천 통계 조회 성공
 */
router.get("/recommendations/stats", authenticateAdmin, adminRecommendationController.getRecommendationStats);

/**
 * @swagger
 * /api/admin/stores/{storeId}/recommendations:
 *   get:
 *     summary: 특정 매장의 추천 목록 조회
 *     tags: [Admin]
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
 *         description: 매장별 추천 조회 성공
 */
router.get("/stores/:storeId/recommendations", authenticateAdmin, adminRecommendationController.getStoreRecommendations);

export default router;
