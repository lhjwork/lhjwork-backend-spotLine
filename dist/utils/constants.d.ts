export declare const STORE_CATEGORIES: readonly ["cafe", "restaurant", "exhibition", "hotel", "retail", "culture", "other"];
export declare const RECOMMENDATION_CATEGORIES: readonly ["next_meal", "dessert", "activity", "shopping", "culture", "rest"];
export declare const EVENT_TYPES: readonly ["qr_scan", "page_view", "recommendation_click", "map_click", "store_visit"];
export declare const ADMIN_ROLES: readonly ["admin", "super_admin"];
export declare const DEFAULT_SEARCH_RADIUS = 1000;
export declare const MAX_SEARCH_RADIUS = 5000;
export declare const DEFAULT_RECOMMENDATION_LIMIT = 10;
export declare const MAX_RECOMMENDATION_LIMIT = 50;
export declare const BUSINESS_HOURS_FORMAT: {
    readonly CLOSED: "closed";
    readonly OPEN_24H: "24h";
    readonly TIME_FORMAT: "HH:mm";
};
export declare const PRIORITY_LEVELS: {
    readonly LOW: 1;
    readonly MEDIUM: 5;
    readonly HIGH: 10;
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const JWT_CONFIG: {
    readonly EXPIRES_IN: "24h";
    readonly ALGORITHM: "HS256";
};
export type StoreCategory = (typeof STORE_CATEGORIES)[number];
export type RecommendationCategory = (typeof RECOMMENDATION_CATEGORIES)[number];
export type EventType = (typeof EVENT_TYPES)[number];
export type AdminRole = (typeof ADMIN_ROLES)[number];
//# sourceMappingURL=constants.d.ts.map