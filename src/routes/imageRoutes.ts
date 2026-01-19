import { Router } from "express";
import { authenticateAdmin } from "../middleware/adminAuth";
import { uploadSingle, uploadMultiple, handleUploadError } from "../middleware/imageUpload";
import * as imageController from "../controllers/imageController";

const router = Router();

// 모든 이미지 라우트에 관리자 인증 적용
router.use(authenticateAdmin);

/**
 * @swagger
 * /admin/stores/{storeId}/representative-image:
 *   post:
 *     summary: 대표 이미지 업로드
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
 *         description: 대표 이미지 업로드 성공
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
 *       400:
 *         description: 잘못된 요청 (파일 없음, 형식 오류, 크기 초과)
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 상점을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post("/:storeId/representative-image", uploadSingle, handleUploadError, imageController.uploadRepresentativeImage);

/**
 * @swagger
 * /admin/stores/{storeId}/images:
 *   post:
 *     summary: 갤러리 이미지 업로드 (다중)
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
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 업로드할 이미지 파일들 (최대 5개, JPG, PNG, WebP, 각각 최대 5MB)
 *     responses:
 *       200:
 *         description: 갤러리 이미지 업로드 성공
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
 *                     uploadedImages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           imageKey:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 상점을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post("/:storeId/images", uploadMultiple, handleUploadError, imageController.uploadGalleryImages);

/**
 * @swagger
 * /admin/stores/{storeId}/representative-image:
 *   delete:
 *     summary: 대표 이미지 삭제
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
 *     responses:
 *       200:
 *         description: 대표 이미지 삭제 성공
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 상점 또는 이미지를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete("/:storeId/representative-image", imageController.deleteRepresentativeImage);

/**
 * @swagger
 * /admin/stores/{storeId}/images/{imageKey}:
 *   delete:
 *     summary: 특정 갤러리 이미지 삭제
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
 *         description: 이미지 삭제 성공
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 상점 또는 이미지를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete("/:storeId/images/:imageKey", imageController.deleteGalleryImage);

export default router;