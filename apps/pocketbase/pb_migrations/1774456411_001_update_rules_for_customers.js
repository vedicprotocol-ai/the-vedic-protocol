/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("customers");
  collection.listRule = "id = @request.auth.id";
  collection.viewRule = "id = @request.auth.id";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("customers");
  collection.listRule = "id = @request.auth.id";
  collection.viewRule = "id = @request.auth.id";
  return app.save(collection);
})