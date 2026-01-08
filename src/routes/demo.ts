import express, { Router } from "express";
import * as demoController from "../controllers/demoController";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Demo
 *   description: 데모 시스템 API V2.0 (백엔드 연동)
 */

/**
 * @swagger
 * /api/demo/store:
 *   get:
 *     summary: 데모 매장 및 근처 Spot 조회
 *     tags: [Demo]
 *     description: SpotLine 데모 시스템의 메인 API. 데모 매장 정보와 4개의 근처 추천 Spot을 반환합니다.
 *     responses:
 *       200:
 *         description: 데모 데이터 조회 성공
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
 *                         store:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "demo-store"
 *                             name:
 *                               type: string
 *                               example: "아늑한 카페 스토리"
 *                             shortDescription:
 *                               type: string
 *                               example: "따뜻한 분위기의 동네 카페"
 *                             representativeImage:
 *                               type: string
 *                               example: "/demo/cafe-001.jpg"
 *                             category:
 *                               type: string
 *                               example: "cafe"
 *                             location:
 *                               type: object
 *                               properties:
 *                                 address:
 *                                   type: string
 *                                   example: "서울시 강남구 테헤란로 123"
 *                                 coordinates:
 *                                   type: array
 *                                   items:
 *                                     type: number
 *                                   example: [127.0276, 37.4979]
 *                             qrCode:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   example: "demo_cafe_001"
 *                                 isActive:
 *                                   type: boolean
 *                                   example: true
 *                             spotlineStory:
 *                               type: object
 *                               properties:
 *                                 title:
 *                                   type: string
 *                                   example: "커피 한 잔의 여유"
 *                                 content:
 *                                   type: string
 *                                   example: "바쁜 일상 속에서 잠시 멈춰 서서..."
 *                                 tags:
 *                                   type: array
 *                                   items:
 *                                     type: string
 *                                   example: ["커피", "휴식", "분위기", "수제디저트"]
 *                             externalLinks:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   type:
 *                                     type: string
 *                                     example: "instagram"
 *                                   url:
 *                                     type: string
 *                                     example: "https://instagram.com/demo_cafe"
 *                                   title:
 *                                     type: string
 *                                     example: "인스타그램"
 *                             demoNotice:
 *                               type: string
 *                               example: "이것은 SpotLine 서비스 소개용 데모입니다."
 *                         nextSpots:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "demo_bakery_001"
 *                               name:
 *                                 type: string
 *                                 example: "달콤한 베이커리"
 *                               shortDescription:
 *                                 type: string
 *                                 example: "갓 구운 빵의 향기"
 *                               representativeImage:
 *                                 type: string
 *                                 example: "/demo/bakery-001.jpg"
 *                               category:
 *                                 type: string
 *                                 example: "bakery"
 *                               distance:
 *                                 type: number
 *                                 example: 150
 *                               walkingTime:
 *                                 type: number
 *                                 example: 2
 *                               spotlineStory:
 *                                 type: object
 *                                 properties:
 *                                   title:
 *                                     type: string
 *                                     example: "갓 구운 빵의 행복"
 *                                   content:
 *                                     type: string
 *                                     example: "매일 새벽부터 정성스럽게..."
 *                     meta:
 *                       type: object
 *                       properties:
 *                         isDemo:
 *                           type: boolean
 *                           example: true
 *                         scenario:
 *                           type: string
 *                           example: "cafe"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-08T10:30:00.000Z"
 *       500:
 *         description: 서버 오류
 */
router.get("/store", demoController.getDemoStore);

/**
 * @swagger
 * /api/demo/health:
 *   get:
 *     summary: 데모 시스템 상태 확인
 *     tags: [Demo]
 *     description: 데모 시스템의 상태와 버전 정보를 확인합니다.
 *     responses:
 *       200:
 *         description: 데모 시스템 상태 확인 성공
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
 *                         status:
 *                           type: string
 *                           example: "healthy"
 *                         version:
 *                           type: string
 *                           example: "2.0"
 *                         dataVersion:
 *                           type: string
 *                           example: "cafe-v1"
 *                         lastUpdated:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-08T10:00:00.000Z"
 *       500:
 *         description: 서버 오류
 */
router.get("/health", demoController.getDemoHealth);

export default router;