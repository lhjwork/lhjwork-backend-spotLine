import mongoose, { Schema } from "mongoose";

// 데모 추천 인터페이스
interface IDemoRecommendation {
  _id: mongoose.Types.ObjectId;
  fromStoreId: mongoose.Types.ObjectId; // 출발 매장
  toStoreId: mongoose.Types.ObjectId; // 추천 매장
  category: "cafe" | "restaurant" | "culture" | "gallery" | "dessert" | "bookstore";
  priority: number; // 1-10 (높을수록 우선순위)
  distance: number; // 미터 단위
  walkingTime: number; // 분 단위
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const demoRecommendationSchema = new Schema<IDemoRecommendation>({
  fromStoreId: {
    type: Schema.Types.ObjectId,
    ref: "DemoStore",
    required: true,
  },
  toStoreId: {
    type: Schema.Types.ObjectId,
    ref: "DemoStore",
    required: true,
  },
  category: {
    type: String,
    enum: ["cafe", "restaurant", "culture", "gallery", "dessert", "bookstore"],
    required: true,
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
  },
  distance: {
    type: Number, // 미터 단위
    min: 0,
    required: true,
  },
  walkingTime: {
    type: Number, // 분 단위
    min: 1,
    required: true,
  },
  description: {
    type: String,
    maxlength: 200,
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
demoRecommendationSchema.pre<IDemoRecommendation>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// 인덱스 설정
demoRecommendationSchema.index({ fromStoreId: 1, priority: -1 });
demoRecommendationSchema.index({ isActive: 1 });

export { IDemoRecommendation };
export default mongoose.model<IDemoRecommendation>("DemoRecommendation", demoRecommendationSchema);
