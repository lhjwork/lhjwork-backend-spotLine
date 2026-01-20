import express, { Router } from "express";
import { authenticateAdmin } from "../middleware/adminAuth";
import { AuthenticatedRequest } from "../types";

// 기존 어드민 라우터들 import
import adminRouter from "./admin";

// 새로운 Demo/Live 관리 라우터들
import * as adminDemoController from "../controllers/adminDemoController";
import * as adminLiveController from "../controllers/adminLiveController";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: 통합 어드민 관리 시스템
 */

// ==========================================
// 기존 어드민 기능들
// ==========================================

// 기본 어드민 기능 (로그인, 사용자 관리 등)
router.use("/", adminRouter);

// ==========================================
// Demo 시스템 관리
// ==========================================

/**
 * @swagger
 * /api/admin/demo/stores:
 *   get:
 *     summary: 데모 매장 목록 조회
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 데모 매장 목록 조회 성공
 *       401:
 *         description: 인증 실패
 */
router.get("/demo/stores", authenticateAdmin, adminDemoController.getDemoStores);

/**
 * @swagger
 * /api/admin/demo/stores/{storeId}:
 *   get:
 *     summary: 특정 데모 매장 조회
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
 *         description: 데모 매장 조회 성공
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.get("/demo/stores/:storeId", authenticateAdmin, adminDemoController.getDemoStore);

/**
 * @swagger
 * /api/admin/demo/stores:
 *   post:
 *     summary: 새 데모 매장 생성
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *               representativeImage:
 *                 type: string
 *     responses:
 *       201:
 *         description: 데모 매장 생성 성공
 *       401:
 *         description: 인증 실패
 */
router.post("/demo/stores", authenticateAdmin, adminDemoController.createDemoStore);

/**
 * @swagger
 * /api/admin/demo/stores/{storeId}:
 *   put:
 *     summary: 데모 매장 수정
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
 *         description: 데모 매장 수정 성공
 *       401:
 *         description: 인증 실패
 */
router.put("/demo/stores/:storeId", authenticateAdmin, adminDemoController.updateDemoStore);

/**
 * @swagger
 * /api/admin/demo/stores/{storeId}:
 *   delete:
 *     summary: 데모 매장 삭제
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
 *         description: 데모 매장 삭제 성공
 *       401:
 *         description: 인증 실패
 */
router.delete("/demo/stores/:storeId", authenticateAdmin, adminDemoController.deleteDemoStore);

// Demo 추천 관리
router.get("/demo/recommendations", authenticateAdmin, adminDemoController.getDemoRecommendations);
router.post("/demo/recommendations", authenticateAdmin, adminDemoController.createDemoRecommendation);
router.put("/demo/recommendations/:id", authenticateAdmin, adminDemoController.updateDemoRecommendation);
router.delete("/demo/recommendations/:id", authenticateAdmin, adminDemoController.deleteDemoRecommendation);

// Demo 설정 관리
router.get("/demo/settings", authenticateAdmin, adminDemoController.getDemoSettings);
router.put("/demo/settings", authenticateAdmin, adminDemoController.updateDemoSettings);

// ==========================================
// Live 시스템 관리
// ==========================================

/**
 * @swagger
 * /api/admin/live/stores:
 *   get:
 *     summary: 실제 매장 목록 조회 (어드민)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, suspended, closed]
 *     responses:
 *       200:
 *         description: 실제 매장 목록 조회 성공
 *       401:
 *         description: 인증 실패
 */
router.get("/live/stores", authenticateAdmin, adminLiveController.getLiveStores);

/**
 * @swagger
 * /api/admin/live/stores/{storeId}:
 *   get:
 *     summary: 특정 실제 매장 조회 (어드민)
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
 *         description: 실제 매장 조회 성공
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.get("/live/stores/:storeId", authenticateAdmin, adminLiveController.getLiveStore);

/**
 * @swagger
 * /api/admin/live/stores/{storeId}/approve:
 *   post:
 *     summary: 매장 승인 (어드민 전용)
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
 *         description: 매장 승인 성공
 *       401:
 *         description: 인증 실패
 */
