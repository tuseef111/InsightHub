import { Router } from "express"
import Collection from "../models/Collection.js"
import auth from "../middleware/auth.js"

const router = Router()

router.get("/", auth, async (req, res) => {
  try {
    const collections = await Collection.find({ owner: req.user._id }).sort({ createdAt: -1 })
    res.json({ collections })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: "Name required" })
    const collection = await Collection.create({ name, owner: req.user._id })
    res.status(201).json({ collection })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.patch("/:id", auth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: "Name required" })
    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name },
      { new: true }
    )
    if (!collection) return res.status(404).json({ error: "Not found" })
    res.json({ collection })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: "Invalid ID format" })
    }
    res.status(500).json({ error: error.message })
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    await Collection.deleteOne({ _id: req.params.id, owner: req.user._id })
    res.json({ ok: true })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: "Invalid ID format" })
    }
    res.status(500).json({ error: error.message })
  }
})

export default router
