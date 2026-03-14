import mongoose from "mongoose";

const CrimeStatsSchema = new mongoose.Schema(
  {
    district: {
      type: String,
      required: true
    },
    rate: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("CrimeStats", CrimeStatsSchema);