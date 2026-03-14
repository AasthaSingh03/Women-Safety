import mongoose from "mongoose";
import dotenv from "dotenv";
import CrimeStats from "../models/CrimeStats.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const data = [
  { district: "Delhi", rate: 650 },
  { district: "Mumbai", rate: 520 },
  { district: "Bhubaneswar", rate: 310 }
];

await CrimeStats.deleteMany();
await CrimeStats.insertMany(data);

console.log("Crime stats imported");
process.exit();