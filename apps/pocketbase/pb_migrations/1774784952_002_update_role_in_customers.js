/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("customers");
  const field = collection.fields.getByName("role");
  field.values = ["user", "influencer", "Admin", "Customer"];
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("customers");
  const field = collection.fields.getByName("role");
  field.values = ["user", "influencer"];
  return app.save(collection);
})