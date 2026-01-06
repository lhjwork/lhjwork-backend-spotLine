const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
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
    district: String, // 구/동 정보
    area: String, // 상권 정보 (홍대, 강남 등)
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
  description: String,
  tags: [String], // ['데이트', '조용한', '와이파이', '주차가능' 등]
  images: [String], // 이미지 URL 배열
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
storeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// 인덱스 설정 (GeoJSON 형식)
storeSchema.index({ "location.coordinates": "2dsphere" });
// qrCode.id는 스키마에서 unique: true로 이미 인덱스가 생성되므로 중복 제거
storeSchema.index({ category: 1 });
storeSchema.index({ "location.area": 1 });

module.exports = mongoose.model("Store", storeSchema);
