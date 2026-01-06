"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.checkPermission = exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = __importDefault(require("@/models/Admin"));
const constants_1 = require("@/utils/constants");
const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        const token = authHeader?.replace("Bearer ", "");
        if (!token) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({ error: "액세스 토큰이 필요합니다" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "spotline-admin-secret");
        const admin = await Admin_1.default.findById(decoded.adminId).select("-password");
        if (!admin || !admin.isActive) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({ error: "유효하지 않은 토큰입니다" });
            return;
        }
        req.admin = {
            adminId: admin._id.toString(),
            type: "admin",
        };
        next();
    }
    catch (error) {
        res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({ error: "토큰 검증에 실패했습니다" });
    }
};
exports.authenticateAdmin = authenticateAdmin;
const checkPermission = (resource, action) => {
    return (req, res, next) => {
        next();
    };
};
exports.checkPermission = checkPermission;
const requireRole = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.admin) {
                res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({ error: "인증이 필요합니다" });
                return;
            }
            const admin = await Admin_1.default.findById(req.admin.adminId);
            if (!admin || !roles.includes(admin.role)) {
                res.status(constants_1.HTTP_STATUS.FORBIDDEN).json({ error: "접근 권한이 없습니다" });
                return;
            }
            next();
        }
        catch (error) {
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "권한 확인 중 오류가 발생했습니다" });
        }
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=adminAuth.js.map