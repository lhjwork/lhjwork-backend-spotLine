import mongoose, { Schema } from "mongoose";
import { IStore } from "../types";

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
  representativeImage: String, // 대표 이미지 1장만
  externalLinks: {
    instagram: String,
    blog: String,
    notion: String,
    website: String,
  },
  // 기존 필드들 (호환성 유지)
  description: String,
  tags: [String],
  images: [String],
  qrCode: {
    id: {
      type: String,
      unique: true,
      required: true,
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

export default mongoose.model<IStore>("Store", storeSchema);