router.post("/live/stores/:storeId/approve", authenticateAdmin, adminLiveController.approveStore);

/**
 * @swagger
 * /api/admin/live/stores/{storeId}/suspend:
 *   post:
 *     summary: 매장 정지 (어드민 전용)
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
 *         description: 매장 정지 성공
 *       401:
 *         description: 인증 실패
 */
router.post("/live/stores/:storeId/suspend", authenticateAdmin, adminLiveController.suspendStore);

// Live 추천 관리
router.get("/live/recommendations", authenticateAdmin, adminLiveController.getLiveRecommendations);
router.post("/live/recommendations", authenticateAdmin, adminLiveController.createLiveRecommendation);
router.put("/live/recommendations/:id", authenticateAdmin, adminLiveController.updateLiveRecommendation);
router.delete("/live/recommendations/:id", authenticateAdmin, adminLiveController.deleteLiveRecommendation);

// Live 분석 데이터
router.get("/live/analytics", authenticateAdmin, adminLiveController.getLiveAnalytics);
router.get("/live/analytics/stores/:storeId", authenticateAdmin, adminLiveController.getStoreAnalytics);

// Live 설정 관리
router.get("/live/settings", authenticateAdmin, adminLiveController.getLiveSettings);
router.put("/live/settings", authenticateAdmin, adminLiveController.updateLiveSettings);

// ==========================================
// Live 시스템 이미지 업로드
// ==========================================

// 이미지 업로드 미들웨어 import
import { uploadSingle, uploadMultiple, handleUploadError } from "../middleware/imageUpload";
import * as imageController from "../controllers/imageController";

/**
 * @swagger
 * /api/admin/live/stores/{storeId}/main-banner-images:
 *   post:
 *     summary: Live 매장 메인 배너 이미지 업로드 (최대 5개)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 매장 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 메인 배너 이미지 업로드 성공
 *       400:
 *         description: 잘못된 요청 (최대 5개 제한)
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 매장을 찾을 수 없음
 */
router.post("/live/stores/:storeId/main-banner-images", authenticateAdmin, uploadSingle, handleUploadError, imageController.uploadMainBannerImage);

/**
 * @swagger
 * /api/admin/live/stores/{storeId}/main-banner-images/{imageKey}:
 *   delete:
 *     summary: Live 매장 메인 배너 이미지 삭제
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 매장 ID
 *       - in: path
 *         name: imageKey
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 이미지의 S3 키 (URL 인코딩 필요)
 *     responses:
 *       200:
 *         description: 메인 배너 이미지 삭제 성공
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 매장 또는 이미지를 찾을 수 없음
 */
router.delete("/live/stores/:storeId/main-banner-images/:imageKey", authenticateAdmin, imageController.deleteMainBannerImage);

// ==========================================
// 시스템 관리
// ==========================================

/**
 * @swagger
 * /api/admin/system/health:
 *   get:
 *     summary: 시스템 상태 확인 (어드민)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 시스템 상태 확인 성공
 */
router.get("/system/health", authenticateAdmin, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    message: "어드민 시스템이 정상 작동 중입니다.",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      systems: {
        demo: "active",
        live: "active",
        admin: "active"
      },
      admin: req.admin ? {
        adminId: req.admin.adminId,
        type: req.admin.type
      } : null
    }
  });
});

/**
 * @swagger
 * /api/admin/system/stats:
 *   get:
 *     summary: 전체 시스템 통계 (어드민)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 시스템 통계 조회 성공
 */
router.get("/system/stats", authenticateAdmin, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    message: "시스템 통계를 성공적으로 가져왔습니다.",
    data: {
      demo: {
        stores: 1,
        recommendations: 4,
        lastUpdated: new Date().toISOString()
      },
      live: {
        stores: 2,
        activeStores: 2,
        pendingStores: 0,
        totalViews: 2139,
        totalQRScans: 290,
        lastUpdated: new Date().toISOString()
      },
      admin: {
        totalAdmins: 1,
        lastLogin: new Date().toISOString(),
        currentAdmin: req.admin?.adminId
      }
    }
  });
});

export default router;