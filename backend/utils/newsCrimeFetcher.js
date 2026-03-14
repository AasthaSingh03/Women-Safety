import axios from "axios";

const crimeKeywords = [
  "harassment",
  "assault",
  "robbery",
  "snatching",
  "rape",
  "theft",
  "molestation",
  "kidnap"
];

export async function fetchCrimeNews() {

  try {

    const response = await axios.get(
      "https://newsdata.io/api/1/news",
      {
        params: {
          apikey: process.env.NEWSDATA_API_KEY,
          q: crimeKeywords.join(" OR "),
          language: "en",
          country: "in"
        }
      }
    );

    return response.data.results || [];

  } catch (error) {

    console.error("NewsData fetch error:", error.message);
    return [];

  }

}