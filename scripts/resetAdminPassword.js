const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://spotline-user:v0G1clW384dxjUQo@spotline.xcbj77w.mongodb.net/?appName=spotLine';

async function resetAdminPassword() {
  let client;
  
  try {
    console.log('🔄 MongoDB 연결 중...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('spotLine');
    const adminsCollection = db.collection('admins');
    
    // 새 비밀번호 설정
    const newPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // 관리자 비밀번호 업데이트
    const result = await adminsCollection.updateOne(
      { username: 'spotline-admin' },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ 관리자 비밀번호가 성공적으로 재설정되었습니다.');
      console.log(`📋 로그인 정보:`);
      console.log(`   Username: spotline-admin`);
      console.log(`   Password: ${newPassword}`);
      console.log(`   Email: admin@spotline.co.kr`);
    } else {
      console.log('❌ 관리자를 찾을 수 없습니다.');
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

resetAdminPassword();