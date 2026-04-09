/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("blog_posts");

  const existing = collection.fields.getByName("image_url");
  if (existing) {
    if (existing.type === "url") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("image_url"); // exists with wrong type, remove first
  }

  collection.fields.add(new URLField({
    name: "image_url",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("blog_posts");
  collection.fields.removeByName("image_url");
  return app.save(collection);
})