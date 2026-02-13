import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

async function run() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/insight_hub")
    console.log("Connected.")
    
    const collection = mongoose.connection.db.collection("resources")
    if (collection) {
      console.log("Dropping indexes for resources collection...")
      try {
        await collection.dropIndexes()
        console.log("Indexes dropped successfully.")
      } catch (err) {
        if (err.codeName === 'NamespaceNotFound') {
             console.log("Collection not found, skipping drop indexes.")
        } else {
             console.log("Error dropping indexes (might be empty):", err.message)
        }
      }
    }
    
    await mongoose.disconnect()
    console.log("Done.")
  } catch (e) {
    console.error("Script error:", e)
    process.exit(1)
  }
}

run()
