import { Request, Response } from "express";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";
import * as storeService from "../services/storeService";

/**
 * GET /api/live/qr/:qrId
 * QR 코드로 매장 조회
 */
export const getStoreByQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;

    // 실제 DB에서 QR 코드로 매장 조회
    const store = await storeService.getStoreByQR(qrId);
    
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "유효하지 않은 QR 코드입니다.",
          null,
          HTTP_STATUS.NOT_FOUND,
          {
            system: "live",
            qrId,
            reason: "QR code not found or store inactive"
          }
        )
      );
      return;
    }

    // TODO: QR 스캔 통계 업데이트 (Analytics 모델 구현 후)
    // await analyticsService.incrementQRScans(store._id, qrId);

    res.json(
      formatResponse(
        true,
        "QR 코드로 매장 정보를 성공적으로 가져왔습니다.",
        {
          store: {
            id: store._id,
            name: store.name,
            shortDescription: store.shortDescription || store.description,
            representativeImage: store.mainBannerImages?.[0] || null,
            category: store.category,
            location: store.location,
            spotlineStory: store.spotlineStory
          },
          qrInfo: {
            qrId: qrId,
            scannedAt: new Date().toISOString()
          }
        },
        HTTP_STATUS.OK,
        {
          system: "live",
          scanIncremented: false, // Analytics 구현 후 true로 변경
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] QR scanned - QrId: ${qrId}, StoreId: ${store._id}`);
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

    // 실제 DB에서 매장 존재 확인
    const store = await storeService.getStoreById(storeId);
    if (!store || !store.isActive) {
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

    // QR 코드 ID 생성 (실제로는 QRCode 모델에 저장)
    const qrId = `qr_${storeId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // TODO: QRCode 모델에 저장
    // const newQRCode = await QRCode.create({ qrId, storeId, location, isActive: true });

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
            storeId: store._id,
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
          generatedAt: new Date().toISOString()
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

    // TODO: QRCode 모델에서 확인
    // const qrCode = await QRCode.findOne({ qrId, isActive: true });
    // if (!qrCode) { ... }

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