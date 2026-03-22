const crimeTypes = {
  rape:        ["rape", "gangrape", "sexual assault"],
  murder:      ["murder", "killed", "stabbed to death", "shot dead"],
  assault:     ["assault", "attack", "beaten", "thrashed"],
  harassment:  ["harassment", "molestation", "eve teasing", "stalking", "acid attack"],
  theft:       ["theft", "robbery", "snatching", "burglary", "loot"],
  kidnap:      ["kidnap", "abduction", "missing girl", "missing woman"],
};

const cityNames = [
  "Bhubaneswar","Cuttack","Puri","Rourkela","Sambalpur",
  "Delhi","New Delhi","Noida","Gurgaon","Faridabad","Ghaziabad",
  "Mumbai","Thane","Pune","Nagpur","Nashik","Aurangabad",
  "Bangalore","Bengaluru","Mysore","Mangalore","Hubli",
  "Chennai","Coimbatore","Madurai","Salem",
  "Hyderabad","Secunderabad","Warangal","Karimnagar",
  "Kolkata","Howrah","Siliguri","Asansol","Durgapur",
  "Ahmedabad","Surat","Vadodara","Rajkot",
  "Jaipur","Jodhpur","Udaipur","Kota",
  "Lucknow","Kanpur","Agra","Varanasi","Allahabad","Meerut",
  "Patna","Gaya","Muzaffarpur",
  "Indore","Bhopal","Jabalpur","Gwalior",
  "Chandigarh","Ludhiana","Amritsar","Jalandhar",
  "Ranchi","Jamshedpur","Dhanbad",
  "Guwahati","Dibrugarh",
  "Raipur","Dehradun","Shimla"
];

export function parseCrimeArticle(article) {

  const text  = `${article.title || ""} ${article.description || ""}`;
  const lower = text.toLowerCase();

  // Detect crime type
  let detectedCrime = null;
  for (const [type, keywords] of Object.entries(crimeTypes)) {
    if (keywords.some(kw => lower.includes(kw))) {
      detectedCrime = type;
      break;
    }
  }
  if (!detectedCrime) return null;

  // Strategy 1 — known city match
  const matchedCity = cityNames.find(c =>
    lower.includes(c.toLowerCase())
  );
  if (matchedCity) return { crimeType: detectedCrime, location: matchedCity };

  // Strategy 2 — "in <Place>"
  const inMatch = text.match(/\bin\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})/);
  if (inMatch?.[1]?.length > 2 && inMatch[1].length < 40)
    return { crimeType: detectedCrime, location: inMatch[1].trim() };

  // Strategy 3 — "near <Place>"
  const nearMatch = text.match(/\bnear\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})/);
  if (nearMatch?.[1]?.length > 2 && nearMatch[1].length < 40)
    return { crimeType: detectedCrime, location: nearMatch[1].trim() };

  return null;
}