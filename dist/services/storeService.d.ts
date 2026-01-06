import { IStore, CreateStoreRequest } from "@/types";
interface StoreFilters {
    category?: string;
    area?: string;
    active?: string;
}
interface CategoryStats {
    _id: string;
    count: number;
}
export declare const getAllStores: (filters?: StoreFilters) => Promise<IStore[]>;
export declare const getStoreByQR: (qrId: string) => Promise<IStore | null>;
export declare const getStoreById: (id: string) => Promise<IStore | null>;
export declare const createStore: (storeData: CreateStoreRequest) => Promise<IStore>;
export declare const updateStore: (id: string, updateData: Partial<CreateStoreRequest>) => Promise<IStore | null>;
export declare const deleteStore: (id: string) => Promise<IStore | null>;
export declare const getNearbyStores: (lat: number, lng: number, radius?: number, category?: string) => Promise<IStore[]>;
export declare const existsById: (id: string) => Promise<boolean>;
export declare const getCategoryStats: () => Promise<CategoryStats[]>;
export {};
//# sourceMappingURL=storeService.d.ts.map