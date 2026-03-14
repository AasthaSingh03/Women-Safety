import { fetchCrimeNews } from "../utils/newsCrimeFetcher.js";
import { parseCrimeArticle } from "../utils/newsCrimeParser.js";
import { geocodeLocation } from "../utils/newsCrimeGeocoder.js";
import CrimeIncident from "../models/CrimeIncident.js";

export async function importCrimeNews() {

  try {

    const articles = await fetchCrimeNews();

    for (const article of articles) {

      const parsed = parseCrimeArticle(article);

      if (!parsed || !parsed.location) continue;

      const existing = await CrimeIncident.findOne({
        location: parsed.location,
        crimeType: parsed.crimeType
      });

      if (existing) continue;

      const coords = await geocodeLocation(parsed.location);

      if (!coords) continue;

      await CrimeIncident.create({

        crimeType: parsed.crimeType,
        location: parsed.location,

        lat: coords.lat,
        lon: coords.lon,

        source: "news"

      });

    }

  } catch (err) {

    console.log("Crime news import error:", err.message);

  }

}