/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("coupons");
  collection.listRule = "influencer_id.user_id = @request.auth.id";
  collection.viewRule = "influencer_id.user_id = @request.auth.id";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("coupons");
  collection.listRule = "is_active = true";
  collection.viewRule = "is_active = true";
  return app.save(collection);
})