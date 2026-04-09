/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("blog_posts");

  const existing = collection.fields.getByName("read_time");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("read_time"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "read_time",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("blog_posts");
  collection.fields.removeByName("read_time");
  return app.save(collection);
})