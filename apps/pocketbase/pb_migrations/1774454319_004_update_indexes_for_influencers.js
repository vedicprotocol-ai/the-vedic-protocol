/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("influencers");
  collection.indexes.push("CREATE INDEX idx_influencers_user_id ON influencers (user_id)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("influencers");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_influencers_user_id"));
  return app.save(collection);
})