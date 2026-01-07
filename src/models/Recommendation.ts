import mongoose, { Schema } from "mongoose";
import { IRecommendation } from "../types";

const recommendationSchema = new Schema<IRecommendation>({
  fromStore: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  toStore: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  category: {
    type: String,
    enum: ["next_meal", "dessert", "activity", "shopping", "culture", "rest"],
    required: true,
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10,
  },
  distance: Number,
  walkingTime: Number,
  description: String,
  tags: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 인덱스 설정
recommendationSchema.index({ fromStore: 1, category: 1 });
recommendationSchema.index({ toStore: 1 });
recommendationSchema.index({ priority: -1 });

export default mongoose.model<IRecommendation>("Recommendation", recommendationSchema);
