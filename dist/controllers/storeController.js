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
exports.getNearbyStores = exports.deleteStore = exports.updateStore = exports.createStore = exports.getStoreById = exports.getStoreByQR = exports.getAllStores = void 0;
const storeService = __importStar(require("@/services/storeService"));
const responseFormatter_1 = require("@/utils/responseFormatter");
const constants_1 = require("@/utils/constants");
const getAllStores = async (req, res) => {
    try {
        const { category, area, active } = req.query;
        const stores = await storeService.getAllStores({ category, area, active });
        res.json((0, responseFormatter_1.formatResponse)(true, "매장 목록 조회 성공", stores));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.getAllStores = getAllStores;
const getStoreByQR = async (req, res) => {
    try {
        const { qrId } = req.params;
        const store = await storeService.getStoreByQR(qrId);
        if (!store) {
            res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, responseFormatter_1.formatResponse)(false, "매장을 찾을 수 없습니다", null, constants_1.HTTP_STATUS.NOT_FOUND));
            return;
        }
        res.json((0, responseFormatter_1.formatResponse)(true, "매장 조회 성공", store));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.getStoreByQR = getStoreByQR;
const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const store = await storeService.getStoreById(id);
        if (!store) {
            res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, responseFormatter_1.formatResponse)(false, "매장을 찾을 수 없습니다", null, constants_1.HTTP_STATUS.NOT_FOUND));
            return;
        }
        res.json((0, responseFormatter_1.formatResponse)(true, "매장 조회 성공", store));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.getStoreById = getStoreById;
const createStore = async (req, res) => {
    try {
        const store = await storeService.createStore(req.body);
        res.status(constants_1.HTTP_STATUS.CREATED).json((0, responseFormatter_1.formatResponse)(true, "매장이 성공적으로 등록되었습니다", store));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.BAD_REQUEST));
    }
};
exports.createStore = createStore;
const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const store = await storeService.updateStore(id, req.body);
        if (!store) {
            res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, responseFormatter_1.formatResponse)(false, "매장을 찾을 수 없습니다", null, constants_1.HTTP_STATUS.NOT_FOUND));
            return;
        }
        res.json((0, responseFormatter_1.formatResponse)(true, "매장 정보가 성공적으로 수정되었습니다", store));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.BAD_REQUEST));
    }
};
exports.updateStore = updateStore;
const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await storeService.deleteStore(id);
        if (!result) {
            res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, responseFormatter_1.formatResponse)(false, "매장을 찾을 수 없습니다", null, constants_1.HTTP_STATUS.NOT_FOUND));
            return;
        }
        res.json((0, responseFormatter_1.formatResponse)(true, "매장이 비활성화되었습니다"));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.deleteStore = deleteStore;
const getNearbyStores = async (req, res) => {
    try {
        const { lat, lng } = req.params;
        const { radius, category } = req.query;
        const stores = await storeService.getNearbyStores(parseFloat(lat), parseFloat(lng), parseInt(radius || "1000"), category);
        res.json((0, responseFormatter_1.formatResponse)(true, "근처 매장 검색 성공", stores));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, errorMessage, null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.getNearbyStores = getNearbyStores;
//# sourceMappingURL=storeController.js.map