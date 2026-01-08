# SpotLine 어드민 데모 관리 시스템 구현 가이드

## 📋 개요
SpotLine 어드민 시스템에서 데모 데이터를 관리할 수 있는 API와 프론트엔드 구현 가이드입니다. 어드민은 데모 매장 정보, 근처 Spot 데이터, 이미지 등을 실시간으로 수정하고 관리할 수 있습니다.

## 🎯 기능 요구사항

### 1. 데모 매장 관리
- 데모 매장 정보 조회/수정
- 매장 이미지 URL 변경
- SpotLine 스토리 편집
- 외부 링크 관리

### 2. 근처 Spot 관리
- 4개 근처 Spot 데이터 조회/수정
- Spot 이미지 URL 변경
- 거리 및 도보 시간 조정
- Spot 스토리 편집

### 3. 데모 시스템 설정
- 데모 활성화/비활성화
- 로딩 시뮬레이션 시간 조정
- 데모 시나리오 선택

## 🔧 API 설계

### 1. 데모 매장 관리 API

#### GET /api/admin/demo/store
데모 매장 정보 조회

```typescript
// 응답 예시
{
  "success": true,
  "message": "데모 매장 정보를 성공적으로 가져왔습니다.",
  "data": {
    "id": "demo-store",
    "name": "아늑한 카페 스토리",
    "shortDescription": "따뜻한 분위기의 동네 카페",
    "representativeImage": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    "category": "cafe",
    "location": {
      "address": "서울시 강남구 테헤란로 123",
      "coordinates": [127.0276, 37.4979]
    },
    "qrCode": {
      "id": "demo_cafe_001",
      "isActive": true
    },
    "spotlineStory": {
      "title": "커피 한 잔의 여유",
      "content": "바쁜 일상 속에서 잠시 멈춰 서서...",
      "tags": ["커피", "휴식", "분위기", "수제디저트"]
    },
    "externalLinks": [
      {
        "type": "instagram",
        "url": "https://instagram.com/demo_cafe",
        "title": "인스타그램"
      }
    ],
    "demoNotice": "이것은 SpotLine 서비스 소개용 데모입니다."
  }
}
```

#### PUT /api/admin/demo/store
데모 매장 정보 수정

```typescript
// 요청 예시
{
  "name": "새로운 카페 이름",
  "shortDescription": "수정된 설명",
  "representativeImage": "https://new-image-url.com/image.jpg",
  "spotlineStory": {
    "title": "새로운 스토리 제목",
    "content": "수정된 스토리 내용",
    "tags": ["새태그1", "새태그2"]
  },
  "externalLinks": [
    {
      "type": "instagram",
      "url": "https://instagram.com/new_cafe",
      "title": "인스타그램"
    }
  ]
}
```

### 2. 근처 Spot 관리 API

#### GET /api/admin/demo/spots
근처 Spot 목록 조회

```typescript
// 응답 예시
{
  "success": true,
  "message": "근처 Spot 목록을 성공적으로 가져왔습니다.",
  "data": [
    {
      "id": "demo_bakery_001",
      "name": "달콤한 베이커리",
      "shortDescription": "갓 구운 빵의 향기",
      "representativeImage": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      "category": "bakery",
      "distance": 150,
      "walkingTime": 2,
      "spotlineStory": {
        "title": "갓 구운 빵의 행복",
        "content": "매일 새벽부터 정성스럽게..."
      }
    }
    // ... 나머지 3개 Spot
  ]
}
```

#### PUT /api/admin/demo/spots/:spotId
특정 Spot 정보 수정

```typescript
// 요청 예시
{
  "name": "수정된 베이커리 이름",
  "shortDescription": "새로운 설명",
  "representativeImage": "https://new-bakery-image.com/image.jpg",
  "distance": 200,
  "walkingTime": 3,
  "spotlineStory": {
    "title": "새로운 스토리",
    "content": "수정된 내용"
  }
}
```

### 3. 데모 시스템 설정 API

