const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function createSpotlineAdmin() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 기존 spotline-admin 계정 확인 및 삭제
    const existingAdmin = await Admin.findOne({ username: 'spotline-admin' });
    if (existingAdmin) {
      await Admin.deleteOne({ username: 'spotline-admin' });
      console.log('기존 spotline-admin 계정을 삭제했습니다.');
    }

    // spotline-admin 계정 생성
    const spotlineAdmin = new Admin({
      username: 'spotline-admin',
      email: 'admin@spotline.co.kr',
      password: '12341234',
      role: 'super_admin',
      permissions: {
        stores: { read: true, write: true, delete: true },
        analytics: { read: true, export: true },
        users: { read: true, write: true, delete: true }
      }
    });

    await spotlineAdmin.save();
    console.log('✅ spotline-admin 계정이 성공적으로 생성되었습니다!');
    console.log('');
    console.log('🔑 로그인 정보:');
    console.log('- 사용자명: spotline-admin');
    console.log('- 비밀번호: 12341234');
    console.log('- 이메일: admin@spotline.co.kr');
    console.log('- 역할: super_admin (모든 권한)');
    console.log('');
    console.log('🌐 어드민 페이지 접속:');
    console.log('- URL: http://localhost:3002');
    console.log('- 백엔드 API: http://localhost:4000');

  } catch (error) {
    console.error('❌ spotline-admin 계정 생성 실패:', error.message);
    
    if (error.code === 11000) {
      console.log('중복된 사용자명 또는 이메일입니다.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  }
}

createSpotlineAdmin();