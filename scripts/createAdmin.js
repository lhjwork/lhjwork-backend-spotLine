const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function createSuperAdmin() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spotline');
    console.log('MongoDB 연결 성공');

    // 기존 super_admin 확인
    const existingAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('Super Admin이 이미 존재합니다:', existingAdmin.username);
      process.exit(0);
    }

    // Super Admin 생성
    const superAdmin = new Admin({
      username: 'admin',
      email: 'admin@spotline.com',
      password: 'admin123!',
      role: 'super_admin',
      permissions: {
        stores: { read: true, write: true, delete: true },
        analytics: { read: true, export: true },
        users: { read: true, write: true, delete: true }
      }
    });

    await superAdmin.save();
    console.log('Super Admin 계정이 생성되었습니다!');
    console.log('사용자명: admin');
    console.log('비밀번호: admin123!');
    console.log('이메일: admin@spotline.com');

  } catch (error) {
    console.error('Super Admin 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createSuperAdmin();