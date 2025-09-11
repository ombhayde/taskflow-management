const Task = require("../models/Task")
const taskService = require("../services/taskService")

const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body
    const userId = req.user.id

    const taskData = {
      userId,
      title,
      description,
      status: status || "todo",
    }

    const task = await taskService.createTask(taskData)

    res.status(201).json({
      status: "success",
      message: "Task created successfully",
      data: {
        task,
      },
    })
  } catch (error) {
    console.error("Create task error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const getTasks = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, status, sortBy = "createdAt", sortOrder = "desc" } = req.query

    const options = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      status,
      sortBy,
      sortOrder,
    }

    const result = await taskService.getUserTasks(userId, options)

    res.status(200).json({
      status: "success",
      data: result,
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const task = await taskService.getTaskById(id, userId)

    if (!task) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      })
    }

    res.status(200).json({
      status: "success",
      data: {
        task,
      },
    })
  } catch (error) {
    console.error("Get task by ID error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const updateData = req.body

    const task = await taskService.updateTask(id, userId, updateData)

    if (!task) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      })
    }

    res.status(200).json({
      status: "success",
      message: "Task updated successfully",
      data: {
        task,
      },
    })
  } catch (error) {
    console.error("Update task error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const success = await taskService.deleteTask(id, userId)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      })
    }

    res.status(200).json({
      status: "success",
      message: "Task deleted successfully",
    })
  } catch (error) {
    console.error("Delete task error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const searchTasks = async (req, res) => {
  try {
    const userId = req.user.id
    const { q: query, page = 1, limit = 10 } = req.query

    if (!query) {
      return res.status(400).json({
        status: "error",
        message: "Search query is required",
      })
    }

    const options = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
    }

    const result = await taskService.searchTasks(userId, query, options)

    res.status(200).json({
      status: "success",
      data: result,
    })
  } catch (error) {
    console.error("Search tasks error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id
    const stats = await taskService.getTaskStats(userId)

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    })
  } catch (error) {
    console.error("Get task stats error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const bulkUpdateTasks = async (req, res) => {
  try {
    const userId = req.user.id
    const { taskIds, updateData } = req.body

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Task IDs array is required",
      })
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Update data is required",
      })
    }

    const result = await taskService.bulkUpdateTasks(userId, taskIds, updateData)

    res.status(200).json({
      status: "success",
      message: `${result.modifiedCount} tasks updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
    })
  } catch (error) {
    console.error("Bulk update tasks error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const bulkDeleteTasks = async (req, res) => {
  try {
    const userId = req.user.id
    const { taskIds } = req.body

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Task IDs array is required",
      })
    }

    const result = await taskService.bulkDeleteTasks(userId, taskIds)

    res.status(200).json({
      status: "success",
      message: `${result.modifiedCount} tasks deleted successfully`,
      data: {
        deletedCount: result.modifiedCount,
      },
    })
  } catch (error) {
    console.error("Bulk delete tasks error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const getTasksByDateRange = async (req, res) => {
  try {
    const userId = req.user.id
    const { startDate, endDate, page = 1, limit = 10 } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "error",
        message: "Start date and end date are required",
      })
    }

    const options = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    }

    const result = await taskService.getTasksByDateRange(userId, options)

    res.status(200).json({
      status: "success",
      data: result,
    })
  } catch (error) {
    console.error("Get tasks by date range error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const duplicatedTask = await taskService.duplicateTask(id, userId)

    if (!duplicatedTask) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      })
    }

    res.status(201).json({
      status: "success",
      message: "Task duplicated successfully",
      data: {
        task: duplicatedTask,
      },
    })
  } catch (error) {
    console.error("Duplicate task error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const getDeletedTasks = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10 } = req.query

    const options = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
    }

    const result = await taskService.getDeletedTasks(userId, options)

    res.status(200).json({
      status: "success",
      data: result,
    })
  } catch (error) {
    console.error("Get deleted tasks error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const restoreTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const task = await taskService.restoreTask(id, userId)

    if (!task) {
      return res.status(404).json({
        status: "error",
        message: "Deleted task not found",
      })
    }

    res.status(200).json({
      status: "success",
      message: "Task restored successfully",
      data: {
        task,
      },
    })
  } catch (error) {
    console.error("Restore task error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  searchTasks,
  getTaskStats,
  bulkUpdateTasks,
  bulkDeleteTasks,
  getTasksByDateRange,
  duplicateTask,
  getDeletedTasks,
  restoreTask,
}
