/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("coupons");
  collection.indexes.push("CREATE UNIQUE INDEX idx_coupons_coupon_code ON coupons (coupon_code)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("coupons");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_coupons_coupon_code"));
  return app.save(collection);
})