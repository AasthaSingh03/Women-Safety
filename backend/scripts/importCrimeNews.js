import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { fetchCrimeNews } from "../utils/newsCrimeFetcher.js";
import { parseCrimeArticle } from "../utils/newsCrimeParser.js";
import { geocodeLocation } from "../utils/newsCrimeGeocoder.js";
import CrimeIncident from "../models/CrimeIncident.js";

export async function importCrimeNews() {

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  }

  try {

    console.log("Starting crime news import...");

    const articles = await fetchCrimeNews();
    console.log(`Processing ${articles.length} articles...`);

    let added = 0, skipped = 0, failed = 0;

    for (const article of articles) {

      const parsed = parseCrimeArticle(article);
      if (!parsed || !parsed.location) { skipped++; continue; }

      const existing = await CrimeIncident.findOne({
        location: parsed.location,
        crimeType: parsed.crimeType
      });
      if (existing) { skipped++; continue; }

      const coords = await geocodeLocation(parsed.location);
      if (!coords?.lat || !coords?.lon) { failed++; continue; }

      if (coords.lat < 6 || coords.lat > 37 ||
          coords.lon < 68 || coords.lon > 98) {
        failed++; continue;
      }

      await CrimeIncident.create({
        crimeType: parsed.crimeType,
        location:  parsed.location,
        lat:       coords.lat,
        lon:       coords.lon,
        source:    "news"
      });

      added++;
      console.log(`✅ Added: ${parsed.crimeType} @ ${parsed.location}`);
      await new Promise(r => setTimeout(r, 200));
    }

    console.log(`\nCrime import done:`);
    console.log(`  ✅ Added:   ${added}`);
    console.log(`  ⏭ Skipped: ${skipped}`);
    console.log(`  ❌ Failed:  ${failed}`);

  } catch (err) {
    console.error("Crime news import error:", err.message);
  }
}