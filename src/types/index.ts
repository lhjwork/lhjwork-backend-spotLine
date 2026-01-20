import { Document, Types } from "mongoose";
import { Request } from "express";

// 공통 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  status?: number;
}

// Store 관련 타입
export interface IStore extends Document {
  name: string;
  category: "cafe" | "restaurant" | "exhibition" | "hotel" | "retail" | "culture" | "other";
  location: {
    address: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
    district?: string;
    area?: string;
  };
  contact?: {
    phone?: string;
    website?: string;
    instagram?: string;
  };
  businessHours?: {
    [key: string]: { open?: string; close?: string };
  };
  // SpotLine 정체성에 맞는 필드들
  shortDescription?: string; // 한 문장 설명
  spotlineStory?: string; // 접힘 UI용 상세 설명
  mainBannerImages?: string[]; // 메인 배너 이미지들 (최대 5개)
  externalLinks?: {
    instagram?: string;
    blog?: string;
    notion?: string;
    website?: string;
  };
  // 기존 필드들 (호환성 유지)
  description?: string;
  tags?: string[];

  // 이미지 URL 가상 필드 (S3에서 생성)
  mainBannerImageUrls?: string[];
  representativeImageUrl?: string; // 호환성용 (첫 번째 배너 이미지)
  imageUrls?: string[]; // 호환성용

  // QR 코드 연결 (역참조) - 새로운 구조
  qrCodes?: Types.ObjectId[];

  // 기존 QR 코드 필드 (호환성 유지, 향후 제거 예정)
  qrCode: {
    id: string;
    isActive: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Admin 관련 타입
export interface IAdmin extends Document {
  username: string;
  email: string;
  password: string;
  role: "admin" | "super_admin";
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Recommendation 관련 타입
export interface IRecommendation extends Document {
  fromStore: Types.ObjectId;
  toStore: Types.ObjectId;
  category: "next_meal" | "dessert" | "activity" | "shopping" | "culture" | "rest";
  priority: number;
  distance?: number;
  walkingTime?: number;
  description?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: Date;
}

// Analytics 관련 타입 (SpotLine 정체성 반영)
export interface IAnalytics extends Document {
  qrCode: string;
  store: Types.ObjectId;
  eventType: "page_enter" | "spot_click" | "map_link_click" | "page_exit" | "external_link_click";
  targetStore?: Types.ObjectId;
  sessionId?: string;
  referrer?: string;
  timestamp: Date;
  metadata?: {
    spotPosition?: number; // spot 위치 (1-4)
    stayDuration?: number; // 체류 시간 (초)
    linkType?: string; // 외부 링크 타입
    nextSpotId?: string; // 다음 spot ID
  };
}

// JWT 페이로드 타입
export interface JwtPayload {
  adminId: string;
  type: "admin";
  iat?: number;
  exp?: number;
}

// 확장된 Request 타입 (인증된 요청)
export interface AuthenticatedRequest extends Request {
  admin?: {
    adminId: string;
    type: string;
  };
}

// 환경 변수 타입
export interface EnvConfig {
  PORT: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  NODE_ENV: "development" | "production" | "test";
}

// 쿼리 파라미터 타입들
export interface StoreQueryParams {
  category?: string;
  area?: string;
  active?: string;
  limit?: string;
  radius?: string;
}

export interface RecommendationQueryParams {
  category?: string;
  limit?: string;
}

export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  period?: "day" | "week" | "month";
  days?: string;
}

// 요청 바디 타입들
export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateAdminRequest {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "super_admin";
}

export interface CreateStoreRequest {
  name: string;
  category: IStore["category"];
  location: IStore["location"];
  qrCode: IStore["qrCode"];
  contact?: IStore["contact"];
  businessHours?: IStore["businessHours"];
  // SpotLine 정체성에 맞는 필드들
  shortDescription?: string;
  spotlineStory?: string;
  mainBannerImages?: string[]; // 메인 배너 이미지들
  externalLinks?: IStore["externalLinks"];
  // 기존 필드들 (호환성 유지)
  description?: string;
  tags?: string[];
  isActive?: boolean;
  active?: boolean; // 관리자용 필드
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: Date;
}

export interface CreateRecommendationRequest {
  fromStore: string;
  toStore: string;
  category: IRecommendation["category"];
  priority?: number;
  description?: string;
  tags?: string[];
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: Date;
}

export interface LogEventRequest {
  qrCode: string;
  store: string;
  eventType: IAnalytics["eventType"];
  targetStore?: string;
  sessionId?: string;
  metadata?: IAnalytics["metadata"];
}

// ExperienceConfig 관련 타입
export interface IExperienceConfig extends Document {
  name: string;
  description?: string;
  type: "fixed" | "random" | "area_based" | "weighted";
  isActive: boolean;
  isDefault: boolean;
  settings: {
    fixedStoreQrId?: string;
    randomStoreQrIds?: string[];
    areaSettings?: {
      gangnam: {
        enabled: boolean;
        storeQrIds: string[];
        weight: number;
      };
      hongdae: {
        enabled: boolean;
        storeQrIds: string[];
        weight: number;
      };
      itaewon: {
        enabled: boolean;
        storeQrIds: string[];
        weight: number;
      };
      myeongdong: {
        enabled: boolean;
        storeQrIds: string[];
        weight: number;
      };
    };
    weightedStores?: Array<{
      qrId: string;
      weight: number;
      enabled: boolean;
    }>;
    excludeStoreQrIds?: string[];
    timeBasedSettings?: {
      enabled: boolean;
      morning: {
        storeQrIds: string[];
        weight: number;
      };
      afternoon: {
        storeQrIds: string[];
        weight: number;
      };
      evening: {
        storeQrIds: string[];
        weight: number;
      };
      night: {
        storeQrIds: string[];
        weight: number;
      };
    };
  };
  priority: number;
  usageCount: number;
  lastUsed?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExperienceConfigRequest {
  name: string;
  description?: string;
  type: IExperienceConfig["type"];
  isDefault?: boolean;
  settings: IExperienceConfig["settings"];
  priority?: number;
}

export interface UpdateExperienceConfigRequest extends Partial<CreateExperienceConfigRequest> {
  isActive?: boolean;
}
