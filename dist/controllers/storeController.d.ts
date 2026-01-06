import { Request, Response } from "express";
import { StoreQueryParams, CreateStoreRequest } from "@/types";
export declare const getAllStores: (req: Request<{}, {}, {}, StoreQueryParams>, res: Response) => Promise<void>;
export declare const getStoreByQR: (req: Request<{
    qrId: string;
}>, res: Response) => Promise<void>;
export declare const getStoreById: (req: Request<{
    id: string;
}>, res: Response) => Promise<void>;
export declare const createStore: (req: Request<{}, {}, CreateStoreRequest>, res: Response) => Promise<void>;
export declare const updateStore: (req: Request<{
    id: string;
}, {}, Partial<CreateStoreRequest>>, res: Response) => Promise<void>;
export declare const deleteStore: (req: Request<{
    id: string;
}>, res: Response) => Promise<void>;
export declare const getNearbyStores: (req: Request<{
    lat: string;
    lng: string;
}, {}, {}, {
    radius?: string;
    category?: string;
}>, res: Response) => Promise<void>;
//# sourceMappingURL=storeController.d.ts.map