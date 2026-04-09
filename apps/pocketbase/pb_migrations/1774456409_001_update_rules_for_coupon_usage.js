/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("coupon_usage");
  collection.listRule = "coupon_id.influencer_id.user_id = @request.auth.id || customer_id = @request.auth.id";
  collection.viewRule = "coupon_id.influencer_id.user_id = @request.auth.id || customer_id = @request.auth.id";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("coupon_usage");
  collection.listRule = "customer_id = @request.auth.id || coupon_id.influencer_id.user_id = @request.auth.id";
  collection.viewRule = "customer_id = @request.auth.id || coupon_id.influencer_id.user_id = @request.auth.id";
  return app.save(collection);
})