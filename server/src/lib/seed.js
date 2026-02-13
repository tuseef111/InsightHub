import bcrypt from "bcryptjs"
import User from "../models/User.js"
import Blog from "../models/Blog.js"

export default async function seed() {
  const existingBlogs = await Blog.countDocuments()
  if (existingBlogs > 0) return

  try {
    await Blog.collection.dropIndexes()
  } catch (_) {}

  let user = await User.findOne({ email: "demo@insighthub.local" })
  if (!user) {
    const hash = await bcrypt.hash("demo123", 10)
    user = await User.create({ email: "demo@insighthub.local", password: hash, name: "Demo User" })
  }

  const samples = [
    {
      title: "The AI Bubble Is About To Burst, But The Next Bubble Is Already Growing",
      content: "Techbros are preparing their latest bandwagon. This post explores industry cycles and what’s next...",
      coverImage: "https://via.placeholder.com/640x360?text=AI",
      tags: ["ai", "industry", "featured"],
      author: user._id,
      published: true
    },
    {
      title: "AI Agents: Complete Course",
      content: "From beginner to intermediate to production. We cover planning, tooling, and deployment...",
      coverImage: "https://via.placeholder.com/640x360?text=Agents",
      tags: ["ai", "agents", "course"],
      author: user._id,
      published: true
    }
  ]

  await Blog.insertMany(samples)
}
