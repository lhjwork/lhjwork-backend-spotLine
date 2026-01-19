# S3 이미지 업로드 API 명세서

## 개요
상점 이미지를 S3에 업로드하고 관리하기 위한 REST API 명세서입니다.

## 인증
모든 API는 관리자 인증이 필요합니다.
```
Authorization: Bearer {admin_jwt_token}
```

## 환경 변수
```env
# AWS S3 설정
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your-bucket-name
AWS_S3_BUCKET_URL=https://your-bucket-name.s3.ap-northeast-2.amazonaws.com

# 이미지 업로드 설정
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

## API 엔드포인트

### 1. 대표 이미지 업로드
상점의 대표 이미지를 업로드합니다.

**POST** `/admin/stores/:storeId/representative-image`

**Request:**
- Content-Type: `multipart/form-data`
- Body: 
  - `image`: 이미지 파일 (required)

**Response:**
```json
{
  "success": true,
  "message": "대표 이미지가 성공적으로 업로드되었습니다",
  "data": {
    "imageKey": "stores/store-123/representative/uuid-filename.jpg",
    "imageUrl": "https://bucket.s3.region.amazonaws.com/stores/store-123/representative/uuid-filename.jpg",
    "uploadedAt": "2026-01-20T10:30:00.000Z"
  }
}
```

### 2. 추가 이미지 업로드 (다중)
상점의 추가 이미지들을 업로드합니다.

**POST** `/admin/stores/:storeId/images`

**Request:**
- Content-Type: `multipart/form-data`
- Body: 
  - `images`: 이미지 파일 배열 (최대 5개)

**Response:**
```json
{
  "success": true,
  "message": "이미지가 성공적으로 업로드되었습니다",
  "data": {
    "uploadedImages": [
      {
        "imageKey": "stores/store-123/gallery/uuid-filename1.jpg",
        "imageUrl": "https://bucket.s3.region.amazonaws.com/stores/store-123/gallery/uuid-filename1.jpg"
      },
      {
        "imageKey": "stores/store-123/gallery/uuid-filename2.jpg",
        "imageUrl": "https://bucket.s3.region.amazonaws.com/stores/store-123/gallery/uuid-filename2.jpg"
      }
    ],
    "uploadedAt": "2026-01-20T10:30:00.000Z"
  }
}
```

### 3. 대표 이미지 삭제
상점의 대표 이미지를 삭제합니다.

**DELETE** `/admin/stores/:storeId/representative-image`

**Response:**
```json
{
  "success": true,
  "message": "대표 이미지가 성공적으로 삭제되었습니다",
  "data": null
}
```

### 4. 특정 이미지 삭제
상점의 특정 이미지를 삭제합니다.

**DELETE** `/admin/stores/:storeId/images/:imageKey`

**Parameters:**
- `imageKey`: URL 인코딩된 S3 키

**Response:**
```json
{
  "success": true,
  "message": "이미지가 성공적으로 삭제되었습니다",
  "data": null
}
```

### 5. 상점 정보 조회 (이미지 포함)
기존 상점 조회 API에 이미지 URL이 포함됩니다.

**GET** `/admin/stores/:storeId`

**Response:**
```json
{
  "success": true,
  "message": "상점 정보 조회 성공",
  "data": {
    "_id": "store-123",
    "name": "카페 스팟라인",
    "category": "cafe",
    "representativeImage": "stores/store-123/representative/uuid-filename.jpg",
    "representativeImageUrl": "https://bucket.s3.region.amazonaws.com/stores/store-123/representative/uuid-filename.jpg",
    "images": [
      "stores/store-123/gallery/uuid-filename1.jpg",
      "stores/store-123/gallery/uuid-filename2.jpg"
    ],
    "imageUrls": [
      "https://bucket.s3.region.amazonaws.com/stores/store-123/gallery/uuid-filename1.jpg",
      "https://bucket.s3.region.amazonaws.com/stores/store-123/gallery/uuid-filename2.jpg"
    ],
    // ... 기타 상점 정보
  }
}
```

### 6. 상점 목록 조회 (이미지 포함)
기존 상점 목록 조회 API에 이미지 URL이 포함됩니다.

**GET** `/admin/stores`

**Response:**
```json
{
  "success": true,
  "message": "상점 목록 조회 성공",
  "data": {
    "stores": [
      {
        "_id": "store-123",
        "name": "카페 스팟라인",
        "representativeImageUrl": "https://bucket.s3.region.amazonaws.com/stores/store-123/representative/uuid-filename.jpg",
        // ... 기타 정보
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

## 에러 응답

### 파일 형식 오류
```json
{
  "success": false,
  "message": "지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 업로드 가능합니다.",
  "error": "INVALID_FILE_TYPE",
  "statusCode": 400
}
```

### 파일 크기 초과
```json
{
  "success": false,
  "message": "파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.",
  "error": "FILE_TOO_LARGE",
  "statusCode": 400
}
```

### S3 업로드 실패
```json
{
  "success": false,
  "message": "이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.",
  "error": "UPLOAD_FAILED",
  "statusCode": 500
}
```

### 상점 없음
```json
{
  "success": false,
  "message": "상점을 찾을 수 없습니다.",
  "error": "STORE_NOT_FOUND",
  "statusCode": 404
}
```

### 이미지 없음
```json
{
  "success": false,
  "message": "삭제할 이미지를 찾을 수 없습니다.",
  "error": "IMAGE_NOT_FOUND",
  "statusCode": 404
}
```

## S3 키 구조
```
stores/
├── {storeId}/
│   ├── representative/
│   │   └── {uuid}-{originalname}.{ext}
│   └── gallery/
│       ├── {uuid}-{originalname1}.{ext}
│       ├── {uuid}-{originalname2}.{ext}
│       └── ...
```

## 이미지 처리 규칙
1. 파일명에 UUID 추가로 중복 방지
2. 원본 파일명 보존 (한글 지원)
3. 이미지 최적화 (선택사항)
4. 썸네일 생성 (선택사항)

## 보안 고려사항
1. 파일 형식 검증 (MIME 타입 + 확장자)
2. 파일 크기 제한
3. 악성 파일 스캔 (선택사항)
4. S3 버킷 정책 설정
5. CORS 설정

## 성능 최적화
1. CloudFront CDN 연동 (선택사항)
2. 이미지 압축 및 리사이징
3. 적절한 캐시 헤더 설정
4. 병렬 업로드 지원