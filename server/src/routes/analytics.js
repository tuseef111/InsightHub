import { Router } from "express"
import Resource from "../models/Resource.js"
import Collection from "../models/Collection.js"
import auth from "../middleware/auth.js"

const router = Router()

router.get("/", auth, async (req, res) => {
  const owner = req.user._id
  const totalResources = await Resource.countDocuments({ owner })
  const totalCollections = await Collection.countDocuments({ owner })
  const favorites = await Resource.countDocuments({ owner, favorite: true })

  const resourcesPerCollectionAgg = await Resource.aggregate([
    { $match: { owner } },
    { $group: { _id: "$collectionId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ])
  const collectionMap = await Collection.find({ _id: { $in: resourcesPerCollectionAgg.map(r => r._id) } })
    .select("_id name").lean()
  const nameById = Object.fromEntries(collectionMap.map(c => [String(c._id), c.name]))
  const resourcesPerCollection = resourcesPerCollectionAgg.map(r => ({
    name: nameById[String(r._id)] || "Uncategorized",
    count: r.count
  }))

  const difficultyAgg = await Resource.aggregate([
    { $match: { owner } },
    { $group: { _id: "$difficulty", value: { $sum: 1 } } }
  ])
  const difficultyDistribution = ["Beginner","Intermediate","Advanced"].map(label => {
    const key = label.toLowerCase()
    const found = difficultyAgg.find(d => d._id === key)
    return { name: label, value: found ? found.value : 0 }
  })

  const topTagsAgg = await Resource.aggregate([
    { $match: { owner } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ])
  const topTags = topTagsAgg.map(t => ({ name: t._id, count: t.count }))

  const topDomainsAgg = await Resource.aggregate([
    { $match: { owner } },
    { $group: { _id: "$domain", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 }
  ])
  const topDomains = topDomainsAgg.map(d => ({ name: d._id, count: d.count }))

  res.json({
    totalResources,
    totalCollections,
    favorites,
    resourcesPerCollection,
    difficultyDistribution,
    topTags,
    topDomains
  })
})

export default router