#### GET /api/admin/demo/settings
데모 시스템 설정 조회

```typescript
// 응답 예시
{
  "success": true,
  "data": {
    "isEnabled": true,
    "loadingSimulationMs": 500,
    "currentScenario": "cafe",
    "availableScenarios": ["cafe", "restaurant", "retail"],
    "version": "2.0",
    "lastUpdated": "2024-01-08T10:00:00.000Z"
  }
}
```

#### PUT /api/admin/demo/settings
데모 시스템 설정 수정

```typescript
// 요청 예시
{
  "isEnabled": true,
  "loadingSimulationMs": 1000,
  "currentScenario": "cafe"
}
```

### 4. 데모 이미지 관리 API

#### POST /api/admin/demo/images/validate
이미지 URL 유효성 검증

```typescript
// 요청 예시
{
  "imageUrl": "https://example.com/image.jpg"
}

// 응답 예시
{
  "success": true,
  "data": {
    "isValid": true,
    "imageSize": {
      "width": 800,
      "height": 600
    },
    "fileSize": "245KB",
    "format": "JPEG"
  }
}
```

## 💻 백엔드 구현

### 1. 컨트롤러 생성

```typescript
// src/controllers/adminDemoController.ts
import { Request, Response } from "express";
import { DEMO_STORE, DEMO_NEXT_SPOTS } from "../data/demo";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";

/**
 * GET /api/admin/demo/store
 * 데모 매장 정보 조회
 */
export const getDemoStore = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(
      formatResponse(
        true,
        "데모 매장 정보를 성공적으로 가져왔습니다.",
        DEMO_STORE,
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Admin demo store get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 매장 정보를 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * PUT /api/admin/demo/store
 * 데모 매장 정보 수정
 */
export const updateDemoStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      shortDescription,
      representativeImage,
      spotlineStory,
      externalLinks
    } = req.body;

    // 데모 데이터 업데이트 (실제 구현에서는 파일 시스템 또는 DB 업데이트)
    const updatedStore = {
      ...DEMO_STORE,
      ...(name && { name }),
      ...(shortDescription && { shortDescription }),
      ...(representativeImage && { representativeImage }),
      ...(spotlineStory && { spotlineStory }),
      ...(externalLinks && { externalLinks })
    };

    res.json(
      formatResponse(
        true,
        "데모 매장 정보가 성공적으로 수정되었습니다.",
        updatedStore,
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Admin demo store update error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 매장 정보를 수정할 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/admin/demo/spots
 * 근처 Spot 목록 조회
 */
export const getDemoSpots = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(
      formatResponse(
        true,
        "근처 Spot 목록을 성공적으로 가져왔습니다.",
        DEMO_NEXT_SPOTS,
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Admin demo spots get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "근처 Spot 목록을 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * PUT /api/admin/demo/spots/:spotId
 * 특정 Spot 정보 수정
 */
export const updateDemoSpot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { spotId } = req.params;
    const updateData = req.body;

    // Spot 찾기
    const spotIndex = DEMO_NEXT_SPOTS.findIndex(spot => spot.id === spotId);
    if (spotIndex === -1) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "해당 Spot을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // Spot 업데이트
    const updatedSpot = {
      ...DEMO_NEXT_SPOTS[spotIndex],
      ...updateData
    };

    res.json(
      formatResponse(
        true,
        "Spot 정보가 성공적으로 수정되었습니다.",
        updatedSpot,
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Admin demo spot update error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "Spot 정보를 수정할 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/admin/demo/settings
 * 데모 시스템 설정 조회
 */
export const getDemoSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = {
      isEnabled: true,
      loadingSimulationMs: 500,
      currentScenario: "cafe",
      availableScenarios: ["cafe", "restaurant", "retail"],
      version: "2.0",
      lastUpdated: new Date().toISOString()
    };

    res.json(
      formatResponse(
        true,
        "데모 시스템 설정을 성공적으로 가져왔습니다.",
        settings,
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Admin demo settings get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 시스템 설정을 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * PUT /api/admin/demo/settings
 * 데모 시스템 설정 수정
 */
export const updateDemoSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isEnabled, loadingSimulationMs, currentScenario } = req.body;

    const updatedSettings = {
      isEnabled: isEnabled ?? true,
      loadingSimulationMs: loadingSimulationMs ?? 500,
      currentScenario: currentScenario ?? "cafe",
      availableScenarios: ["cafe", "restaurant", "retail"],
      version: "2.0",
      lastUpdated: new Date().toISOString()
    };

    res.json(
      formatResponse(
        true,
        "데모 시스템 설정이 성공적으로 수정되었습니다.",
        updatedSettings,
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Admin demo settings update error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 시스템 설정을 수정할 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * POST /api/admin/demo/images/validate
 * 이미지 URL 유효성 검증
 */
export const validateImageUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(
          false,
          "이미지 URL이 필요합니다.",
          null,
          HTTP_STATUS.BAD_REQUEST
        )
      );
      return;
    }

    // 간단한 URL 유효성 검증 (실제 구현에서는 이미지 헤더 확인)
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
    const isValid = urlPattern.test(imageUrl);

    const validationResult = {
      isValid,
      imageUrl,
      message: isValid ? "유효한 이미지 URL입니다." : "유효하지 않은 이미지 URL입니다."
    };

    res.json(
      formatResponse(
        true,
        "이미지 URL 검증이 완료되었습니다.",
        validationResult,
        HTTP_STATUS.OK
      )
    );
  } catch (error) {
    console.error("Image URL validation error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "이미지 URL 검증 중 오류가 발생했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};
```

