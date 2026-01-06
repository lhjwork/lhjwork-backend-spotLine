"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyTraffic = exports.getRecommendationPerformance = exports.getStoreStats = exports.getQRStats = exports.logEvent = void 0;
const analyticsService = __importStar(require("@/services/analyticsService"));
const responseFormatter_1 = require("@/utils/responseFormatter");
const constants_1 = require("@/utils/constants");
const logEvent = async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            userAgent: req.headers["user-agent"],
            ipAddress: req.ip,
            referrer: req.headers.referer,
        };
        const result = await analyticsService.logEvent(eventData);
        if (!result) {
            res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, responseFormatter_1.formatResponse)(false, "매장을 찾을 수 없습니다", null, constants_1.HTTP_STATUS.NOT_FOUND));
            return;
        }
        res.status(constants_1.HTTP_STATUS.CREATED).json((0, responseFormatter_1.formatResponse)(true, "이벤트가 기록되었습니다", { id: result.id }));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.BAD_REQUEST));
    }
};
exports.logEvent = logEvent;
const getQRStats = async (req, res) => {
    try {
        const { qrId } = req.params;
        const { startDate, endDate, period } = req.query;
        const stats = await analyticsService.getQRStats(qrId, {
            startDate,
            endDate,
            period,
        });
        res.json((0, responseFormatter_1.formatResponse)(true, "QR 코드 통계 조회 성공", stats));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.getQRStats = getQRStats;
const getStoreStats = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { startDate, endDate, period } = req.query;
        const stats = await analyticsService.getStoreStats(storeId, {
            startDate,
            endDate,
            period,
        });
        res.json((0, responseFormatter_1.formatResponse)(true, "매장별 통계 조회 성공", stats));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.getStoreStats = getStoreStats;
const getRecommendationPerformance = async (req, res) => {
    try {
        const { qrCode, startDate, endDate, category, limit } = req.query;
        const performance = await analyticsService.getRecommendationPerformance({
            qrCode,
            startDate,
            endDate,
            category,
            limit: parseInt(limit || "20"),
        });
        res.json((0, responseFormatter_1.formatResponse)(true, "추천 성과 분석 조회 성공", performance));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.getRecommendationPerformance = getRecommendationPerformance;
const getDailyTraffic = async (req, res) => {
    try {
        const { startDate, endDate, qrCode, days } = req.query;
        const dailyStats = await analyticsService.getDailyTraffic({
            startDate,
            endDate,
            qrCode,
            days: parseInt(days || "30"),
        });
        res.json((0, responseFormatter_1.formatResponse)(true, "일별 트래픽 통계 조회 성공", dailyStats));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.getDailyTraffic = getDailyTraffic;
//# sourceMappingURL=analyticsController.js.map