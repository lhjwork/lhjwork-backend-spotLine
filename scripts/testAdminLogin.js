const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://spotline-user:v0G1clW384dxjUQo@spotline.xcbj77w.mongodb.net/?appName=spotLine';

async function testAdminLogin() {
  let client;
  
  try {
    console.log('🔄 MongoDB 연결 중...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('spotLine');
    const adminsCollection = db.collection('admins');
    
    // 관리자 정보 조회
    const admin = await adminsCollection.findOne({ username: 'spotline-admin' });
    
    if (!admin) {
      console.log('❌ 관리자를 찾을 수 없습니다.');
      return;
    }
    
    console.log('📋 관리자 정보:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.isActive}`);
    console.log(`   Password Hash: ${admin.password.substring(0, 20)}...`);
    
    // 비밀번호 테스트
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    
    console.log(`\n🔐 비밀번호 테스트:`);
    console.log(`   테스트 비밀번호: ${testPassword}`);
    console.log(`   검증 결과: ${isValid ? '✅ 일치' : '❌ 불일치'}`);
    
    // API 테스트
    console.log(`\n🌐 API 테스트:`);
    const { default: fetch } = await import('node-fetch');
    
    try {
      const response = await fetch('http://localhost:4000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'spotline-admin',
          password: 'admin123'
        })
      });
      
      const result = await response.json();
      console.log(`   응답 상태: ${response.status}`);
      console.log(`   응답 내용:`, JSON.stringify(result, null, 2));
      
    } catch (apiError) {
      console.log(`   API 오류:`, apiError.message);
    }
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB 연결 종료');
    }
  }
}

testAdminLogin();