#!/usr/bin/env node

const mysql = require("mysql2/promise")
const mongoose = require("mongoose")
const fs = require("fs").promises
const path = require("path")
require("dotenv").config()

class DatabaseSetup {
  constructor() {
    this.mysqlConnection = null
  }

  async setupMySQL() {
    try {
      console.log("🔄 Setting up MySQL database...")

      // Connect without specifying database first
      this.mysqlConnection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
      })

      // Create database if it doesn't exist
      await this.mysqlConnection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE}`)
      console.log(`✅ Database '${process.env.MYSQL_DATABASE}' created/verified`)

      // Use the database
      await this.mysqlConnection.execute(`USE ${process.env.MYSQL_DATABASE}`)

      // Read and execute SQL initialization script
      const sqlScript = await fs.readFile(path.join(__dirname, "mysql-init.sql"), "utf8")
      const statements = sqlScript
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0)

      for (const statement of statements) {
        if (statement.trim()) {
          await this.mysqlConnection.execute(statement)
        }
      }

      console.log("✅ MySQL tables and data initialized")
    } catch (error) {
      console.error("❌ MySQL setup failed:", error.message)
      throw error
    } finally {
      if (this.mysqlConnection) {
        await this.mysqlConnection.end()
      }
    }
  }

  async setupMongoDB() {
    try {
      console.log("🔄 Setting up MongoDB database...")

      await mongoose.connect(process.env.MONGODB_URI)
      console.log("✅ Connected to MongoDB")

      // Import and run seeding
      const { seedDatabase } = require("./mongodb-seed")
      await seedDatabase()

      console.log("✅ MongoDB setup completed")
    } catch (error) {
      console.error("❌ MongoDB setup failed:", error.message)
      throw error
    } finally {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close()
      }
    }
  }

  async run() {
    try {
      console.log("🚀 Starting database setup...")

      await this.setupMySQL()
      await this.setupMongoDB()

      console.log("🎉 Database setup completed successfully!")
      console.log("\n📋 Setup Summary:")
      console.log("   ✅ MySQL database and tables created")
      console.log("   ✅ Sample users inserted")
      console.log("   ✅ MongoDB connected and indexed")
      console.log("   ✅ Sample tasks inserted")
      console.log("\n🔐 Test Credentials:")
      console.log("   Email: john@example.com")
      console.log("   Password: password123")
    } catch (error) {
      console.error("❌ Database setup failed:", error.message)
      process.exit(1)
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new DatabaseSetup()
  setup.run()
}

module.exports = DatabaseSetup
