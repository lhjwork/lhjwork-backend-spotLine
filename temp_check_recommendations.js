require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const DemoRecommendation = require("./dist/models/DemoRecommendation").default;
const DemoStore = require("./dist/models/DemoStore").default;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("=== 데모 추천 데이터 확인 ===");
    const recs = await DemoRecommendation.find({}).populate("fromStoreId toStoreId");
    console.log(`총 ${recs.length}개의 추천 데이터`);

    recs.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.fromStoreId?.name || "Unknown"} → ${rec.toStoreId?.name || "Unknown"} (${rec.category}, ${rec.walkingTime}분)`);
    });

    // 특정 매장의 추천 조회
    const cafeId = "695f50c27cf02f4867687a69";
    console.log(`\n=== 카페 데모 (${cafeId})의 추천 ===`);
    const cafeRecs = await DemoRecommendation.find({ fromStoreId: cafeId }).populate("toStoreId");
    console.log(`카페 데모 추천: ${cafeRecs.length}개`);
    cafeRecs.forEach((rec) => {
      console.log(`- ${rec.toStoreId?.name || "Unknown"} (${rec.category}, ${rec.walkingTime}분)`);
    });

    process.exit(0);
  })
  .catch(console.error);
