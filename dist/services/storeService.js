"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryStats = exports.existsById = exports.getNearbyStores = exports.deleteStore = exports.updateStore = exports.createStore = exports.getStoreById = exports.getStoreByQR = exports.getAllStores = void 0;
const Store_1 = __importDefault(require("@/models/Store"));
const { v4: uuidv4 } = require("uuid");
const getAllStores = async (filters = {}) => {
    const { category, area, active } = filters;
    const filter = {};
    if (category)
        filter.category = category;
    if (area)
        filter["location.area"] = area;
    if (active !== undefined)
        filter.isActive = active === "true";
    return await Store_1.default.find(filter).sort({ createdAt: -1 });
};
exports.getAllStores = getAllStores;
const getStoreByQR = async (qrId) => {
    return await Store_1.default.findOne({
        "qrCode.id": qrId,
        "qrCode.isActive": true,
        isActive: true,
    });
};
exports.getStoreByQR = getStoreByQR;
const getStoreById = async (id) => {
    return await Store_1.default.findById(id);
};
exports.getStoreById = getStoreById;
const createStore = async (storeData) => {
    const store = new Store_1.default({
        ...storeData,
        qrCode: {
            id: storeData.qrCode?.id || uuidv4(),
            isActive: true,
        },
    });
    return await store.save();
};
exports.createStore = createStore;
const updateStore = async (id, updateData) => {
    return await Store_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};
exports.updateStore = updateStore;
const deleteStore = async (id) => {
    return await Store_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
exports.deleteStore = deleteStore;
const getNearbyStores = async (lat, lng, radius = 1000, category) => {
    const filter = {
        "location.coordinates": {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
                $maxDistance: radius,
            },
        },
        isActive: true,
    };
    if (category) {
        filter.category = category;
    }
    return await Store_1.default.find(filter);
};
exports.getNearbyStores = getNearbyStores;
const existsById = async (id) => {
    const count = await Store_1.default.countDocuments({ _id: id, isActive: true });
    return count > 0;
};
exports.existsById = existsById;
const getCategoryStats = async () => {
    return await Store_1.default.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
};
exports.getCategoryStats = getCategoryStats;
//# sourceMappingURL=storeService.js.map