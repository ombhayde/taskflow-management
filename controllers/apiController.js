const Task = require("../models/Task")
const { getConnection } = require("../config/mysql")


const getApiDocs = async (req, res) => {
  const apiDocs = {
    title: "Task Management API",
    version: "1.0.0",
    description: "A comprehensive task management API with user authentication",
    baseUrl: `${req.protocol}://${req.get("host")}/api`,
    endpoints: {
      authentication: {
        "POST /auth/register": {
          description: "Register a new user",
          body: {
            name: "string (required)",
            email: "string (required)",
            password: "string (required, min 6 chars)",
          },
        },
        "POST /auth/login": {
          description: "Login user",
          body: {
            email: "string (required)",
            password: "string (required)",
          },
        },
        "GET /auth/profile": {
          description: "Get user profile",
          headers: {
            Authorization: "Bearer <token>",
          },
        },
      },
      tasks: {
        "GET /tasks": {
          description: "Get all tasks with pagination and filtering",
          query: {
            page: "number (default: 1)",
            limit: "number (default: 10, max: 100)",
            status: "string (todo|in-progress|done)",
            sortBy: "string (default: createdAt)",
            sortOrder: "string (asc|desc, default: desc)",
          },
        },
        "POST /tasks": {
          description: "Create a new task",
          body: {
            title: "string (required, max 200 chars)",
            description: "string (optional, max 1000 chars)",
            status: "string (todo|in-progress|done, default: todo)",
          },
        },
        "GET /tasks/:id": {
          description: "Get task by ID",
        },
        "PUT /tasks/:id": {
          description: "Update task",
          body: {
            title: "string (optional)",
            description: "string (optional)",
            status: "string (optional)",
          },
        },
        "DELETE /tasks/:id": {
          description: "Delete task (soft delete)",
        },
        "GET /tasks/search": {
          description: "Search tasks by title",
          query: {
            q: "string (required)",
            page: "number (default: 1)",
            limit: "number (default: 10)",
          },
        },
        "GET /tasks/stats": {
          description: "Get task statistics",
        },
        "PATCH /tasks/bulk": {
          description: "Bulk update tasks",
          body: {
            taskIds: "array of strings (required)",
            updateData: "object (required)",
          },
        },
        "DELETE /tasks/bulk": {
          description: "Bulk delete tasks",
          body: {
            taskIds: "array of strings (required)",
          },
        },
      },
    },
  }

  res.status(200).json({
    status: "success",
    data: apiDocs,
  })
}

const getApiHealth = async (req, res) => {
  try {
    const connection = getConnection()

    const [userCount] = await connection.execute("SELECT COUNT(*) as count FROM users")
    const taskCount = await Task.countDocuments({ isDeleted: false })
    const deletedTaskCount = await Task.countDocuments({ isDeleted: true })

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: "1.0.0",
      database: {
        mysql: {
          status: "connected",
          users: userCount[0].count,
        },
        mongodb: {
          status: "connected",
          activeTasks: taskCount,
          deletedTasks: deletedTaskCount,
        },
      },
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      },
    }

    res.status(200).json({
      status: "success",
      data: health,
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error.message,
    })
  }
}

module.exports = {
  getApiDocs,
  getApiHealth,
}
