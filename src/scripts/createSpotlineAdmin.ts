import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin";

dotenv.config();

const createSpotlineAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/spotline";
    console.log(`📡 MongoDB 연결 중: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB 연결 성공!");

    // 기존 spotline-admin 계정이 있는지 확인
    const existingAdmin = await Admin.findOne({ username: "spotline-admin" });
    if (existingAdmin) {
      console.log("⚠️ spotline-admin 계정이 이미 존재합니다. 삭제 후 재생성합니다.");
      await Admin.deleteOne({ username: "spotline-admin" });
    }

    // 비밀번호를 직접 해시 (모델의 pre-save 미들웨어 우회)
    const plainPassword = "12341234";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log(`🔐 비밀번호 해시 생성:`);
    console.log(`   - 원본: ${plainPassword}`);
    console.log(`   - 해시: ${hashedPassword}`);

    // 해시 검증 테스트
    const testHash = await bcrypt.compare(plainPassword, hashedPassword);
    console.log(`   - 해시 검증: ${testHash}`);

    // 새로운 관리자 계정을 직접 생성 (pre-save 미들웨어 우회)
    const adminData = {
      username: "spotline-admin",
      password: hashedPassword, // 이미 해시된 비밀번호
      role: "super_admin",
      name: "SpotLine 관리자",
      email: "spotline-admin@spotline.com",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // insertOne을 사용하여 pre-save 미들웨어 우회
    const result = await Admin.collection.insertOne(adminData);
    console.log("✅ spotline-admin 계정 생성 완료!");
    console.log("   - 사용자명: spotline-admin");
    console.log("   - 비밀번호: 12341234");
    console.log("   - 권한: super_admin");

    // 생성된 계정으로 비밀번호 검증 테스트
    const createdAdmin = await Admin.findOne({ username: "spotline-admin" });
    if (createdAdmin) {
      const passwordTest = await createdAdmin.comparePassword(plainPassword);
      console.log(`🔐 생성된 계정 비밀번호 검증: ${passwordTest}`);
    }

    // 모든 관리자 계정 확인
    const allAdmins = await Admin.find({});
    console.log(`\n👤 전체 관리자 계정 (${allAdmins.length}개):`);
    for (const admin of allAdmins) {
      console.log(`   - ${admin.username} (${admin.role})`);
    }

    await mongoose.disconnect();
    console.log("📡 MongoDB 연결 종료");
  } catch (error) {
    console.error("❌ 오류:", error);
    process.exit(1);
  }
};

createSpotlineAdmin();
