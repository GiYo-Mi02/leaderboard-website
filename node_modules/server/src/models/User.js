import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    link: String,
    date: Date,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatarUrl: String,
    place: String, // location/place
    bio: String, // description
    experiences: [experienceSchema], // past experiences in the website
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
