import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { Server } from "socket.io";
import http from "http";
import Redis from "ioredis";
import { watchAllCollectionsChanges } from "./controllers/watchDB.js";

configDotenv();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const rds = new Redis(process.env.REDIS_URL);

export { rds };

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("socketio", io);
app.use("/api", authRoutes);

rds.ping((err, result) => {
  if (err) {
    console.error("Error connecting to Redis:", err);
  } else {
    console.log("Connected to Redis:", result); // Should print 'PONG'
  }
});

rds.on("error", (err) => {
  console.error("Redis connection error: ", err);
});

const PORT = process.env.PORT;
server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
  watchAllCollectionsChanges(io);
});
