/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("doctors");

  const record0 = new Record(collection);
    record0.set("name", "Dr. Sonam Chauhan");
    record0.set("qualification", "BAMS, MD, PhD Ayurveda");
    record0.set("experience_years", 10);
    record0.set("specialization", "Skin & Hair");
    record0.set("short_description", "Expert in Ayurvedic skin and hair treatments");
    record0.set("full_description", "Dr. Sonam Chauhan is a highly qualified Ayurvedic practitioner with 10 years of experience specializing in skin and hair health. She combines traditional Vedic knowledge with modern diagnostic techniques to provide personalized treatment plans.");
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
    record1.set("name", "Dr. Prachi Khandelwal");
    record1.set("qualification", "BAMS, MD, PhD Ayurveda");
    record1.set("experience_years", 8);
    record1.set("specialization", "Skin & Hair");
    record1.set("short_description", "Specialized in holistic skin and hair wellness");
    record1.set("full_description", "Dr. Prachi Khandelwal brings 8 years of expertise in Ayurvedic dermatology and trichology. She is dedicated to treating skin and hair conditions using time-tested Vedic protocols and personalized wellness approaches.");
  try {
    app.save(record1);
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