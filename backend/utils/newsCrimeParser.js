const crimeTypes = {
  harassment: ["harassment","molestation"],
  assault: ["assault","attack"],
  theft: ["theft","robbery","snatching"],
  rape: ["rape"],
  kidnap: ["kidnap","abduction"]
};

export function parseCrimeArticle(article) {

  const text =
    (article.title || "") +
    " " +
    (article.description || "");

  let detectedCrime = null;

  for (const type in crimeTypes) {

    if (crimeTypes[type].some(word =>
      text.toLowerCase().includes(word)
    )) {
      detectedCrime = type;
      break;
    }

  }

  if (!detectedCrime) return null;

  const locationMatch =
    text.match(/near ([A-Za-z ]+)/i) ||
    text.match(/in ([A-Za-z ]+)/i);

  if (!locationMatch) return null;

  const location = locationMatch[1];

  return {
    crimeType: detectedCrime,
    location
  };

}