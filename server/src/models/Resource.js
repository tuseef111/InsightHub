import mongoose from "mongoose"

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  url: { type: String, required: true },
  domain: { type: String, index: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection" },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  // tags: [{ type: String, index: true }],
  favorite: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true })

resourceSchema.index({ title: "text", description: "text" })

export default mongoose.model("Resource", resourceSchema)

