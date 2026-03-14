import Infrastructure from "../models/Infrastructure.js";

export const fetchAreaInfrastructure = async (bbox) => {

  const [minLat, minLng, maxLat, maxLng] = bbox;

  const infra = await Infrastructure.find({

    lat: { $gte: minLat, $lte: maxLat },
    lon: { $gte: minLng, $lte: maxLng }

  });

  return infra;

};