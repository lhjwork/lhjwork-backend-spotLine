import mongoose, { Schema } from "mongoose";

// 데모용 매장 인터페이스
interface IDemoStore {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: "cafe" | "restaurant" | "exhibition" | "hotel" | "retail" | "culture" | "other";
  location: {
    address: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
    district: string;
    area: string;
  };
  qrCode: {
    id: string;
    isActive: boolean;
  };
  // SpotLine 정체성에 맞는 필드들
  shortDescription: string; // 한 문장 설명만 허용
  spotlineStory?: string; // 접힘 UI용 상세 설명
  representativeImage: string; // 대표 이미지 1장만
  externalLinks: {
    instagram?: string;
    blog?: string;
    notion?: string;
    website?: string;
  };
  isActive: boolean;
  isDemoOnly: boolean; // 데모 전용 플래그
  createdAt: Date;
  updatedAt: Date;
}

const demoStoreSchema = new Schema<IDemoStore>({
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
  // SpotLine 정체성에 맞는 필드들
  shortDescription: {
    type: String,
    maxlength: 100, // 한 문장 설명만 허용
    trim: true,
    required: true,
  },
  spotlineStory: {
    type: String,
    maxlength: 500, // 접힘 UI용 상세 설명
    trim: true,
  },
  representativeImage: {
    type: String,
    required: true,
  }, // 대표 이미지 1장만
  externalLinks: {
    instagram: String,
    blog: String,
    notion: String,
    website: String,
  },
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
  isDemoOnly: {
    type: Boolean,
    default: true, // 데모 전용
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
demoStoreSchema.pre<IDemoStore>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// 인덱스 설정
demoStoreSchema.index({ "location.coordinates": "2dsphere" });
demoStoreSchema.index({ category: 1 });
demoStoreSchema.index({ "location.area": 1 });
demoStoreSchema.index({ isDemoOnly: 1 });

export { IDemoStore };
export default mongoose.model<IDemoStore>("DemoStore", demoStoreSchema);
