/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("customers");
  const field = collection.fields.getByName("vedic_points");
  field.required = false;
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("customers");
  const field = collection.fields.getByName("vedic_points");
  field.required = false;
  return app.save(collection);
})