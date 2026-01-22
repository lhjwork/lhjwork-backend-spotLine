// multer가 설치되어 있지 않을 경우를 대비한 조건부 import
let multer: any;
try {
  multer = require("multer");
} catch (error) {
  console.warn("multer 패키지가 설치되지 않았습니다. 이미지 업로드 기능이 제한될 수 있습니다.");
  // multer 대체 객체 생성
  multer = {
    memoryStorage: () => ({}),
    MulterError: class MulterError extends Error {
      code: string;
      constructor(code: string, message: string) {
        super(message);
        this.code = code;
      }
    },
  };
}

import { Request } from "express";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB
const ALLOWED_TYPES = (process.env.ALLOWED_IMAGE_TYPES || "image/jpeg,image/png,image/webp").split(",");

// 메모리 스토리지 사용 (S3 업로드를 위해)
const storage = multer.memoryStorage();

// 파일 필터 함수
const fileFilter = (req: Request, file: any, cb: any) => {
  // MIME 타입 검증
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 업로드 가능합니다."));
  }
};

// 단일 이미지 업로드 (대표 이미지용)
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
}).single("image");

// 다중 이미지 업로드 (갤러리용, 최대 5개)
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
}).array("images", 5);

// 에러 처리 미들웨어
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 업로드 가능합니다.`,
        error: "FILE_TOO_LARGE",
        statusCode: 400,
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "업로드 가능한 파일 수를 초과했습니다. 최대 5개까지 업로드 가능합니다.",
        error: "TOO_MANY_FILES",
        statusCode: 400,
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "예상하지 못한 필드에서 파일이 업로드되었습니다.",
        error: "UNEXPECTED_FIELD",
        statusCode: 400,
      });
    }
  }

  if (error.message.includes("지원하지 않는 파일 형식")) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: "INVALID_FILE_TYPE",
      statusCode: 400,
    });
  }

  // 기타 에러
  return res.status(500).json({
    success: false,
    message: "파일 업로드 중 오류가 발생했습니다.",
    error: "UPLOAD_ERROR",
    statusCode: 500,
  });
};
