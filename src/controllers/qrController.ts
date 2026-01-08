import { Request, Response } from "express";
import QRCode from "../models/QRCode";
import Store from "../models/Store";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";

// QR 코드로 매장 ID 조회
export const getStoreByQRCode = async (req: Request<{ qrId: string }>, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;

    // QRCode 컬렉션에서 조회
    const qrCode = await QRCode.findActiveByQrId(qrId);

    if (!qrCode) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "유효하지 않거나 만료된 QR 코드입니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    // QR 코드 스캔 카운트 증가
    await qrCode.incrementScanCount();

    // 매장 정보 조회
    const store = await Store.findById(qrCode.storeId);
    if (!store || !store.isActive) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없거나 비활성화된 매장입니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(
      formatResponse(true, "QR 코드 조회 성공", {
        qrId: qrCode.qrId,
        storeId: store._id.toString(),
        storeName: store.name,
        scanCount: qrCode.scanCount,
      })
    );
  } catch (error) {
    console.error("QR code lookup error:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 매장별 QR 코드 목록 조회
export const getQRCodesByStore = async (req: Request<{ storeId: string }>, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    // 매장 존재 확인
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    // 매장의 QR 코드 목록 조회
    const qrCodes = await QRCode.findByStoreId(storeId);

    res.json(
      formatResponse(true, "매장 QR 코드 목록 조회 성공", {
        storeId,
        storeName: store.name,
        qrCodes: qrCodes.map((qr: any) => ({
          qrId: qr.qrId,
          isActive: qr.isActive,
          scanCount: qr.scanCount,
          lastScannedAt: qr.lastScannedAt,
          createdAt: qr.createdAt,
          expiresAt: qr.expiresAt,
          metadata: qr.metadata,
        })),
      })
    );
  } catch (error) {
    console.error("Get QR codes by store error:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 새 QR 코드 생성
export const createQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId, storeId, expiresAt, metadata } = req.body;

    // 입력 검증
    if (!qrId || !storeId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "QR ID와 매장 ID는 필수입니다.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    // 매장 존재 확인
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    // QR 코드 중복 확인
    const existingQR = await QRCode.findOne({ qrId });
    if (existingQR) {
      res.status(HTTP_STATUS.CONFLICT).json(formatResponse(false, "이미 존재하는 QR 코드 ID입니다.", null, HTTP_STATUS.CONFLICT));
      return;
    }

    // 새 QR 코드 생성
    const newQRCode = new QRCode({
      qrId,
      storeId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      metadata,
    });

    await newQRCode.save();

    // 매장의 QR 코드 목록에 추가
    await Store.findByIdAndUpdate(storeId, {
      $push: { qrCodes: newQRCode._id },
    });

    res.status(HTTP_STATUS.CREATED).json(
      formatResponse(true, "QR 코드가 성공적으로 생성되었습니다.", {
        qrId: newQRCode.qrId,
        storeId: newQRCode.storeId,
        isActive: newQRCode.isActive,
        createdAt: newQRCode.createdAt,
      })
    );
  } catch (error) {
    console.error("Create QR code error:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// QR 코드 비활성화
export const deactivateQRCode = async (req: Request<{ qrId: string }>, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;

    const qrCode = await QRCode.findOne({ qrId });
    if (!qrCode) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "QR 코드를 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    qrCode.isActive = false;
    await qrCode.save();

    res.json(
      formatResponse(true, "QR 코드가 비활성화되었습니다.", {
        qrId: qrCode.qrId,
        isActive: qrCode.isActive,
      })
    );
  } catch (error) {
    console.error("Deactivate QR code error:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// QR 코드 통계 조회
export const getQRCodeStats = async (req: Request<{ qrId: string }>, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;

    const qrCode = await QRCode.findOne({ qrId }).populate("storeId");
    if (!qrCode) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "QR 코드를 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(
      formatResponse(true, "QR 코드 통계 조회 성공", {
        qrId: qrCode.qrId,
        storeId: qrCode.storeId,
        scanCount: qrCode.scanCount,
        lastScannedAt: qrCode.lastScannedAt,
        createdAt: qrCode.createdAt,
        isActive: qrCode.isActive,
        isExpired: (qrCode as any).isExpired(),
        metadata: qrCode.metadata,
      })
    );
  } catch (error) {
    console.error("Get QR code stats error:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, errorMessage, null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};
