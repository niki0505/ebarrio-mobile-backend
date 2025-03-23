//SERVER

import express from "express";
import cors from "cors";
import authRoutes from "../routes/authRoutes.js";
import { connectDB } from "./lib/db.js";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;

app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
