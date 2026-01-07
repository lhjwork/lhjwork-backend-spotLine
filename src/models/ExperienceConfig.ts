import mongoose, { Schema } from "mongoose";
import { IExperienceConfig } from "../types";

const experienceConfigSchema = new Schema<IExperienceConfig>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true,
  },
  type: {
    type: String,
    enum: ["fixed", "random", "area_based", "weighted"],
    default: "fixed",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  settings: {
    // fixed 타입: 특정 매장 고정
    fixedStoreQrId: String,

    // random 타입: 랜덤 선택할 매장들
    randomStoreQrIds: [String],

    // area_based 타입: 지역별 설정
    areaSettings: {
      gangnam: {
        enabled: { type: Boolean, default: true },
        storeQrIds: [String],
        weight: { type: Number, default: 1 },
      },
      hongdae: {
        enabled: { type: Boolean, default: true },
        storeQrIds: [String],
        weight: { type: Number, default: 1 },
      },
      // 추후 확장 가능한 지역들
      itaewon: {
        enabled: { type: Boolean, default: false },
        storeQrIds: [String],
        weight: { type: Number, default: 1 },
      },
      myeongdong: {
        enabled: { type: Boolean, default: false },
        storeQrIds: [String],
        weight: { type: Number, default: 1 },
      },
    },

    // weighted 타입: 가중치 기반 선택
    weightedStores: [
      {
        qrId: String,
        weight: { type: Number, default: 1 },
        enabled: { type: Boolean, default: true },
      },
    ],

    // 공통 설정
    excludeStoreQrIds: [String], // 제외할 매장들
    timeBasedSettings: {
      enabled: { type: Boolean, default: false },
      morning: {
        // 06:00 - 12:00
        storeQrIds: [String],
        weight: { type: Number, default: 1 },
      },
      afternoon: {
        // 12:00 - 18:00
        storeQrIds: [String],
        weight: { type: Number, default: 1 },
      },
      evening: {
        // 18:00 - 24:00
        storeQrIds: [String],
        weight: { type: Number, default: 1 },
      },
      night: {
        // 00:00 - 06:00
        storeQrIds: [String],
        weight: { type: Number, default: 1 },
      },
    },
  },
  priority: {
    type: Number,
    default: 0, // 높을수록 우선순위 높음
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  lastUsed: Date,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
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

// 인덱스 설정
experienceConfigSchema.index({ isActive: 1, isDefault: 1 });
experienceConfigSchema.index({ type: 1, isActive: 1 });
experienceConfigSchema.index({ priority: -1 });

// 업데이트 시 updatedAt 자동 갱신
experienceConfigSchema.pre<IExperienceConfig>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// 기본 설정은 하나만 존재하도록 보장
experienceConfigSchema.pre<IExperienceConfig>("save", async function (next) {
  if (this.isDefault) {
    await mongoose.model("ExperienceConfig").updateMany({ _id: { $ne: this._id } }, { isDefault: false });
  }
  next();
});

export default mongoose.model<IExperienceConfig>("ExperienceConfig", experienceConfigSchema);
