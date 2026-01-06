"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryStats = exports.deleteRecommendation = exports.updateRecommendation = exports.createRecommendation = exports.getRecommendationsByStore = exports.getRecommendationsByQR = void 0;
const Recommendation_1 = __importDefault(require("@/models/Recommendation"));
const Store_1 = __importDefault(require("@/models/Store"));
const getRecommendationsByQR = async (qrId, filters = {}) => {
    const store = await Store_1.default.findOne({
        "qrCode.id": qrId,
        "qrCode.isActive": true,
        isActive: true,
    });
    if (!store) {
        return null;
    }
    return (0, exports.getRecommendationsByStore)(store._id.toString(), filters);
};
exports.getRecommendationsByQR = getRecommendationsByQR;
const getRecommendationsByStore = async (storeId, filters = {}) => {
    const { category, limit = 10 } = filters;
    const filter = { fromStore: storeId, isActive: true };
    if (category) {
        filter.category = category;
    }
    return await Recommendation_1.default.find(filter).populate("toStore").sort({ priority: -1 }).limit(limit);
};
exports.getRecommendationsByStore = getRecommendationsByStore;
const createRecommendation = async (recommendationData) => {
    const recommendation = new Recommendation_1.default(recommendationData);
    return await recommendation.save();
};
exports.createRecommendation = createRecommendation;
const updateRecommendation = async (id, updateData) => {
    return await Recommendation_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};
exports.updateRecommendation = updateRecommendation;
const deleteRecommendation = async (id) => {
    return await Recommendation_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
exports.deleteRecommendation = deleteRecommendation;
const getCategoryStats = async () => {
    return await Recommendation_1.default.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
};
exports.getCategoryStats = getCategoryStats;
//# sourceMappingURL=recommendationService.js.map