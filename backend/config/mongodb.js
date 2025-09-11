const mongoose = require("mongoose")

const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://mongodb:27017/taskflow"

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(" MongoDB connected successfully")

    mongoose.connection.on("error", (err) => {
      console.error(" MongoDB connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log(" MongoDB disconnected")
    })

    process.on("SIGINT", async () => {
      await mongoose.connection.close()
      console.log("🔌 MongoDB connection closed through app termination")
      process.exit(0)
    })
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message)
    throw error
  }
}

module.exports = connectMongoDB
