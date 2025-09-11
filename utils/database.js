const mysql = require("mysql2/promise")
const mongoose = require("mongoose")

class DatabaseManager {
  constructor() {
    this.mysqlConnection = null
    this.mongoConnection = null
  }

  async initialize() {
    try {
      await this.connectMySQL()
      await this.connectMongoDB()
      console.log("All database connections established")
    } catch (error) {
      console.error("Database initialization failed:", error.message)
      throw error
    }
  }

  async connectMySQL() {
    try {
      this.mysqlConnection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        timezone: "+00:00",
        dateStrings: true,
      })

      console.log("MySQL connected successfully")
      await this.createMySQLTables()
    } catch (error) {
      console.error("MySQL connection failed:", error.message)
      throw error
    }
  }

  async connectMongoDB() {
    try {
      this.mongoConnection = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })

      console.log(" MongoDB connected successfully")
      await this.createMongoIndexes()
    } catch (error) {
      console.error(" MongoDB connection failed:", error.message)
      throw error
    }
  }

  async createMySQLTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_created_at (createdAt)
      )
    `

    try {
      await this.mysqlConnection.execute(createUsersTable)
      console.log("MySQL tables created/verified")
    } catch (error) {
      console.error("Error creating MySQL tables:", error.message)
      throw error
    }
  }

  async createMongoIndexes() {
    try {
      const Task = require("../models/Task")

      await Task.collection.createIndex({ userId: 1, status: 1 })
      await Task.collection.createIndex({ userId: 1, isDeleted: 1 })
      await Task.collection.createIndex({ userId: 1, createdAt: -1 })
      await Task.collection.createIndex({ title: "text", description: "text" })

      console.log(" MongoDB indexes created/verified")
    } catch (error) {
      console.error("Error creating MongoDB indexes:", error.message)
      throw error
    }
  }

  async healthCheck() {
    const health = {
      mysql: false,
      mongodb: false,
      timestamp: new Date().toISOString(),
    }

    try {
      if (this.mysqlConnection) {
        await this.mysqlConnection.execute("SELECT 1")
        health.mysql = true
      }

      if (mongoose.connection.readyState === 1) {
        health.mongodb = true
      }
    } catch (error) {
      console.error(" Database health check failed:", error.message)
    }

    return health
  }

  getMySQLConnection() {
    if (!this.mysqlConnection) {
      throw new Error("MySQL connection not established")
    }
    return this.mysqlConnection
  }

  async closeConnections() {
    try {
      if (this.mysqlConnection) {
        await this.mysqlConnection.end()
        console.log("MySQL connection closed")
      }

      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close()
        console.log("MongoDB connection closed")
      }
    } catch (error) {
      console.error(" Error closing database connections:", error.message)
    }
  }
}

module.exports = new DatabaseManager()
