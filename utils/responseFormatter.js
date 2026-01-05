// API 응답 포맷 유틸리티

class ResponseFormatter {
  static success(data, message = 'Success', meta = {}) {
    return {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString()
    };
  }

  static error(message, code = 'INTERNAL_ERROR', details = null) {
    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      timestamp: new Date().toISOString()
    };
  }

  static paginated(data, pagination) {
    return {
      success: true,
      data,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ResponseFormatter;