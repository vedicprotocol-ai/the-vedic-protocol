/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const customersCollection = app.findCollectionByNameOrId("customers");
  const collection = app.findCollectionByNameOrId("appointments");

  const existing = collection.fields.getByName("customer_id");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("customer_id"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "customer_id",
    required: true,
    collectionId: customersCollection.id
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("appointments");
  collection.fields.removeByName("customer_id");
  return app.save(collection);
})