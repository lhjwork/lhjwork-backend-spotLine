import { Request, Response } from "express";
import { RecommendationQueryParams, CreateRecommendationRequest } from "@/types";
export declare const getRecommendationsByQR: (req: Request<{
    qrId: string;
}, {}, {}, RecommendationQueryParams>, res: Response) => Promise<void>;
export declare const getRecommendationsByStore: (req: Request<{
    storeId: string;
}, {}, {}, RecommendationQueryParams>, res: Response) => Promise<void>;
export declare const createRecommendation: (req: Request<{}, {}, CreateRecommendationRequest>, res: Response) => Promise<void>;
export declare const updateRecommendation: (req: Request<{
    id: string;
}, {}, Partial<CreateRecommendationRequest>>, res: Response) => Promise<void>;
export declare const deleteRecommendation: (req: Request<{
    id: string;
}>, res: Response) => Promise<void>;
export declare const getCategoryStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=recommendationController.d.ts.map