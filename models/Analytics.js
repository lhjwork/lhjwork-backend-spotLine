const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  qrCode: {
    type: String,
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  eventType: {
    type: String,
    enum: ['qr_scan', 'page_view', 'recommendation_click', 'map_click', 'store_visit'],
    required: true
  },
  targetStore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  }, // recommendation_click, map_click 시 클릭한 매장
  sessionId: String, // 세션 추적용
  userAgent: String,
  ipAddress: String,
  referrer: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    category: String, // 추천 카테고리
    position: Number, // 리스트에서의 위치
    duration: Number // 페이지 체류 시간 (초)
  }
});

// 인덱스 설정
analyticsSchema.index({ qrCode: 1, timestamp: -1 });
analyticsSchema.index({ store: 1, eventType: 1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);