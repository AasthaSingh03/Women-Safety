import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import routeAPI from "./routes/route.js";
import zonesAPI from "./routes/zones.js";

import { importCrimeNews } from "./scripts/importCrimeNews.js";
import { importInfrastructure } from "./scripts/importInfrastructure.js";

dotenv.config();

const app = express();

/* =========================
   Middleware
========================= */

app.use(cors());
app.use(express.json());

/* =========================
   Routes
========================= */

app.use("/api/route", routeAPI);
app.use("/api/zones", zonesAPI);

app.get("/", (req, res) => {
  res.send("Women Safety Backend Running");
});

/* =========================
   MongoDB Connection
========================= */

mongoose.connect(process.env.MONGO_URI)

.then(async () => {

  console.log("MongoDB Connected Successfully");

  /* =========================
     Import infrastructure once
  ========================= */

  try {

    console.log("Importing infrastructure...");
    await importInfrastructure();

  } catch (err) {

    console.log("Infrastructure import failed:", err.message);

  }

  /* =========================
     Import crime news
  ========================= */

  try {

    console.log("Importing crime news...");
    await importCrimeNews();

  } catch (err) {

    console.log("Crime news import failed:", err.message);

  }

  /* =========================
     Schedule crime updates
  ========================= */

  setInterval(async () => {

    try {

      console.log("Updating crime news...");
      await importCrimeNews();

    } catch (err) {

      console.log("Crime update failed:", err.message);

    }

  }, 60 * 60 * 1000);

})

.catch((err) => {

  console.error("MongoDB Connection Failed:", err);

});

/* =========================
   Start Server
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {

  console.log(`Backend running on port ${PORT}`);

});