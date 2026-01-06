# 🧪 Spotline Admin API 테스트 가이드

## 🚀 빠른 테스트

### 1. 서버 실행 확인
```bash
curl http://localhost:4000/health
```

**예상 응답**:
```json
{
  "status": "OK",
  "message": "Spotline API is running (TypeScript)",
  "timestamp": "2026-01-06T12:00:00.000Z",
  "koreanTime": "2026. 01. 06. 오후 9:00:00",
  "timezone": "Asia/Seoul (KST, UTC+9)",
  "version": "2.0.0-ts"
}
```

### 2. 관리자 로그인
```bash
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "spotline-admin", "password": "12341234"}'
```

**예상 응답**:
```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "admin": {
      "id": "695bad104e53e6bb484d0b35",
      "username": "spotline-admin",
      "email": "admin@spotline.co.kr",
      "role": "super_admin",
      "lastLogin": "2026-01-06T12:24:36.716Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

**토큰 저장**: 응답에서 받은 `token` 값을 복사해서 다음 요청들에 사용하세요.

### 3. 매장 목록 조회
```bash
curl -X GET "http://localhost:4000/api/admin/stores?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. 추천 목록 조회
```bash
curl -X GET "http://localhost:4000/api/admin/recommendations?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. 대시보드 통계 조회
```bash
curl -X GET "http://localhost:4000/api/admin/analytics/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📋 전체 API 테스트 스크립트

### Bash 스크립트 (test-api.sh)
```bash
#!/bin/bash

BASE_URL="http://localhost:4000"
echo "🚀 Spotline Admin API 테스트 시작"

# 1. 서버 상태 확인
echo "1. 서버 상태 확인..."
curl -s "$BASE_URL/health" | jq '.'

# 2. 로그인
echo -e "\n2. 관리자 로그인..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "spotline-admin", "password": "12341234"}')

echo $LOGIN_RESPONSE | jq '.'

# 토큰 추출
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" = "null" ]; then
  echo "❌ 로그인 실패"
  exit 1
fi

echo "✅ 로그인 성공, 토큰: ${TOKEN:0:20}..."

# 3. 매장 목록 조회
echo -e "\n3. 매장 목록 조회..."
curl -s -X GET "$BASE_URL/api/admin/stores?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.stores[] | {name, category, address: .location.address}'

# 4. 추천 목록 조회
echo -e "\n4. 추천 목록 조회..."
curl -s -X GET "$BASE_URL/api/admin/recommendations?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.recommendations[] | {from: .fromStore.name, to: .toStore.name, category, priority}'

# 5. 대시보드 통계
echo -e "\n5. 대시보드 통계..."
curl -s -X GET "$BASE_URL/api/admin/analytics/dashboard" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {stores, recommendations}'

echo -e "\n✅ 모든 테스트 완료!"
```

### 실행 방법
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 🌐 Postman 컬렉션

### 환경 변수 설정
```json
{
  "name": "Spotline Admin API",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:4000",
      "enabled": true
    },
    {
      "key": "adminToken",
      "value": "",
      "enabled": true
    }
  ]
}
```

### 요청 컬렉션
1. **로그인**
   - Method: POST
   - URL: `{{baseUrl}}/api/admin/login`
   - Body: `{"username": "spotline-admin", "password": "12341234"}`
   - Tests: `pm.environment.set("adminToken", pm.response.json().data.token);`

2. **매장 목록**
   - Method: GET
   - URL: `{{baseUrl}}/api/admin/stores`
   - Headers: `Authorization: Bearer {{adminToken}}`

3. **추천 목록**
   - Method: GET
   - URL: `{{baseUrl}}/api/admin/recommendations`
   - Headers: `Authorization: Bearer {{adminToken}}`

---

## 🔍 프론트엔드 연동 테스트

