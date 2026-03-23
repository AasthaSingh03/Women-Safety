import mongoose from "mongoose";

const safetyReportSchema = new mongoose.Schema({
  lat:       { type: Number, required: true },
  lon:       { type: Number, required: true },
  issues:    [{ type: String }],
  severity:  { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  routeId:   { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
  note:      { type: String, default: "" },
});

export default mongoose.model("SafetyReport", safetyReportSchema);