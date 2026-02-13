import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  firstName: { type: String, trim: true, default: "" },
  lastName: { type: String, trim: true, default: "" },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
  profession: { type: String, trim: true, default: "" }
}, { timestamps: true })

export default mongoose.model("User", userSchema)
