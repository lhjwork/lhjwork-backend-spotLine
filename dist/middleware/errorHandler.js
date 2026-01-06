"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const constants_1 = require("@/utils/constants");
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        if (field) {
            res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
                error: `${field} 값이 이미 존재합니다: ${err.keyValue[field]}`,
            });
            return;
        }
    }
    if (err.name === "ValidationError" && err.errors) {
        const errors = Object.values(err.errors).map((e) => e.message);
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            error: "데이터 검증 실패",
            details: errors,
        });
        return;
    }
    if (err.name === "CastError") {
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            error: "잘못된 ID 형식입니다",
        });
        return;
    }
    if (err.name === "JsonWebTokenError") {
        res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            error: "유효하지 않은 토큰입니다",
        });
        return;
    }
    if (err.name === "TokenExpiredError") {
        res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            error: "토큰이 만료되었습니다",
        });
        return;
    }
    const status = err.status || constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || "서버 내부 오류가 발생했습니다";
    const errorResponse = { error: message };
    if (process.env.NODE_ENV === "development" && err.stack) {
        errorResponse.stack = err.stack;
    }
    res.status(status).json(errorResponse);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
        error: `요청한 엔드포인트를 찾을 수 없습니다: ${req.method} ${req.path}`,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map