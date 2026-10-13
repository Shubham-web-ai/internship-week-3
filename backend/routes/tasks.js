import express from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

// Get tasks, optionally filter by status or search title
router.get("/", async (req, res) => {
  try {
    const filter = { user: req.userId };

    if (["pending", "in-progress", "completed"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (typeof req.query.search === "string" && req.query.search.trim()) {
      filter.title = { $regex: req.query.search.trim(), $options: "i" };
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Could not fetch tasks" });
  }
});

// Create a task
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = await Task.create({
      title: title.trim(),
      description: typeof description === "string" ? description : "",
      user: req.userId
    });

    res.status(201).json(task);
  } catch {
    res.status(500).json({ message: "Could not create task" });
  }
});

// Update a task belonging to the logged-in user
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const updates = {};
    const { title, description, status } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({ message: "Invalid description" });
      }
      updates.description = description;
    }

    if (status !== undefined) {
      if (!["pending", "in-progress", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid task status" });
      }
      updates.status = status;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch {
    res.status(500).json({ message: "Could not update task" });
  }
});

// Delete a task belonging to the logged-in user
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch {
    res.status(500).json({ message: "Could not delete task" });
  }
});

export default router;