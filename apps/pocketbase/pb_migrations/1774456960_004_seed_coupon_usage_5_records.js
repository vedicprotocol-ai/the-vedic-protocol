/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("coupon_usage");

  const record0 = new Record(collection);
    const record0_coupon_idLookup = app.findFirstRecordByFilter("coupons", "coupon_code='SARAH20'");
    if (!record0_coupon_idLookup) { throw new Error("Lookup failed for coupon_id: no record in 'coupons' matching \"coupon_code='SARAH20'\""); }
    record0.set("coupon_id", record0_coupon_idLookup.id);
    const record0_customer_idLookup = app.findFirstRecordByFilter("customers", "email='customer1@example.com'");
    if (!record0_customer_idLookup) { throw new Error("Lookup failed for customer_id: no record in 'customers' matching \"email='customer1@example.com'\""); }
    record0.set("customer_id", record0_customer_idLookup.id);
    record0.set("purchase_amount", 100);
    record0.set("discount_amount", 20);
    record0.set("influencer_earning", 10);
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    const record1_coupon_idLookup = app.findFirstRecordByFilter("coupons", "coupon_code='SARAH20'");
    if (!record1_coupon_idLookup) { throw new Error("Lookup failed for coupon_id: no record in 'coupons' matching \"coupon_code='SARAH20'\""); }
    record1.set("coupon_id", record1_coupon_idLookup.id);
    const record1_customer_idLookup = app.findFirstRecordByFilter("customers", "email='customer2@example.com'");
    if (!record1_customer_idLookup) { throw new Error("Lookup failed for customer_id: no record in 'customers' matching \"email='customer2@example.com'\""); }
    record1.set("customer_id", record1_customer_idLookup.id);
    record1.set("purchase_amount", 100);
    record1.set("discount_amount", 20);
    record1.set("influencer_earning", 10);
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    const record2_coupon_idLookup = app.findFirstRecordByFilter("coupons", "coupon_code='SARAH20'");
    if (!record2_coupon_idLookup) { throw new Error("Lookup failed for coupon_id: no record in 'coupons' matching \"coupon_code='SARAH20'\""); }
    record2.set("coupon_id", record2_coupon_idLookup.id);
    const record2_customer_idLookup = app.findFirstRecordByFilter("customers", "email='customer3@example.com'");
    if (!record2_customer_idLookup) { throw new Error("Lookup failed for customer_id: no record in 'customers' matching \"email='customer3@example.com'\""); }
    record2.set("customer_id", record2_customer_idLookup.id);
    record2.set("purchase_amount", 100);
    record2.set("discount_amount", 20);
    record2.set("influencer_earning", 10);
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    const record3_coupon_idLookup = app.findFirstRecordByFilter("coupons", "coupon_code='SARAH20'");
    if (!record3_coupon_idLookup) { throw new Error("Lookup failed for coupon_id: no record in 'coupons' matching \"coupon_code='SARAH20'\""); }
    record3.set("coupon_id", record3_coupon_idLookup.id);
    const record3_customer_idLookup = app.findFirstRecordByFilter("customers", "email='customer4@example.com'");
    if (!record3_customer_idLookup) { throw new Error("Lookup failed for customer_id: no record in 'customers' matching \"email='customer4@example.com'\""); }
    record3.set("customer_id", record3_customer_idLookup.id);
    record3.set("purchase_amount", 100);
    record3.set("discount_amount", 20);
    record3.set("influencer_earning", 10);
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    const record4_coupon_idLookup = app.findFirstRecordByFilter("coupons", "coupon_code='SARAH20'");
    if (!record4_coupon_idLookup) { throw new Error("Lookup failed for coupon_id: no record in 'coupons' matching \"coupon_code='SARAH20'\""); }
    record4.set("coupon_id", record4_coupon_idLookup.id);
    const record4_customer_idLookup = app.findFirstRecordByFilter("customers", "email='customer5@example.com'");
    if (!record4_customer_idLookup) { throw new Error("Lookup failed for customer_id: no record in 'customers' matching \"email='customer5@example.com'\""); }
    record4.set("customer_id", record4_customer_idLookup.id);
    record4.set("purchase_amount", 100);
    record4.set("discount_amount", 20);
    record4.set("influencer_earning", 10);
  try {
    app.save(record4);
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