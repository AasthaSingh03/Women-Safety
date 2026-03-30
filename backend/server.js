import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cron from "node-cron";

import routeAPI from "./routes/route.js";
import zonesAPI from "./routes/zones.js";
import { importCrimeNews } from "./scripts/importCrimeNews.js";
import { importInfrastructure } from "./scripts/importInfrastructure.js";

const app = express();

// ✅ Explicit CORS config (replaces the old app.use(cors()))
const allowedOrigins = [
  "https://women-safety-frontend.onrender.com",
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ✅ Handle preflight OPTIONS requests for all routes
app.options("*", cors());

app.use(express.json());

app.use("/api/route", routeAPI);
app.use("/api/zones", zonesAPI);

app.get("/", (req, res) => res.send("Women Safety Backend Running"));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {

    console.log("MongoDB Connected Successfully");

    // Import infrastructure on startup
    try {
      console.log("Importing infrastructure...");
      await importInfrastructure();
    } catch (err) {
      console.log("Infrastructure import failed:", err.message);
    }

    // Import crime news on startup
    try {
      console.log("Importing crime news...");
      await importCrimeNews();
    } catch (err) {
      console.log("Crime news import failed:", err.message);
    }

    // Schedule crime news every 6 hours
    cron.schedule("0 */6 * * *", async () => {
      console.log("Scheduled crime import running...");
      try {
        await importCrimeNews();
      } catch (err) {
        console.log("Scheduled crime update failed:", err.message);
      }
    });

    console.log("Cron job scheduled — crime data updates every 6 hours");

  })
  .catch(err => console.error("MongoDB Connection Failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});