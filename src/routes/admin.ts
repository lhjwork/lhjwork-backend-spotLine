import express, { Router } from "express";
import * as adminController from "../controllers/adminController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: 관리자 인증 및 관리 API
 */

// ==================== 인증 관련 API ====================

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
 *       401:
 *         description: 토큰 무효
 */
router.get("/verify", authenticateAdmin, adminController.verifyToken);

// ==================== 매장 관리 API ====================

/**
 * @swagger
 * /api/admin/stores:
 *   get:
 *     summary: 매장 목록 조회 (관리자용)
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
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어 (매장명, 주소)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: 상태 필터
 *     responses:
 *       200:
 *         description: 매장 목록 조회 성공
 *       401:
 *         description: 인증 실패
 */
router.get("/stores", authenticateAdmin, adminController.getStores);

/**
 * @swagger
 * /api/admin/stores/{id}:
 *   get:
 *     summary: 매장 상세 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 매장 ID
 *     responses:
 *       200:
 *         description: 매장 상세 조회 성공
 *       404:
 *         description: 매장을 찾을 수 없음
 *       401:
 *         description: 인증 실패
 */
router.get("/stores/:id", authenticateAdmin, adminController.getStore);

/**
 * @swagger
 * /api/admin/stores:
 *   post:
 *     summary: 매장 생성
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
 *               - address
 *               - coordinates
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               address:
 *                 type: string
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               phone:
 *                 type: string
 *               description:
 *                 type: string
 *               operatingHours:
 *                 type: object
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 매장 생성 성공
 *       400:
 *         description: 잘못된 요청 데이터
 *       401:
 *         description: 인증 실패
 */
router.post("/stores", authenticateAdmin, adminController.createStore);

/**
 * @swagger
 * /api/admin/stores/{id}:
 *   put:
 *     summary: 매장 수정
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 매장 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               address:
 *                 type: string
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               phone:
 *                 type: string
 *               description:
 *                 type: string
 *               operatingHours:
 *                 type: object
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 매장 수정 성공
 *       404:
 *         description: 매장을 찾을 수 없음
 *       400:
 *         description: 잘못된 요청 데이터
 *       401:
 *         description: 인증 실패
 */
router.put("/stores/:id", authenticateAdmin, adminController.updateStore);

/**
 * @swagger
 * /api/admin/stores/{id}:
 *   delete:
 *     summary: 매장 삭제
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 매장 ID
 *     responses:
 *       200:
 *         description: 매장 삭제 성공
 *       404:
 *         description: 매장을 찾을 수 없음
 *       401:
 *         description: 인증 실패
 */
router.delete("/stores/:id", authenticateAdmin, adminController.deleteStore);

// ==================== 추천 관리 API ====================

/**
 * @swagger
 * /api/admin/recommendations:
 *   get:
 *     summary: 추천 목록 조회 (관리자용)
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
 *         description: 페이지당 항목 수
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
 *     responses:
 *       200:
 *         description: 추천 목록 조회 성공
 *       401:
 *         description: 인증 실패
 */
router.get("/recommendations", authenticateAdmin, adminController.getRecommendations);

/**
 * @swagger
 * /api/admin/recommendations/{id}:
 *   get:
 *     summary: 추천 상세 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 추천 ID
 *     responses:
 *       200:
 *         description: 추천 상세 조회 성공
 *       404:
 *         description: 추천을 찾을 수 없음
 *       401:
 *         description: 인증 실패
 */
router.get("/recommendations/:id", authenticateAdmin, adminController.getRecommendation);

/**
 * @swagger
 * /api/admin/recommendations:
 *   post:
 *     summary: 추천 생성
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
 *               - fromStoreId
 *               - toStoreId
 *               - priority
 *             properties:
 *               fromStoreId:
 *                 type: string
 *               toStoreId:
 *                 type: string
 *               priority:
 *                 type: integer
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 추천 생성 성공
 *       400:
 *         description: 잘못된 요청 데이터
 *       401:
 *         description: 인증 실패
 */
router.post("/recommendations", authenticateAdmin, adminController.createRecommendation);

/**
 * @swagger
 * /api/admin/recommendations/{id}:
 *   put:
 *     summary: 추천 수정
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 추천 ID
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
 *               priority:
 *                 type: integer
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 추천 수정 성공
 *       404:
 *         description: 추천을 찾을 수 없음
 *       400:
 *         description: 잘못된 요청 데이터
 *       401:
 *         description: 인증 실패
 */
router.put("/recommendations/:id", authenticateAdmin, adminController.updateRecommendation);

/**
 * @swagger
 * /api/admin/recommendations/{id}:
 *   delete:
 *     summary: 추천 삭제
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 추천 ID
 *     responses:
 *       200:
 *         description: 추천 삭제 성공
 *       404:
 *         description: 추천을 찾을 수 없음
 *       401:
 *         description: 인증 실패
 */
router.delete("/recommendations/:id", authenticateAdmin, adminController.deleteRecommendation);

// ==================== 분석 및 통계 API ====================

/**
 * @swagger
 * /api/admin/analytics/dashboard:
 *   get:
 *     summary: 대시보드 통계 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대시보드 통계 조회 성공
 *       401:
 *         description: 인증 실패
 */
router.get("/analytics/dashboard", authenticateAdmin, adminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/analytics/stores:
 *   get:
 *     summary: 매장별 통계 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         description: 특정 매장 ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: 통계 기간
 *     responses:
 *       200:
 *         description: 매장별 통계 조회 성공
 *       401:
 *         description: 인증 실패
 */
router.get("/analytics/stores", authenticateAdmin, adminController.getStoreAnalytics);

export default router;
