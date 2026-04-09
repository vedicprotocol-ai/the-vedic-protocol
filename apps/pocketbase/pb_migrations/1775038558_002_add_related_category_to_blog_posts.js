/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("blog_posts");

  const existing = collection.fields.getByName("related_category");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("related_category"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "related_category",
    required: false,
    values: ["skincare", "haircare"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("blog_posts");
  collection.fields.removeByName("related_category");
  return app.save(collection);
})