### JavaScript 테스트 코드
```html
<!DOCTYPE html>
<html>
<head>
    <title>Spotline Admin API 테스트</title>
</head>
<body>
    <h1>Spotline Admin API 테스트</h1>
    <div id="result"></div>

    <script>
        const API_BASE = 'http://localhost:4000';
        let adminToken = '';

        // 로그인 테스트
        async function testLogin() {
            try {
                const response = await fetch(`${API_BASE}/api/admin/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'spotline-admin',
                        password: '12341234'
                    })
                });

                const data = await response.json();
                console.log('로그인 응답:', data);

                if (data.success) {
                    adminToken = data.data.token;
                    document.getElementById('result').innerHTML += '<p>✅ 로그인 성공</p>';
                    testStores();
                } else {
                    document.getElementById('result').innerHTML += '<p>❌ 로그인 실패</p>';
                }
            } catch (error) {
                console.error('로그인 에러:', error);
                document.getElementById('result').innerHTML += '<p>❌ 로그인 에러</p>';
            }
        }

        // 매장 목록 테스트
        async function testStores() {
            try {
                const response = await fetch(`${API_BASE}/api/admin/stores?page=1&limit=5`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });

                const data = await response.json();
                console.log('매장 목록:', data);

                if (data.success) {
                    document.getElementById('result').innerHTML += 
                        `<p>✅ 매장 목록 조회 성공 (${data.data.stores.length}개)</p>`;
                    testRecommendations();
                } else {
                    document.getElementById('result').innerHTML += '<p>❌ 매장 목록 조회 실패</p>';
                }
            } catch (error) {
                console.error('매장 목록 에러:', error);
                document.getElementById('result').innerHTML += '<p>❌ 매장 목록 에러</p>';
            }
        }

        // 추천 목록 테스트
        async function testRecommendations() {
            try {
                const response = await fetch(`${API_BASE}/api/admin/recommendations?page=1&limit=5`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });

                const data = await response.json();
                console.log('추천 목록:', data);

                if (data.success) {
                    document.getElementById('result').innerHTML += 
                        `<p>✅ 추천 목록 조회 성공 (${data.data.recommendations.length}개)</p>`;
                    testDashboard();
                } else {
                    document.getElementById('result').innerHTML += '<p>❌ 추천 목록 조회 실패</p>';
                }
            } catch (error) {
                console.error('추천 목록 에러:', error);
                document.getElementById('result').innerHTML += '<p>❌ 추천 목록 에러</p>';
            }
        }

        // 대시보드 테스트
        async function testDashboard() {
            try {
                const response = await fetch(`${API_BASE}/api/admin/analytics/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });

                const data = await response.json();
                console.log('대시보드:', data);

                if (data.success) {
                    document.getElementById('result').innerHTML += 
                        `<p>✅ 대시보드 조회 성공</p>`;
                    document.getElementById('result').innerHTML += 
                        `<p>📊 매장: ${data.data.stores.total}개, 추천: ${data.data.recommendations.total}개</p>`;
                } else {
                    document.getElementById('result').innerHTML += '<p>❌ 대시보드 조회 실패</p>';
                }
            } catch (error) {
                console.error('대시보드 에러:', error);
                document.getElementById('result').innerHTML += '<p>❌ 대시보드 에러</p>';
            }
        }

        // 테스트 시작
        testLogin();
    </script>
</body>
</html>
```

---

## 🐛 문제 해결

### 1. CORS 에러
**증상**: `Access to fetch at 'http://localhost:4000' from origin 'http://localhost:3002' has been blocked by CORS policy`

**해결**: 서버에서 CORS 설정이 올바르게 되어 있는지 확인
```javascript
app.use(cors({
  origin: true, // 개발 환경에서는 모든 origin 허용
  credentials: true
}));
```

### 2. 401 Unauthorized
**증상**: `{"success":false,"message":"인증이 필요합니다.","status":401}`

**해결**: 
- 로그인 후 토큰을 올바르게 받았는지 확인
- Authorization 헤더가 `Bearer TOKEN` 형식인지 확인
- 토큰이 만료되지 않았는지 확인 (24시간)

### 3. 404 Not Found
**증상**: API 엔드포인트를 찾을 수 없음

**해결**:
- URL이 올바른지 확인 (`/api/admin/stores`)
- 서버가 실행 중인지 확인 (`http://localhost:4000`)

### 4. 500 Internal Server Error
**증상**: 서버 내부 오류

**해결**:
- 서버 로그 확인
- MongoDB 연결 상태 확인
- 요청 데이터 형식 확인

---

## 📊 성능 테스트

### 부하 테스트 (Apache Bench)
```bash
# 로그인 API 부하 테스트
ab -n 100 -c 10 -p login.json -T application/json http://localhost:4000/api/admin/login

# login.json 파일 내용
# {"username": "spotline-admin", "password": "12341234"}
```

### 응답 시간 측정
```bash
# 매장 목록 API 응답 시간
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:4000/api/admin/stores" \
  -H "Authorization: Bearer YOUR_TOKEN"

# curl-format.txt 파일 내용
#      time_namelookup:  %{time_namelookup}\n
#         time_connect:  %{time_connect}\n
#      time_appconnect:  %{time_appconnect}\n
#     time_pretransfer:  %{time_pretransfer}\n
#        time_redirect:  %{time_redirect}\n
#   time_starttransfer:  %{time_starttransfer}\n
#                      ----------\n
#           time_total:  %{time_total}\n
```

---

이제 모든 Admin API가 완벽하게 구현되고 테스트되었습니다! 프론트엔드 개발자는 이 가이드를 참고하여 API 연동을 진행할 수 있습니다.