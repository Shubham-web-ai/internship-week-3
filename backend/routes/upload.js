import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import auth from "../middleware/auth.js";

const router = express.Router();

const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, randomUUID() + path.extname(file.originalname).toLowerCase());
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed"));
    }
    cb(null, true);
  }
});

router.post("/", auth, (req, res) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please select an image" });
    }

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl: `/uploads/${req.file.filename}`
    });
  });
});

export default router;