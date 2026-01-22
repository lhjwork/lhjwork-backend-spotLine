import dotenv from "dotenv";
dotenv.config();

// AWS SDK 조건부 import
let S3Client: any, PutObjectCommand: any, DeleteObjectCommand: any, GetObjectCommand: any;
try {
  const awsS3 = require("@aws-sdk/client-s3");
  S3Client = awsS3.S3Client;
  PutObjectCommand = awsS3.PutObjectCommand;
  DeleteObjectCommand = awsS3.DeleteObjectCommand;
  GetObjectCommand = awsS3.GetObjectCommand;
} catch (error) {
  console.warn("@aws-sdk/client-s3 패키지가 설치되지 않았습니다. S3 업로드 기능이 제한될 수 있습니다.");
}

// sharp 조건부 import
let sharp: any;
try {
  sharp = require("sharp");
} catch (error) {
  console.warn("sharp 패키지가 설치되지 않았습니다. 이미지 최적화 기능이 제한될 수 있습니다.");
}

import { v4 as uuidv4 } from "uuid";

// S3 클라이언트 초기화
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION || "ap-northeast-2";

if (!awsAccessKeyId || !awsSecretAccessKey) {
  console.error("[ERROR] AWS 자격증명이 설정되지 않았습니다!");
  console.error("AWS_ACCESS_KEY_ID:", awsAccessKeyId ? "설정됨" : "없음");
  console.error("AWS_SECRET_ACCESS_KEY:", awsSecretAccessKey ? "설정됨" : "없음");
}

const s3Client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId!,
    secretAccessKey: awsSecretAccessKey!,
  },
});

// S3 설정 - 임시로 하드코딩해서 테스트
const BUCKET_NAME = process.env.AWS_S3_BUCKET || "lhj-spotline-assets-2026";
const BUCKET_URL = process.env.AWS_S3_BUCKET_URL || "https://lhj-spotline-assets-2026.s3.ap-northeast-2.amazonaws.com";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB
const ALLOWED_TYPES = (process.env.ALLOWED_IMAGE_TYPES || "image/jpeg,image/png,image/webp").split(",");

// 환경 변수 디버깅
console.log("[DEBUG] S3 Environment Variables:");
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "***설정됨***" : "undefined");
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "***설정됨***" : "undefined");
console.log("AWS_S3_BUCKET:", process.env.AWS_S3_BUCKET);
console.log("AWS_S3_BUCKET_URL:", process.env.AWS_S3_BUCKET_URL);
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("BUCKET_NAME (final):", BUCKET_NAME);
console.log("BUCKET_URL (final):", BUCKET_URL);

export interface UploadResult {
  imageKey: string;
  imageUrl: string;
  uploadedAt: Date;
}

/**
 * 이미지를 S3에 업로드합니다
 */
export const uploadImage = async (
  file: any, // Express.Multer.File 대신 any 사용
  storeId: string,
  imageType: "main-banner",
): Promise<UploadResult> => {
  console.log("[DEBUG] S3 uploadImage called with:", {
    fileName: file.originalname,
    fileSize: file.size,
    storeId,
    imageType,
    bucketName: BUCKET_NAME,
    bucketUrl: BUCKET_URL,
  });

  try {
    // AWS 자격증명 재검증
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error("AWS 자격증명이 설정되지 않았습니다. AWS_ACCESS_KEY_ID와 AWS_SECRET_ACCESS_KEY를 확인하세요.");
    }

    // 파일 검증
    validateFile(file);

    // 이미지 최적화
    const optimizedBuffer = await optimizeImage(file.buffer);

    // S3 키 생성
    const fileExtension = getFileExtension(file.originalname);
    const fileName = `${uuidv4()}-${file.originalname}`;
    const imageKey = `stores/${storeId}/${imageType}/${fileName}`;

    console.log("[DEBUG] Generated S3 key:", imageKey);
    console.log("[DEBUG] Using bucket:", BUCKET_NAME);

    if (!BUCKET_NAME) {
      throw new Error("AWS_S3_BUCKET 환경 변수가 설정되지 않았습니다");
    }

    // S3 업로드
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageKey,
      Body: optimizedBuffer,
      ContentType: file.mimetype,
      CacheControl: "max-age=31536000", // 1년 캐시
    });

    console.log("[DEBUG] Sending upload command to S3...");
    await s3Client.send(uploadCommand);
    console.log("[DEBUG] S3 upload completed successfully");

    return {
      imageKey,
      imageUrl: `${BUCKET_URL}/${imageKey}`,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error("S3 업로드 오류:", error);
    throw new Error("이미지 업로드에 실패했습니다");
  }
};

/**
 * S3에서 이미지를 삭제합니다
 */
export const deleteImage = async (imageKey: string): Promise<void> => {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageKey,
    });

    await s3Client.send(deleteCommand);
  } catch (error) {
    console.error("S3 삭제 오류:", error);
    throw new Error("이미지 삭제에 실패했습니다");
  }
};

/**
 * S3 키로부터 이미지 URL을 생성합니다
 */
export const getImageUrl = (imageKey: string): string => {
  if (!imageKey) return "";
  return `${BUCKET_URL}/${imageKey}`;
};

/**
 * 이미지 키 배열을 URL 배열로 변환합니다
 */
export const getImageUrls = (imageKeys: string[]): string[] => {
  return imageKeys.filter((key) => key).map((key) => getImageUrl(key));
};

/**
 * 파일 검증
 */
const validateFile = (file: any): void => {
  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 업로드 가능합니다.`);
  }

  // 파일 형식 검증
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error("지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 업로드 가능합니다.");
  }
};

/**
 * 이미지 최적화
 */
const optimizeImage = async (buffer: Buffer): Promise<Buffer> => {
  try {
    return await sharp(buffer)
      .resize(1920, 1080, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (error) {
    console.error("이미지 최적화 오류:", error);
    // 최적화 실패 시 원본 반환
    return buffer;
  }
};

/**
 * 파일 확장자 추출
 */
const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

/**
 * S3 설정 검증
 */
export const validateS3Config = (): void => {
  const requiredEnvVars = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_S3_BUCKET", "AWS_S3_BUCKET_URL"];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`필수 환경 변수가 설정되지 않았습니다: ${missingVars.join(", ")}`);
  }
};
