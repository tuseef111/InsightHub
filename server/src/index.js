// import express from "express"
// import cors from "cors"
// import morgan from "morgan"
// import dotenv from "dotenv"
// import connectDB from "./lib/db.js"
// import authRoutes from "./routes/auth.js"
// import blogRoutes from "./routes/blogs.js"
// import collectionRoutes from "./routes/collections.js"
// import resourceRoutes from "./routes/resources.js"
// import analyticsRoutes from "./routes/analytics.js"
// import seed from "./lib/seed.js"

// dotenv.config()

// const app = express()

// const defaultOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]
// const envOrigins = (process.env.CLIENT_ORIGIN || "").split(",").map(s=>s.trim()).filter(Boolean)
// const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]))

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true)
//     if (allowedOrigins.includes(origin)) return callback(null, true)
//     return callback(new Error("Not allowed by CORS"))
//   },
//   credentials: true,
// }))
// app.use(express.json({ limit: "1mb" }))
// app.use(morgan("dev"))

// app.get("/api/health", (_, res) => res.json({ ok: true }))

// app.use("/api/auth", authRoutes)
// app.use("/api/blogs", blogRoutes)
// app.use("/api/collections", collectionRoutes)
// app.use("/api/resources", resourceRoutes)
// app.use("/api/analytics", analyticsRoutes)

// const port = process.env.PORT || 5001
// connectDB().then(async () => {
//   await seed().catch((e) => console.error("Seed error:", e))
//   app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`)
//   })
// }).catch((err) => {
//   console.error("Failed to connect to database", err)
//   process.exit(1)
// })


import express from "express"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"
import connectDB from "./lib/db.js"  // Remove extra src/
import authRoutes from "./routes/auth.js"
import blogRoutes from "./routes/blogs.js"
import collectionRoutes from "./routes/collections.js"
import resourceRoutes from "./routes/resources.js"
import analyticsRoutes from "./routes/analytics.js"
import seed from "./lib/seed.js"


dotenv.config()

const app = express()

const defaultOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"]
const envOrigins = (process.env.CLIENT_ORIGIN || "").split(",").map(s=>s.trim()).filter(Boolean)
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]))

// CORS for development - allow all origins
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // For development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true)
    }
    
    // Production: check allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    return callback(new Error("Not allowed by CORS"))
  },
  credentials: true,
}))

app.use(express.json({ limit: "1mb" }))
app.use(morgan("dev"))

// Simple test routes
app.get("/api/health", (_, res) => res.json({ 
  ok: true, 
  message: "Server is running",
  timestamp: new Date().toISOString()
}))

app.get("/api/test", (req, res) => {
  res.json({ 
    success: true,
    data: {
      resources: "/api/resources",
      collections: "/api/collections",
      auth: {
        login: "POST /api/auth/login",
        signup: "POST /api/auth/signup"
      }
    }
  })
})

// Mount routes
app.use("/api/auth", authRoutes)
app.use("/api/blogs", blogRoutes)
app.use("/api/collections", collectionRoutes)
app.use("/api/resources", resourceRoutes)
app.use("/api/analytics", analyticsRoutes)

// Fallback route
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Unexpected Error:", err)
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

// Catch-all for other requests (could serve frontend in production)
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

const port = process.env.PORT || 5001

// MODIFIED: Start server even if DB fails
async function startServer() {
  console.log("🚀 Starting InsightHub Server...")
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Port: ${port}`)
  console.log(`🔗 Origins: ${allowedOrigins.join(', ')}`)
  
  try {
    // Try to connect to database
    console.log("🔌 Attempting database connection...")
    await connectDB()
    console.log("✅ Database connected successfully")
    
    // Try to seed data
    try {
      await seed()
      console.log("🌱 Database seeded")
    } catch (seedError) {
      console.log("⚠️  Seed skipped:", seedError.message)
    }
    
  } catch (dbError) {
    console.log("⚠️  WARNING: Could not connect to database")
    console.log("📝 Note: Server will run WITHOUT database")
    console.log("💡 Data will not persist between restarts")
    console.log("🔧 Error details:", dbError.message)
  }
  
  // Start the server in ANY CASE
  app.listen(port, () => {
    console.log(`🎉 Server is running on http://localhost:${port}`)
    console.log(`📡 Health check: http://localhost:${port}/api/health`)
    console.log(`🛠️  API Test: http://localhost:${port}/api/test`)
    console.log(`🔧 Ready for frontend connections!`)
    
    if (process.env.NODE_ENV === 'development') {
      console.log("\n📋 Available API Endpoints:")
      console.log("   GET  /api/health         - Server health check")
      console.log("   GET  /api/test           - API test endpoint")
      console.log("   GET  /api/resources      - Get all resources")
      console.log("   GET  /api/collections    - Get all collections")
      console.log("   POST /api/auth/login     - User login")
      console.log("   POST /api/auth/signup    - User registration")
    }
  })
}

startServer()
