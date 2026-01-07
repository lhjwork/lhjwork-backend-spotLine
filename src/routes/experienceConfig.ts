import express, { Router } from "express";
import * as experienceConfigController from "../controllers/experienceConfigController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ExperienceConfig
 *   description: SpotLine 체험 설정 관리 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ExperienceConfig:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           description: 설정 이름
 *         description:
 *           type: string
 *           description: 설정 설명
 *         type:
 *           type: string
 *           enum: [fixed, random, area_based, weighted]
 *           description: 체험 타입
 *         isActive:
 *           type: boolean
 *           description: 활성화 상태
 *         isDefault:
 *           type: boolean
 *           description: 기본 설정 여부
 *         settings:
 *           type: object
 *           description: 타입별 상세 설정
 *         priority:
 *           type: number
 *           description: 우선순위
 *         usageCount:
 *           type: number
 *           description: 사용 횟수
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/admin/experience-configs:
 *   get:
 *     summary: 모든 체험 설정 조회
 *     tags: [ExperienceConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: 활성화 상태 필터
 *     responses:
 *       200:
 *         description: 체험 설정 목록 조회 성공
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
 *                         $ref: '#/components/schemas/ExperienceConfig'
 */
router.get("/", authenticateAdmin, experienceConfigController.getAllExperienceConfigs);

/**
 * @swagger
 * /api/admin/experience-configs/default:
 *   get:
 *     summary: 기본 체험 설정 조회
 *     tags: [ExperienceConfig]
 *     responses:
 *       200:
 *         description: 기본 체험 설정 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ExperienceConfig'
 */
router.get("/default", experienceConfigController.getDefaultExperienceConfig);

/**
 * @swagger
 * /api/admin/experience-configs/{id}:
 *   get:
 *     summary: 특정 체험 설정 조회
 *     tags: [ExperienceConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 체험 설정 ID
 *     responses:
 *       200:
 *         description: 체험 설정 조회 성공
 *       404:
 *         description: 체험 설정을 찾을 수 없음
 */
router.get("/:id", authenticateAdmin, experienceConfigController.getExperienceConfigById);

/**
 * @swagger
 * /api/admin/experience-configs:
 *   post:
 *     summary: 새 체험 설정 생성
 *     tags: [ExperienceConfig]
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
 *               - type
 *               - settings
 *             properties:
 *               name:
 *                 type: string
 *                 description: 설정 이름
 *               description:
 *                 type: string
 *                 description: 설정 설명
 *               type:
 *                 type: string
 *                 enum: [fixed, random, area_based, weighted]
 *                 description: 체험 타입
 *               isDefault:
 *                 type: boolean
 *                 description: 기본 설정 여부
 *               settings:
 *                 type: object
 *                 description: 타입별 상세 설정
 *               priority:
 *                 type: number
 *                 description: 우선순위
 *     responses:
 *       201:
 *         description: 체험 설정 생성 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post("/", authenticateAdmin, experienceConfigController.createExperienceConfig);

/**
 * @swagger
 * /api/admin/experience-configs/{id}:
 *   put:
 *     summary: 체험 설정 수정
 *     tags: [ExperienceConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 체험 설정 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [fixed, random, area_based, weighted]
 *               isActive:
 *                 type: boolean
 *               isDefault:
 *                 type: boolean
 *               settings:
 *                 type: object
 *               priority:
 *                 type: number
 *     responses:
 *       200:
 *         description: 체험 설정 수정 성공
 *       404:
 *         description: 체험 설정을 찾을 수 없음
 */
router.put("/:id", authenticateAdmin, experienceConfigController.updateExperienceConfig);

/**
 * @swagger
 * /api/admin/experience-configs/{id}:
 *   delete:
 *     summary: 체험 설정 삭제 (비활성화)
 *     tags: [ExperienceConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 체험 설정 ID
 *     responses:
 *       200:
 *         description: 체험 설정 삭제 성공
 *       404:
 *         description: 체험 설정을 찾을 수 없음
 */
router.delete("/:id", authenticateAdmin, experienceConfigController.deleteExperienceConfig);

/**
 * @swagger
 * /api/admin/experience-configs/{id}/set-default:
 *   patch:
 *     summary: 기본 설정으로 지정
 *     tags: [ExperienceConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 체험 설정 ID
 *     responses:
 *       200:
 *         description: 기본 설정 지정 성공
 *       404:
 *         description: 체험 설정을 찾을 수 없음
 */
router.patch("/:id/set-default", authenticateAdmin, experienceConfigController.setAsDefault);

/**
 * @swagger
 * /api/admin/experience-configs/{id}/preview:
 *   get:
 *     summary: 체험 설정 미리보기
 *     tags: [ExperienceConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 체험 설정 ID
 *       - in: query
 *         name: testCount
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: 테스트 횟수
 *     responses:
 *       200:
 *         description: 미리보기 성공
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
 *                         config:
 *                           type: object
 *                         testCount:
 *                           type: number
 *                         results:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               qrId:
 *                                 type: string
 *                               storeName:
 *                                 type: string
 *                               area:
 *                                 type: string
 *                               count:
 *                                 type: number
 *                               percentage:
 *                                 type: string
 */
router.get("/:id/preview", authenticateAdmin, experienceConfigController.previewExperienceConfig);

export default router;
