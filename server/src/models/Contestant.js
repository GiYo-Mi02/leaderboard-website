import mongoose from "mongoose";

const contestantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    teamName: String,
    title: { type: String, required: true },
    projectLink: { type: String, required: true },
    description: String,
    screenshotUrl: String,
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Single definition: case-insensitive unique index for emails
contestantSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export default mongoose.model("Contestant", contestantSchema);
