const mongoose = require("mongoose")
const { connectMySQL } = require("../config/mysql")
const { beforeAll, afterAll, jest } = require("@jest/globals")

// Setup test environment
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = "test"
  process.env.JWT_SECRET = "test_jwt_secret"
  process.env.MYSQL_DATABASE = "task_management_test"
  process.env.MONGODB_URI = "mongodb://localhost:27017/task_management_test"

  // Connect to test databases
  await connectMySQL()
  await mongoose.connect(process.env.MONGODB_URI)
})

afterAll(async () => {
  // Close database connections
  await mongoose.connection.close()
})

// Global test timeout
jest.setTimeout(30000)
