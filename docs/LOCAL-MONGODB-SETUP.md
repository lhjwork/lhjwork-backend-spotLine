# SpotLine 로컬 MongoDB 설정 가이드

## 📋 개요

이 가이드는 SpotLine 프로젝트를 로컬 환경에서 개발할 때 MongoDB를 설정하는 방법을 설명합니다.

## 🔧 MongoDB 로컬 설치

### Windows 설치

1. **MongoDB Community Server 다운로드**

   ```
   https://www.mongodb.com/try/download/community
   ```

2. **설치 실행**

   - MSI 파일 실행
   - "Complete" 설치 선택
   - "Install MongoDB as a Service" 체크
   - "Install MongoDB Compass" 체크 (GUI 도구)

3. **환경 변수 설정** (선택사항)
   ```bash
   # MongoDB bin 폴더를 PATH에 추가
   C:\Program Files\MongoDB\Server\7.0\bin
   ```

### macOS 설치

```bash
# Homebrew 사용
brew tap mongodb/brew
brew install mongodb-community

# 서비스 시작
brew services start mongodb/brew/mongodb-community
```

### Linux (Ubuntu) 설치

```bash
# MongoDB 공식 GPG 키 추가
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# MongoDB 저장소 추가
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 패키지 업데이트 및 설치
sudo apt-get update
sudo apt-get install -y mongodb-org

# 서비스 시작
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 🚀 SpotLine 로컬 환경 설정

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일이 자동으로 생성되어 있습니다:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/spotline-dev
NODE_ENV=development
JWT_SECRET=spotLine-jwt-secret-local
```

### 2. MongoDB 서버 시작

```bash
# Windows (서비스로 설치된 경우 자동 시작)
net start MongoDB

# macOS/Linux
mongod

# 또는 서비스로 시작
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### 3. 데이터베이스 연결 테스트

```bash
# 로컬 MongoDB 연결 테스트
pnpm run test:db:local
```

성공 시 출력:

```
MongoDB 연결 테스트 중...
환경: development
연결 URI: mongodb://localhost:27017/spotline-dev
✅ MongoDB 연결 성공!
📁 사용 가능한 컬렉션: []
🌐 연결된 데이터베이스: spotline-dev
🏠 호스트: localhost
연결 테스트 완료
```

### 4. 로컬 데이터베이스 초기 설정

```bash
# 샘플 데이터와 함께 로컬 DB 설정
pnpm run setup:local
```

이 명령어는 다음을 수행합니다:

- 기본 관리자 계정 생성 (admin/admin123)
- 3개의 샘플 매장 생성
- 매장 간 추천 연결 생성
- 샘플 분석 데이터 생성

### 5. 로컬 서버 실행

```bash
# 로컬 환경으로 개발 서버 실행
pnpm run dev:local

# 또는 파일 변경 감지 모드
pnpm run dev:watch:local
```

## 🔍 MongoDB 관리 도구

### MongoDB Compass (GUI)

1. **MongoDB Compass 실행**
2. **연결 문자열 입력**: `mongodb://localhost:27017`
3. **Connect 클릭**
4. **spotline-dev 데이터베이스 확인**

### MongoDB Shell (CLI)

```bash
# MongoDB Shell 접속
mongosh

# 데이터베이스 선택
use spotline-dev

# 컬렉션 확인
show collections

# 매장 데이터 확인
db.stores.find().pretty()

# 관리자 계정 확인
db.admins.find().pretty()
```

## 📊 로컬 환경 테스트

### API 테스트

```bash
# 서버 상태 확인
curl http://localhost:4000/health

# 관리자 로그인
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# QR 스캔 테스트
curl http://localhost:4000/api/stores/spotline/cafe_gangnam_001
```

### 브라우저 테스트

- **메인 페이지**: http://localhost:4000
- **API 문서**: http://localhost:4000/api-docs
- **Health Check**: http://localhost:4000/health

## 🔄 환경 전환

### 로컬 → 프로덕션

```bash
# 프로덕션 환경으로 전환
cp .env.production .env

# 또는 환경 변수로 실행
NODE_ENV=production pnpm run dev
```

### 프로덕션 → 로컬

```bash
# 로컬 환경으로 전환
cp .env.local .env

# 또는 로컬 전용 명령어 사용
pnpm run dev:local
```

## 🛠️ 문제 해결

### MongoDB 연결 실패

**오류**: `ECONNREFUSED`

```bash
# MongoDB 서버 상태 확인
# Windows
net start MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod
```

**해결 방법**:

1. MongoDB 서버가 실행 중인지 확인
2. 포트 27017이 사용 중인지 확인
3. 방화벽 설정 확인

### 권한 오류

**오류**: `Permission denied`

```bash
# MongoDB 데이터 디렉토리 권한 확인
# Linux/macOS
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
```

### 포트 충돌

**오류**: `Port 27017 already in use`

```bash
# 포트 사용 프로세스 확인
# Windows
netstat -ano | findstr :27017

# macOS/Linux
lsof -i :27017

# 프로세스 종료 후 MongoDB 재시작
```

## 📋 개발 워크플로우

### 일일 개발 루틴

1. **MongoDB 서버 시작**

   ```bash
   # 서비스로 설치된 경우 자동 시작
   # 수동 시작이 필요한 경우
   mongod
   ```

2. **로컬 서버 실행**

   ```bash
   pnpm run dev:local
   ```

3. **개발 및 테스트**

   - API 테스트
   - 데이터베이스 확인
   - 기능 개발

4. **데이터 초기화** (필요시)
   ```bash
   pnpm run setup:local
   ```

### 데이터 백업/복원

```bash
# 로컬 데이터 백업
mongodump --db spotline-dev --out ./backup

# 데이터 복원
mongorestore --db spotline-dev ./backup/spotline-dev
```

## 🔗 유용한 링크

- **MongoDB 공식 문서**: https://docs.mongodb.com/
- **MongoDB Compass**: https://www.mongodb.com/products/compass
- **Mongoose 문서**: https://mongoosejs.com/docs/
- **MongoDB Shell 가이드**: https://docs.mongodb.com/mongodb-shell/

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. MongoDB 서버 실행 상태
2. 환경 변수 설정 (.env.local)
3. 포트 충돌 여부
4. 권한 설정

추가 도움이 필요하면 개발팀에 문의하세요: dev@spotline.com
