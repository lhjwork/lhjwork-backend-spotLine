import mongoose, { Schema } from "mongoose";

// QR 코드 인터페이스
interface IQRCode {
  _id: mongoose.Types.ObjectId;
  qrId: string; // QR 코드 고유 ID (예: "qr_cafe_gangnam_001")
  storeId: mongoose.Types.ObjectId; // 매장 ID (Store 컬렉션 참조)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // 선택적 필드
  campaignId?: mongoose.Types.ObjectId; // 마케팅 캠페인 연결
  expiresAt?: Date; // QR 코드 만료일
  scanCount: number; // 스캔 횟수
  lastScannedAt?: Date; // 마지막 스캔 시간

  // 메타데이터
  metadata?: {
    campaign?: string;
    location?: string;
    purpose?: string;
  };

  // 메서드
  incrementScanCount(): Promise<IQRCode>;
  isExpired(): boolean;
}

const qrCodeSchema = new Schema<IQRCode>({
  qrId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true, // 빠른 조회를 위한 인덱스
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: true,
    index: true, // 매장별 QR 코드 조회를 위한 인덱스
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true, // 활성 QR 코드 필터링을 위한 인덱스
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  // 선택적 필드
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: "Campaign", // 향후 Campaign 모델 생성 시 사용
  },
  expiresAt: {
    type: Date,
    index: true, // 만료된 QR 코드 정리를 위한 인덱스
  },
  scanCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastScannedAt: {
    type: Date,
  },

  // 메타데이터
  metadata: {
    campaign: String,
    location: String,
    purpose: String,
  },
});

// 업데이트 시 updatedAt 자동 갱신
qrCodeSchema.pre<IQRCode>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// 복합 인덱스 설정
qrCodeSchema.index({ storeId: 1, isActive: 1 }); // 매장별 활성 QR 코드 조회
qrCodeSchema.index({ isActive: 1, expiresAt: 1 }); // 활성 상태와 만료일 조합

// QR 코드 스캔 시 카운트 증가 메서드
qrCodeSchema.methods.incrementScanCount = function () {
  this.scanCount += 1;
  this.lastScannedAt = new Date();
  return this.save();
};

// 만료된 QR 코드 확인 메서드
qrCodeSchema.methods.isExpired = function () {
  return this.expiresAt && this.expiresAt < new Date();
};

// 정적 메서드: 활성 QR 코드 조회
qrCodeSchema.statics.findActiveByQrId = function (qrId: string) {
  return this.findOne({
    qrId,
    isActive: true,
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
  }).populate("storeId");
};

// 정적 메서드: 매장별 QR 코드 목록 조회
qrCodeSchema.statics.findByStoreId = function (storeId: string) {
  return this.find({ storeId, isActive: true }).sort({ createdAt: -1 });
};

// 인터페이스에 정적 메서드 추가
interface IQRCodeModel extends mongoose.Model<IQRCode> {
  findActiveByQrId(qrId: string): Promise<IQRCode | null>;
  findByStoreId(storeId: string): Promise<IQRCode[]>;
}

export { IQRCode };
export default mongoose.model<IQRCode, IQRCodeModel>("QRCode", qrCodeSchema);
