const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  fromStore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  toStore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  category: {
    type: String,
    enum: ['next_meal', 'dessert', 'activity', 'shopping', 'culture', 'rest'],
    required: true
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  distance: Number, // 미터 단위
  walkingTime: Number, // 분 단위
  description: String, // 추천 이유
  tags: [String], // ['데이트코스', '가성비', '분위기좋은' 등]
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 인덱스 설정
recommendationSchema.index({ fromStore: 1, category: 1 });
recommendationSchema.index({ toStore: 1 });
recommendationSchema.index({ priority: -1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);