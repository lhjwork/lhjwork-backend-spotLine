import { Document, Types } from "mongoose";
import { Request } from "express";
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    status?: number;
}
export interface IStore extends Document {
    name: string;
    category: "cafe" | "restaurant" | "exhibition" | "hotel" | "retail" | "culture" | "other";
    location: {
        address: string;
        coordinates: {
            type: "Point";
            coordinates: [number, number];
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
        [key: string]: {
            open?: string;
            close?: string;
        };
    };
    description?: string;
    tags?: string[];
    images?: string[];
    qrCode: {
        id: string;
        isActive: boolean;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
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
export interface IAnalytics extends Document {
    qrCode: string;
    store: Types.ObjectId;
    eventType: "qr_scan" | "page_view" | "recommendation_click" | "map_click" | "store_visit";
    targetStore?: Types.ObjectId;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    timestamp: Date;
    metadata?: {
        category?: string;
        position?: number;
        duration?: number;
    };
}
export interface JwtPayload {
    adminId: string;
    type: "admin";
    iat?: number;
    exp?: number;
}
export interface AuthenticatedRequest extends Request {
    admin?: {
        adminId: string;
        type: string;
    };
}
export interface EnvConfig {
    PORT: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    NODE_ENV: "development" | "production" | "test";
}
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
    description?: string;
    tags?: string[];
    images?: string[];
}
export interface CreateRecommendationRequest {
    fromStore: string;
    toStore: string;
    category: IRecommendation["category"];
    priority?: number;
    description?: string;
    tags?: string[];
}
export interface LogEventRequest {
    qrCode: string;
    store: string;
    eventType: IAnalytics["eventType"];
    targetStore?: string;
    sessionId?: string;
    metadata?: IAnalytics["metadata"];
}
//# sourceMappingURL=index.d.ts.map