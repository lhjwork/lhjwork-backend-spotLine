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
    enum: [
      "qr_scan", // QR 코드 스캔
      "page_view", // 페이지 조회
      "recommendation_click", // 추천 클릭
      "map_click", // 지도 클릭
      "store_visit", // 매장 방문
      // 기존 호환성 유지
      "page_enter", // 페이지 진입
      "spot_click", // spot 클릭
      "map_link_click", // 지도 링크 클릭
      "page_exit", // 페이지 이탈 (체류 시간 계산용)
      "external_link_click", // 외부 링크 클릭
    ],
    required: true,
  },
  targetStore: {
    type: Schema.Types.ObjectId,
    ref: "Store",
  },
  // 개인 식별 데이터 제거
  sessionId: String, // 세션 기반으로만 추적
  // ipAddress: String, // 제거
  // userAgent: String, // 제거
  referrer: String,
  timestamp: {
    type: Date,
    default: getKoreanTime, // 한국 시간으로 기본값 설정
  },
  metadata: {
    spotPosition: Number, // spot 위치 (1-4)
    stayDuration: Number, // 체류 시간 (초)
    linkType: String, // 외부 링크 타입 (instagram, blog, etc)
    nextSpotId: String, // 다음 spot ID
  },
});

// 인덱스 설정
analyticsSchema.index({ qrCode: 1, timestamp: -1 });
analyticsSchema.index({ store: 1, eventType: 1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });

export default mongoose.model<IAnalytics>("Analytics", analyticsSchema);
