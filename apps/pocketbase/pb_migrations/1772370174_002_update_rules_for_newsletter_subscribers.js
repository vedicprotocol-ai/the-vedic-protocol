/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("newsletter_subscribers");
  collection.createRule = "";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("newsletter_subscribers");
  collection.listRule = null;
  collection.viewRule = null;
  collection.createRule = "";
  collection.updateRule = null;
  collection.deleteRule = null;
  return app.save(collection);
})