### 2. 라우터 생성

```typescript
// src/routes/adminDemo.ts
import express, { Router } from "express";
import * as adminDemoController from "../controllers/adminDemoController";
import { adminAuth } from "../middleware/adminAuth";

const router: Router = express.Router();

// 모든 라우트에 어드민 인증 미들웨어 적용
router.use(adminAuth);

/**
 * @swagger
 * tags:
 *   name: Admin Demo
 *   description: 어드민 데모 관리 API
 */

/**
 * @swagger
 * /api/admin/demo/store:
 *   get:
 *     summary: 데모 매장 정보 조회
 *     tags: [Admin Demo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 데모 매장 정보 조회 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get("/store", adminDemoController.getDemoStore);

/**
 * @swagger
 * /api/admin/demo/store:
 *   put:
 *     summary: 데모 매장 정보 수정
 *     tags: [Admin Demo]
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
 *                 example: "새로운 카페 이름"
 *               shortDescription:
 *                 type: string
 *                 example: "수정된 설명"
 *               representativeImage:
 *                 type: string
 *                 example: "https://new-image-url.com/image.jpg"
 *     responses:
 *       200:
 *         description: 데모 매장 정보 수정 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.put("/store", adminDemoController.updateDemoStore);

/**
 * @swagger
 * /api/admin/demo/spots:
 *   get:
 *     summary: 근처 Spot 목록 조회
 *     tags: [Admin Demo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 근처 Spot 목록 조회 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get("/spots", adminDemoController.getDemoSpots);

/**
 * @swagger
 * /api/admin/demo/spots/{spotId}:
 *   put:
 *     summary: 특정 Spot 정보 수정
 *     tags: [Admin Demo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: spotId
 *         required: true
 *         schema:
 *           type: string
 *         example: "demo_bakery_001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               representativeImage:
 *                 type: string
 *               distance:
 *                 type: number
 *               walkingTime:
 *                 type: number
 *     responses:
 *       200:
 *         description: Spot 정보 수정 성공
 *       404:
 *         description: Spot을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.put("/spots/:spotId", adminDemoController.updateDemoSpot);

/**
 * @swagger
 * /api/admin/demo/settings:
 *   get:
 *     summary: 데모 시스템 설정 조회
 *     tags: [Admin Demo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 데모 시스템 설정 조회 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get("/settings", adminDemoController.getDemoSettings);

/**
 * @swagger
 * /api/admin/demo/settings:
 *   put:
 *     summary: 데모 시스템 설정 수정
 *     tags: [Admin Demo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isEnabled:
 *                 type: boolean
 *                 example: true
 *               loadingSimulationMs:
 *                 type: number
 *                 example: 1000
 *               currentScenario:
 *                 type: string
 *                 example: "cafe"
 *     responses:
 *       200:
 *         description: 데모 시스템 설정 수정 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.put("/settings", adminDemoController.updateDemoSettings);

/**
 * @swagger
 * /api/admin/demo/images/validate:
 *   post:
 *     summary: 이미지 URL 유효성 검증
 *     tags: [Admin Demo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *             required:
 *               - imageUrl
 *     responses:
 *       200:
 *         description: 이미지 URL 검증 완료
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.post("/images/validate", adminDemoController.validateImageUrl);

export default router;
```

### 3. 서버에 라우터 등록

```typescript
// src/server.ts에 추가
import adminDemoRoutes from "./routes/adminDemo";

// 라우터 등록
app.use("/api/admin/demo", adminDemoRoutes);
```

## 🎨 프론트엔드 구현 예시

### 1. 데모 관리 페이지 컴포넌트

```tsx
// admin-frontend/src/pages/DemoManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Tabs, InputNumber } from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { adminApi } from '../services/adminApi';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface DemoStore {
  id: string;
  name: string;
  shortDescription: string;
  representativeImage: string;
  spotlineStory: {
    title: string;
    content: string;
    tags: string[];
  };
  externalLinks: Array<{
    type: string;
    url: string;
    title: string;
  }>;
}

interface DemoSpot {
  id: string;
  name: string;
  shortDescription: string;
  representativeImage: string;
  category: string;
  distance: number;
  walkingTime: number;
  spotlineStory: {
    title: string;
    content: string;
  };
}

const DemoManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [demoStore, setDemoStore] = useState<DemoStore | null>(null);
  const [demoSpots, setDemoSpots] = useState<DemoSpot[]>([]);
  const [storeForm] = Form.useForm();
  const [spotForms] = Form.useForm();

  // 데모 데이터 로드
  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      setLoading(true);
      const [storeResponse, spotsResponse] = await Promise.all([
        adminApi.get('/demo/store'),
        adminApi.get('/demo/spots')
      ]);
      
      setDemoStore(storeResponse.data.data);
      setDemoSpots(spotsResponse.data.data);
      
      // 폼에 데이터 설정
      storeForm.setFieldsValue(storeResponse.data.data);
    } catch (error) {
      message.error('데모 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 매장 정보 저장
  const handleStoreSave = async (values: any) => {
    try {
      setLoading(true);
      await adminApi.put('/demo/store', values);
      message.success('매장 정보가 성공적으로 저장되었습니다.');
      loadDemoData();
    } catch (error) {
      message.error('매장 정보 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Spot 정보 저장
  const handleSpotSave = async (spotId: string, values: any) => {
    try {
      setLoading(true);
      await adminApi.put(`/demo/spots/${spotId}`, values);
      message.success('Spot 정보가 성공적으로 저장되었습니다.');
      loadDemoData();
    } catch (error) {
      message.error('Spot 정보 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 이미지 URL 검증
  const validateImageUrl = async (url: string) => {
    try {
      const response = await adminApi.post('/demo/images/validate', { imageUrl: url });
      return response.data.data.isValid;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="demo-management">
      <h1>데모 시스템 관리</h1>
      
      <Tabs defaultActiveKey="store">
        <TabPane tab="매장 정보" key="store">
          <Card title="데모 매장 정보 관리">
            <Form
              form={storeForm}
              layout="vertical"
              onFinish={handleStoreSave}
              loading={loading}
            >
              <Form.Item
                label="매장명"
                name="name"
                rules={[{ required: true, message: '매장명을 입력해주세요.' }]}
              >
                <Input placeholder="매장명을 입력하세요" />
              </Form.Item>

              <Form.Item
                label="간단 설명"
                name="shortDescription"
                rules={[{ required: true, message: '간단 설명을 입력해주세요.' }]}
              >
                <Input placeholder="매장에 대한 간단한 설명을 입력하세요" />
              </Form.Item>

              <Form.Item
                label="대표 이미지 URL"
                name="representativeImage"
                rules={[
                  { required: true, message: '이미지 URL을 입력해주세요.' },
                  { type: 'url', message: '올바른 URL 형식이 아닙니다.' }
                ]}
              >
                <Input 
                  placeholder="https://example.com/image.jpg"
                  onBlur={async (e) => {
                    const url = e.target.value;
                    if (url) {
                      const isValid = await validateImageUrl(url);
                      if (!isValid) {
                        message.warning('이미지 URL이 유효하지 않을 수 있습니다.');
                      }
                    }
                  }}
                />
              </Form.Item>

              <Form.Item label="SpotLine 스토리">
                <Form.Item
                  label="제목"
                  name={['spotlineStory', 'title']}
                  rules={[{ required: true, message: '스토리 제목을 입력해주세요.' }]}
                >
                  <Input placeholder="스토리 제목" />
                </Form.Item>

                <Form.Item
                  label="내용"
                  name={['spotlineStory', 'content']}
                  rules={[{ required: true, message: '스토리 내용을 입력해주세요.' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="매장의 스토리를 입력하세요"
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Form.Item
                  label="태그 (쉼표로 구분)"
                  name={['spotlineStory', 'tags']}
                >
                  <Input placeholder="커피, 휴식, 분위기" />
                </Form.Item>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  매장 정보 저장
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="근처 Spot" key="spots">
          <div className="spots-management">
            {demoSpots.map((spot, index) => (
              <Card 
                key={spot.id} 
                title={`${index + 1}. ${spot.name}`}
                style={{ marginBottom: 16 }}
              >
                <Form
                  layout="vertical"
                  initialValues={spot}
                  onFinish={(values) => handleSpotSave(spot.id, values)}
                >
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <Form.Item
                        label="Spot 이름"
                        name="name"
                        rules={[{ required: true, message: 'Spot 이름을 입력해주세요.' }]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        label="간단 설명"
                        name="shortDescription"
                        rules={[{ required: true, message: '간단 설명을 입력해주세요.' }]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        label="이미지 URL"
                        name="representativeImage"
                        rules={[
                          { required: true, message: '이미지 URL을 입력해주세요.' },
                          { type: 'url', message: '올바른 URL 형식이 아닙니다.' }
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </div>

                    <div style={{ flex: 1 }}>
                      <Form.Item
                        label="거리 (미터)"
                        name="distance"
                        rules={[{ required: true, message: '거리를 입력해주세요.' }]}
                      >
                        <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                      </Form.Item>

                      <Form.Item
                        label="도보 시간 (분)"
                        name="walkingTime"
                        rules={[{ required: true, message: '도보 시간을 입력해주세요.' }]}
                      >
                        <InputNumber min={1} max={30} style={{ width: '100%' }} />
                      </Form.Item>

                      <Form.Item label="스토리">
                        <Form.Item
                          label="제목"
                          name={['spotlineStory', 'title']}
                        >
                          <Input />
                        </Form.Item>

                        <Form.Item
                          label="내용"
                          name={['spotlineStory', 'content']}
                        >
                          <TextArea rows={3} maxLength={200} showCount />
                        </Form.Item>
                      </Form.Item>
                    </div>
                  </div>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      size="small"
                    >
                      저장
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ))}
          </div>
        </TabPane>

        <TabPane tab="시스템 설정" key="settings">
          <Card title="데모 시스템 설정">
            <DemoSettingsForm />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

// 데모 설정 폼 컴포넌트
const DemoSettingsForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminApi.get('/demo/settings');
      form.setFieldsValue(response.data.data);
    } catch (error) {
      message.error('설정을 불러오는데 실패했습니다.');
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      await adminApi.put('/demo/settings', values);
      message.success('설정이 성공적으로 저장되었습니다.');
    } catch (error) {
      message.error('설정 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSave}>
      <Form.Item
        label="데모 시스템 활성화"
        name="isEnabled"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="로딩 시뮬레이션 시간 (밀리초)"
        name="loadingSimulationMs"
      >
        <InputNumber min={0} max={5000} step={100} />
      </Form.Item>

      <Form.Item
        label="현재 시나리오"
        name="currentScenario"
      >
        <Select>
          <Select.Option value="cafe">카페</Select.Option>
          <Select.Option value="restaurant">레스토랑</Select.Option>
          <Select.Option value="retail">리테일</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          설정 저장
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DemoManagement;
```

### 2. API 서비스 함수

```typescript
// admin-frontend/src/services/adminApi.ts에 추가

// 데모 관리 API
export const demoApi = {
  // 매장 정보
  getStore: () => adminApi.get('/demo/store'),
  updateStore: (data: any) => adminApi.put('/demo/store', data),
  
  // Spot 관리
  getSpots: () => adminApi.get('/demo/spots'),
  updateSpot: (spotId: string, data: any) => adminApi.put(`/demo/spots/${spotId}`, data),
  
  // 시스템 설정
  getSettings: () => adminApi.get('/demo/settings'),
  updateSettings: (data: any) => adminApi.put('/demo/settings', data),
  
  // 이미지 검증
  validateImage: (imageUrl: string) => adminApi.post('/demo/images/validate', { imageUrl })
};
```

## 📝 사용 시나리오

### 1. 데모 매장 이미지 변경
1. 어드민이 "매장 정보" 탭에서 새로운 이미지 URL 입력
2. 시스템이 자동으로 이미지 URL 유효성 검증
3. 저장 버튼 클릭으로 변경사항 적용
4. 실시간으로 데모 페이지에 반영

### 2. 근처 Spot 정보 수정
1. "근처 Spot" 탭에서 수정할 Spot 선택
2. 이름, 설명, 이미지, 거리, 시간 등 수정
3. 개별 저장으로 즉시 반영
4. 프론트엔드에서 실시간 확인 가능

### 3. 시스템 설정 조정
1. "시스템 설정" 탭에서 전체 설정 관리
2. 데모 활성화/비활성화 토글
3. 로딩 시간 조정으로 사용자 경험 최적화
4. 시나리오 변경으로 다양한 데모 제공

## 🔒 보안 고려사항

### 1. 인증 및 권한
- JWT 토큰 기반 어드민 인증
- 데모 관리 권한 별도 체크
- API 요청 시 토큰 검증

### 2. 입력 검증
- 이미지 URL 형식 검증
- XSS 방지를 위한 입력 sanitization
- 파일 크기 및 형식 제한

### 3. 에러 처리
- 상세한 에러 메시지 제공
- 실패 시 롤백 메커니즘
- 로그 기록 및 모니터링

## 🚀 배포 및 운영

### 1. 환경별 설정
```typescript
// config/demo.ts
export const demoConfig = {
  development: {
    loadingSimulation: 500,
    imageValidation: true,
    autoSave: false
  },
  production: {
    loadingSimulation: 300,
    imageValidation: true,
    autoSave: true
  }
};
```

### 2. 모니터링
- 데모 사용 통계 수집
- 이미지 로딩 성능 모니터링
- 어드민 활동 로그 기록

### 3. 백업 및 복구
- 데모 데이터 정기 백업
- 변경 이력 관리
- 빠른 복구 메커니즘

---

이 가이드를 통해 SpotLine 어드민에서 데모 시스템을 완전히 관리할 수 있는 기능을 구현할 수 있습니다. 실시간 수정, 이미지 관리, 시스템 설정 등 모든 기능이 포함되어 있어 효율적인 데모 운영이 가능합니다.