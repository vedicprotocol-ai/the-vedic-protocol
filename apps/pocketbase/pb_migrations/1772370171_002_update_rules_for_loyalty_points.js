/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("loyalty_points");
  collection.listRule = "customer_id = @request.auth.id";
  collection.viewRule = "customer_id = @request.auth.id";
  collection.createRule = "@request.auth.id != \"\"";
  collection.updateRule = "customer_id = @request.auth.id";
  collection.deleteRule = "customer_id = @request.auth.id";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("loyalty_points");
  collection.listRule = "customer_id = @request.auth.id";
  collection.viewRule = "customer_id = @request.auth.id";
  collection.createRule = "@request.auth.id != \"\"";
  collection.updateRule = "customer_id = @request.auth.id";
  collection.deleteRule = "customer_id = @request.auth.id";
  return app.save(collection);
})