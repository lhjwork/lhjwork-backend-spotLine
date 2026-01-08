import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin";

dotenv.config();

const updateAdminEmails = async (): Promise<void> => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/spotline");
    console.log("MongoDB 연결 성공");

    // 기존 Admin 계정들의 이메일 도메인 업데이트
    const admins = await Admin.find({});

    for (const admin of admins) {
      let needsUpdate = false;
      let newEmail = admin.email;

      // @spotline.com을 @spotline.co.kr로 변경
      if (admin.email.endsWith("@spotline.com")) {
        newEmail = admin.email.replace("@spotline.com", "@spotline.co.kr");
        needsUpdate = true;
      }
      // 다른 도메인이면 @spotline.co.kr로 변경
      else if (!admin.email.endsWith("@spotline.co.kr")) {
        const username = admin.email.split("@")[0];
        newEmail = `${username}@spotline.co.kr`;
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log(`Updating admin ${admin.username}: ${admin.email} -> ${newEmail}`);

        // 직접 업데이트 (validation 미들웨어 우회)
        await Admin.updateOne(
          { _id: admin._id },
          {
            $set: {
              email: newEmail,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    console.log("✅ Admin 이메일 도메인 업데이트 완료");

    // 업데이트된 결과 확인
    const updatedAdmins = await Admin.find({}).select("username email role");
    console.log("\n📋 업데이트된 Admin 목록:");
    updatedAdmins.forEach((admin) => {
      console.log(`- ${admin.username}: ${admin.email} (${admin.role})`);
    });
  } catch (error) {
    console.error("❌ Admin 이메일 업데이트 실패:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB 연결 종료");
  }
};

// 스크립트 실행
if (require.main === module) {
  updateAdminEmails();
}

export default updateAdminEmails;
