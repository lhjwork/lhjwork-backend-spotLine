import mongoose, { Schema } from "mongoose";
import { IStore } from "../types";
import { getImageUrl, getImageUrls } from "../services/s3Service";

const storeSchema = new Schema<IStore>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["cafe", "restaurant", "exhibition", "hotel", "retail", "culture", "other"],
  },
  location: {
    address: {
      type: String,
      required: true,
    },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    district: String,
    area: String,
  },
  contact: {
    phone: String,
    website: String,
    instagram: String,
  },
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  // SpotLine 정체성에 맞는 필드들
  shortDescription: {
    type: String,
    maxlength: 100, // 한 문장 설명만 허용
    trim: true,
  },
  spotlineStory: {
    type: String,
    maxlength: 500, // 접힘 UI용 상세 설명
    trim: true,
  },
  representativeImage: String, // S3 키로 저장
  externalLinks: {
    instagram: String,
    blog: String,
    notion: String,
    website: String,
  },
  // 기존 필드들 (호환성 유지)
  description: String,
  tags: [String],
  images: [String], // S3 키 배열로 저장

  // QR 코드 연결 (역참조) - 새로운 구조
  qrCodes: [
    {
      type: Schema.Types.ObjectId,
      ref: "QRCode",
    },
  ],

  // 기존 QR 코드 필드 (호환성 유지, 향후 제거 예정)
  qrCode: {
    id: {
      type: String,
      unique: true,
      sparse: true, // null 값 허용하면서 unique 유지
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 업데이트 시 updatedAt 자동 갱신
storeSchema.pre<IStore>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// 인덱스 설정 (GeoJSON 형식)
storeSchema.index({ "location.coordinates": "2dsphere" });
// qrCode.id는 스키마에서 unique: true로 이미 인덱스가 생성되므로 중복 제거
storeSchema.index({ category: 1 });
storeSchema.index({ "location.area": 1 });

// 이미지 URL 가상 필드 추가
storeSchema.virtual("representativeImageUrl").get(function() {
  return this.representativeImage ? getImageUrl(this.representativeImage) : "";
});

storeSchema.virtual("imageUrls").get(function() {
  return this.images ? getImageUrls(this.images) : [];
});

// JSON 변환 시 가상 필드 포함
storeSchema.set("toJSON", { virtuals: true });
storeSchema.set("toObject", { virtuals: true });

export default mongoose.model<IStore>("Store", storeSchema);
