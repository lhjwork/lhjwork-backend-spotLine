require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const DemoRecommendation = require("./dist/models/DemoRecommendation").default;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("=== 추천 데이터의 ID 타입 확인 ===");

    const recs = await DemoRecommendation.find({});
    console.log(`총 ${recs.length}개의 추천 데이터`);

    recs.slice(0, 3).forEach((rec, index) => {
      console.log(`${index + 1}. fromStoreId: ${rec.fromStoreId} (type: ${typeof rec.fromStoreId})`);
      console.log(`   toStoreId: ${rec.toStoreId} (type: ${typeof rec.toStoreId})`);
      console.log(`   fromStoreId ObjectId: ${mongoose.Types.ObjectId.isValid(rec.fromStoreId)}`);
    });

    // 특정 매장 ID로 조회 테스트
    const testId = "695f50c27cf02f4867687a69";
    console.log(`\n=== ${testId}로 조회 테스트 ===`);

    // 문자열로 조회
    const stringQuery = await DemoRecommendation.find({ fromStoreId: testId });
    console.log(`문자열 조회 결과: ${stringQuery.length}개`);

    // ObjectId로 조회
    const objectIdQuery = await DemoRecommendation.find({ fromStoreId: new mongoose.Types.ObjectId(testId) });
    console.log(`ObjectId 조회 결과: ${objectIdQuery.length}개`);

    process.exit(0);
  })
  .catch(console.error);
