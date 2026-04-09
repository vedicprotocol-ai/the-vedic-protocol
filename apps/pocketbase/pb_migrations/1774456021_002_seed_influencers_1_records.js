/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("influencers");

  const record0 = new Record(collection);
    const record0_user_idLookup = app.findFirstRecordByFilter("customers", "email='sarah@example.com'");
    if (!record0_user_idLookup) { throw new Error("Lookup failed for user_id: no record in 'customers' matching \"email='sarah@example.com'\""); }
    record0.set("user_id", record0_user_idLookup.id);
    record0.set("influencer_code", "VEDIC_SARAH001");
    record0.set("total_earnings", 0);
    record0.set("vedic_points", 0);
    record0.set("status", "active");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})