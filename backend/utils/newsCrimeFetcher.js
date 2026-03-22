import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function fetchCrimeNews() {

  const allArticles = [];

  const queries = [
    "crime India",
    "assault India",
    "harassment India",
    "robbery India",
    "rape India",
    "theft India",
    "kidnap India",
    "murder India"
  ];

  for (const q of queries) {
    try {

      const res = await axios.get("https://newsdata.io/api/1/news", {
        params: {
          apikey: process.env.NEWSDATA_API_KEY,
          q,
          language: "en",
        }
      });

      const articles = res.data.results || [];
      allArticles.push(...articles);
      console.log(`"${q}": ${articles.length} articles`);

      await new Promise(r => setTimeout(r, 1500));

    } catch (err) {
      console.warn(`Failed "${q}":`, err.response?.data?.message || err.message);
    }
  }

  const seen = new Set();
  const unique = allArticles.filter(a => {
    if (!a.article_id || seen.has(a.article_id)) return false;
    seen.add(a.article_id);
    return true;
  });

  console.log(`Total unique articles: ${unique.length}`);
  return unique;
}