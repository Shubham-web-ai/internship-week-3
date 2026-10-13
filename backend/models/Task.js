import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    image: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);