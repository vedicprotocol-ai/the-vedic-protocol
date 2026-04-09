/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("influencers");
  collection.indexes.push("CREATE UNIQUE INDEX idx_influencers_influencer_code ON influencers (influencer_code)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("influencers");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_influencers_influencer_code"));
  return app.save(collection);
})