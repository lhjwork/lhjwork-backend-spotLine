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
router.get("/verify", authenticateAdmin, adminController.verifyToken);

export default router;
