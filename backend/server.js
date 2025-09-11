const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("express-async-errors")
require("dotenv").config()

const connectMongoDB = require("./config/mongodb")
const connectMySQL = require("./config/mysql")
const errorHandler = require("./middleware/errorHandler")

const authRoutes = require("./routes/authRoutes")
const taskRoutes = require("./routes/taskRoutes")

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)


app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running successfully",
    timestamp: new Date().toISOString(),
  })
})


app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)

app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  })
})


app.use(errorHandler)


const startServer = async () => {
  try {
   
    await connectMongoDB()
    await connectMySQL()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(` Health check: http://localhost:${PORT}/health`)
      console.log(` Environment: ${process.env.NODE_ENV}`)
    })
  } catch (error) {
    console.error(" Failed to start server:", error.message)
    process.exit(1)
  }
}

startServer()

module.exports = app
