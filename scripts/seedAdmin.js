const mongoose = require('mongoose');
require('dotenv').config();

const AdminUser = require('../models/AdminUser');

const adminUsers = [
  {
    username: 'admin',
    email: 'admin@spotline.app',
    password: 'admin123!@#',
    role: 'super_admin',
    permissions: [
      'stores:read', 'stores:write', 'stores:delete',
      'recommendations:read', 'recommendations:write', 'recommendations:delete',
      'analytics:read', 'analytics:export',
      'qr:read', 'qr:generate',
      'users:read', 'users:write'
    ]
  },
  {
    username: 'manager',
    email: 'manager@spotline.app',
    password: 'manager123!@#',
    role: 'admin',
    permissions: [
      'stores:read', 'stores:write',
      'recommendations:read', 'recommendations:write',
      'analytics:read',
      'qr:read', 'qr:generate'
    ]
  }
];

async function seedAdminUsers() {
  try {
    console.log('🌱 MongoDB Atlas 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas 연결 성공!');

    // 기존 어드민 사용자 삭제
    console.log('🧹 기존 어드민 사용자 정리 중...');
    await AdminUser.deleteMany({});

    // 어드민 사용자 생성
    console.log('👤 어드민 사용자 생성 중...');
    const createdAdmins = await AdminUser.insertMany(adminUsers);
    console.log(`✅ ${createdAdmins.length}개 어드민 계정 생성 완료`);

    console.log('\n📋 생성된 어드민 계정:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    createdAdmins.forEach((admin, index) => {
      console.log(`👤 계정 ${index + 1}: ${admin.username}`);
      console.log(`   📧 이메일: ${admin.email}`);
      console.log(`   🔑 역할: ${admin.role}`);
      console.log(`   🛡️  권한: ${admin.permissions.length}개`);
      console.log('');
    });

    console.log('🔐 로그인 정보:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('슈퍼 어드민:');
    console.log('  사용자명: admin');
    console.log('  비밀번호: admin123!@#');
    console.log('');
    console.log('일반 관리자:');
    console.log('  사용자명: manager');
    console.log('  비밀번호: manager123!@#');
    console.log('');

    console.log('🎯 테스트 로그인 API:');
    console.log('POST http://localhost:3000/api/admin/auth/login');
    console.log('Body: { "username": "admin", "password": "admin123!@#" }');

  } catch (error) {
    console.error('❌ 어드민 사용자 생성 실패:', error.message);
    
    if (error.name === 'ValidationError') {
      console.log('💡 해결 방법: 입력 데이터를 확인하세요');
      Object.values(error.errors).forEach(err => {
        console.log(`   - ${err.path}: ${err.message}`);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 데이터베이스 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  seedAdminUsers();
}

module.exports = { seedAdminUsers, adminUsers };