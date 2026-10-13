import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import uploadRoutes from "./routes/upload.js";

const app = express();
const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  throw new Error("MONGO_URI and JWT_SECRET must be set in .env");
}

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Task Manager API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/upload", uploadRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error" });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });