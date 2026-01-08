import { Request, Response } from "express";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";

// 임시 QR 코드 데이터 (실제 구현에서는 MongoDB에서 조회)
const SAMPLE_QR_CODES = [
  {
    qrId: "qr_live_store_001_001",
    storeId: "live_store_001",
    location: "entrance",
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    qrId: "qr_live_store_001_002", 
    storeId: "live_store_001",
    location: "table",
    isActive: true,
    createdAt: new Date("2024-01-02")
  },
  {
    qrId: "qr_live_store_002_001",
    storeId: "live_store_002",
    location: "counter",
    isActive: true,
    createdAt: new Date("2024-01-03")
  }
];

// 매장 데이터 참조 (실제로는 별도 서비스에서 가져옴)
const SAMPLE_LIVE_STORES = [
  {
    storeId: "live_store_001",
    name: "강남 브런치 카페",
    description: "신선한 재료로 만든 건강한 브런치와 스페셜티 커피",
    category: "cafe",
    location: {
      address: "서울시 강남구 테헤란로 152",
      coordinates: [127.0276, 37.4979]
    },
    images: {
      representative: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
    },
    spotlineStory: {
      title: "건강한 아침을 시작하는 곳",
      content: "매일 새벽 5시부터 준비하는 신선한 재료로 건강하고 맛있는 브런치를 제공합니다.",
      tags: ["브런치", "건강식", "스페셜티커피"]
    },
    status: "active",
    analytics: {
      totalViews: 1247,
      monthlyViews: 89,
      qrScans: 156,
      recommendations: 23
    }
  },
  {
    storeId: "live_store_002",
    name: "홍대 수제 베이커리", 
    description: "매일 구워내는 신선한 빵과 디저트",
    category: "bakery",
    location: {
      address: "서울시 마포구 홍익로 25",
      coordinates: [126.9240, 37.5563]
    },
    images: {
      representative: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
    },
    spotlineStory: {
      title: "매일 새로 굽는 행복",
      content: "전통 방식으로 발효시킨 천연 효모빵과 계절 과일을 사용한 디저트를 만나보세요.",
      tags: ["수제빵", "천연효모", "계절디저트"]
    },
    status: "active",
    analytics: {
      totalViews: 892,
      monthlyViews: 67,
      qrScans: 134,
      recommendations: 18
    }
  }
];

/**
 * GET /api/live/qr/:qrId
 * QR 코드로 매장 조회
 */
export const getStoreByQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;

    // QR 코드 유효성 확인
    const qrCode = SAMPLE_QR_CODES.find(qr => qr.qrId === qrId && qr.isActive);
    
    if (!qrCode) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "유효하지 않은 QR 코드입니다.",
          null,
          HTTP_STATUS.NOT_FOUND,
          {
            system: "live",
            qrId,
            reason: "QR code not found or inactive"
          }
        )
      );
      return;
    }

    // 매장 정보 조회
    const store = SAMPLE_LIVE_STORES.find(s => s.storeId === qrCode.storeId && s.status === 'active');
    
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장 정보를 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND,
          {
            system: "live",
            qrId,
            storeId: qrCode.storeId,
            reason: "Store not found or inactive"
          }
        )
      );
      return;
    }

    // QR 스캔 통계 업데이트 (실제 구현에서는 DB 업데이트)
    store.analytics.qrScans += 1;
    store.analytics.totalViews += 1;

    res.json(
      formatResponse(
        true,
        "QR 코드로 매장 정보를 성공적으로 가져왔습니다.",
        {
          store: {
            id: store.storeId,
            name: store.name,
            shortDescription: store.description,
            representativeImage: store.images.representative,
            category: store.category,
            location: store.location,
            spotlineStory: store.spotlineStory
          },
          qrInfo: {
            qrId: qrCode.qrId,
            location: qrCode.location,
            scannedAt: new Date().toISOString()
          }
        },
        HTTP_STATUS.OK,
        {
          system: "live",
          scanIncremented: true,
          totalScans: store.analytics.qrScans,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] QR scanned - QrId: ${qrId}, StoreId: ${store.storeId}, Location: ${qrCode.location}, Total scans: ${store.analytics.qrScans}`);
  } catch (error) {
    console.error("Live QR get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "QR 코드 처리 중 오류가 발생했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * POST /api/live/qr/generate
 * QR 코드 생성
 */
export const generateQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId, location = 'default' } = req.body;

    if (!storeId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(
          false,
          "매장 ID가 필요합니다.",
          null,
          HTTP_STATUS.BAD_REQUEST
        )
      );
      return;
    }

    // 매장 존재 확인
    const store = SAMPLE_LIVE_STORES.find(s => s.storeId === storeId && s.status === 'active');
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // QR 코드 ID 생성
    const qrId = `qr_${storeId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // QR 코드 데이터 생성
    const newQRCode = {
      qrId,
      storeId,
      location,
      isActive: true,
      createdAt: new Date()
    };

    // 실제 구현에서는 MongoDB에 저장
    SAMPLE_QR_CODES.push(newQRCode);

    // QR 코드 URL 생성
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const qrUrl = `${frontendUrl}/spotline/live?qr=${qrId}`;
    const downloadUrl = `${process.env.API_URL || "http://localhost:4000"}/api/live/qr/${qrId}/download`;

    res.json(
      formatResponse(
        true,
        "QR 코드가 성공적으로 생성되었습니다.",
        { 
          qrId,
          qrUrl,
          downloadUrl,
          location,
          storeInfo: {
            storeId: store.storeId,
            name: store.name
          },
          usage: {
            scanUrl: qrUrl,
            printReady: true,
            validUntil: null // 무제한
          }
        },
        HTTP_STATUS.OK,
        {
          system: "live",
          generatedAt: new Date().toISOString(),
          totalQRCodes: SAMPLE_QR_CODES.filter(qr => qr.storeId === storeId).length
        }
      )
    );

    console.log(`[LIVE] QR code generated - QrId: ${qrId}, StoreId: ${storeId}, Location: ${location}`);
  } catch (error) {
    console.error("QR generate error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "QR 코드 생성에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/live/qr/:qrId/download
 * QR 코드 이미지 다운로드
 */
export const downloadQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;

    // QR 코드 확인
    const qrCode = SAMPLE_QR_CODES.find(qr => qr.qrId === qrId);
    if (!qrCode) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "QR 코드를 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // 실제 구현에서는 QR 코드 이미지 생성 라이브러리 사용
    // 예: qrcode, node-qrcode 등
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${process.env.FRONTEND_URL}/spotline/live?qr=${qrId}`)}`;

    res.json(
      formatResponse(
        true,
        "QR 코드 다운로드 링크를 생성했습니다.",
        {
          qrId,
          downloadUrl: qrImageUrl,
          format: "PNG",
          size: "300x300",
          instructions: {
            print: "고품질 인쇄를 위해 300DPI 이상으로 출력하세요.",
            placement: "고객이 쉽게 스캔할 수 있는 위치에 배치하세요.",
            size: "최소 3cm x 3cm 크기로 인쇄하세요."
          }
        },
        HTTP_STATUS.OK
      )
    );

    console.log(`[LIVE] QR code download requested - QrId: ${qrId}`);
  } catch (error) {
    console.error("QR download error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "QR 코드 다운로드에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};