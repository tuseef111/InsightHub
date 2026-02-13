import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import User from "../models/User.js"
import RefreshToken from "../models/RefreshToken.js"
import auth from "../middleware/auth.js"

const router = Router()

function setRefreshCookie(res, token, maxAgeMs) {
  res.cookie("ih_refresh", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: maxAgeMs
  })
}

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name, firstName, lastName, gender, profession, avatarUrl } = req.body
    if (!email || !password) return res.status(400).json({ error: "Email and password required" })
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: "Email already registered" })
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ 
      email, 
      password: hash, 
      name: name || `${firstName || ""} ${lastName || ""}`.trim() || email.split("@")[0],
      firstName: firstName || "",
      lastName: lastName || "",
      gender: gender || "",
      profession: profession || "",
      avatarUrl: avatarUrl || ""
    })
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" })
    const refreshTokenPlain = crypto.randomBytes(32).toString("hex")
    const refresh = await RefreshToken.create({
      userId: user._id,
      token: refreshTokenPlain,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    setRefreshCookie(res, refresh.token, 7 * 24 * 60 * 60 * 1000)
    res.json({ token: accessToken, user: { id: user._id, email: user.email, name: user.name, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl, gender: user.gender, profession: user.profession } })
  } catch (error) {
    next(error)
  }
})

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ error: "Invalid credentials" })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(404).json({ error: "Invalid credentials" })
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" })
    const refreshTokenPlain = crypto.randomBytes(32).toString("hex")
    await RefreshToken.deleteMany({ userId: user._id, revoked: true })
    const refresh = await RefreshToken.create({
      userId: user._id,
      token: refreshTokenPlain,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    setRefreshCookie(res, refresh.token, 7 * 24 * 60 * 60 * 1000)
    res.json({ token: accessToken, user: { id: user._id, email: user.email, name: user.name, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl, gender: user.gender, profession: user.profession } })
  } catch (error) {
    next(error)
  }
})

router.get("/me", auth, async (req, res, next) => {
  try {
    res.json({ user: req.user })
  } catch (error) {
    next(error)
  }
})

router.patch("/me", auth, async (req, res, next) => {
  try {
    const allowed = ["name","firstName","lastName","bio","avatarUrl","gender","profession"]
    const update = {}
    for (const key of allowed) {
      if (typeof req.body[key] !== "undefined") update[key] = req.body[key]
    }
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select("-password")
    res.json({ user })
  } catch (error) {
    next(error)
  }
})

router.post("/refresh", async (req, res, next) => {
  try {
    const cookie = req.headers.cookie || ""
    const match = cookie.split(";").map(s=>s.trim()).find(s=>s.startsWith("ih_refresh="))
    if (!match) return res.status(401).json({ error: "No refresh token" })
    const token = decodeURIComponent(match.split("=")[1])
    const found = await RefreshToken.findOne({ token })
    if (!found || found.revoked) return res.status(401).json({ error: "Invalid refresh token" })
    if (found.expiresAt.getTime() < Date.now()) return res.status(401).json({ error: "Refresh token expired" })
    const user = await User.findById(found.userId)
    if (!user) return res.status(401).json({ error: "Invalid refresh token" })
    found.revoked = true
    await found.save()
    const newRefreshPlain = crypto.randomBytes(32).toString("hex")
    await RefreshToken.create({
      userId: user._id,
      token: newRefreshPlain,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    setRefreshCookie(res, newRefreshPlain, 7 * 24 * 60 * 60 * 1000)
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" })
    res.json({ token: accessToken, user: { id: user._id, email: user.email, name: user.name, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl, gender: user.gender, profession: user.profession } })
  } catch (error) {
    next(error)
  }
})

router.post("/logout", async (req, res) => {
  const cookie = req.headers.cookie || ""
  const match = cookie.split(";").map(s=>s.trim()).find(s=>s.startsWith("ih_refresh="))
  if (match) {
    const token = decodeURIComponent(match.split("=")[1])
    await RefreshToken.updateOne({ token }, { $set: { revoked: true } })
  }
  res.clearCookie("ih_refresh")
  res.json({ ok: true })
})

export default router
