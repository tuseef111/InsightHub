import mongoose from "mongoose"

export default async function connectDB() {
  const uri = process.env.MONGODB_URI
  console.log("database url",uri)
  if (!uri) {
    throw new Error("MONGODB_URI is not set")
  }
  mongoose.set("strictQuery", true)
  await mongoose.connect(uri, { autoIndex: true })
}

