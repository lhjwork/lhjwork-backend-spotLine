import { IRecommendation, CreateRecommendationRequest } from "@/types";
interface RecommendationFilters {
    category?: string;
    limit?: number;
}
export declare const getRecommendationsByQR: (qrId: string, filters?: RecommendationFilters) => Promise<IRecommendation[] | null>;
export declare const getRecommendationsByStore: (storeId: string, filters?: RecommendationFilters) => Promise<IRecommendation[]>;
export declare const createRecommendation: (recommendationData: CreateRecommendationRequest) => Promise<IRecommendation>;
export declare const updateRecommendation: (id: string, updateData: Partial<CreateRecommendationRequest>) => Promise<IRecommendation | null>;
export declare const deleteRecommendation: (id: string) => Promise<IRecommendation | null>;
export declare const getCategoryStats: () => Promise<any[]>;
export {};
//# sourceMappingURL=recommendationService.d.ts.map