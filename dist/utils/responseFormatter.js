"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatResponse = void 0;
class ResponseFormatter {
    static success(data, message = "Success", meta = {}) {
        return {
            success: true,
            message,
            data,
            meta,
            timestamp: new Date().toISOString(),
        };
    }
    static error(message, code = "INTERNAL_ERROR", details = null) {
        return {
            success: false,
            error: {
                code,
                message,
                details,
            },
            timestamp: new Date().toISOString(),
        };
    }
    static paginated(data, pagination) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const total = pagination.total || 0;
        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            timestamp: new Date().toISOString(),
        };
    }
}
const formatResponse = (success, message, data, status) => ({
    success,
    message,
    data,
    status,
});
exports.formatResponse = formatResponse;
exports.default = ResponseFormatter;
//# sourceMappingURL=responseFormatter.js.map