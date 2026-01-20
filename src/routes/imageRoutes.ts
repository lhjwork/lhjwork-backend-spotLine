import { Router } from "express";
import { authenticateAdmin } from "../middleware/adminAuth";
import { uploadSingle, handleUploadError } from "../middleware/imageUpload";
import * as imageController from "../controllers/imageController";

const router = Router();

// 모든 이미지 라우트에 관리자 인증 적용
router.use(authenticateAdmin);

/**
 * @swagger
 * /admin/stores/{storeId}/main-banner-images:
 *   post:
 *     summary: 메인 배너 이미지 업로드 (최대 5개)
 *     tags: [Admin Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상점 ID
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
 *                 description: 업로드할 이미지 파일 (JPG, PNG, WebP, 최대 5MB)
 *     responses:
 *       200:
 *         description: 메인 배너 이미지 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageKey:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *                     totalMainBannerImages:
 *                       type: number
 *       400:
 *         description: 잘못된 요청 (파일 없음, 형식 오류, 크기 초과, 최대 5개 제한)
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 상점을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post("/:storeId/main-banner-images", uploadSingle, handleUploadError, imageController.uploadMainBannerImage);

/**
 * @swagger
 * /admin/stores/{storeId}/main-banner-images/{imageKey}:
 *   delete:
 *     summary: 메인 배너 이미지 삭제
 *     tags: [Admin Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상점 ID
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
 *         description: 상점 또는 이미지를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete("/:storeId/main-banner-images/:imageKey", imageController.deleteMainBannerImage);

export default router;