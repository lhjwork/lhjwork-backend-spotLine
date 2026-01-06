import { Request, Response, NextFunction } from "express";
interface MongoError extends Error {
    code?: number;
    keyValue?: Record<string, any>;
    errors?: Record<string, {
        message: string;
    }>;
    status?: number;
    stack?: string;
}
export declare const errorHandler: (err: MongoError, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map