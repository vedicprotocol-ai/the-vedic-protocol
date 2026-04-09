/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("blog_posts");

  const existing = collection.fields.getByName("type");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("type"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "type",
    required: true,
    values: ["journal", "research"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("blog_posts");
  collection.fields.removeByName("type");
  return app.save(collection);
})