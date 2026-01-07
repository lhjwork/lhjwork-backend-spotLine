import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin";

dotenv.config();

const checkAdmins = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/spotline";
    console.log(`📡 MongoDB 연결 중: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB 연결 성공!");

    const admins = await Admin.find({});
    console.log(`👤 관리자 계정 수: ${admins.length}`);

    for (const admin of admins) {
      console.log(`- ${admin.username} (${admin.role})`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ 오류:", error);
  }
};

checkAdmins();
