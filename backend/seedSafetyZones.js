import mongoose from "mongoose";
import dotenv from "dotenv";
import SafetyZone from "./models/SafetyZone.js";

dotenv.config();

const safetyZones = [
  {
    center: [20.356, 85.820],
    radius: 300,
    risk: "high",
  },
  {
    center: [20.354, 85.818],
    radius: 250,
    risk: "moderate",
  },
  {
    center: [20.353, 85.817],
    radius: 200,
    risk: "safe",
  },
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await SafetyZone.deleteMany(); // clear old zones
    console.log("Old safety zones removed");

    await SafetyZone.insertMany(safetyZones);
    console.log("Safety zones inserted successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedDB();