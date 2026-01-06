import { ApiResponse } from "@/types";
interface PaginationMeta {
    page?: number;
    limit?: number;
    total?: number;
}
interface PaginatedResponse<T> {
    success: boolean;
    data: T;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    timestamp: string;
}
declare class ResponseFormatter {
    static success<T>(data: T, message?: string, meta?: Record<string, any>): ApiResponse<T> & {
        meta: Record<string, any>;
        timestamp: string;
    };
    static error(message: string, code?: string, details?: any): {
        success: false;
        error: {
            code: string;
            message: string;
            details: any;
        };
        timestamp: string;
    };
    static paginated<T>(data: T, pagination: PaginationMeta): PaginatedResponse<T>;
}
export declare const formatResponse: <T>(success: boolean, message: string, data?: T, status?: number) => ApiResponse<T>;
export default ResponseFormatter;
//# sourceMappingURL=responseFormatter.d.ts.map