"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_CONFIG = exports.HTTP_STATUS = exports.PRIORITY_LEVELS = exports.BUSINESS_HOURS_FORMAT = exports.MAX_RECOMMENDATION_LIMIT = exports.DEFAULT_RECOMMENDATION_LIMIT = exports.MAX_SEARCH_RADIUS = exports.DEFAULT_SEARCH_RADIUS = exports.ADMIN_ROLES = exports.EVENT_TYPES = exports.RECOMMENDATION_CATEGORIES = exports.STORE_CATEGORIES = void 0;
exports.STORE_CATEGORIES = ["cafe", "restaurant", "exhibition", "hotel", "retail", "culture", "other"];
exports.RECOMMENDATION_CATEGORIES = [
    "next_meal",
    "dessert",
    "activity",
    "shopping",
    "culture",
    "rest",
];
exports.EVENT_TYPES = [
    "qr_scan",
    "page_view",
    "recommendation_click",
    "map_click",
    "store_visit",
];
exports.ADMIN_ROLES = ["admin", "super_admin"];
exports.DEFAULT_SEARCH_RADIUS = 1000;
exports.MAX_SEARCH_RADIUS = 5000;
exports.DEFAULT_RECOMMENDATION_LIMIT = 10;
exports.MAX_RECOMMENDATION_LIMIT = 50;
exports.BUSINESS_HOURS_FORMAT = {
    CLOSED: "closed",
    OPEN_24H: "24h",
    TIME_FORMAT: "HH:mm",
};
exports.PRIORITY_LEVELS = {
    LOW: 1,
    MEDIUM: 5,
    HIGH: 10,
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};
exports.JWT_CONFIG = {
    EXPIRES_IN: "24h",
    ALGORITHM: "HS256",
};
//# sourceMappingURL=constants.js.map