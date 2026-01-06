import { ApiResponse } from "@/types";

// API 응답 포맷 유틸리티

interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

class ResponseFormatter {
  static success<T>(data: T, message: string = "Success", meta: Record<string, any> = {}): ApiResponse<T> & { meta: Record<string, any>; timestamp: string } {
    return {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    message: string,
    code: string = "INTERNAL_ERROR",
    details: any = null
  ): {
    success: false;
    error: {
      code: string;
      message: string;
      details: any;
    };
    timestamp: string;
  } {
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

  static paginated<T>(data: T, pagination: PaginationMeta): PaginatedResponse<T> {
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

// 간단한 응답 포맷 함수들
export const formatResponse = <T>(success: boolean, message: string, data?: T, status?: number): ApiResponse<T> => ({
  success,
  message,
  data,
  status,
});

export default ResponseFormatter;
