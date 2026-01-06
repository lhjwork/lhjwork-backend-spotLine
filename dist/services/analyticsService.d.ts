import { LogEventRequest } from "@/types";
interface AnalyticsFilters {
    startDate?: string;
    endDate?: string;
    period?: "day" | "week" | "month";
}
interface RecommendationPerformanceFilters extends AnalyticsFilters {
    qrCode?: string;
    category?: string;
    limit?: number;
}
interface DailyTrafficFilters extends AnalyticsFilters {
    qrCode?: string;
    days?: number;
}
export declare const logEvent: (eventData: LogEventRequest & {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
}) => Promise<{
    id: string;
} | null>;
export declare const getQRStats: (qrId: string, filters?: AnalyticsFilters) => Promise<any>;
export declare const getStoreStats: (storeId: string, filters?: AnalyticsFilters) => Promise<any>;
export declare const getRecommendationPerformance: (filters?: RecommendationPerformanceFilters) => Promise<any[]>;
export declare const getDailyTraffic: (filters?: DailyTrafficFilters) => Promise<any[]>;
export {};
//# sourceMappingURL=analyticsService.d.ts.map