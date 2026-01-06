import { Request, Response } from "express";
import { LogEventRequest, AnalyticsQueryParams } from "@/types";
export declare const logEvent: (req: Request<{}, {}, LogEventRequest>, res: Response) => Promise<void>;
export declare const getQRStats: (req: Request<{
    qrId: string;
}, {}, {}, AnalyticsQueryParams>, res: Response) => Promise<void>;
export declare const getStoreStats: (req: Request<{
    storeId: string;
}, {}, {}, AnalyticsQueryParams>, res: Response) => Promise<void>;
export declare const getRecommendationPerformance: (req: Request<{}, {}, {}, AnalyticsQueryParams & {
    qrCode?: string;
    category?: string;
    limit?: string;
}>, res: Response) => Promise<void>;
export declare const getDailyTraffic: (req: Request<{}, {}, {}, AnalyticsQueryParams & {
    qrCode?: string;
}>, res: Response) => Promise<void>;
//# sourceMappingURL=analyticsController.d.ts.map