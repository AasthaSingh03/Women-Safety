import mongoose from "mongoose";

const crimeSchema = new mongoose.Schema({

  crimeType: String,

  location: String,

  lat: Number,

  lon: Number,

  source: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("CrimeIncident", crimeSchema);