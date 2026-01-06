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
exports.getCategoryStats = exports.deleteRecommendation = exports.updateRecommendation = exports.createRecommendation = exports.getRecommendationsByStore = exports.getRecommendationsByQR = void 0;
const recommendationService = __importStar(require("@/services/recommendationService"));
const responseFormatter_1 = require("@/utils/responseFormatter");
const constants_1 = require("@/utils/constants");
const getRecommendationsByQR = async (req, res) => {
    try {
        const { qrId } = req.params;
        const { category, limit } = req.query;
        const recommendations = await recommendationService.getRecommendationsByQR(qrId, { category, limit: parseInt(limit || "10") });
        if (!recommendations) {
            res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, responseFormatter_1.formatResponse)(false, "매장을 찾을 수 없습니다", null, constants_1.HTTP_STATUS.NOT_FOUND));
            return;
        }
        res.json((0, responseFormatter_1.formatResponse)(true, "QR 기반 추천 조회 성공", recommendations));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.getRecommendationsByQR = getRecommendationsByQR;
const getRecommendationsByStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { category, limit } = req.query;
        const recommendations = await recommendationService.getRecommendationsByStore(storeId, { category, limit: parseInt(limit || "10") });
        res.json((0, responseFormatter_1.formatResponse)(true, "매장별 추천 조회 성공", recommendations));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.getRecommendationsByStore = getRecommendationsByStore;
const createRecommendation = async (req, res) => {
    try {
        const recommendation = await recommendationService.createRecommendation(req.body);
        res.status(constants_1.HTTP_STATUS.CREATED).json((0, responseFormatter_1.formatResponse)(true, "추천 관계가 성공적으로 생성되었습니다", recommendation));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.BAD_REQUEST));
    }
};
exports.createRecommendation = createRecommendation;
const updateRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const recommendation = await recommendationService.updateRecommendation(id, req.body);
        if (!recommendation) {
            res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, responseFormatter_1.formatResponse)(false, "추천을 찾을 수 없습니다", null, constants_1.HTTP_STATUS.NOT_FOUND));
            return;
        }
        res.json((0, responseFormatter_1.formatResponse)(true, "추천 관계가 성공적으로 수정되었습니다", recommendation));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.BAD_REQUEST));
    }
};
exports.updateRecommendation = updateRecommendation;
const deleteRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await recommendationService.deleteRecommendation(id);
        if (!result) {
            res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, responseFormatter_1.formatResponse)(false, "추천을 찾을 수 없습니다", null, constants_1.HTTP_STATUS.NOT_FOUND));
            return;
        }
        res.json((0, responseFormatter_1.formatResponse)(true, "추천이 비활성화되었습니다"));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.deleteRecommendation = deleteRecommendation;
const getCategoryStats = async (req, res) => {
    try {
        const stats = await recommendationService.getCategoryStats();
        res.json((0, responseFormatter_1.formatResponse)(true, "카테고리별 통계 조회 성공", stats));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.getCategoryStats = getCategoryStats;
//# sourceMappingURL=recommendationController.js.map