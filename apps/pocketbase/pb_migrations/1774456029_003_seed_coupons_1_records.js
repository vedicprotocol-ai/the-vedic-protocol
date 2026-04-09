/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("coupons");

  const record0 = new Record(collection);
    record0.set("coupon_code", "SARAH20");
    record0.set("discount_percentage", 20);
    const record0_influencer_idLookup = app.findFirstRecordByFilter("influencers", "influencer_code='VEDIC_SARAH001'");
    if (!record0_influencer_idLookup) { throw new Error("Lookup failed for influencer_id: no record in 'influencers' matching \"influencer_code='VEDIC_SARAH001'\""); }
    record0.set("influencer_id", record0_influencer_idLookup.id);
    record0.set("influencer_earning_percentage", 5);
    record0.set("total_usage_count", 0);
    record0.set("is_active", true);
    record0.set("expires_at", null);
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