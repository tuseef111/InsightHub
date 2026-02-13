import mongoose from "mongoose"

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resourceCount: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model("Collection", collectionSchema)

