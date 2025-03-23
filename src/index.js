//SERVER

import express from "express";
import cors from "cors";
import authRoutes from "../routes/authRoutes.js";
import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";

const app = express();

// job.start();
app.use(express.json());
app.use(cors());

const PORT = 3000;

app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
