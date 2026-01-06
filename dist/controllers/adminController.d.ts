import { Request, Response } from "express";
import { AuthenticatedRequest, LoginRequest, CreateAdminRequest } from "@/types";
export declare const login: (req: Request<{}, {}, LoginRequest>, res: Response) => Promise<void>;
export declare const getProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createAdmin: (req: Request<{}, {}, CreateAdminRequest>, res: Response) => Promise<void>;
export declare const verifyToken: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map