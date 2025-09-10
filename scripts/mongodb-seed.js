// MongoDB seeding script
const mongoose = require("mongoose")
require("dotenv").config()

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Connected to MongoDB for seeding")
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    process.exit(1)
  }
}

// Sample tasks data
const sampleTasks = [
  {
    userId: 1,
    title: "Complete project documentation",
    description: "Write comprehensive documentation for the task management API",
    status: "in-progress",
  },
  {
    userId: 1,
    title: "Set up CI/CD pipeline",
    description: "Configure automated testing and deployment pipeline",
    status: "todo",
  },
  {
    userId: 1,
    title: "Review code changes",
    description: "Review and approve pending pull requests",
    status: "done",
  },
  {
    userId: 2,
    title: "Design user interface",
    description: "Create mockups and wireframes for the frontend application",
    status: "in-progress",
  },
  {
    userId: 2,
    title: "Implement authentication",
    description: "Add user login and registration functionality",
    status: "done",
  },
  {
    userId: 2,
    title: "Write unit tests",
    description: "Create comprehensive test suite for all API endpoints",
    status: "todo",
  },
  {
    userId: 3,
    title: "Database optimization",
    description: "Optimize database queries and add proper indexing",
    status: "todo",
  },
  {
    userId: 3,
    title: "Security audit",
    description: "Perform security review and implement best practices",
    status: "in-progress",
  },
]

// Seed function
const seedDatabase = async () => {
  try {
    // Import Task model
    const Task = require("../models/Task")

    // Clear existing tasks
    await Task.deleteMany({})
    console.log("🗑️ Cleared existing tasks")

    // Insert sample tasks
    const tasks = await Task.insertMany(sampleTasks)
    console.log(`✅ Inserted ${tasks.length} sample tasks`)

    console.log("🌱 Database seeding completed successfully")
  } catch (error) {
    console.error("❌ Seeding failed:", error.message)
  } finally {
    await mongoose.connection.close()
    console.log("🔒 MongoDB connection closed")
  }
}

// Run seeding
const runSeed = async () => {
  await connectDB()
  await seedDatabase()
}

// Execute if run directly
if (require.main === module) {
  runSeed()
}

module.exports = { seedDatabase, sampleTasks }
