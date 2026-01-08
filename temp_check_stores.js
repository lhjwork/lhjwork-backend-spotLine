require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const DemoStore = require("./dist/models/DemoStore").default;
const Store = require("./dist/models/Store").default;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("=== 데모 매장 목록 ===");
    const demos = await DemoStore.find({}, "_id name qrCode.id");
    demos.forEach((d) => console.log(`ID: ${d._id}, Name: ${d.name}, QR: ${d.qrCode.id}`));

    console.log("\n=== 프로덕션 매장 목록 ===");
    const prods = await Store.find({}, "_id name qrCode.id");
    prods.forEach((p) => console.log(`ID: ${p._id}, Name: ${p.name}, QR: ${p.qrCode?.id || "N/A"}`));

    process.exit(0);
  })
  .catch(console.error);
