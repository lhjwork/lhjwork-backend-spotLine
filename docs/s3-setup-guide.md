# S3 버킷 설정 가이드

## AWS S3 버킷 설정

### 1. 버킷 정책 설정
버킷에 다음 정책을 적용하여 공개 읽기 권한을 부여합니다:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### 2. CORS 설정
웹 애플리케이션에서 이미지에 접근할 수 있도록 CORS를 설정합니다:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://your-admin-domain.com",
            "https://your-app-domain.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]
```

### 3. IAM 사용자 권한
S3 업로드를 위한 IAM 사용자에게 다음 권한을 부여합니다:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name"
        }
    ]
}
```

## 환경별 버킷 구성

### 개발 환경
- 버킷명: `spotline-dev-images`
- 리전: `ap-northeast-2` (서울)

### 프로덕션 환경
- 버킷명: `spotline-prod-images`
- 리전: `ap-northeast-2` (서울)

## CloudFront 설정 (선택사항)

### 1. CloudFront 배포 생성
- Origin Domain: S3 버킷 도메인
- Origin Path: 비워둠
- Viewer Protocol Policy: Redirect HTTP to HTTPS

### 2. 캐시 정책
- TTL 설정: Default TTL 86400 (1일)
- 이미지 파일에 대한 긴 캐시 시간 설정

### 3. 압축 설정
- Compress Objects Automatically: Yes

## 보안 강화 (선택사항)

### 1. 버킷 암호화
- Default Encryption: AES-256 또는 KMS

### 2. 버전 관리
- Versioning: Enabled (실수로 삭제된 이미지 복구용)

### 3. 액세스 로깅
- Server Access Logging: Enabled

## 모니터링 설정

### 1. CloudWatch 메트릭
- 요청 수 모니터링
- 에러율 모니터링
- 데이터 전송량 모니터링

### 2. 알림 설정
- 높은 에러율 알림
- 비정상적인 트래픽 알림

## 비용 최적화

### 1. 스토리지 클래스
- 자주 접근하는 이미지: Standard
- 오래된 이미지: Standard-IA (30일 후 자동 전환)

### 2. 라이프사이클 정책
```json
{
    "Rules": [
        {
            "ID": "ImageLifecycle",
            "Status": "Enabled",
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "STANDARD_IA"
                },
                {
                    "Days": 90,
                    "StorageClass": "GLACIER"
                }
            ]
        }
    ]
}
```

## 백업 전략

### 1. 교차 리전 복제
- 중요한 이미지의 경우 다른 리전에 복제

### 2. 정기 백업
- 주요 이미지들의 정기적인 백업 스케줄

## 문제 해결

### 1. 업로드 실패
- IAM 권한 확인
- 버킷 정책 확인
- CORS 설정 확인

### 2. 이미지 접근 불가
- 버킷 정책의 공개 읽기 권한 확인
- CloudFront 캐시 무효화

### 3. 느린 업로드
- 멀티파트 업로드 사용
- 이미지 압축 적용
- CloudFront 사용 고려