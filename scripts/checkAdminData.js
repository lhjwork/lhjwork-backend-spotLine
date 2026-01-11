const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://spotline-user:v0G1clW384dxjUQo@spotline.xcbj77w.mongodb.net/?appName=spotLine';

async function checkAdminData() {
  let client;
  
  try {
    console.log('🔄 MongoDB 연결 중...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('spotLine');
    const adminsCollection = db.collection('admins');
    
    console.log('📋 관리자 계정 정보:');
    const admins = await adminsCollection.find({}).toArray();
    
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. 관리자 정보:`);
      console.log(`   ID: ${admin._id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log(`   Created: ${admin.createdAt}`);
      console.log(`   Last Login: ${admin.lastLogin || '없음'}`);
    });
    
    console.log(`\n📊 총 ${admins.length}개의 관리자 계정이 있습니다.`);
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB 연결 종료');
    }
  }
}

checkAdminData();