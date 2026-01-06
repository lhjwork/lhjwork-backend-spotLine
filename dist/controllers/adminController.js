"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createAdmin = exports.getProfile = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = __importDefault(require("@/models/Admin"));
const responseFormatter_1 = require("@/utils/responseFormatter");
const constants_1 = require("@/utils/constants");
const generateToken = (adminId) => {
    return jsonwebtoken_1.default.sign({ adminId, type: "admin" }, process.env.JWT_SECRET || "spotline-admin-secret", { expiresIn: constants_1.JWT_CONFIG.EXPIRES_IN });
};
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, responseFormatter_1.formatResponse)(false, "사용자명과 비밀번호를 입력해주세요.", null, constants_1.HTTP_STATUS.BAD_REQUEST));
            return;
        }
        const admin = await Admin_1.default.findOne({
            $or: [{ username: username }, { email: username }],
            isActive: true,
        });
        if (!admin) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, responseFormatter_1.formatResponse)(false, "잘못된 로그인 정보입니다.", null, constants_1.HTTP_STATUS.UNAUTHORIZED));
            return;
        }
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, responseFormatter_1.formatResponse)(false, "잘못된 로그인 정보입니다.", null, constants_1.HTTP_STATUS.UNAUTHORIZED));
            return;
        }
        admin.lastLogin = new Date();
        await admin.save();
        const token = generateToken(admin._id.toString());
        const adminData = {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            lastLogin: admin.lastLogin,
        };
        res.json((0, responseFormatter_1.formatResponse)(true, "로그인 성공", {
            admin: adminData,
            token,
            expiresIn: constants_1.JWT_CONFIG.EXPIRES_IN,
        }));
    }
    catch (error) {
        console.error("Admin login error:", error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, "서버 오류가 발생했습니다.", null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        if (!req.admin) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, responseFormatter_1.formatResponse)(false, "인증이 필요합니다.", null, constants_1.HTTP_STATUS.UNAUTHORIZED));
            return;
        }
        const admin = await Admin_1.default.findById(req.admin.adminId).select("-password");
        if (!admin) {
            res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, responseFormatter_1.formatResponse)(false, "관리자를 찾을 수 없습니다.", null, constants_1.HTTP_STATUS.NOT_FOUND));
            return;
        }
        res.json((0, responseFormatter_1.formatResponse)(true, "프로필 조회 성공", admin));
    }
    catch (error) {
        console.error("Get admin profile error:", error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, "서버 오류가 발생했습니다.", null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.getProfile = getProfile;
const createAdmin = async (req, res) => {
    try {
        const { username, email, password, role = "admin" } = req.body;
        if (!username || !email || !password) {
            res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, responseFormatter_1.formatResponse)(false, "모든 필드를 입력해주세요.", null, constants_1.HTTP_STATUS.BAD_REQUEST));
            return;
        }
        const existingAdmin = await Admin_1.default.findOne({
            $or: [{ username }, { email }],
        });
        if (existingAdmin) {
            res.status(constants_1.HTTP_STATUS.CONFLICT).json((0, responseFormatter_1.formatResponse)(false, "이미 존재하는 사용자명 또는 이메일입니다.", null, constants_1.HTTP_STATUS.CONFLICT));
            return;
        }
        const admin = new Admin_1.default({
            username,
            email,
            password,
            role,
        });
        await admin.save();
        const adminData = {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            createdAt: admin.createdAt,
        };
        res.status(constants_1.HTTP_STATUS.CREATED).json((0, responseFormatter_1.formatResponse)(true, "관리자 계정이 생성되었습니다.", adminData));
    }
    catch (error) {
        console.error("Create admin error:", error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, "서버 오류가 발생했습니다.", null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.createAdmin = createAdmin;
const verifyToken = async (req, res) => {
    try {
        if (!req.admin) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, responseFormatter_1.formatResponse)(false, "유효하지 않은 토큰입니다.", null, constants_1.HTTP_STATUS.UNAUTHORIZED));
            return;
        }
        const admin = await Admin_1.default.findById(req.admin.adminId).select("-password");
        if (!admin || !admin.isActive) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, responseFormatter_1.formatResponse)(false, "유효하지 않은 토큰입니다.", null, constants_1.HTTP_STATUS.UNAUTHORIZED));
            return;
        }
        res.json((0, responseFormatter_1.formatResponse)(true, "토큰이 유효합니다.", { admin }));
    }
    catch (error) {
        console.error("Verify token error:", error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, responseFormatter_1.formatResponse)(false, "서버 오류가 발생했습니다.", null, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=adminController.js.map