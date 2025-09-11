const mongoose = require("mongoose")

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(` MongoDB Connected: ${conn.connection.host}`)

    mongoose.connection.on("error", (err) => {
      console.error(" MongoDB connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log(" MongoDB disconnected")
    })

    process.on("SIGINT", async () => {
      await mongoose.connection.close()
      console.log(" MongoDB connection closed through app termination")
      process.exit(0)
    })
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message)
    throw error
  }
}

module.exports = connectMongoDB
