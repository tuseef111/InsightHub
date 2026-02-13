import mongoose from "mongoose"

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: "" },
  tags: [{ type: String, index: true }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  published: { type: Boolean, default: true }
}, { timestamps: true })

blogSchema.index({ title: "text", content: "text" })
blogSchema.index({ tags: 1 })

export default mongoose.model("Blog", blogSchema)
