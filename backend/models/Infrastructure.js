import mongoose from "mongoose";

const infrastructureSchema = new mongoose.Schema({

  type: String,

  lat: Number,
  lon: Number,

  tags: Object

});

export default mongoose.model(
  "Infrastructure",
  infrastructureSchema
);