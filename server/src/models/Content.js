import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    rules: { type: String, default: "" },
    prizes: { type: String, default: "" },
    timeline: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Content", contentSchema);
