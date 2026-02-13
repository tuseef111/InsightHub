import { Router } from "express"
import Resource from "../models/Resource.js"
import Collection from "../models/Collection.js"
import auth from "../middleware/auth.js"

const router = Router()

function isAllowed(urlStr) {
  try {
    const u = new URL(urlStr)
    const host = u.hostname.toLowerCase()
    const path = u.pathname.toLowerCase()
    if (host === "medium.com" || host === "dev.to" || host === "hashnode.com" || host === "github.com") return true
    if (host === "vercel.com" && path.startsWith("/blog")) return true
    return false
  } catch {
    return false
  }
}

router.get("/", auth, async (req, res) => {
  const { q, collectionId, difficulty, tags, domain, favorite } = req.query
  const filter = { owner: req.user._id }
  if (q) filter.$text = { $search: q }
  if (collectionId && collectionId !== "all") filter.collectionId = collectionId
  if (difficulty && difficulty !== "all") filter.difficulty = difficulty
  if (typeof favorite !== "undefined" && favorite !== "all") filter.favorite = favorite === "true"
  if (domain && domain !== "all") filter.domain = domain
  if (tags) {
    const arr = Array.isArray(tags) ? tags : String(tags).split(",").map(t=>t.trim()).filter(Boolean)
    if (arr.length) filter.tags = { $all: arr }
  }
  const resources = await Resource.find(filter).sort({ createdAt: -1 }).limit(200)
  res.json({ resources })
})

router.post("/", auth, async (req, res) => {
  const { url, collectionId, difficulty, tags } = req.body
  if (!url) return res.status(400).json({ error: "URL required" })
  if (!isAllowed(url)) return res.status(400).json({ error: "Domain not allowed" })
  const domain = new URL(url).hostname
  try {
    let title = url
    let description = ""
    let image = ""
    
    if (process.env.MICROLINK_OFFLINE !== "1") {
      try {
        const resp = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
        const json = await resp.json()
        if (json && json.status === "success") {
          const data = json.data || {}
          title = data.title || title
          description = data.description || description
          image = (data.image && (data.image.url || data.image)) || image
        }
      } catch (err) {
        console.error("Microlink fetch failed, using fallback:", err.message)
      }
    }

    const resource = await Resource.create({
      url,
      collectionId,
      difficulty: difficulty || "beginner",
      tags: tags || [],
      title,
      description,
      image,
      domain,
      owner: req.user._id
    })
    if (collectionId) {
      await Collection.updateOne(
        { _id: collectionId, owner: req.user._id },
        { $inc: { resourceCount: 1 } }
      )
    }
    res.status(201).json({ resource })
  } catch (e) {
    console.error("Resource creation error:", e)
    res.status(500).json({ error: "Failed to create resource" })
  }
})

router.patch("/:id/favorite", auth, async (req, res) => {
  const { favorite } = req.body
  const resource = await Resource.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { favorite: !!favorite },
    { new: true }
  )
  res.json({ resource })
})

router.patch("/:id", auth, async (req, res) => {
  const allowed = ["tags","difficulty"]
  const update = {}
  for (const k of allowed) {
    if (typeof req.body[k] !== "undefined") update[k] = req.body[k]
  }
  const resource = await Resource.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    update,
    { new: true }
  )
  if (!resource) return res.status(404).json({ error: "Not found" })
  res.json({ resource })
})

router.delete("/:id", auth, async (req, res) => {
  const found = await Resource.findOne({ _id: req.params.id, owner: req.user._id })
  if (!found) return res.status(404).json({ error: "Not found" })
  await Resource.deleteOne({ _id: req.params.id, owner: req.user._id })
  if (found.collectionId) {
    await Collection.updateOne(
      { _id: found.collectionId, owner: req.user._id },
      { $inc: { resourceCount: -1 } }
    )
  }
  res.json({ ok: true })
})

export default router
