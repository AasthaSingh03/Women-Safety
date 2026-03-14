import mongoose from "mongoose";

const safetyZoneSchema = new mongoose.Schema({
  center: {
    type: [Number],          // [latitude, longitude]
    required: true,
  },
  radius: {
    type: Number,            // in meters
    required: true,
  },
  risk: {
    type: String,
    enum: ["high", "moderate", "safe"],
    required: true,
  },
}, {
  timestamps: true,
});

const SafetyZone = mongoose.model("SafetyZone", safetyZoneSchema);

export default SafetyZone;
