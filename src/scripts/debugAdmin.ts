import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin";

dotenv.config();

const debugAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/spotline";
    console.log(`📡 MongoDB 연결 중: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB 연결 성공!");

    // spotline-admin 계정 찾기
    const admin = await Admin.findOne({ username: "spotline-admin" });

    if (!admin) {
      console.log("❌ spotline-admin 계정을 찾을 수 없습니다.");
      return;
    }

    console.log("👤 spotline-admin 계정 정보:");
    console.log(`   - ID: ${admin._id}`);
    console.log(`   - Username: ${admin.username}`);
    console.log(`   - Email: ${admin.email}`);
    console.log(`   - Role: ${admin.role}`);
    console.log(`   - IsActive: ${admin.isActive}`);
    console.log(`   - Password Hash: ${admin.password}`);

    // 비밀번호 검증 테스트
    const testPassword = "12341234";
    console.log(`\n🔐 비밀번호 검증 테스트 (${testPassword}):`);

    // 직접 bcrypt.compare 사용
    const isValidDirect = await bcrypt.compare(testPassword, admin.password);
    console.log(`   - 직접 bcrypt.compare: ${isValidDirect}`);

    // 모델 메서드 사용
    const isValidMethod = await admin.comparePassword(testPassword);
    console.log(`   - admin.comparePassword: ${isValidMethod}`);

    // 잘못된 비밀번호로도 테스트
    const wrongPassword = "wrongpassword";
    const isValidWrong = await admin.comparePassword(wrongPassword);
    console.log(`   - 잘못된 비밀번호 (${wrongPassword}): ${isValidWrong}`);

    await mongoose.disconnect();
    console.log("📡 MongoDB 연결 종료");
  } catch (error) {
    console.error("❌ 오류:", error);
    process.exit(1);
  }
};

debugAdmin();
