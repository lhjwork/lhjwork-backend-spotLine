import mongoose, { Schema } from "mongoose";
import { IAnalytics } from "../types";
import { getKoreanTime } from "../utils/dateUtils";

const analyticsSchema = new Schema<IAnalytics>({
  qrCode: {
    type: String,
    required: true,
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  eventType: {
    type: String,
    enum: ["qr_scan", "page_view", "recommendation_click", "map_click", "store_visit"],
    required: true,
  },
  targetStore: {
    type: Schema.Types.ObjectId,
    ref: "Store",
  },
  sessionId: String,
  userAgent: String,
  ipAddress: String,
  referrer: String,
  timestamp: {
    type: Date,
    default: getKoreanTime, // 한국 시간으로 기본값 설정
  },
  metadata: {
    category: String,
    position: Number,
    duration: Number,
  },
});

// 인덱스 설정
analyticsSchema.index({ qrCode: 1, timestamp: -1 });
analyticsSchema.index({ store: 1, eventType: 1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });

export default mongoose.model<IAnalytics>("Analytics", analyticsSchema);
