import { Router } from "express"
import Blog from "../models/Blog.js"
import auth from "../middleware/auth.js"

const router = Router()

router.get("/", async (req, res) => {
  try {
    const { q } = req.query
    const filter = q ? { $text: { $search: q } } : {}
    const blogs = await Blog.find(filter).populate("author", "name email avatarUrl").sort({ createdAt: -1 }).limit(100)
    res.json({ blogs })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/mine", auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id }).sort({ createdAt: -1 })
    res.json({ blogs })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name email avatarUrl")
    if (!blog) return res.status(404).json({ error: "Not found" })
    res.json({ blog })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: "Invalid ID format" })
    }
    res.status(500).json({ error: error.message })
  }
})

router.post("/", auth, async (req, res) => {
  try {
    const { title, content, tags, coverImage } = req.body
    if (!title || !content) return res.status(400).json({ error: "Title and content required" })
    const blog = await Blog.create({ title, content, tags: tags || [], coverImage: coverImage || "", author: req.user._id })
    res.status(201).json({ blog })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.patch("/:id", auth, async (req, res) => {
  try {
    const { title, content, tags, coverImage } = req.body
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      { ...(title && { title }), ...(content && { content }), ...(Array.isArray(tags) && { tags }), ...(typeof coverImage !== "undefined" && { coverImage }) },
      { new: true }
    )
    if (!blog) return res.status(404).json({ error: "Not found" })
    res.json({ blog })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: "Invalid ID format" })
    }
    res.status(500).json({ error: error.message })
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await Blog.deleteOne({ _id: req.params.id, author: req.user._id })
    if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" })
    res.json({ ok: true })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: "Invalid ID format" })
    }
    res.status(500).json({ error: error.message })
  }
})

export default router
