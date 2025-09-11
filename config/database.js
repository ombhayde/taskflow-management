const mysql = require("mysql2/promise")
const mongoose = require("mongoose")

const createMySQLPool = () => {
  return mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    timezone: "+00:00",
  })
}

const connectMongoDB = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    console.log("MongoDB connected successfully")

    mongoose.connection.on("error", (err) => {
      console.error(" MongoDB connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("] MongoDB disconnected")
    })

    mongoose.connection.on("reconnected", () => {
      console.log(" MongoDB reconnected")
    })
  } catch (error) {
    console.error(` MongoDB connection attempt failed. Retries left: ${retries - 1}`)

    if (retries > 1) {
      console.log(" Retrying MongoDB connection in 5 seconds...")
      setTimeout(() => connectMongoDB(retries - 1), 5000)
    } else {
      console.error(" MongoDB connection failed after all retries")
      throw error
    }
  }
}

const initializeDatabases = async () => {
  try {
    const mysqlPool = createMySQLPool()

    const connection = await mysqlPool.getConnection()
    await connection.execute("SELECT 1")
    connection.release()
    console.log(" MySQL pool created and tested")

    await connectMongoDB()

    return { mysqlPool }
  } catch (error) {
    console.error(" Database initialization failed:", error.message)
    throw error
  }
}

const gracefulShutdown = async (mysqlPool) => {
  console.log(" Shutting down database connections...")

  try {
    if (mysqlPool) {
      await mysqlPool.end()
      console.log("MySQL pool closed")
    }

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close()
      console.log(" MongoDB connection closed")
    }
  } catch (error) {
    console.error(" Error during graceful shutdown:", error.message)
  }
}

module.exports = {
  createMySQLPool,
  connectMongoDB,
  initializeDatabases,
  gracefulShutdown,
}
