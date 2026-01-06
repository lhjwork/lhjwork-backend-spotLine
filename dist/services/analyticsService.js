"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyTraffic = exports.getRecommendationPerformance = exports.getStoreStats = exports.getQRStats = exports.logEvent = void 0;
const Analytics_1 = __importDefault(require("@/models/Analytics"));
const Store_1 = __importDefault(require("@/models/Store"));
const logEvent = async (eventData) => {
    const store = await Store_1.default.findById(eventData.store);
    if (!store) {
        return null;
    }
    const analytics = new Analytics_1.default(eventData);
    const saved = await analytics.save();
    return { id: saved._id.toString() };
};
exports.logEvent = logEvent;
const getQRStats = async (qrId, filters = {}) => {
    const { startDate, endDate } = filters;
    const matchFilter = { qrCode: qrId };
    if (startDate || endDate) {
        matchFilter.timestamp = {};
        if (startDate)
            matchFilter.timestamp.$gte = new Date(startDate);
        if (endDate)
            matchFilter.timestamp.$lte = new Date(endDate);
    }
    const stats = await Analytics_1.default.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: null,
                totalEvents: { $sum: 1 },
                eventBreakdown: {
                    $push: {
                        eventType: "$eventType",
                        count: 1,
                    },
                },
            },
        },
    ]);
    return stats[0] || { totalEvents: 0, eventBreakdown: [] };
};
exports.getQRStats = getQRStats;
const getStoreStats = async (storeId, filters = {}) => {
    const { startDate, endDate } = filters;
    const matchFilter = { store: storeId };
    if (startDate || endDate) {
        matchFilter.timestamp = {};
        if (startDate)
            matchFilter.timestamp.$gte = new Date(startDate);
        if (endDate)
            matchFilter.timestamp.$lte = new Date(endDate);
    }
    const stats = await Analytics_1.default.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: "$eventType",
                count: { $sum: 1 },
            },
        },
    ]);
    return stats;
};
exports.getStoreStats = getStoreStats;
const getRecommendationPerformance = async (filters = {}) => {
    const { qrCode, startDate, endDate, limit = 20 } = filters;
    const matchFilter = { eventType: "recommendation_click" };
    if (qrCode)
        matchFilter.qrCode = qrCode;
    if (startDate || endDate) {
        matchFilter.timestamp = {};
        if (startDate)
            matchFilter.timestamp.$gte = new Date(startDate);
        if (endDate)
            matchFilter.timestamp.$lte = new Date(endDate);
    }
    return await Analytics_1.default.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: "$targetStore",
                clicks: { $sum: 1 },
            },
        },
        { $sort: { clicks: -1 } },
        { $limit: limit },
    ]);
};
exports.getRecommendationPerformance = getRecommendationPerformance;
const getDailyTraffic = async (filters = {}) => {
    const { startDate, endDate, qrCode, days = 30 } = filters;
    const matchFilter = {};
    if (qrCode)
        matchFilter.qrCode = qrCode;
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date(endDateObj.getTime() - days * 24 * 60 * 60 * 1000);
    matchFilter.timestamp = {
        $gte: startDateObj,
        $lte: endDateObj,
    };
    return await Analytics_1.default.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$timestamp",
                    },
                },
                totalEvents: { $sum: 1 },
                qrScans: {
                    $sum: {
                        $cond: [{ $eq: ["$eventType", "qr_scan"] }, 1, 0],
                    },
                },
            },
        },
        { $sort: { _id: 1 } },
    ]);
};
exports.getDailyTraffic = getDailyTraffic;
//# sourceMappingURL=analyticsService.js.map